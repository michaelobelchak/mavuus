import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

const API_BASE = '/api'

/**
 * Decode a JWT payload (base64url) without verification.
 * atob() only accepts standard base64, so we first translate base64url →
 * base64 (replace -/_ with +//) and add padding. Any character that slips
 * through (or malformed JSON) throws, which the caller must handle.
 */
function decodeJwtPayload(token) {
  const segment = token.split('.')[1]
  if (!segment) throw new Error('Malformed token')
  const normalized = segment.replace(/-/g, '+').replace(/_/g, '/')
  const padded = normalized + '='.repeat((4 - (normalized.length % 4)) % 4)
  const json = decodeURIComponent(
    atob(padded)
      .split('')
      .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
      .join('')
  )
  return JSON.parse(json)
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(() => localStorage.getItem('mavuus_token'))
  const [loading, setLoading] = useState(true)

  // On mount, check if we have a token and validate it
  useEffect(() => {
    if (token) {
      // Decode JWT payload (no verification — that's server-side)
      try {
        const payload = decodeJwtPayload(token)
        setUser({
          id: payload.id,
          email: payload.email,
          name: payload.name,
          avatar_url: payload.avatar_url,
          membership_tier: payload.membership_tier,
        })
      } catch (err) {
        console.warn('[auth] failed to decode JWT, logging out:', err)
        localStorage.removeItem('mavuus_token')
        setToken(null)
        setUser(null)
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

  function updateUser(patch) {
    setUser((prev) => (prev ? { ...prev, ...patch } : prev))
  }

  // Demo login — call real API so we get a valid JWT
  async function demoLogin() {
    return login('demo@mavuus.com', 'demo123')
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, demoLogin, updateUser, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
