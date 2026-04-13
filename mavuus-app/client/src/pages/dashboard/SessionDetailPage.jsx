import { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../components/ui/Toast'
import Avatar from '../../components/ui/Avatar'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import ShareModal from '../../components/ui/ShareModal'
import StatusDot from '../../components/ui/StatusDot'
import { fireConfetti } from '../../hooks/useConfetti'
import {
  Calendar,
  Clock,
  ArrowLeft,
  CheckCircle,
  Users,
  Video,
  Share2,
} from 'lucide-react'

function useCountdown(targetDate) {
  const target = useMemo(() => (targetDate ? new Date(targetDate).getTime() : null), [targetDate])
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    if (!target) return
    const iv = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(iv)
  }, [target])
  if (!target) return { days: 0, hours: 0, minutes: 0, seconds: 0, done: true }
  const diff = Math.max(0, target - now)
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff % 86400000) / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
    seconds: Math.floor((diff % 60000) / 1000),
    done: diff === 0,
  }
}

function TimeTile({ value, label }) {
  return (
    <div className="flex flex-col items-center">
      <div className="flex gap-1">
        {String(value).padStart(2, '0').split('').map((d, i) => (
          <div
            key={i}
            className="w-9 h-12 md:w-11 md:h-14 rounded-md bg-white border border-neutral-200 flex items-center justify-center text-[20px] md:text-[24px] font-semibold text-dark-blue shadow-sm"
          >
            {d}
          </div>
        ))}
      </div>
      <p className="text-[11px] text-neutral-500 mt-1.5 capitalize">{label}</p>
    </div>
  )
}

