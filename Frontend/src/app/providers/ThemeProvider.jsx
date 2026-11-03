import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const ThemeContext = createContext(null)
const STORAGE_KEY = 'unisphere_theme'

function readPreference() {
  try {
    const value = localStorage.getItem(STORAGE_KEY)
    return ['light', 'dark', 'system'].includes(value) ? value : 'system'
  } catch {
    return 'system'
  }
}

function resolveTheme(preference) {
  if (preference !== 'system') return preference
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function ThemeProvider({ children }) {
  const [preference, setPreference] = useState(readPreference)
  const [resolvedTheme, setResolvedTheme] = useState(() => {
    if (typeof window === 'undefined') return 'light'
    return resolveTheme(readPreference())
  })

  useEffect(() => {
    const media = window.matchMedia?.('(prefers-color-scheme: dark)')
    const apply = () => {
      const next = resolveTheme(preference)
      setResolvedTheme(next)
      document.documentElement.dataset.theme = next
      document.documentElement.style.colorScheme = next
    }
    apply()
    media?.addEventListener?.('change', apply)
    return () => media?.removeEventListener?.('change', apply)
  }, [preference])

  const updatePreference = (next) => {
    if (!['light', 'dark', 'system'].includes(next)) return
    setPreference(next)
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {
      // Theme still works for this session when storage is unavailable.
    }
  }

  const value = useMemo(() => ({
    theme: resolvedTheme,
    preference,
    setTheme: updatePreference,
    toggleTheme: () => updatePreference(resolvedTheme === 'dark' ? 'light' : 'dark'),
  }), [resolvedTheme, preference])

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) throw new Error('useTheme must be used inside ThemeProvider')
  return context
}
