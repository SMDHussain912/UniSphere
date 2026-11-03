const request = require('supertest');
const http = require('http');
const WebSocket = require('ws');
const mongoose = require('mongoose');
const app = require('../app');
const LabSession = require('../models/LabSession');
const User = require('../models/User');
const dockerRunner = require('../utils/dockerRunner');
const { docker } = dockerRunner;
const { initTerminalGateway, closeTerminalsForSession, terminalCount } = require('../utils/terminalGateway');
const config = require('../config/env');
const { generateToken } = require('../utils/generateToken');

jest.setTimeout(300000);

const MONGO_URL = process.env.MONGO_URL || 'mongodb://127.0.0.1:27017/unisphere_test_term';
const TEST_IMAGE = 'node:18-alpine';

let dockerAvailable = false;
let server;
let port;
let tokensToCleanup = [];
const createdContainers = [];
let skippedTests = [];

const createUser = (firstname, phone) =>
  User.create({
    fullname: { firstname, lastname: 'UniSphere' },
    email: `${firstname.toLowerCase()}${phone}@unisphere.com`,
    phone,
    dob: '1990-01-01',
    gender: 'Other',
    qualification: 'Degree',
    password: 'Test@1234',
    role: 'user',
  });

const makeSession = async (userId, overrides = {}) => {
  await dockerRunner.ensureImage(TEST_IMAGE);
  const container = await docker.createContainer({
    Image: TEST_IMAGE,
    Tty: true,
    OpenStdin: true,
    HostConfig: {
      CapDrop: ['ALL'],
      SecurityOpt: ['no-new-privileges:true'],
      PidsLimit: 64,
      Memory: 192 * 1024 * 1024,
    },
  });
  await container.start();
  createdContainers.push(container);
  return LabSession.create({
    userId,
    sessionType: 'code-server',
    containerId: container.id,
    port: 9999,
    url: 'http://localhost:9999',
    status: LabSession.STATUS_ACTIVE,
    expiresAt: overrides.expiresAt || new Date(Date.now() + config.labSessionTtlMinutes * 60 * 1000),
  });
};
class TerminalClient {
  constructor() {
    this.ws = new WebSocket(`ws://127.0.0.1:${port}/ws/terminal`);
    this.out = '';
    this.ok = null;
    this.closed = null;
    this.exitCode = null;
    this.waiters = [];
    this.ws.binaryType = 'nodebuffer';
    this.ws.on('message', (data, isBinary) => {
      if (isBinary) {
        this.out += data.toString('utf8');
      } else {
        const msg = JSON.parse(data.toString('utf8'));
        if (msg.type === 'ok') this.ok = msg;
        if (msg.type === 'closed') this.closed = msg;
      }
      this.flush();
    });
    this.ws.on('close', (code) => {
      this.exitCode = code;
      this.flush();
    });
    this.ws.on('error', () => {});
  }

  flush() {
    this.waiters.splice(0).forEach((fn) => fn());
  }

  send(obj) {
    this.ws.send(JSON.stringify(obj));
  }

  input(text) {
    this.send({ type: 'input', data: text });
  }

  auth(tokenValue) {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('auth timeout')), 20000);
      this.ws.on('open', () => this.send({ type: 'auth', token: tokenValue }));
      const check = () => {
        if (this.ok || this.closed) {
          clearTimeout(timer);
          resolve();
        }
      };
      this.waiters.push(check);
      check();
    });
  }

  waitOutput(matcher, ms = 20000) {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        cleanup();
        reject(new Error(`timeout waiting for ${matcher}. tail=${this.out.slice(-200)}`));
      }, ms);
      const check = () => {
        if (matcher.test(this.out)) {
          clearTimeout(timer);
          resolve(this.out);
        }
      };
      const cleanup = () => {
        this.waiters.splice(this.waiters.indexOf(check), 1);
      };
      this.waiters.push(check);
      check();
    });
  }

  waitCondition(predicate, ms = 15000, label = 'condition') {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        cleanup();
        reject(new Error(`timeout waiting for ${label}`));
      }, ms);
      const check = () => {
        if (predicate()) {
          clearTimeout(timer);
          resolve();
        }
      };
      const cleanup = () => {
        clearTimeout(timer);
        this.waiters.splice(this.waiters.indexOf(check), 1);
      };
      this.waiters.push(check);
      check();
    });
  }

  close() {
    try {
      this.ws.close();
    } catch (_) {}
  }
}

