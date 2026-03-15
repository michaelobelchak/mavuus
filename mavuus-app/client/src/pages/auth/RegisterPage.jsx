import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Avatar from '../../components/ui/Avatar'
import { testimonials, trustedBrands } from '../../data/mockData'
import { Star, AlertCircle } from 'lucide-react'

export default function RegisterPage() {
  const navigate = useNavigate()
  const { register, demoLogin } = useAuth()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await register(form.name, form.email, form.password)
      navigate('/dashboard')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDemoLogin = () => {
    demoLogin()
    navigate('/dashboard')
  }

  const t = testimonials[1]

  return (
    <div className="min-h-screen flex">
      {/* Left - Testimonial Side */}
      <div className="hidden lg:flex lg:w-1/2 bg-dark-blue text-white p-16 flex-col justify-between">
        <div>
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand-pink rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">M</span>
            </div>
            <span className="text-xl font-bold">Mavuus</span>
          </Link>
        </div>

        <div>
          <div className="flex gap-1 mb-6">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={18} className="text-yellow-400 fill-yellow-400" />
            ))}
          </div>
          <blockquote className="text-2xl font-medium leading-relaxed mb-8">
            &ldquo;{t.quote}&rdquo;
          </blockquote>
          <div className="flex items-center gap-3">
            <Avatar name={t.name} size="md" />
            <div>
              <p className="font-semibold">{t.name}</p>
              <p className="text-sm text-neutral-300">{t.title}, {t.company}</p>
            </div>
          </div>
        </div>

        <div>
          <p className="text-xs text-neutral-300 mb-4 tracking-wider">TRUSTED BY LEADERS AT</p>
          <div className="flex flex-wrap gap-6">
            {trustedBrands.slice(0, 5).map(brand => (
              <span key={brand} className="text-neutral-400 font-semibold text-sm">{brand}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Right - Register Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-brand-pink rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">M</span>
              </div>
              <span className="text-xl font-bold text-dark-blue">Mavuus</span>
            </Link>
          </div>

          <h1 className="text-3xl font-bold text-dark-blue mb-2">Create your account</h1>
          <p className="text-neutral-500 mb-8">Join Mavuus and connect with marketing leaders</p>

          {error && (
            <div className="flex items-center gap-2 bg-red-50 text-red-600 text-sm p-3 rounded-xl mb-5">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Full Name"
              placeholder="Jane Doe"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              required
            />
            <Input
              label="Email"
              type="email"
              placeholder="you@company.com"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              required
            />
            <Input
              label="Password"
              type="password"
              placeholder="Create a password (min. 6 characters)"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              required
            />

            <Button type="submit" size="lg" className="w-full" disabled={loading}>
              {loading ? 'Creating account...' : 'Create Account'}
            </Button>
          </form>

          <button
            onClick={handleDemoLogin}
            className="mt-4 w-full text-center text-sm text-brand-pink font-medium hover:underline cursor-pointer"
          >
            Try Demo Account (skip registration)
          </button>

          <div className="mt-6 text-center">
            <p className="text-sm text-neutral-500">
              Already have an account?{' '}
              <Link to="/login" className="text-brand-pink font-medium hover:underline">Log in</Link>
            </p>
          </div>

          <div className="mt-6 flex items-center gap-4">
            <div className="flex-1 border-t border-neutral-200" />
            <span className="text-xs text-neutral-400">OR</span>
            <div className="flex-1 border-t border-neutral-200" />
          </div>

          <button className="mt-6 w-full flex items-center justify-center gap-3 px-4 py-3 border border-neutral-200 rounded-xl text-sm font-medium text-neutral-600 hover:bg-neutral-50 transition-colors cursor-pointer">
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Continue with Google
          </button>

          <p className="mt-6 text-xs text-neutral-400 text-center">
            By creating an account, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  )
}
