import { useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function AuthCallbackPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { setTokenFromOAuth } = useAuth()

  useEffect(() => {
    const token = searchParams.get('token')
    if (token) {
      setTokenFromOAuth(token)
      navigate('/dashboard', { replace: true })
    } else {
      navigate('/login?error=oauth_failed', { replace: true })
    }
  }, [searchParams, navigate, setTokenFromOAuth])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-brand-pink border-t-transparent rounded-full animate-spin" />
    </div>
  )
}
