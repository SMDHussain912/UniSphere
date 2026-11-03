import { forwardRef } from 'react'

const Input = forwardRef(function Input({ label, hint, error, id, className = '', ...props }, ref) {
  const inputId = id || props.name
  return (
    <div className="us-field">
      {label && <label className="us-field__label" htmlFor={inputId}>{label}</label>}
      <input ref={ref} id={inputId} className={['us-input', error ? 'us-input--error' : '', className].filter(Boolean).join(' ')} aria-invalid={Boolean(error)} aria-describedby={error || hint ? `${inputId}-message` : undefined} {...props} />
      {(error || hint) && <p id={`${inputId}-message`} className={error ? 'us-field__error' : 'us-field__hint'}>{error || hint}</p>}
    </div>
  )
})

export default Input
