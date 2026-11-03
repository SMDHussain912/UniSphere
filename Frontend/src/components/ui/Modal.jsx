import { useEffect } from 'react'
import Button from './Button'

export default function Modal({ open, onClose, title, children, footer, labelledBy = 'us-modal-title' }) {
  useEffect(() => {
    if (!open) return undefined
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose?.()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  if (!open) return null
  return (
    <div className="us-modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose?.() }}>
      <section className="us-modal" role="dialog" aria-modal="true" aria-labelledby={labelledBy}>
        <header className="us-modal__header">
          <h2 id={labelledBy}>{title}</h2>
          <Button variant="ghost" size="sm" aria-label="Close dialog" onClick={onClose}>×</Button>
        </header>
        <div className="us-modal__body">{children}</div>
        {footer && <footer className="us-modal__footer">{footer}</footer>}
      </section>
    </div>
  )
}
