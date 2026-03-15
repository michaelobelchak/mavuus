import { useState } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import PasswordStrength from '../../components/ui/PasswordStrength'
import { CheckCircle, AlertCircle } from 'lucide-react'

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 p-8">
        <div className="bg-white rounded-2xl border border-neutral-100 p-8 text-center max-w-md">
          <AlertCircle size={40} className="text-red-500 mx-auto mb-3" />
          <h1 className="text-xl font-bold text-dark-blue mb-2">Invalid Reset Link</h1>
          <p className="text-neutral-500 text-sm mb-4">This password reset link is invalid or has expired.</p>
          <Link to="/forgot-password" className="text-brand-pink font-medium hover:underline text-sm">
            Request a new link
          </Link>
        </div>
      </div>
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      })
      if (res.ok) {
        setSuccess(true)
      } else {
        const data = await res.json()
        setError(data.error || 'Failed to reset password')
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 p-8">
      <div className="w-full max-w-md">
        <div className="mb-8">
          <Link to="/login" className="flex items-center gap-2">
            <img src="/assets/shared/mavuus-icon.svg" alt="" className="w-7 h-7" />
            <img src="/assets/shared/mavuus-wordmark.svg" alt="Mavuus" className="h-5" />
          </Link>
        </div>

        {success ? (
          <div className="bg-white rounded-2xl border border-neutral-100 p-8 text-center">
            <CheckCircle size={40} className="text-green-500 mx-auto mb-3" />
            <h1 className="text-2xl font-bold text-dark-blue mb-2">Password Reset!</h1>
            <p className="text-neutral-500 text-sm mb-6">Your password has been updated. You can now log in.</p>
            <Button onClick={() => navigate('/login')} className="w-full">Go to Login</Button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-neutral-100 p-8">
            <h1 className="text-2xl font-bold text-dark-blue mb-2">Reset Password</h1>
            <p className="text-neutral-500 text-sm mb-6">Enter your new password below.</p>

            {error && (
              <div className="bg-red-50 text-red-600 text-sm p-3 rounded-xl mb-4">{error}</div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <Input
                  label="New Password"
                  type="password"
                  placeholder="At least 8 characters"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
                <PasswordStrength password={password} />
              </div>
              <Input
                label="Confirm Password"
                type="password"
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required
              />
              <Button type="submit" size="lg" className="w-full" disabled={loading}>
                {loading ? 'Resetting...' : 'Reset Password'}
              </Button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
