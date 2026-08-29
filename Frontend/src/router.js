import { useEffect, useState } from 'react'

export function getPath() {
  const h = window.location.hash
  if (!h) return ''
  return h.replace(/^#\/?/, '')
}

export function useHashLocation() {
  const [path, setPath] = useState(getPath())
  useEffect(() => {
    const onChange = () => setPath(getPath())
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])
  return path
}

export function navigate(to) {
  window.location.hash = `/${to.replace(/^\//, '')}`
}
