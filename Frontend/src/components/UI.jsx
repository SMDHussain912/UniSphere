import { useState, useEffect, useRef } from 'react'
import { navigate } from '../router'
import { useAuth } from '../auth/AuthContext'

// Design tokens from Syntropic Precision system
const COLOR_PRIMARY = '#2a14b4'
const COLOR_SECONDARY = '#0051d5'
const COLOR_TERTIARY = '#0d9488'
const COLOR_SURFACE = '#faf8ff'
const COLOR_SURFACE_BRIGHT = '#faf8ff'
const COLOR_ON_SURFACE = '#131b2e'
const COLOR_OUTLINE = '#777586'
const COLOR_OUTLINE_VARIANT = '#c7c4d7'
const RADIUS_SM = '0.25rem'
const RADIUS_MD = '0.5rem'
const RADIUS_LG = '0.75rem'

function NavLink({ to, children, className = '' }) {
  const path = useHashLocation()
  const active = path === to || (to !== '/' && path.startsWith(`${to}/`))
  return (
    <a href="#" className={`${className} ${active ? 'active' : ''}`}>
      {children}
    </a>
  )
}

function Dropdown({ label, children }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="dropdown" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <button type="button" className="dropdown-toggle" onClick={() => setOpen(!open)}>
        {label}
        <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor" style={{ marginLeft: 4, opacity: 0.6 }}>
          <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.5" fill="none" />
        </svg>
      </button>
      {open && <div className="dropdown-menu">{children}</div>}
    </div>
  )
}

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
  return <span className="tooltip" data-tip={text}>{children}</span>
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
      )}
      <button type="button" className="page-btn" disabled={page >= totalPages} onClick={() => onChange(page + 1)}>
        Next
      </button>
    </div>
  )
}
