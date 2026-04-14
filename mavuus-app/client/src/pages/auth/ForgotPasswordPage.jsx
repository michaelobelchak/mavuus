import { useState } from 'react'
import { Link } from 'react-router-dom'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import { ArrowLeft, Mail } from 'lucide-react'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      if (res.ok) {
        setSubmitted(true)
      } else {
        const data = await res.json()
        setError(data.error || 'Something went wrong')
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

        {submitted ? (
          <div className="bg-white rounded-2xl border border-neutral-100 p-8 text-center">
            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail size={28} className="text-green-500" />
            </div>
            <h1 className="text-2xl font-bold text-dark-blue mb-2">Check Your Email</h1>
            <p className="text-neutral-500 text-sm mb-6">
              If an account exists for <strong>{email}</strong>, we&apos;ve sent password reset instructions.
            </p>
            <Link to="/login" className="text-brand-pink font-medium hover:underline text-sm">
              Back to Login
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-neutral-100 p-8">
            <h1 className="text-2xl font-bold text-dark-blue mb-2">Forgot Password?</h1>
            <p className="text-neutral-500 text-sm mb-6">
              Enter your email and we&apos;ll send you a link to reset your password.
            </p>

            {error && (
              <div className="bg-red-50 text-red-600 text-sm p-3 rounded-xl mb-4">{error}</div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <Input
                label="Email"
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
              <Button type="submit" size="lg" className="w-full" disabled={loading}>
                {loading ? 'Sending...' : 'Send Reset Link'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Link to="/login" className="text-sm text-neutral-500 hover:text-brand-pink flex items-center justify-center gap-1">
                <ArrowLeft size={14} /> Back to Login
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
