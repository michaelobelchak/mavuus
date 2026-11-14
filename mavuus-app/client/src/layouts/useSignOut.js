import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// The sign-out in progress, shared by every caller: the notifications and messages polls can both
// get a 401 at once, and the session should end once.
let pending = null

/**
 * Signs out and then navigates: `signOut(to)` waits for the logout request before leaving.
 * `sessionExpired()` is signOut('/login'), for a poll that gets a 401. While a sign-out is under
 * way, further calls return the same promise instead of logging out again.
 */
export function useSignOut() {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const signOut = useCallback(
    (to = '/') => {
      if (pending) return pending
      pending = (async () => {
        try {
          await logout()
          navigate(to)
        } finally {
          pending = null
        }
      })()
      return pending
    },
    [logout, navigate],
  )
  const sessionExpired = useCallback(() => signOut('/login'), [signOut])
  return { signOut, sessionExpired }
}
