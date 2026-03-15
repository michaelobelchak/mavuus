import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

const API_BASE = '/api'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(() => localStorage.getItem('mavuus_token'))
  const [loading, setLoading] = useState(true)

  // On mount, try to restore session from cookie (GET /api/auth/me) or localStorage token
  useEffect(() => {
    const init = async () => {
      // Try cookie-based auth first
      try {
        const res = await fetch(`${API_BASE}/auth/me`, { credentials: 'include' })
        if (res.ok) {
          const data = await res.json()
          setUser(data.user)
          setLoading(false)
          return
        }
      } catch {}

      // Fallback to localStorage token
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]))
          setUser({
            id: payload.id,
            email: payload.email,
            name: payload.name,
            avatar_url: payload.avatar_url,
            membership_tier: payload.membership_tier,
            email_verified: payload.email_verified,
          })
        } catch {
          localStorage.removeItem('mavuus_token')
          setToken(null)
        }
      }
      setLoading(false)
    }
    init()
  }, [])

  async function login(email, password) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
      credentials: 'include',
    })

    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.error || 'Login failed')
    }

    const data = await res.json()
    localStorage.setItem('mavuus_token', data.token)
    setToken(data.token)
    setUser(data.user)
    return data.user
  }

  async function register(name, email, password) {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
      credentials: 'include',
    })

    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.error || 'Registration failed')
    }

    const data = await res.json()
    localStorage.setItem('mavuus_token', data.token)
    setToken(data.token)
    setUser(data.user)
    return data.user
  }

  async function logout() {
    try {
      await fetch(`${API_BASE}/auth/logout`, { method: 'POST', credentials: 'include' })
    } catch {}
    localStorage.removeItem('mavuus_token')
    setToken(null)
    setUser(null)
  }

  // Demo login — call real API so we get a valid JWT
  async function demoLogin() {
    return login('demo@mavuus.com', 'demo123')
  }

  // For OAuth callback
  function setTokenFromOAuth(newToken) {
    localStorage.setItem('mavuus_token', newToken)
    setToken(newToken)
    try {
      const payload = JSON.parse(atob(newToken.split('.')[1]))
      setUser({
        id: payload.id,
        email: payload.email,
        name: payload.name,
        avatar_url: payload.avatar_url,
        membership_tier: payload.membership_tier,
        email_verified: payload.email_verified,
      })
    } catch {}
  }

  function updateUser(updates) {
    setUser(prev => prev ? { ...prev, ...updates } : prev)
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, demoLogin, setTokenFromOAuth, updateUser, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
