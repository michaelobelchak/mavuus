import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

const API_BASE = '/api'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(() => localStorage.getItem('mavuus_token'))
  const [loading, setLoading] = useState(true)

  // On mount, check if we have a token and validate it
  useEffect(() => {
    if (token) {
      // Decode JWT payload (no verification — that's server-side)
      try {
        const payload = JSON.parse(atob(token.split('.')[1]))
        setUser({ id: payload.id, email: payload.email, name: payload.name })
      } catch {
        localStorage.removeItem('mavuus_token')
        setToken(null)
      }
    }
    setLoading(false)
  }, [token])

  async function login(email, password) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
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

  function logout() {
    localStorage.removeItem('mavuus_token')
    setToken(null)
    setUser(null)
  }

  // Demo login — skip API, just set user directly
  function demoLogin() {
    const demoUser = { id: 7, email: 'demo@mavuus.com', name: 'Demo User', title: 'Marketing Director', company: 'Mavuus' }
    const fakeToken = btoa(JSON.stringify({ alg: 'none' })) + '.' + btoa(JSON.stringify(demoUser)) + '.demo'
    localStorage.setItem('mavuus_token', fakeToken)
    setToken(fakeToken)
    setUser(demoUser)
    return demoUser
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, demoLogin, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
