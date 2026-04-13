import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../components/ui/Toast'
import { AlertCircle, Eye, EyeOff, ChevronLeft, ChevronRight } from 'lucide-react'

const testimonialSlides = [
  {
    name: 'Cameron Micules',
    title: 'Fractional CMO at Niuz',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=160&h=160&fit=crop&crop=faces',
    quote: "Joining Mavuus gives you the opportunity to expand your network further, and potentially find new work. And they don't pump out the typical, formulaic, templated content — it's real, it's vulnerable, it's relatable.",
  },
  {
    name: 'Leah Andrew',
    title: 'VP Marketing at Lyft',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=160&h=160&fit=crop&crop=faces',
    quote: 'The Mavuus community has been a game-changer for me — the quality of conversation, the candor, and the support from peers who actually get what it takes to lead marketing today.',
  },
  {
    name: 'Marcus Chen',
    title: 'CMO at Fathom',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=160&h=160&fit=crop&crop=faces',
    quote: "This is the first community I've joined where I actually learn something new every single week. The speaker lineup alone is worth the membership.",
  },
]

const logoBrands = [
  'Microsoft',
  'CERIDIAN',
  'PointClickCare',
  'Salesforce',
  'Scotiabank',
  'Amazon',
  'Terminus',
]

export default function RegisterPage() {
  const navigate = useNavigate()
  const toast = useToast()
  const [searchParams] = useSearchParams()
  const { register, demoLogin } = useAuth()

  const [form, setForm] = useState({
    name: '',
    email: searchParams.get('email') || '',
    password: '',
    confirm: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [slide, setSlide] = useState(0)

  // Keep email field in sync if user arrives with ?email=
  useEffect(() => {
    const emailParam = searchParams.get('email')
    if (emailParam && !form.email) {
      setForm((f) => ({ ...f, email: emailParam }))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (form.password !== form.confirm) {
      setError("Passwords don't match")
      return
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }
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

  const handleDemoLogin = async () => {
    setError('')
    setLoading(true)
    try {
      await demoLogin()
      navigate('/dashboard')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const t = testimonialSlides[slide]
  const prev = () => setSlide((s) => (s - 1 + testimonialSlides.length) % testimonialSlides.length)
  const next = () => setSlide((s) => (s + 1) % testimonialSlides.length)

  return (
    <div className="min-h-screen flex bg-bg-light font-[Manrope]">
      {/* ─── Left Panel ─────────────────────────────────────────── */}
      <aside className="hidden lg:flex lg:w-[55%] bg-[#79A2BB] text-white flex-col relative overflow-hidden">
        <div className="flex-1 flex items-center justify-center px-16">
          <div className="w-full max-w-[588px] flex flex-col gap-8 items-center text-center">
            <div className="flex gap-3 items-start self-start">
              <div className="w-[78px] h-[78px] rounded-full overflow-hidden bg-[#d6e0e6] flex-shrink-0">
                <img
                  src={t.avatar}
                  alt={t.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex flex-col gap-2 justify-center text-left whitespace-nowrap">
                <p className="text-[28px] font-semibold leading-[1.3]">{t.name}</p>
                <p className="text-[20px] font-light leading-[1.6] text-[#E4EBF1]">
                  {t.title}
                </p>
              </div>
            </div>
            <p className="text-[20px] font-medium leading-[28px]">
              &ldquo;{t.quote}&rdquo;
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={prev}
                aria-label="Previous testimonial"
                className="w-8 h-8 rounded-lg border-2 border-[#F5F8FE] flex items-center justify-center hover:bg-white/10 transition-colors cursor-pointer"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                type="button"
                onClick={next}
                aria-label="Next testimonial"
                className="w-8 h-8 rounded-lg bg-[#F5F8FE] text-[#1C2232] flex items-center justify-center hover:bg-white transition-colors cursor-pointer"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>

        <div className="px-16 pb-16 flex flex-col gap-8 items-center">
          <p className="text-[20px] font-semibold leading-[1.3] text-white capitalize text-center">
            Our talent has worked at some of the biggest companies:
          </p>
          <div className="flex flex-wrap gap-6 items-center justify-center opacity-80">
            {logoBrands.map((brand) => (
              <span
                key={brand}
                className="text-white/90 font-semibold text-sm tracking-wide mix-blend-luminosity"
              >
                {brand}
              </span>
            ))}
          </div>
        </div>
      </aside>

      {/* ─── Right Panel — Form ────────────────────────────────── */}
      <section className="flex-1 flex items-center justify-center px-6 py-10 lg:px-16">
        <div className="w-full max-w-[414px] flex flex-col gap-10">
          <Link to="/home" className="flex items-center gap-2">
            <img src="/assets/shared/mavuus-icon.svg" alt="" className="w-8 h-8" />
            <img src="/assets/shared/mavuus-wordmark.svg" alt="Mavuus" className="h-5" />
          </Link>

          <div className="flex flex-col gap-2.5 text-dark-blue">
            <h1 className="text-[28px] font-semibold leading-[1.3]">
              Create Your Mavuus Account
            </h1>
            <p className="text-[16px] font-light leading-[1.6]">
              Join 500+ marketing leaders elevating their influence
            </p>
          </div>

          {error && (
            <div
              key={error}
              className="flex items-center gap-2 bg-red-50 text-red-600 text-sm p-3 rounded-xl border border-red-200 animate-shake"
            >
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-10">
            <div className="flex flex-col gap-6">
              {/* Name */}
              <div className="flex flex-col gap-2.5">
                <label className="px-1 text-[14px] font-semibold leading-5 text-neutral-600">
                  Full name
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Jane Doe"
                  className="w-full px-4 py-4 bg-white border border-neutral-300 rounded-xl text-[16px] text-dark-blue placeholder:text-[#8692A1] outline-none focus:border-brand-pink transition-colors"
                />
              </div>

              {/* Email */}
              <div className="flex flex-col gap-2.5">
                <label className="px-1 text-[14px] font-semibold leading-5 text-neutral-600">
                  Email address
                </label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="you@company.com"
                  className="w-full px-4 py-4 bg-white border border-neutral-300 rounded-xl text-[16px] text-dark-blue placeholder:text-[#8692A1] outline-none focus:border-brand-pink transition-colors"
                />
              </div>

              {/* Password */}
              <div className="flex flex-col gap-2.5">
                <label className="px-1 text-[14px] font-semibold leading-5 text-neutral-600">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="At least 8 characters"
                    className="w-full px-4 py-4 pr-12 bg-white border border-neutral-300 rounded-xl text-[16px] text-dark-blue placeholder:text-[#8692A1] outline-none focus:border-brand-pink transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Confirm */}
              <div className="flex flex-col gap-2.5">
                <label className="px-1 text-[14px] font-semibold leading-5 text-neutral-600">
                  Confirm password
                </label>
                <div className="relative">
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    required
                    value={form.confirm}
                    onChange={(e) => setForm({ ...form, confirm: e.target.value })}
                    placeholder="Re-enter your password"
                    className="w-full px-4 py-4 pr-12 bg-white border border-neutral-300 rounded-xl text-[16px] text-dark-blue placeholder:text-[#8692A1] outline-none focus:border-brand-pink transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((s) => !s)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 cursor-pointer"
                  >
                    {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4 items-center">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center px-8 py-4 rounded-2xl bg-brand-pink text-white text-[16px] font-semibold leading-6 shadow-[0_4px_15px_rgba(242,109,146,0.25)] hover:bg-brand-pink-hover active:scale-[0.99] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
              >
                {loading ? 'Creating account…' : 'Create Account'}
              </button>

              <button
                type="button"
                onClick={() => toast.info('Google sign-up is coming soon.')}
                className="w-full flex items-center justify-center gap-4 px-8 py-4 rounded-2xl bg-white border border-neutral-300 text-[16px] font-semibold leading-6 text-neutral-600 hover:bg-neutral-50 transition-colors cursor-pointer"
              >
                Sign Up With Google
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
              </button>

              <p className="text-[16px] font-medium text-dark-blue leading-6 text-center">
                Already have an account?{' '}
                <Link to="/login" className="font-semibold text-brand-pink underline">
                  Sign In
                </Link>
              </p>
            </div>
          </form>

          <button
            type="button"
            onClick={handleDemoLogin}
            className="text-center text-sm text-neutral-500 hover:text-brand-pink transition-colors cursor-pointer"
          >
            Or try the demo account
          </button>

          <p className="text-xs text-neutral-400 text-center">
            By creating an account, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </section>
    </div>
  )
}
