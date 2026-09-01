import { useState, useEffect, useRef } from 'react'
import { navigate } from '../router'
import { useAuth } from '../auth/AuthContext'
import { LabTerminal } from './Terminal'

export function Loader() {
  return <div className="loader" />
}

export function Spinner({ size = 16 }) {
  return <div className="spinner" style={{ width: size, height: size }} />
}

export function Avatar({ src, name, size = 32 }) {
  const initials = name?.split(' ').map((n) => n[0]).join('').toUpperCase() || '?'
  if (src) {
    return <img src={src} alt={name || 'avatar'} className="avatar" style={{ width: size, height: size, borderRadius: '50%' }} />
  }
  return (
    <div className="avatar" style={{ width: size, height: size, borderRadius: '50%' }} title={name || ''}>
      <span className="avatar-text">{initials}</span>
    </div>
  )
}

export function ProgressBar({ value, label, small }) {
  const pct = Math.min(100, Math.max(0, value || 0))
  return (
    <div className={small ? 'progress-compact' : 'progress'}>
      {label && <div className="progress-label">{label}</div>}
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

export function Editor({ code, onChange, language }) {
  return (
    <textarea
      className="code-editor"
      value={code}
      onChange={(e) => onChange(e.target.value)}
      spellCheck="false"
      data-language={language}
    />
  )
}

export function VirtualTerminal() {
  return <LabTerminal />
}

export function Modal({ show, onClose, title, children }) {
  if (!show) return null
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">{title}</h3>
          <button type="button" className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  )
}

export function Tooltip({ text, children }) {
  return (
    <span className="tooltip" data-tip={text}>
      {children}
    </span>
  )
}

export function useSearchParams() {
  const path = useHashLocation()
  const segs = path.split('/').filter(Boolean)
  const id = segs[1]
  return { id }
}

export function Badge({ kind = 'muted', children }) {
  return <span className={`badge badge-${kind}`}>{children}</span>
}

export function Alert({ kind = 'error', children }) {
  if (!children) return null
  return <div className={`alert alert-${kind}`}>{children}</div>
}

export function Pagination({ page, totalPages, onChange }) {
  if (!totalPages || totalPages <= 1) return null
  const pages = []
  for (let i = 1; i <= totalPages; i += 1) pages.push(i)
  return (
    <div className="pagination">
      <button type="button" className="page-btn" disabled={page <= 1} onClick={() => onChange(page - 1)}>
        Prev
      </button>
      {pages.map((p) => (
        <button
          type="button"
          key={p}
          className={`page-btn ${p === page ? 'active' : ''}`}
          onClick={() => onChange(p)}
        >
          {p}
        </button>
      ))}
      <button type="button" className="page-btn" disabled={page >= totalPages} onClick={() => onChange(page + 1)}>
        Next
      </button>
    </div>
  )
}

export function EmptyState({ text }) {
  return <div className="empty">{text || 'No data found'}</div>
}

export function Field({ label, children }) {
  return (
    <div className="field">
      <label>{label}</label>
      {children}
    </div>
  )
}

export function CaptchaField({ value, onChange }) {
  const [ts, setTs] = useState(Date.now())
  return (
    <div>
      <div className="captcha-row">
        <img src={`/api/v1/auth/captcha?t=${ts}`} alt="captcha" />
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => setTs(Date.now())}>
          Refresh
        </button>
      </div>
      <div className="field mt">
        <input
          className="input"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Enter the captcha text"
        />
      </div>
    </div>
  )
}

export function RequireAuth({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <Loader />
  if (!user) {
    return (
      <div className="card empty">
        <div>You need to log in to continue.</div>
        <div className="mt">
          <button type="button" className="btn btn-primary" onClick={() => navigate('/login')}>
            Go to Login
          </button>
        </div>
      </div>
    )
  }
  return children
}

export const STAFF_ROLES = ['admin', 'superadmin', 'exam_admin', 'question_admin', 'hallticket_admin', 'grader_admin']

export const ROLE_LABELS = {
  admin: 'Administrator',
  superadmin: 'Super Admin',
  exam_admin: 'Exam Officer',
  question_admin: 'Question Setter',
  hallticket_admin: 'Hall Ticket Officer',
  grader_admin: 'Answer Evaluator',
  user: 'Candidate',
}

export function RequireRole({ roles, children }) {
  const { user } = useAuth()
  const allowed = roles || STAFF_ROLES
  if (!user || !allowed.includes(user.role)) {
    return (
      <div className="card empty">
        <div>You do not have permission to access this page.</div>
      </div>
    )
  }
  return children
}

export function RequireAdmin({ children }) {
  const { user } = useAuth()
  if (!user || !STAFF_ROLES.includes(user.role)) {
    return (
      <div className="card empty">
        <div>You do not have permission to access this page.</div>
      </div>
    )
  }
  return children
}

export function formatDate(value) {
  if (!value) return '—'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}

export function AdminTabs({ current }) {
  const { user } = useAuth()
  const role = user?.role
  const tabs = [
    { key: '', label: 'Dashboard', to: '/admin', roles: STAFF_ROLES },
    { key: 'exams', label: 'Exams', to: '/admin/exams', roles: ['admin', 'superadmin', 'exam_admin', 'question_admin'] },
    { key: 'enrollments', label: 'Enrollments', to: '/admin/enrollments', roles: ['admin', 'superadmin', 'exam_admin', 'hallticket_admin'] },
    { key: 'centers', label: 'Exam Centers', to: '/admin/centers', roles: ['admin', 'superadmin', 'exam_admin', 'hallticket_admin'] },
    { key: 'hall-tickets', label: 'Hall Tickets', to: '/admin/hall-tickets', roles: ['admin', 'superadmin', 'hallticket_admin'] },
    { key: 'papers', label: 'Question Papers', to: '/admin/papers', roles: ['admin', 'superadmin', 'question_admin'] },
    { key: 'grading', label: 'Answer Verification', to: '/admin/grading', roles: ['admin', 'superadmin', 'grader_admin'] },
    { key: 'results', label: 'Exam Results', to: '/admin/results', roles: STAFF_ROLES },
    { key: 'jobs', label: 'Jobs', to: '/admin/jobs', roles: ['admin', 'superadmin'] },
    { key: 'applications', label: 'Job Applications', to: '/admin/applications', roles: ['admin', 'superadmin'] },
    { key: 'news', label: 'News', to: '/admin/news', roles: ['admin', 'superadmin'] },
    { key: 'admins', label: 'Admin Accounts', to: '/admin/admins', roles: ['superadmin'] },
  ]
  const visible = tabs.filter((t) => t.roles.includes(role))
  return (
    <div className="admin-tabs">
      {visible.map((t) => (
        <a key={t.key} href={`#${t.to}`} className={`sidebar-link ${current === t.key ? 'active' : ''}`}>
          {t.label}
        </a>
      ))}
    </div>
  )
}
