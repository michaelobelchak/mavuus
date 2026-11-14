import { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Calendar, CheckCircle, Clock, Eye, Radio, Video } from 'lucide-react'
import { formatDate } from '@/design-system/lib/formatDate'
import { Card, DescriptionList, FormField, MediaFrame, SectionHeader, ShareDialog, VideoEmbed, useToast } from '@/design-system/patterns'
import { CommentThread, MetaList, SessionCard } from '@/design-system/organisms'
import { Avatar, Badge, Button, Caption, Heading, Icon, Input, Text } from '@/design-system/primitives'
import { useAuth } from '../../context/AuthContext'
import { useComments } from '../../hooks/useComments'
import { fireConfetti } from '../../hooks/useConfetti'
import { LIVE_PATH, ON_DEMAND_PATH, sessionCardProps } from './academy/cardProps'
import { DetailError, DetailNotFound, DetailSkeleton, DetailTopBar } from './academy/DetailChrome'

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
    <div className="flex flex-col items-center gap-ds-xs">
      <div className="flex gap-ds-xxs">
        {String(value)
          .padStart(2, '0')
          .split('')
          .map((digit, i) => (
            <span
              key={i}
              className="flex h-12 w-9 items-center justify-center rounded-input border border-border-default bg-surface-raised text-h4 font-semibold shadow-card md:h-14 md:w-11 md:text-h3"
            >
              {digit}
            </span>
          ))}
      </div>
      <Caption>{label}</Caption>
    </div>
  )
}

