const jwt = require('jsonwebtoken');
const { WebSocketServer } = require('ws');
const config = require('../config/env');
const LabSession = require('../models/LabSession');
const User = require('../models/User');
const dockerRunner = require('./dockerRunner');
const logger = require('../config/logger');
const CLOSE_UNAUTHENTICATED = 4001;
const CLOSE_NO_SESSION = 4003;
const CLOSE_EXPIRED = 4004;
const CLOSE_CONTAINER = 4005;
const CLOSE_STOPPED = 4006;
const CLOSE_LIMIT = 4007;
const AUTH_TIMEOUT_MS = 10000;
const MAX_INPUT_FRAME = 4096;
const MAX_OUTPUT_BYTES = 5 * 1024 * 1024;
const BUCKET_CAPACITY = 60;
const BUCKET_REFILL_PER_SEC = 25;
const MAX_TERMINALS_PER_SESSION = 2;
const registry = new Map();

const isActive = (session) =>
  session && session.status === LabSession.STATUS_ACTIVE;

const sendJson = (ws, payload) => {
  if (ws.readyState === ws.OPEN) {
    ws.send(JSON.stringify(payload));
  }
};

const closeTerminal = (entry, code, reason) => {
  if (entry.closed) return;
  entry.closed = true;
  clearTimeout(entry.authTimer);
  clearTimeout(entry.ttlTimer);
  if (entry.bucketTimer) clearInterval(entry.bucketTimer);
  try {
    if (entry.stream) entry.stream.end();
  } catch (_) {}
  const set = registry.get(entry.sessionId);
  if (set) {
    set.delete(entry);
    if (set.size === 0) registry.delete(entry.sessionId);
  }
  try {
    entry.ws.close(code, reason);
  } catch (_) {};
};

const closeTerminalsForSession = (sessionId) => {
  const key = String(sessionId);
  const set = registry.get(key);
  if (!set) return 0;
  const entries = Array.from(set);
  for (const entry of entries) {
    closeTerminal(entry, CLOSE_STOPPED, 'session_stopped');
  }
  return entries.length;
};

const expireSession = async (session) => {
  closeTerminalsForSession(String(session._id));
  if (session.containerId) {
    await dockerRunner.stopLabSession(session.containerId);
  }
  session.status = LabSession.STATUS_EXPIRED;
  session.stoppedAt = new Date();
  await session.save();
};

const verifyAuthMessage = async (ws, raw) => {
  if (typeof raw !== 'string' || raw.length > 2048) return null;
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (_) {
    return null;
  }
  if (!parsed || parsed.type !== 'auth' || typeof parsed.token !== 'string') {
    return null;
  }
  const decoded = jwt.verify(parsed.token, config.jwtSecret);
  const user = await User.findById(decoded.id).select('+role active');
  if (!user || user.active === false) return null;
  return user;
};

