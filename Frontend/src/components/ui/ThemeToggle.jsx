import { useTheme } from '../../app/providers/ThemeProvider'

export default function ThemeToggle({ className = '' }) {
  const { theme, preference, setTheme, toggleTheme } = useTheme()
  return (
    <div className={['us-theme-toggle', className].filter(Boolean).join(' ')}>
      <button type="button" className="us-theme-toggle__switch" onClick={toggleTheme} aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`} title="Toggle light and dark theme">
        <span aria-hidden="true">{theme === 'dark' ? '☾' : '☀'}</span>
      </button>
      <label className="us-sr-only" htmlFor="us-theme-preference">Theme preference</label>
      <select id="us-theme-preference" value={preference} onChange={(event) => setTheme(event.target.value)} aria-label="Theme preference">
        <option value="system">System</option>
        <option value="light">Light</option>
        <option value="dark">Dark</option>
      </select>
    </div>
  )
}
