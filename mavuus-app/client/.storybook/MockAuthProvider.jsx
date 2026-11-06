import { useMemo, useState } from 'react'
import { AuthContext } from '../src/context/AuthContext'
import { storyUser } from './storyUser'

/** AuthContext provider for stories: the AuthProvider value shape, with local state instead of network calls. */
export function MockAuthProvider({ initialUser, children }) {
  const [user, setUser] = useState(initialUser)
  const value = useMemo(
    () => ({
      user,
      token: user ? 'storybook-token' : null,
      loading: false,
      login: async () => {
        setUser(initialUser ?? storyUser)
        return initialUser ?? storyUser
      },
      register: async (name, email) => {
        const next = { ...storyUser, name, email }
        setUser(next)
        return next
      },
      logout: async () => setUser(null),
      demoLogin: async () => {
        setUser(storyUser)
        return storyUser
      },
      setTokenFromOAuth: () => setUser(initialUser ?? storyUser),
      updateUser: (patch) => setUser((prev) => (prev ? { ...prev, ...patch } : prev)),
      isAuthenticated: Boolean(user),
    }),
    [user, initialUser],
  )
  return <AuthContext value={value}>{children}</AuthContext>
}
