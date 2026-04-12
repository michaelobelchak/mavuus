import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { CheckCircle, Copy, ArrowRight } from 'lucide-react'
import AnimatedSection from '../../components/ui/AnimatedSection'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import { useToast } from '../../components/ui/Toast'

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
  const days = Math.floor(diff / 86400000)
  const hours = Math.floor((diff % 86400000) / 3600000)
  const minutes = Math.floor((diff % 3600000) / 60000)
  const seconds = Math.floor((diff % 60000) / 1000)
  return { days, hours, minutes, seconds, done: diff === 0 }
}

function TimeTile({ value, label }) {
  return (
    <div className="flex flex-col items-center">
      <div className="flex gap-1">
        {String(value).padStart(2, '0').split('').map((d, i) => (
          <div
            key={i}
            className="w-10 h-14 md:w-12 md:h-16 rounded-lg bg-white border border-neutral-200 flex items-center justify-center text-[24px] md:text-[28px] font-semibold text-dark-blue shadow-sm"
          >
            {d}
          </div>
        ))}
      </div>
      <p className="text-xs text-neutral-500 mt-2 capitalize">{label}</p>
    </div>
  )
}

export default function EventConfirmationPage() {
  const { id } = useParams()
  const toast = useToast()
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [invite, setInvite] = useState('')

  useEffect(() => {
    if (!id) {
      setLoading(false)
      return
    }
    fetch(`/api/sessions/${id}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setSession(data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [id])

  const countdown = useCountdown(session?.scheduled_date)
  const shareLink =
    typeof window !== 'undefined'
      ? `${window.location.origin}/events/${id || ''}`
      : ''

  const handleCopy = () => {
    navigator.clipboard?.writeText(shareLink)
    toast.success('Event link copied')
  }

  const handleSendInvite = (e) => {
    e.preventDefault()
    if (!invite.trim()) return
    const subject = encodeURIComponent(`Join me at: ${session?.title || 'this Mavuus event'}`)
    const body = encodeURIComponent(`I'm attending this event — come join me! ${shareLink}`)
    window.location.href = `mailto:${invite}?subject=${subject}&body=${body}`
    setInvite('')
    toast.success('Invite email opened')
  }

  return (
    <div>
      <section className="px-6 md:px-12 lg:px-[104px] pt-10 pb-16">
        <AnimatedSection animation="fade-up">
          <Breadcrumbs
            items={[
              { label: 'Home', path: '/' },
              { label: 'Events', path: '/events' },
              { label: 'Confirmation' },
            ]}
          />
        </AnimatedSection>

        <div className="flex flex-col lg:flex-row gap-12 items-start mt-8">
          {/* Left content */}
          <div className="flex-1 min-w-0 max-w-2xl">
            <AnimatedSection animation="fade-up">
              <span className="inline-block text-[12px] tracking-[0.18em] font-semibold text-brand-pink uppercase mb-3">
                Confirmation
              </span>
              <h1 className="text-[28px] md:text-[40px] lg:text-[48px] font-semibold leading-[1.1] text-dark-blue mb-6 flex items-start gap-3">
                <CheckCircle size={36} className="text-green-500 mt-1 shrink-0" />
                <span>
                  Congratulations!
                  <br />
                  You&rsquo;re now registered!
                </span>
              </h1>

              {loading ? (
                <div className="w-8 h-8 border-2 border-brand-pink border-t-transparent rounded-full animate-spin" />
              ) : session ? (
                <>
                  <h2 className="text-[18px] md:text-[20px] font-semibold text-dark-blue mb-6">
                    {session.title}
                  </h2>

                  {session.scheduled_date && !countdown.done && (
                    <div className="bg-bg-light border border-neutral-100 rounded-2xl p-6 md:p-8 mb-8">
                      <p className="text-[13px] font-semibold text-neutral-500 mb-4">Live Session Details</p>
                      <div className="flex gap-4 md:gap-6">
                        <TimeTile value={countdown.days} label="Days" />
                        <TimeTile value={countdown.hours} label="Hours" />
                        <TimeTile value={countdown.minutes} label="Minutes" />
                        <TimeTile value={countdown.seconds} label="Seconds" />
                      </div>
                    </div>
                  )}

                  <p className="text-sm text-neutral-500 mb-8 leading-relaxed">
                    Zoom link and calendar invite will be sent to you before the session.
                  </p>
                </>
              ) : (
                <p className="text-sm text-neutral-500 mb-8">Your registration is confirmed.</p>
              )}

              {/* Share Event */}
              <div className="pt-6 border-t border-neutral-100">
                <h3 className="text-[18px] font-semibold text-dark-blue mb-4">Share Event</h3>

                <form onSubmit={handleSendInvite} className="max-w-md">
                  <label className="text-[13px] font-semibold text-neutral-500 block mb-2">
                    Send invite to your friend
                  </label>
                  <div className="flex items-center gap-2 p-1 border border-neutral-200 rounded-full bg-white mb-4">
                    <input
                      type="email"
                      value={invite}
                      onChange={(e) => setInvite(e.target.value)}
                      placeholder="friend@example.com"
                      className="flex-1 bg-transparent text-sm px-4 py-2 outline-none placeholder:text-neutral-300"
                    />
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-full bg-brand-pink text-white text-sm font-semibold hover:bg-brand-pink-hover transition-colors cursor-pointer shrink-0"
                    >
                      Submit
                    </button>
                  </div>
                </form>

                <div className="max-w-md">
                  <p className="text-[13px] font-semibold text-neutral-500 mb-2">Or share this link:</p>
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="flex items-center gap-2 text-sm text-brand-pink hover:underline cursor-pointer truncate w-full text-left"
                  >
                    <Copy size={14} className="shrink-0" />
                    <span className="truncate">{shareLink}</span>
                  </button>
                </div>
              </div>
            </AnimatedSection>
          </div>

          {/* Right image */}
          <div className="w-full lg:w-[420px] shrink-0">
            <div className="aspect-[4/5] rounded-3xl overflow-hidden bg-gradient-to-br from-brand-pink/20 to-brand-blue/20">
              {session?.thumbnail_url ? (
                <img
                  src={session.thumbnail_url}
                  alt={session.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-brand-blue/40">
                  <CheckCircle size={64} />
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Meantime videos CTA */}
      <section className="px-6 md:px-12 lg:px-[104px] py-14 bg-bg-light border-t border-neutral-100">
        <AnimatedSection animation="fade-up">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-[22px] md:text-[26px] font-semibold text-dark-blue">
              Meantime — catch up on on-demand videos
            </h2>
            <Link
              to="/dashboard/on-demand"
              className="text-sm text-brand-pink font-medium hover:underline inline-flex items-center gap-1"
            >
              View all <ArrowRight size={14} />
            </Link>
          </div>
          <p className="text-neutral-500">
            While you wait for the event, explore recordings from previous speakers in the community.
          </p>
        </AnimatedSection>
      </section>
    </div>
  )
}
