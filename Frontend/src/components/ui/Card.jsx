export default function Card({ as: Component = 'section', padding = 'md', interactive = false, className = '', children, ...props }) {
  return (
    <Component
      className={['us-card', `us-card--${padding}`, interactive ? 'us-card--interactive' : '', className].filter(Boolean).join(' ')}
      {...props}
    >
      {children}
    </Component>
  )
}
