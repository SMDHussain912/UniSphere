import { cloneElement, isValidElement, useCallback, useEffect, useId, useState } from 'react'
import { useHashLocation } from '../router'
import { useAuth } from '../auth/AuthContext'
import { api } from '../api'
import { LabTerminal } from './Terminal'

// Staff roles used throughout the application.
export const STAFF_ROLES = ['admin', 'manager', 'supervisor']

// Loading components
export function Loader() {
  return <div className="loader" />
}

export function Spinner({ size = 16 }) {
  return (
    <div
      className="spinner"
      style={{ width: size, height: size }}
    />
  )
}

// Avatar component
export function Avatar({ src, name, size = 32 }) {
  const initials =
    name?.split(' ').map((n) => n[0]).join('').toUpperCase() || '?'

  if (src) {
    return (
      <img
        src={src}
        alt={name || 'avatar'}
        className="avatar"
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
        }}
      />
    )
  }

  return (
    <div
      className="avatar"
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
      }}
      title={name || ''}
    >
      <span className="avatar-text">{initials}</span>
    </div>
  )
}

// Progress bar
export function ProgressBar({ value, label, small }) {
  const pct = Math.min(100, Math.max(0, value || 0))

  return (
    <div className={small ? 'progress-compact' : 'progress'}>
      {label && <div className="progress-label">{label}</div>}

      <div className="progress-bar">
        <div
          className="progress-fill"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

// Code editor
export function Editor({ code, onChange, language }) {
  return (
    <textarea
      className="code-editor"
      value={code}
      onChange={(event) => onChange(event.target.value)}
      spellCheck="false"
      data-language={language}
    />
  )
}

// Real Linux lab terminal
export function VirtualTerminal({ onStopped }) {
  return <LabTerminal onStopped={onStopped} />
}

// Modal
export function Modal({ show, onClose, title, children }) {
  if (!show) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="modal-header">
          <h3 className="modal-title">{title}</h3>

          <button
            type="button"
            className="modal-close"
            onClick={onClose}
            aria-label="Close modal"
          >
            ×
          </button>
        </div>

        <div className="modal-body">{children}</div>
      </div>
    </div>
  )
}

// Tooltip
export function Tooltip({ text, children }) {
  return (
    <span className="tooltip" data-tip={text}>
      {children}
    </span>
  )
}

// URL search parameters hook
export function useSearchParams() {
  const path = useHashLocation()
  const segments = path.split('/').filter(Boolean)

  return {
    id: segments[1],
  }
}

// Badge
export function Badge({ kind = 'muted', children }) {
  return (
    <span className={`badge badge-${kind}`}>
      {children}
    </span>
  )
}

// Alert
export function Alert({ kind = 'error', children }) {
  if (!children) return null

  return (
    <div className={`alert alert-${kind}`}>
      {children}
    </div>
  )
}

// Pagination
export function Pagination({ page, totalPages, onChange }) {
  if (!totalPages || totalPages <= 1) return null

  const pages = Array.from(
    { length: totalPages },
    (_, index) => index + 1
  )

  return (
    <div className="pagination">
      <button
        type="button"
        className="page-btn"
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
      >
        Prev
      </button>

      {pages.map((currentPage) => (
        <button
          type="button"
          key={currentPage}
          className={`page-btn ${
            currentPage === page ? 'active' : ''
          }`}
          onClick={() => onChange(currentPage)}
          aria-current={currentPage === page ? 'page' : undefined}
        >
          {currentPage}
        </button>
      ))}

      <button
        type="button"
        className="page-btn"
        disabled={page >= totalPages}
        onClick={() => onChange(page + 1)}
      >
        Next
      </button>
    </div>
  )
}

// Reusable form field
export function Field({ label, children, className = '', ...props }) {
  const generatedId = useId()

  const control = isValidElement(children)
    ? cloneElement(children, {
        id: children.props.id || generatedId,
      })
    : children

  return (
    <div
      className={`field ${className}`.trim()}
      {...props}
    >
      <label
        className="field-label"
        htmlFor={generatedId}
      >
        {label}
      </label>

      <div className="field-content">
        {control}
      </div>
    </div>
  )
}

// CAPTCHA input
export function CaptchaField({
  value = '',
  onChange,
  id,
  refreshKey,
  onRefresh,
  required = true,
  ...props
}) {
  const [svg, setSvg] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [prevRefreshKey, setPrevRefreshKey] = useState(refreshKey)

  if (refreshKey !== prevRefreshKey) {
    setPrevRefreshKey(refreshKey)
    setLoading(true)
    setError(null)
  }

  const loadCaptcha = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await api.getCaptcha()
      setSvg(data)
    } catch (err) {
      setError(err.message || 'Failed to load captcha')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let active = true
    api.getCaptcha()
      .then((data) => {
        if (active) {
          setSvg(data)
          setError(null)
        }
      })
      .catch((err) => {
        if (active) {
          setError(err.message || 'Failed to load captcha')
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false)
        }
      })
    return () => {
      active = false
    }
  }, [refreshKey])

  const handleRefresh = () => {
    onChange?.('')
    loadCaptcha()
    onRefresh?.()
  }

  return (
    <div className="captcha-field">
      <div className="captcha-row">
        {loading ? (
          <div className="captcha-placeholder captcha-loading" aria-live="polite">
            <Spinner size={14} />
            <span>Loading challenge...</span>
          </div>
        ) : error ? (
          <div className="captcha-placeholder captcha-error" role="alert">
            <span>Failed to load</span>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={handleRefresh}
              title="Retry loading captcha"
            >
              Retry
            </button>
          </div>
        ) : (
          <img
            src={`data:image/svg+xml;utf8,${encodeURIComponent(svg)}`}
            alt="CAPTCHA challenge (click to refresh)"
            className="captcha-img"
            onClick={handleRefresh}
            title="Click to refresh challenge"
          />
        )}

        <button
          type="button"
          className="btn btn-ghost btn-sm captcha-refresh-btn"
          onClick={handleRefresh}
          disabled={loading}
          title="Get a new challenge"
          aria-label="Refresh captcha challenge"
        >
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            className={loading ? 'captcha-spinning' : ''}
          >
            <path d="M21.5 2v6h-6M2.5 22v-6h6" />
            <path d="M21.5 15.5a9 9 0 0 1-16.14 4.16L2.5 16M2.5 8.5a9 9 0 0 1 16.14-4.16L21.5 8" />
          </svg>
          <span>Refresh</span>
        </button>
      </div>

      <input
        id={id}
        className="input captcha-input"
        type="text"
        value={value}
        onChange={(event) => onChange?.(event.target.value)}
        placeholder="Enter captcha code"
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck="false"
        required={required}
        aria-label="Enter captcha code"
        {...props}
      />
    </div>
  )
}

