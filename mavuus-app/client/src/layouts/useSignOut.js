import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

/**
 * Signs out and then navigates: `signOut(to)` waits for the logout request before leaving, so
 * the route guards never see a half-signed-out user. `sessionExpired()` is signOut('/login'),
 * for a poll that gets a 401.
 */
export function useSignOut() {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const signOut = useCallback(
    async (to = '/') => {
      await logout()
      navigate(to)
    },
    [logout, navigate],
  )
  const sessionExpired = useCallback(() => signOut('/login'), [signOut])
  return { signOut, sessionExpired }
}