export default function SessionDetailPage() {
  const { id } = useParams()
  const { token, user } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [registered, setRegistered] = useState(false)
  const [registering, setRegistering] = useState(false)
  const [shareOpen, setShareOpen] = useState(false)
  const [regForm, setRegForm] = useState({
    firstName: user?.name?.split(' ')[0] || '',
    email: user?.email || '',
    jobTitle: '',
    company: '',
  })

  const countdown = useCountdown(session?.scheduled_date)

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const [sRes, rRes] = await Promise.all([
          fetch(`/api/sessions/${id}`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`/api/sessions/${id}/registration-status`, { headers: { Authorization: `Bearer ${token}` } }),
        ])
        if (sRes.ok) setSession(await sRes.json())
        if (rRes.ok) {
          const data = await rRes.json()
          setRegistered(!!data.registered)
        }
      } catch {
        // Network error
      } finally {
        setLoading(false)
      }
    }
    fetchSession()
  }, [id, token])

  const handleRegister = async (e) => {
    e?.preventDefault?.()
    if (registering) return
    setRegistering(true)
    try {
      const res = await fetch(`/api/sessions/${id}/register`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        toast.error(data.error || 'Could not register for this session.')
        return
      }
      setRegistered(true)
      if (!data.alreadyRegistered) fireConfetti()
      toast.success(data.alreadyRegistered
        ? 'You were already registered for this session.'
        : 'You\'re registered! Redirecting to confirmation…')
      setTimeout(() => navigate(`/events/${id}/confirmation`), 1200)
    } catch {
      toast.error('Network error. Please try again.')
    } finally {
      setRegistering(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-brand-pink border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!session) {
    return (
      <div className="text-center py-20">
        <p className="text-neutral-500">Session not found</p>
        <button
          onClick={() => navigate('/dashboard/live-sessions')}
          className="text-brand-pink hover:underline mt-2 inline-block cursor-pointer"
        >
          Back to Live Sessions
        </button>
      </div>
    )
  }

  const isLive = session.type === 'live'
  const sessionDate = session.scheduled_date
    ? new Date(session.scheduled_date)
    : null
  const showCountdown = isLive && sessionDate && !countdown.done

  return (
    <div className="max-w-6xl">
      {/* Back + share */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-neutral-500 hover:text-dark-blue cursor-pointer"
        >
          <ArrowLeft size={16} /> Back
        </button>
        <button
          onClick={() => setShareOpen(true)}
          className="flex items-center gap-2 text-sm text-neutral-500 hover:text-brand-pink cursor-pointer"
        >
          <Share2 size={16} /> Share
        </button>
      </div>

      {/* Hero image */}
      <div className="h-64 rounded-2xl overflow-hidden mb-6">
        {session.thumbnail_url ? (
          <img
            src={session.thumbnail_url}
            alt={session.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-brand-blue/10 to-brand-pink/10 flex items-center justify-center">
            <Video size={48} className="text-brand-blue/40" />
          </div>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Main content */}
        <div className="flex-1">
          <div className="bg-white rounded-2xl border border-neutral-100 p-6 mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Badge variant={isLive ? 'blue' : 'pink'}>{session.category}</Badge>
              {isLive && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-50 border border-green-200">
                  <StatusDot status="live" size="sm" />
                  <span className="text-[11px] font-bold tracking-wide text-green-700">LIVE</span>
                </span>
              )}
            </div>

            <h1 className="text-2xl font-bold text-dark-blue mb-3">
              {session.title}
            </h1>

            <div className="flex flex-wrap gap-4 text-sm text-neutral-500 mb-6">
              {sessionDate && (
                <span className="flex items-center gap-1">
                  <Calendar size={14} />
                  {sessionDate.toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              )}
              {sessionDate && (
                <span className="flex items-center gap-1">
                  <Clock size={14} />
                  {sessionDate.toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                    timeZoneName: 'short',
                  })}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Clock size={14} />
                {session.duration}
              </span>
              {session.views > 0 && (
                <span className="flex items-center gap-1">
                  <Users size={14} />
                  {session.views.toLocaleString()} views
                </span>
              )}
            </div>

            <div className="prose prose-sm max-w-none">
              <h3 className="text-lg font-semibold text-dark-blue mb-2">About This Session</h3>
              <p className="text-neutral-600 leading-relaxed whitespace-pre-line">
                {session.description}
              </p>
            </div>
          </div>

          {/* Countdown + registration form (live only) */}
          {showCountdown && !registered && (
            <div className="bg-white rounded-2xl border border-neutral-100 p-6 mb-6">
              <p className="text-[13px] font-semibold text-neutral-500 mb-4">Live session starts in</p>
              <div className="flex gap-3 md:gap-5 mb-8">
                <TimeTile value={countdown.days} label="Days" />
                <TimeTile value={countdown.hours} label="Hours" />
                <TimeTile value={countdown.minutes} label="Minutes" />
                <TimeTile value={countdown.seconds} label="Seconds" />
              </div>

              <form onSubmit={handleRegister} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-neutral-500">First name</label>
                  <input
                    type="text"
                    required
                    value={regForm.firstName}
                    onChange={(e) => setRegForm({ ...regForm, firstName: e.target.value })}
                    placeholder="Enter your full name"
                    className="px-4 py-3 bg-white border border-neutral-200 rounded-xl text-sm text-dark-blue placeholder:text-neutral-300 outline-none focus:border-brand-pink transition-colors"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-neutral-500">Email address</label>
                  <input
                    type="email"
                    required
                    value={regForm.email}
                    onChange={(e) => setRegForm({ ...regForm, email: e.target.value })}
                    placeholder="you@company.com"
                    className="px-4 py-3 bg-white border border-neutral-200 rounded-xl text-sm text-dark-blue placeholder:text-neutral-300 outline-none focus:border-brand-pink transition-colors"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-neutral-500">Current job title</label>
                  <input
                    type="text"
                    value={regForm.jobTitle}
                    onChange={(e) => setRegForm({ ...regForm, jobTitle: e.target.value })}
                    placeholder="e.g. VP Marketing"
                    className="px-4 py-3 bg-white border border-neutral-200 rounded-xl text-sm text-dark-blue placeholder:text-neutral-300 outline-none focus:border-brand-pink transition-colors"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-neutral-500">Company name</label>
                  <input
                    type="text"
                    value={regForm.company}
                    onChange={(e) => setRegForm({ ...regForm, company: e.target.value })}
                    placeholder="Company"
                    className="px-4 py-3 bg-white border border-neutral-200 rounded-xl text-sm text-dark-blue placeholder:text-neutral-300 outline-none focus:border-brand-pink transition-colors"
                  />
                </div>
                <div className="md:col-span-2">
                  <Button type="submit" disabled={registering} className="w-full md:w-auto">
                    {registering ? 'Registering…' : 'Reserve your spot'}
                  </Button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="w-full lg:w-80 space-y-4">
          {/* Register / Status card */}
          <div className="bg-white rounded-2xl border border-neutral-100 p-6">
            {isLive && (
              <>
                {registered ? (
                  <div className="text-center">
                    <CheckCircle size={40} className="text-green-500 mx-auto mb-3" />
                    <p className="font-semibold text-dark-blue mb-1">You're Registered!</p>
                    <p className="text-sm text-neutral-500">We'll send you a reminder before the session starts.</p>
                  </div>
                ) : (
                  <>
                    <Button
                      className="w-full mb-3"
                      onClick={handleRegister}
                      disabled={registering}
                    >
                      {registering ? 'Registering...' : 'Register for Session'}
                    </Button>
                    <p className="text-xs text-neutral-500 text-center">
                      Free for Pro members
                    </p>
                  </>
                )}
              </>
            )}
            {!isLive && (
              <Button className="w-full">
                <Video size={16} /> Watch Now
              </Button>
            )}
          </div>

          {/* Speaker card */}
          <div className="bg-white rounded-2xl border border-neutral-100 p-6">
            <h3 className="text-sm font-semibold text-dark-blue mb-4">Speaker</h3>
            <div className="flex items-center gap-3 mb-3">
              <Avatar
                name={session.speaker_name}
                src={session.speaker_avatar}
                size="lg"
              />
              <div>
                <p className="font-semibold text-dark-blue">{session.speaker_name}</p>
                <p className="text-sm text-neutral-500">{session.speaker_title}</p>
              </div>
            </div>
          </div>

          {/* Session details card */}
          <div className="bg-white rounded-2xl border border-neutral-100 p-6">
            <h3 className="text-sm font-semibold text-dark-blue mb-3">Details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-neutral-500">Type</span>
                <span className="text-dark-blue font-medium capitalize">{session.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Category</span>
                <span className="text-dark-blue font-medium">{session.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Duration</span>
                <span className="text-dark-blue font-medium">{session.duration}</span>
              </div>
              {sessionDate && (
                <div className="flex justify-between">
                  <span className="text-neutral-500">Date</span>
                  <span className="text-dark-blue font-medium">
                    {sessionDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <ShareModal
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        title="Share Event With Your Friends"
        shareTitle={session.title}
      />
    </div>
  )
}