const handleConnection = (wss, ws) => {
  let entry = {
    ws,
    sessionId: null,
    userId: null,
    stream: null,
    exec: null,
    authTimer: null,
    ttlTimer: null,
    bucketTimer: null,
    bucket: BUCKET_CAPACITY,
    closed: false,
    authenticated: false,
    authenticating: false,
  };
  entry.authTimer = setTimeout(() => {
    closeTerminal(entry, CLOSE_UNAUTHENTICATED, 'auth_timeout');
  }, AUTH_TIMEOUT_MS);
  ws.on('close', () => closeTerminal(entry, undefined, undefined));
  ws.on('error', () => closeTerminal(entry, undefined, undefined));
  ws.on('message', async (raw, isBinary) => {
    if (entry.closed) return;
    if (!entry.authenticated) {
      const text = isBinary ? null : raw.toString('utf8');
      let user;
      try {
        user = await verifyAuthMessage(ws, text);
      } catch (_) {
        user = null;
      }
      clearTimeout(entry.authTimer);
      if (!user) {
        sendJson(ws, { type: 'closed', reason: 'auth_failed' });
        closeTerminal(entry, CLOSE_UNAUTHENTICATED, 'auth_failed');
        return;
      }
      if (!config.terminalEnabled || !config.labEnabled) {
        sendJson(ws, { type: 'closed', reason: 'terminal_disabled' });
        closeTerminal(entry, CLOSE_LIMIT, 'terminal_disabled');
        return;
      }
      const session = await LabSession.findOne({
        userId: user._id,
        status: LabSession.STATUS_ACTIVE,
      });
      if (!session) {
        sendJson(ws, { type: 'closed', reason: 'no_active_session' });
        closeTerminal(entry, CLOSE_NO_SESSION, 'no_active_session');
        return;
      }
      entry.sessionId = String(session._id);
      entry.userId = String(user._id);
      const execResult = await dockerRunner.createTerminalExec({
        containerId: session.containerId,
        userId: user._id,
        sessionType: session.sessionType,
        workspacePath: `/workspace/${user._id}`,
      });
      entry.exec = execResult.exec;
      entry.stream = execResult.stream;
      entry.sessionType = session.sessionType;
      entry.workspacePath = execResult.workspacePath;
      entry.authenticated = true;
      entry.registrySet = registry.get(entry.sessionId);
      if (!entry.registrySet) {
        entry.registrySet = new Set();
        registry.set(entry.sessionId, entry.registrySet);
      }
      entry.registrySet.add(entry);
      if (entry.registrySet.size > MAX_TERMINALS_PER_SESSION) {
        // Remove the oldest terminal (excluding the current one just added)
        const terminals = Array.from(entry.registrySet);
        for (const terminal of terminals) {
          if (terminal !== entry) {
            closeTerminal(terminal, CLOSE_LIMIT, 'terminal_limit');
            break;
          }
        }
      }
      entry.ttlTimer = setTimeout(async () => {
        sendJson(ws, { type: 'closed', reason: 'session_expired' });
        closeTerminal(entry, CLOSE_EXPIRED, 'session_expired');
        try {
          const fresh = await LabSession.findById(session._id);
          if (fresh && isActive(fresh)) await expireSession(fresh);
        } catch (_) {}
      }, Math.max(0, session.expiresAt.getTime() - Date.now()));
      // Token bucket refill: starts once per connection, cleaned up by closeTerminal
      entry.bucketTimer = setInterval(() => {
        if (!entry.closed) {
          entry.bucket = Math.min(BUCKET_CAPACITY, entry.bucket + BUCKET_REFILL_PER_SEC);
        }
      }, 1000);
      if (execResult.stream) {
        execResult.stream.on('data', (chunk) => {
          if (entry.closed || ws.readyState !== ws.OPEN) return;
          entry.outputBytes = (entry.outputBytes || 0) + chunk.length;
          if (entry.outputBytes > MAX_OUTPUT_BYTES) {
            sendJson(ws, { type: 'closed', reason: 'output_limit' });
            closeTerminal(entry, CLOSE_LIMIT, 'output_limit');
            return;
          }
          if (ws.bufferedAmount > MAX_OUTPUT_BYTES) {
            execResult.stream.pause();
            const check = setInterval(() => {
              if (entry.closed) {
                clearInterval(check);
                return;
              }
              if (ws.readyState === ws.OPEN && ws.bufferedAmount < 1024 * 1024) {
                clearInterval(check);
                execResult.stream.resume();
              }
            }, 200);
            check.unref();
            return;
          }
          ws.send(chunk, { binary: true });
        });
        execResult.stream.on('error', () => {
          sendJson(ws, { type: 'closed', reason: 'stream_error' });
          closeTerminal(entry, CLOSE_CONTAINER, 'stream_error');
        });
        execResult.stream.on('end', () => {
          sendJson(ws, { type: 'closed', reason: 'shell_exited' });
          closeTerminal(entry, CLOSE_CONTAINER, 'shell_exited');
        });
      }
      sendJson(ws, {
        type: 'ok',
        session: {
          id: entry.sessionId,
          sessionType: entry.sessionType,
          expiresAt: session.expiresAt.toISOString(),
        },
      });
      return;
    }
    if (isBinary) {
      entry.bucket -= 1;
      if (entry.bucket < 0) {
        sendJson(ws, { type: 'closed', reason: 'rate_limited' });
        closeTerminal(entry, CLOSE_LIMIT, 'rate_limited');
        return;
      }
      if (raw.length > MAX_INPUT_FRAME) return;
      try {
        entry.stream.write(raw);
      } catch (_) {}
      return;
    }
    const text = raw.toString('utf8');
    if (text.length > MAX_INPUT_FRAME) return;
    entry.bucket -= 1;
    if (entry.bucket < 0) {
      sendJson(ws, { type: 'closed', reason: 'rate_limited' });
      closeTerminal(entry, CLOSE_LIMIT, 'rate_limited');
      return;
    }
    let msg;
    try {
      msg = JSON.parse(text);
    } catch (_) {
      return;
    }
    if (msg.type === 'input' && typeof msg.data === 'string') {
      try {
        entry.stream.write(msg.data);
      } catch (_) {}
      return;
    }
    if (msg.type === 'resize') {
      const cols = Math.min(500, Math.max(2, parseInt(msg.cols, 10) || 80));
      const rows = Math.min(200, Math.max(2, parseInt(msg.rows, 10) || 24));
      try {
        entry.exec.resize({ w: cols, h: rows });
      } catch (_) {}
      return;
    }
    if (msg.type === 'ping') {
      sendJson(ws, { type: 'pong' });
    }
  });
};

const initTerminalGateway = (httpServer) => {
  const wss = new WebSocketServer({ noServer: true, maxPayload: 64 * 1024 });
  httpServer.on('upgrade', (req, socket, head) => {
    let pathname = '/';
    try {
      pathname = new URL(req.url, 'http://localhost').pathname;
    } catch (_) {}
    if (pathname === '/ws/terminal') {
      if (!config.terminalEnabled || !config.labEnabled) {
        socket.write('HTTP/1.1 503 Service Unavailable\r\n\r\n');
        socket.destroy();
        return;
      }
      wss.handleUpgrade(req, socket, head, (ws) => {
        handleConnection(wss, ws);
      });
      return;
    }
    socket.destroy();
  });
  logger.info('Terminal gateway ready on /ws/terminal');
  return wss;
};

module.exports = {
  initTerminalGateway,
  closeTerminalsForSession,
  terminalCount: () => {
    let total = 0;
    for (const set of registry.values()) total += set.size;
    return total;
  },
};
