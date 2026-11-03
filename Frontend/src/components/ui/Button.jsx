import { forwardRef } from 'react'

const Button = forwardRef(function Button({
  variant = 'primary',
  size = 'md',
  type = 'button',
  className = '',
  disabled = false,
  children,
  ...props
}, ref) {
  return (
    <button
      ref={ref}
      type={type}
      className={['us-button', `us-button--${variant}`, `us-button--${size}`, className].filter(Boolean).join(' ')}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
})

export default Button
