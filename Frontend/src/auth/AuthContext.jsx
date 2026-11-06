import { createContext, useContext, useEffect, useState } from 'react'
import { api } from '../api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(() => Boolean(localStorage.getItem('unisphere_token')))

  useEffect(() => {
    if (!localStorage.getItem('unisphere_token')) return
    api
      .get('/auth/me')
      .then((res) => setUser(res.data.user))
      .catch(() => localStorage.removeItem('unisphere_token'))
      .finally(() => setLoading(false))
  }, [])

  const login = async (email, password, captcha) => {
    const res = await api.post('/auth/login', { email, password, captcha })
    localStorage.setItem('unisphere_token', res.data.token)
    setUser(res.data.user)
  }

  const register = async (fields) => {
    const res = await api.post('/auth/register', fields)
    localStorage.setItem('unisphere_token', res.data.token)
    setUser(res.data.user)
  }

  const logout = () => {
    localStorage.removeItem('unisphere_token')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