function Countdown({ countdown }) {
  return (
    <div className="flex flex-col gap-ds-md">
      <Text size="body-sm" tone="secondary" className="font-semibold">
        Live session starts in
      </Text>
      {/* Read once per minute instead of every second. */}
      <p className="sr-only">
        {countdown.days} days, {countdown.hours} hours and {countdown.minutes} minutes
      </p>
      <div aria-hidden="true" className="flex flex-wrap gap-ds-sm md:gap-ds-lg">
        <TimeTile value={countdown.days} label="Days" />
        <TimeTile value={countdown.hours} label="Hours" />
        <TimeTile value={countdown.minutes} label="Minutes" />
        <TimeTile value={countdown.seconds} label="Seconds" />
      </div>
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
  // A failed request (network or server error) can be retried; a 404 means not found.
  const [loadError, setLoadError] = useState(false)
  const [attempt, setAttempt] = useState(0)
  const [registered, setRegistered] = useState(false)
  const [registering, setRegistering] = useState(false)
  const [shareOpen, setShareOpen] = useState(false)
  const [relatedSessions, setRelatedSessions] = useState([])
  const [regForm, setRegForm] = useState({
    firstName: user?.name?.split(' ')[0] || '',
    email: user?.email || '',
    jobTitle: '',
    company: '',
  })
  const comments = useComments('session', parseInt(id))

  const countdown = useCountdown(session?.scheduled_date)

  useEffect(() => {
    let ignore = false
    const fetchSession = async () => {
      try {
        const [sRes, rRes] = await Promise.all([
          fetch(`/api/sessions/${id}`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`/api/sessions/${id}/registration-status`, { headers: { Authorization: `Bearer ${token}` } }),
        ])
        if (ignore) return
        if (sRes.ok) setSession(await sRes.json())
        else if (sRes.status !== 404) setLoadError(true)
        if (rRes.ok) {
          const data = await rRes.json()
          if (!ignore) setRegistered(!!data.registered)
        }
      } catch {
        if (!ignore) setLoadError(true)
      } finally {
        if (!ignore) setLoading(false)
      }
    }
    fetchSession()
    return () => {
      ignore = true
    }
  }, [id, token, attempt])

  useEffect(() => {
    // Fetch related
    fetch(`/api/sessions/${id}/related`)
      .then((r) => (r.ok ? r.json() : []))
      .then(setRelatedSessions)
      .catch(() => {})

    // Track view (once per page load)
    fetch(`/api/sessions/${id}/view`, { method: 'PUT' }).catch(() => {})
  }, [id])

  const retry = () => {
    setLoadError(false)
    setLoading(true)
    setAttempt((n) => n + 1)
  }

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
      toast.success(
        data.alreadyRegistered ? 'You were already registered for this session.' : "You're registered! Redirecting to confirmation…",
      )
      setTimeout(() => navigate(`/events/${id}/confirmation`), 1200)
    } catch {
      toast.error('Network error. Please try again.')
    } finally {
      setRegistering(false)
    }
  }

  if (loading) return <DetailSkeleton label="Loading session" />

  if (loadError) {
    return <DetailError title="We couldn't load this session" onRetry={retry} backTo={LIVE_PATH} backLabel="Back to Live Sessions" />
  }

  if (!session) {
    return <DetailNotFound title="Session not found" backTo={LIVE_PATH} backLabel="Back to Live Sessions" />
  }

  const isLive = session.type === 'live'
  const showCountdown = isLive && session.scheduled_date && !countdown.done
  const field = (key) => ({ value: regForm[key], onChange: (e) => setRegForm({ ...regForm, [key]: e.target.value }) })

  return (
    <div className="flex flex-col gap-ds-lg">
      <DetailTopBar
        backTo={isLive ? LIVE_PATH : ON_DEMAND_PATH}
        backLabel={isLive ? 'Back to Live Sessions' : 'Back to On-Demand'}
        onShare={() => setShareOpen(true)}
      />

      <div className="flex flex-col gap-ds-lg lg:flex-row lg:items-start">
        <div className="flex min-w-0 flex-1 flex-col gap-ds-lg">
          {session.thumbnail_url ? (
            <MediaFrame src={session.thumbnail_url} alt={session.title} ratio="16/9" eager />
          ) : (
            <div className="flex aspect-video items-center justify-center rounded-card bg-surface-selected text-text-brand-strong">
              <Icon icon={Video} size="lg" />
            </div>
          )}

          <Card as="article" aria-labelledby="session-title" padding="lg" className="flex flex-col gap-ds-md">
            <div className="flex flex-wrap items-center gap-ds-xs">
              <Badge size="sm" tone={isLive ? 'info' : 'brand'}>
                {session.category}
              </Badge>
              {isLive && (
                <Badge size="sm" tone="success" leadingIcon={Radio}>
                  Live
                </Badge>
              )}
            </div>
            <Heading id="session-title" level={2} size="h3">
              {session.title}
            </Heading>
            <MetaList
              items={[
                {
                  key: 'date',
                  icon: Calendar,
                  label: formatDate(session.scheduled_date, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }),
                },
                { key: 'duration', icon: Clock, label: session.duration },
                { key: 'views', icon: Eye, label: session.views > 0 ? `${session.views.toLocaleString()} views` : null },
              ]}
            />
            <div className="flex flex-col gap-ds-xs">
              <Heading level={3} size="h4">
                About This Session
              </Heading>
              <Text tone="secondary" className="whitespace-pre-line">
                {session.description}
              </Text>
            </div>
          </Card>

          {/* Countdown and registration form (live only, not yet registered) */}
          {showCountdown && !registered && (
            <Card padding="lg" className="flex flex-col gap-ds-xl">
              <Countdown countdown={countdown} />
              <form onSubmit={handleRegister} aria-label="Reserve your spot" className="grid grid-cols-1 gap-ds-md md:grid-cols-2">
                <FormField label="First name" required>
                  <Input {...field('firstName')} placeholder="Enter your full name" autoComplete="given-name" />
                </FormField>
                <FormField label="Email address" required>
                  <Input type="email" {...field('email')} placeholder="you@company.com" autoComplete="email" />
                </FormField>
                <FormField label="Current job title">
                  <Input {...field('jobTitle')} placeholder="e.g. VP Marketing" autoComplete="organization-title" />
                </FormField>
                <FormField label="Company name">
                  <Input {...field('company')} placeholder="Company" autoComplete="organization" />
                </FormField>
                <div className="md:col-span-2">
                  <Button type="submit" loading={registering} className="w-full md:w-auto">
                    Reserve your spot
                  </Button>
                </div>
              </form>
            </Card>
          )}

          {/* Video for on-demand */}
          {!isLive && (
            <Card as="section" id="watch" aria-labelledby="watch-title" padding="lg" className="flex flex-col gap-ds-md">
              <Heading id="watch-title" level={2} size="h4">
                Watch
              </Heading>
              <VideoEmbed src={session.video_url} title={session.title} />
            </Card>
          )}

          <CommentThread {...comments} />
        </div>

        {/* Sidebar */}
        <aside aria-label="Session info" className="flex w-full flex-col gap-ds-md lg:w-80 lg:shrink-0">
          <Card padding="lg">
            {isLive ? (
              registered ? (
                <div role="status" className="flex flex-col items-center gap-ds-xs text-center">
                  <Icon icon={CheckCircle} size="lg" className="text-status-success" />
                  <Text className="font-semibold">You&apos;re Registered!</Text>
                  <Text size="body-sm" tone="secondary">
                    We&apos;ll send you a reminder before the session starts.
                  </Text>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-ds-sm">
                  <Button block onClick={handleRegister} loading={registering}>
                    Register for Session
                  </Button>
                  <Caption>Free for Pro members</Caption>
                </div>
              )
            ) : (
              <Button block leadingIcon={Video} href="#watch">
                Watch Now
              </Button>
            )}
          </Card>

          {session.speaker_name && (
            <Card as="section" aria-labelledby="speaker-title" padding="lg" className="flex flex-col gap-ds-md">
              <Heading id="speaker-title" level={2} size="h4">
                Speaker
              </Heading>
              <div className="flex items-center gap-ds-sm">
                <Avatar name={session.speaker_name} src={session.speaker_avatar} size="lg" />
                <div className="flex min-w-0 flex-col">
                  <Text className="font-semibold">{session.speaker_name}</Text>
                  <Text size="body-sm" tone="secondary">
                    {session.speaker_title}
                  </Text>
                </div>
              </div>
            </Card>
          )}

          <Card as="section" aria-labelledby="details-title" padding="lg" className="flex flex-col gap-ds-sm">
            <Heading id="details-title" level={2} size="h4">
              Details
            </Heading>
            <DescriptionList
              items={[
                { key: 'type', label: 'Type', value: isLive ? 'Live' : 'On-demand' },
                { key: 'category', label: 'Category', value: session.category },
                { key: 'duration', label: 'Duration', value: session.duration },
              ]}
            />
          </Card>
        </aside>
      </div>

      {relatedSessions.length > 0 && (
        <section className="flex flex-col gap-ds-md">
          <SectionHeader size="h3" title="Related Sessions" />
          <ul aria-label="Related sessions" className="grid grid-cols-1 gap-ds-md sm:grid-cols-2 xl:grid-cols-3">
            {relatedSessions.map((s) => (
              <li key={s.id}>
                <SessionCard {...sessionCardProps({ ...s, type: s.type || session.type })} />
              </li>
            ))}
          </ul>
        </section>
      )}

      <ShareDialog
        open={shareOpen}
        onOpenChange={setShareOpen}
        title="Share Event With Your Friends"
        shareTitle={session.title}
      />
    </div>
  )
}
