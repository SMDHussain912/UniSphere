import { useCallback, useEffect, useRef, useState } from 'react'
import { Terminal } from '@xterm/xterm'
import { FitAddon } from '@xterm/addon-fit'
import '@xterm/xterm/css/xterm.css'
import { api } from '../api'
import { useAuth } from '../auth/AuthContext'

const MAX_RECONNECT_ATTEMPTS = 6

export function LabTerminal({ onStopped }) {
  const { user } = useAuth()
  const [session, setSession] = useState(null)
  const [status, setStatus] = useState('loading')
  const [starting, setStarting] = useState(false)
  const [remaining, setRemaining] = useState('')
  const hostRef = useRef(null)
  const termRef = useRef(null)
  const fitRef = useRef(null)
  const socketRef = useRef(null)
  const reconnectRef = useRef({ attempts: 0, timer: null })
  const connectRef = useRef(null)
  const disposedRef = useRef(false)

  useEffect(() => {
    let cancelled = false
    api.get('/lab/active')
      .then((res) => {
        if (cancelled) return
        if (res.data && res.data._id) {
          setSession(res.data)
          setStatus('connecting')
        } else {
          setStatus('no-session')
        }
      })
      .catch(() => !cancelled && setStatus('no-session'))
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!session || !session.expiresAt) return
    const tick = () => {
      const left = new Date(session.expiresAt).getTime() - Date.now()
      if (left <= 0) {
        setRemaining('expired')
        return
      }
      const m = Math.floor(left / 60000)
      const s = Math.floor((left % 60000) / 1000)
      setRemaining(`${m}:${String(s).padStart(2, '0')}`)
    }
    tick()
    const timer = setInterval(tick, 1000)
    return () => clearInterval(timer)
  }, [session])

  const writeStatus = useCallback((message) => {
    if (termRef.current) {
      termRef.current.write(`\r\n\x1b[33m${message}\x1b[0m\r\n`)
    }
  }, [])

  const connect = useCallback(() => {
    const token = localStorage.getItem('unisphere_token')
    if (!token || !hostRef.current || disposedRef.current) return

    if (reconnectRef.current.timer) {
      clearTimeout(reconnectRef.current.timer)
      reconnectRef.current.timer = null
    }

    if (!termRef.current) {
      const term = new Terminal({
        cursorBlink: true,
        fontSize: 13,
        fontFamily: '"JetBrains Mono", Consolas, Menlo, monospace',
        theme: {
          background: '#0B1120',
          foreground: '#E2E8F0',
          cursor: '#7C3AED',
          selectionBackground: '#4F46E5',
        },
        scrollback: 5000,
      })
      const fit = new FitAddon()
      term.loadAddon(fit)
      fitRef.current = fit
      term.open(hostRef.current)
      termRef.current = term
      term.onData((data) => {
        if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
          socketRef.current.send(JSON.stringify({ type: 'input', data }))
        }
      })
      term.onResize(({ cols, rows }) => {
        if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
          socketRef.current.send(JSON.stringify({ type: 'resize', cols, rows }))
        }
      })
    }

    const term = termRef.current
    setStatus('connecting')

    const proto = window.location.protocol === 'https:' ? 'wss' : 'ws'
    const ws = new WebSocket(`${proto}://${window.location.host}/ws/terminal`)
    ws.binaryType = 'arraybuffer'
    socketRef.current = ws

    ws.onopen = () => {
      ws.send(JSON.stringify({ type: 'auth', token }))
    }

    ws.onmessage = (event) => {
      if (typeof event.data === 'string') {
        let msg
        try {
          msg = JSON.parse(event.data)
        } catch {
          return
        }
        if (msg.type === 'ok') {
          reconnectRef.current.attempts = 0
          setStatus('connected')
          term.reset()
          term.focus()
          try {
            fitRef.current.fit()
          } catch {
            // The terminal may not have measurable dimensions yet.
          }
          if (term.cols && term.rows) {
            ws.send(JSON.stringify({ type: 'resize', cols: term.cols, rows: term.rows }))
          }
        } else if (msg.type === 'closed') {
          const reasons = {
            no_active_session: 'No active lab session.',
            session_expired: 'Your lab session has expired.',
            session_stopped: 'The lab session was stopped.',
            container_unavailable: 'The lab container is unavailable.',
            auth_failed: 'Authentication failed.',
            terminal_disabled: 'The terminal service is disabled.',
            terminal_limit_reached: 'Too many terminal connections for this session.',
            rate_limited: 'Too much input, connection closed.',
            shell_exited: 'Shell exited. Type anything to reconnect.',
          }
          writeStatus(reasons[msg.reason] || `Disconnected: ${msg.reason}`)
          if (['no_active_session', 'session_expired', 'session_stopped', 'container_unavailable'].includes(msg.reason)) {
            setStatus(msg.reason === 'no_active_session' ? 'no-session' : 'closed')
            reconnectRef.current.attempts = MAX_RECONNECT_ATTEMPTS
            setSession(null)
            if (onStopped) onStopped()
          }
        } else if (msg.type === 'pong') {
          void msg
        }
      } else {
        term.write(new Uint8Array(event.data))
      }
    }

    ws.onclose = () => {
      socketRef.current = null
      if (disposedRef.current) return
      if (reconnectRef.current.attempts >= MAX_RECONNECT_ATTEMPTS) {
        setStatus('closed')
        return
      }
      const delay = Math.min(15000, 1000 * 2 ** reconnectRef.current.attempts)
      reconnectRef.current.attempts += 1
      setStatus('reconnecting')
      reconnectRef.current.timer = setTimeout(() => connectRef.current?.(), delay)
    }

    ws.onerror = () => {
      try {
        ws.close()
      } catch (err) {
        void err
      }
    }
  }, [writeStatus, onStopped])

  useEffect(() => {
    connectRef.current = connect
  }, [connect])

  useEffect(() => {
    if (status !== 'connecting' && status !== 'reconnecting') return
    if (!session) return
    connect()
    const reconnect = reconnectRef.current
    return () => {
      if (reconnect.timer) {
        clearTimeout(reconnect.timer)
        reconnect.timer = null
      }
    }
  }, [session, status, connect])

  useEffect(() => {
    const onWinResize = () => {
      if (termRef.current && fitRef.current && socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        try {
          fitRef.current.fit()
        } catch {
          return
        }
        socketRef.current.send(JSON.stringify({ type: 'resize', cols: termRef.current.cols, rows: termRef.current.rows }))
      }
    }
    window.addEventListener('resize', onWinResize)
    return () => window.removeEventListener('resize', onWinResize)
  }, [])

  useEffect(() => () => {
    disposedRef.current = true
    if (reconnectRef.current.timer) clearTimeout(reconnectRef.current.timer)
    if (socketRef.current) {
      try {
        socketRef.current.close()
      } catch (err) {
        void err
      }
    }
    socketRef.current = null
    if (termRef.current) {
      termRef.current.dispose()
      termRef.current = null
    }
  }, [])

  const startSession = async () => {
    setStarting(true)
    try {
      const res = await api.post('/lab', { sessionType: 'code-server' })
      setSession(res.data.session)
      setStatus('connecting')
    } catch (err) {
      setStatus('error')
    } finally {
      setStarting(false)
    }
  }

  const stopSession = async () => {
    if (!session) return
    try {
      await api.post(`/lab/${session._id}/stop`)
    } catch (err) {
      void err
    }
    if (socketRef.current) {
      try {
        socketRef.current.close()
      } catch (err) {
        void err
      }
    }
    setSession(null)
    setStatus('no-session')
    if (onStopped) onStopped()
  }

  const statusLabel = {
    loading: 'Checking for active session...',
    'no-session': 'No active lab session',
    connecting: 'Connecting to terminal...',
    connected: 'Connected',
    reconnecting: 'Reconnecting...',
    closed: 'Disconnected',
    error: 'Could not start lab session',
  }[status] || status

  if (!user) {
    return <div className="terminal-empty">Log in to use the terminal.</div>
  }

  if (status === 'no-session' || status === 'error') {
    return (
      <div className="terminal-empty">
        <p>{status === 'error' ? 'Could not start the lab. Try again shortly.' : 'Start a lab session to get a real Linux terminal.'}</p>
        <button type="button" className="btn btn-primary" onClick={startSession} disabled={starting}>
          {starting ? 'Starting...' : 'Start Lab Session'}
        </button>
      </div>
    )
  }

  return (
    <div className="terminal-live">
      <div className="terminal-statusbar">
        <span className={`terminal-dot ${status === 'connected' ? 'on' : 'off'}`} />
        <span>{statusLabel}</span>
        {session && remaining && remaining !== 'expired' && <span className="terminal-ttl">{remaining}</span>}
        <button type="button" className="terminal-stop" onClick={stopSession}>Stop</button>
      </div>
      <div className="terminal-host" ref={hostRef} />
    </div>
  )
}