// Empty state
export function EmptyState({
  label = 'No items',
  icon = 'grid',
}) {
  return (
    <div className="empty-state" data-icon={icon}>
      <div className="empty-state-icon">
        <svg
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M12 2L2 10L12 18L22 10L12 2Z" />
          <circle cx="12" cy="12" r="10" fill="none" strokeWidth="1" />
        </svg>
      </div>

      <h3 className="empty-state-title">{label}</h3>
    </div>
  )
}

// Date formatter
export function formatDate(dateString) {
  const date = new Date(dateString)

  if (Number.isNaN(date.getTime())) {
    return 'Invalid date'
  }

  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

// Authentication route guard
export function RequireAuth({ children }) {
  const { user, loading } = useAuth()

  if (loading || !user) return null

  return children
}

// Admin route guard
export function RequireAdmin({ children }) {
  const { user, loading } = useAuth()

  if (loading || !user || user.role !== 'admin') {
    return null
  }

  return children
}

// Admin tabs
export function AdminTabs({ children }) {
  return (
    <nav className="admin-tabs">
      <ul>{children}</ul>
    </nav>
  )
}

// Role-based route guard
export function RequireRole({ role, children }) {
  const { user, loading } = useAuth()

  if (loading || !user || user.role !== role) {
    return null
  }

  return children
}

// Role labels
export const ROLE_LABELS = {
  admin: 'Administrator',
  manager: 'Manager',
  supervisor: 'Supervisor',
  user: 'User',
}