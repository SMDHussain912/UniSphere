const variants = ['neutral', 'primary', 'success', 'warning', 'danger', 'info']

export default function Badge({ variant = 'neutral', className = '', children, ...props }) {
  const safeVariant = variants.includes(variant) ? variant : 'neutral'
  return <span className={['us-badge', `us-badge--${safeVariant}`, className].filter(Boolean).join(' ')} {...props}>{children}</span>
}
