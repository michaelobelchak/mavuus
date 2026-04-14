import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import { CheckCircle, AlertCircle } from 'lucide-react'
import Button from '../../components/ui/Button'
import { useAuth } from '../../context/AuthContext'

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { token: authToken } = useAuth()
  const verifyToken = searchParams.get('token')
  const [status, setStatus] = useState('loading') // loading, success, error
  const [resending, setResending] = useState(false)

  useEffect(() => {
    if (!verifyToken) {
      setStatus('error')
      return
    }

    fetch(`/api/auth/verify-email?token=${verifyToken}`)
      .then(res => {
        if (res.ok) {
          setStatus('success')
          setTimeout(() => navigate('/dashboard', { replace: true }), 3000)
        } else {
          setStatus('error')
        }
      })
      .catch(() => setStatus('error'))
  }, [verifyToken, navigate])

  const handleResend = async () => {
    if (!authToken) return
    setResending(true)
    try {
      await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { Authorization: `Bearer ${authToken}` },
      })
    } catch {}
    setResending(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 p-8">
      <div className="bg-white rounded-2xl border border-neutral-100 p-8 text-center max-w-md">
        {status === 'loading' && (
          <div className="w-8 h-8 border-2 border-brand-pink border-t-transparent rounded-full animate-spin mx-auto" />
        )}

        {status === 'success' && (
          <>
            <CheckCircle size={48} className="text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-dark-blue mb-2">Email Verified!</h1>
            <p className="text-neutral-500 text-sm mb-4">Redirecting to dashboard...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
            <h1 className="text-xl font-bold text-dark-blue mb-2">Invalid Verification Link</h1>
            <p className="text-neutral-500 text-sm mb-4">This link is invalid or has expired.</p>
            {authToken && (
              <Button onClick={handleResend} disabled={resending} className="mb-4">
                {resending ? 'Sending...' : 'Resend Verification Email'}
              </Button>
            )}
            <div>
              <Link to="/dashboard" className="text-brand-pink hover:underline text-sm">
                Go to Dashboard
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