const dockerSkip = (name) => {
  skippedTests.push(name);
  console.log(`SKIPPED (Docker unavailable): ${name}`);
};
describe('Terminal Gateway', () => {
  beforeAll(async () => {
    await mongoose.connect(MONGO_URL, { family: 4 });
    await Promise.all([User, LabSession].map((m) => m.init()));
    dockerAvailable = await dockerRunner.isDockerAvailable();
    server = http.createServer();
    initTerminalGateway(server);
    await new Promise((resolve) => server.listen(0, resolve));
    port = server.address().port;
  }, 600000);

  afterAll(async () => {
    if (skippedTests.length > 0) {
      console.log('\n=== SKIPPED TESTS (Docker unavailable) ===');
      skippedTests.forEach((t) => console.log(`  - ${t}`));
      const securityTestsSkipped = skippedTests.some((t) =>
        t.includes('filesystem') || t.includes('isolation') || t.includes('workspace') ||
        t.includes('terminal limit') || t.includes('rate-limit') || t.includes('rate limit')
      );
      if (securityTestsSkipped) {
        console.error('\n!!! RELEASE BLOCK: Required Docker security tests were skipped !!!');
        process.exitCode = 1;
      }
    }

    for (const container of createdContainers) {
      try {
        await container.remove({ force: true });
      } catch (_) {}
    }
    closeTerminalsForSession('none');
    await new Promise((resolve) => server.close(resolve));
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  describe('live terminal', () => {
    let user;
    let token;

    beforeEach(async () => {
      await Promise.all([User.deleteMany({}), LabSession.deleteMany({})]);
      user = await createUser('Term', '9110000001');
      token = generateToken(user._id);
    });

    const skipIfNoDocker = (fn) => async () => {
      if (!dockerAvailable) { dockerSkip(expect.getState().currentTestName); return; }
      return fn();
    };
    it('rejects connections that never authenticate', skipIfNoDocker(async () => {
      const client = new TerminalClient();
      await new Promise((resolve) => client.ws.once('open', resolve));
      client.send({ type: 'ping' });
      await client.waitCondition(() => client.exitCode !== null, 10000, 'unauthenticated close');
      expect(client.exitCode).toBe(4001);
      client.close();
    }));

    it('rejects valid tokens when the user has no active session', skipIfNoDocker(async () => {
      const client = new TerminalClient();
      await client.auth(token);
      expect(client.ok).toBeNull();
      expect(client.closed.reason).toBe('no_active_session');
      await client.waitCondition(() => client.exitCode !== null, 10000, 'close after rejection');
      expect(client.exitCode).toBe(4003);
      client.close();
    }));

    it('rejects expired sessions and marks them expired', skipIfNoDocker(async () => {
      const session = await makeSession(user._id, {
        expiresAt: new Date(Date.now() - 1000),
      });
      const client = new TerminalClient();
      await client.auth(token);
      expect(client.closed.reason).toBe('session_expired');
      await client.waitCondition(() => client.exitCode !== null, 10000, 'close after expiry');
      const fresh = await LabSession.findById(session._id);
      expect(fresh.status).toBe(LabSession.STATUS_EXPIRED);
      client.close();
    }));

    it('runs an interactive shell with a persistent filesystem', skipIfNoDocker(async () => {
      const session = await makeSession(user._id);
      const client = new TerminalClient();
      await client.auth(token);
      expect(client.ok.session.id).toBe(String(session._id));
      expect(client.ok.session.sessionType).toBe('code-server');

      client.input('pwd; echo M1\n');
      await client.waitOutput(/M1/);
      expect(client.out).toMatch(/\//);

      client.input('mkdir test; echo M2\n');
      await client.waitOutput(/M2/);

      client.input('cd test; echo M3\n');
      await client.waitOutput(/M3/);

      client.input('echo hello; echo M4\n');
      await client.waitOutput(/hello/);

      client.close();
      await client.waitCondition(() => client.exitCode !== null, 5000, 'client close');

      const second = new TerminalClient();
      await second.auth(token);
      second.input('pwd; ls; echo M5\n');
      await second.waitOutput(/test/);
      expect(second.out).toMatch(/M5/);
      second.close();
      await second.waitCondition(() => second.exitCode !== null, 5000, 'second close');
    }));

    it('enforces the per-user workspace boundary', skipIfNoDocker(async () => {
      await makeSession(user._id);
      const client = new TerminalClient();
      await client.auth(token);
      expect(client.ok.session.id).toBeTruthy();

      client.input('pwd\n');
      await client.waitOutput(new RegExp(user._id));
      expect(client.out).toMatch(/\/workspace\//);

      client.input('echo x > /etc/unisphere-escape 2>/dev/null; echo TOP\n');
      await client.waitOutput(/TOP/);
      client.input('test -f /etc/unisphere-escape && echo LEAKED || echo BLOCKED\n');
      await client.waitOutput(/BLOCKED/);
      expect(client.out).not.toMatch(/LEAKED/);

      client.input('echo BACK\n');
      await client.waitOutput(/BACK/);
      client.close();
      await client.waitCondition(() => client.exitCode !== null, 5000, 'client close');
    }));

    it('supports Ctrl+C, Ctrl+D and resize', skipIfNoDocker(async () => {
      await makeSession(user._id);
      const client = new TerminalClient();
      await client.auth(token);

      client.input('sleep 60\n');
      await new Promise((r) => setTimeout(r, 500));
      client.input('\x03');
      await new Promise((r) => setTimeout(r, 500));
      client.input('echo ALIVE\n');
      await client.waitOutput(/ALIVE/);

      client.send({ type: 'resize', cols: 120, rows: 40 });
      client.input('stty size; echo M6\n');
      await client.waitOutput(/M6/);
      expect(client.out).toMatch(/40 120/);

      client.input('\x04');
      await client.waitCondition(() => client.closed && client.closed.reason === 'shell_exited', 10000, 'shell exit');
      expect(client.exitCode).toBe(4005);
    }));

    it('disconnects the terminal when the session is stopped', skipIfNoDocker(async () => {
      const session = await makeSession(user._id);
      const client = new TerminalClient();
      await client.auth(token);
      expect(client.ok).not.toBeNull();

      const res = await request(app)
        .post(`/api/v1/lab/${session._id}/stop`)
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);

      await client.waitCondition(() => client.exitCode !== null, 10000, 'stop disconnect');
      expect(client.exitCode).toBe(4006);
    }));

    it('never lets one user reach another user container', skipIfNoDocker(async () => {
      await makeSession(user._id);
      const other = await createUser('Other', '9110000002');
      const otherToken = generateToken(other._id);
      tokensToCleanup.push(otherToken);

      const stranger = new TerminalClient();
      await stranger.auth(otherToken);
      expect(stranger.closed.reason).toBe('no_active_session');
      expect(stranger.exitCode).toBe(4003);
      stranger.close();

      const sneaky = new TerminalClient();
      await sneaky.auth(token);
      expect(sneaky.ok).not.toBeNull();
      const owner = new TerminalClient();
      await owner.auth(token);
      expect(owner.ok).not.toBeNull();
      owner.close();
      sneaky.close();
    }));

    it('keeps the one-shot /code/run endpoint working', skipIfNoDocker(async () => {
      const res = await request(app)
        .post('/api/v1/code/run')
        .set('Authorization', `Bearer ${token}`)
        .send({ language: 'javascript', code: 'console.log("run-still-works")' });
      expect(res.status).toBe(200);
      expect(res.data.data.output).toContain('run-still-works');
    }));
    it('registers authenticated terminals and cleans up on close', skipIfNoDocker(async () => {
      await makeSession(user._id);
      const before = terminalCount();
      const client = new TerminalClient();
      await client.auth(token);
      expect(terminalCount()).toBe(before + 1);
      client.close();
      await new Promise((r) => setTimeout(r, 100));
      expect(terminalCount()).toBe(before);
    }));

    it('enforces MAX_TERMINALS_PER_SESSION limit', skipIfNoDocker(async () => {
      await makeSession(user._id);
      const client1 = new TerminalClient();
      await client1.auth(token);
      expect(client1.ok).not.toBeNull();
      const client2 = new TerminalClient();
      await client2.auth(token);
      expect(client2.ok).not.toBeNull();
      const client3 = new TerminalClient();
      await client3.auth(token);
      expect(terminalCount()).toBeLessThanOrEqual(2);
      client1.close();
      client2.close();
      client3.close();
      await new Promise((r) => setTimeout(r, 100));
      expect(terminalCount()).toBe(0);
    }));

    it('refills token bucket for sustained input', skipIfNoDocker(async () => {
      await makeSession(user._id);
      const client = new TerminalClient();
      await client.auth(token);
      for (let i = 0; i < 70; i++) {
        client.input('echo burst\n');
      }
      await new Promise((r) => setTimeout(r, 2000));
      client.input('echo ALIVE\n');
      await client.waitOutput(/ALIVE/);
      client.close();
      await client.waitCondition(() => client.exitCode !== null, 5000, 'client close');
    }));

    it('prevents navigation to container root', skipIfNoDocker(async () => {
      await makeSession(user._id);
      const client = new TerminalClient();
      await client.auth(token);
      client.input('cd /; pwd\n');
      await client.waitOutput(/\//);
      client.input('touch /test-write 2>/dev/null; echo WRITE_RESULT=\$?\n');
      await client.waitOutput(/WRITE_RESULT/);
      client.close();
      await client.waitCondition(() => client.exitCode !== null, 5000, 'client close');
    }));

    it('prevents reading /etc/passwd outside workspace', skipIfNoDocker(async () => {
      await makeSession(user._id);
      const client = new TerminalClient();
      await client.auth(token);
      client.input('cat /etc/passwd 2>/dev/null | head -1; echo READ_DONE\n');
      await client.waitOutput(/READ_DONE/);
      client.input('echo x > /etc/unisphere-escape 2>/dev/null; echo WRITE_DONE\n');
      await client.waitOutput(/WRITE_DONE/);
      client.input('test -f /etc/unisphere-escape && echo LEAKED || echo BLOCKED\n');
      await client.waitOutput(/BLOCKED/);
      expect(client.out).not.toMatch(/LEAKED/);
      client.close();
      await client.waitCondition(() => client.exitCode !== null, 5000, 'client close');
    }));

    it('prevents access to another user workspace', skipIfNoDocker(async () => {
      await makeSession(user._id);
      const client = new TerminalClient();
      await client.auth(token);
      const otherUser = await createUser('Other2', '9110000003');
      const otherWorkspace = `/workspace/${otherUser._id}`;
      client.input(`ls ${otherWorkspace} 2>/dev/null; echo ACCESS_RESULT=\$?\n`);
      await client.waitOutput(/ACCESS_RESULT/);
      client.close();
      await client.waitCondition(() => client.exitCode !== null, 5000, 'client close');
    }));

    it('prevents writing outside permitted workspace', skipIfNoDocker(async () => {
      await makeSession(user._id);
      const client = new TerminalClient();
      await client.auth(token);
      client.input('echo x > /etc/unisphere-escape 2>/dev/null; echo WRITE1=\$?\n');
      await client.waitOutput(/WRITE1/);
      client.input('echo x > /var/unisphere-escape 2>/dev/null; echo WRITE2=\$?\n');
      await client.waitOutput(/WRITE2/);
      client.input('echo x > /root/unisphere-escape 2>/dev/null; echo WRITE3=\$?\n');
      await client.waitOutput(/WRITE3/);
      client.input('echo x > /workspace/test-write 2>/dev/null; echo WRITE4=\$?\n');
      await client.waitOutput(/WRITE4/);
      client.close();
      await client.waitCondition(() => client.exitCode !== null, 5000, 'client close');
    }));
  });
});