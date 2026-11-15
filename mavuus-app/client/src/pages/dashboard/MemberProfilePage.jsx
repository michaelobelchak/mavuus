import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Briefcase, Clock, Download, Linkedin, MessageCircle, UserCheck, UserPlus } from 'lucide-react'
import { Alert, Card, DescriptionList, useToast } from '@/design-system/patterns'
import { RecommendationCard, ReviewCard, StatusBadge } from '@/design-system/organisms'
import { Avatar, Badge, Button, Caption, Heading, Icon, Text } from '@/design-system/primitives'
import { formatDate } from '@/design-system/lib/formatDate'
import { isHttpUrl } from '@/design-system/lib/safeUrl'
import { useAuth } from '../../context/AuthContext'
import { useDetailResource } from '../../hooks/useDetailResource'
import { DetailError, DetailLayout, DetailNotFound, DetailSkeleton, DetailTopBar } from './shared/DetailChrome'
import { DetailSection, JobLinkList } from './shared/DetailSection'
import { JOBS_PATH, MEMBERS_PATH, MESSAGES_PATH } from './shared/paths'
import { resumeHref as resumeLink } from './shared/resumeHref'
import { listOf, recommendationCardProps, reviewCardProps } from './shared/reviewProps'

const BACK = { backTo: MEMBERS_PATH, backLabel: 'Back to Members' }
const NO_EXTRAS = { postedJobs: [], completedJobs: [], reviews: [], recommendations: [] }

/**
 * The connect, accept or message actions for the profile header. Nothing while the status loads;
 * a short note with Try again when it failed, so Connect never shows for a member you may
 * already know.
 */
function ConnectionActions({ status, connecting, accepting, onConnect, onAccept, onMessage, onRetry }) {
  if (status === null) return null
  if (status === 'error') {
    return (
      <>
        <Caption>Connection status unavailable.</Caption>
        <Button variant="ghost" size="sm" onClick={onRetry}>
          Try again
        </Button>
      </>
    )
  }
  if (status.status === 'accepted') {
    return (
      <>
        <Button variant="outline" size="sm" leadingIcon={UserCheck} disabled>
          Connected
        </Button>
        <Button variant="outline" size="sm" leadingIcon={MessageCircle} onClick={onMessage}>
          Message
        </Button>
      </>
    )
  }
  if (status.status === 'pending' && status.direction === 'outgoing') {
    return (
      <Button variant="outline" size="sm" leadingIcon={Clock} disabled>
        Request sent
      </Button>
    )
  }
  if (status.status === 'pending' && status.direction === 'incoming') {
    return (
      <Button size="sm" leadingIcon={UserPlus} loading={accepting} onClick={onAccept}>
        Accept request
      </Button>
    )
  }
  return (
    <Button size="sm" leadingIcon={UserPlus} loading={connecting} onClick={onConnect}>
      Connect
    </Button>
  )
}

export default function MemberProfilePage() {
  const { id } = useParams()
  const { user, token } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()
  const isSelf = Boolean(user) && String(id) === String(user.id)
  const { data: member, loading, error, notFound, retry } = useDetailResource(`/api/members/${id}/profile`, token)
  // The route remounts this page for another :id (KeyedById), so state belongs to one member.
  // Connection status: null while it loads, 'error' when it failed, else the API's answer.
  const [connection, setConnection] = useState(null)
  const [statusAttempt, setStatusAttempt] = useState(0)
  const [extras, setExtras] = useState(NO_EXTRAS)
  const [connecting, setConnecting] = useState(false)
  const [accepting, setAccepting] = useState(false)
  const { postedJobs, completedJobs, reviews, recommendations } = extras
  const limited = member?.limited

  // Your own profile lives on the Profile page.
  useEffect(() => {
    if (isSelf) navigate('/dashboard/profile', { replace: true })
  }, [isSelf, navigate])

  useEffect(() => {
    const controller = new AbortController()
    fetch(`/api/connections/status/${id}`, { headers: { Authorization: `Bearer ${token}` }, signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json()
      })
      .then((value) => {
        if (!controller.signal.aborted) setConnection(value)
      })
      .catch((err) => {
        if (err?.name !== 'AbortError' && !controller.signal.aborted) setConnection('error')
      })
    return () => controller.abort()
  }, [id, token, statusAttempt])

  const retryStatus = () => {
    setConnection(null)
    setStatusAttempt((n) => n + 1)
  }

  // Jobs, reviews and recommendations only for a full (not limited) profile.
  useEffect(() => {
    if (!member || limited) return
    const controller = new AbortController()
    const get = (url) =>
      fetch(url, { headers: { Authorization: `Bearer ${token}` }, signal: controller.signal })
        .then((res) => (res.ok ? res.json() : []))
        .then(listOf)
        .catch(() => [])
    Promise.all([
      get(`/api/jobs?posted_by=${id}`),
      get(`/api/jobs/completed-by/${id}`),
      get(`/api/reviews/user/${id}`),
      get(`/api/recommendations/user/${id}`),
    ]).then(([posted, completed, memberReviews, recs]) => {
      if (controller.signal.aborted) return
      setExtras({ postedJobs: posted, completedJobs: completed, reviews: memberReviews, recommendations: recs })
    })
    return () => controller.abort()
  }, [member, limited, id, token])

  const handleConnect = async () => {
    if (connecting) return
    setConnecting(true)
    try {
      const res = await fetch('/api/connections/request', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: parseInt(id, 10) }),
      })
      if (res.ok) {
        setConnection({ status: 'pending', direction: 'outgoing' })
        toast.success('Connection request sent!')
      } else {
        const data = await res.json().catch(() => ({}))
        toast.error(data.error || 'Failed to send request')
      }
    } catch {
      toast.error('Network error')
    } finally {
      setConnecting(false)
    }
  }

  const handleAccept = async () => {
    if (accepting) return
    setAccepting(true)
    try {
      const res = await fetch(`/api/connections/${connection.id}/accept`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      setConnection({ ...connection, status: 'accepted' })
      toast.success('Connection accepted!')
      // A connections-only profile opens up once you are connected.
      if (limited) retry()
    } catch {
      toast.error('Failed to accept connection')
    } finally {
      setAccepting(false)
    }
  }

  if (isSelf || loading) return <DetailSkeleton label="Loading member profile" />
  if (error) return <DetailError title="We couldn't load this profile" onRetry={retry} {...BACK} />
  if (notFound || !member) return <DetailNotFound title="Member not found" {...BACK} />

  const role = [member.title, member.company].filter(Boolean).join(' at ')
  const header = (
    <Card as="section" aria-label="Profile" padding="lg" className="flex flex-col gap-ds-md sm:flex-row sm:items-start">
      <Avatar name={member.name} src={member.avatar_url} size="lg" />
      <div className="flex min-w-0 grow flex-col gap-ds-xs">
        <div className="flex flex-col gap-ds-xxs">
          <Heading level={2} size="h3">
            {member.name}
          </Heading>
          {role && <Text tone="secondary">{role}</Text>}
          {member.membership_tier === 'pro' && (
            <Badge size="sm" tone="brand" className="self-start">
              Pro member
            </Badge>
          )}
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-ds-xs sm:shrink-0">
        <ConnectionActions
          status={connection}
          connecting={connecting}
          accepting={accepting}
          onConnect={handleConnect}
          onAccept={handleAccept}
          onRetry={retryStatus}
          onMessage={() => navigate(`${MESSAGES_PATH}?user=${id}`)}
        />
      </div>
    </Card>
  )

  if (limited) {
    return (
      <div className="flex flex-col gap-ds-lg">
        <DetailTopBar {...BACK} />
        <Alert
          tone="info"
          title="Limited profile"
          description={`This member has restricted their profile visibility.${
            member.profile_visibility === 'connections' ? ' Connect to see their full profile.' : ''
          }`}
        />
        {header}
      </div>
    )
  }

  const skills = member.skills || []
  const experience = member.experience || []
  const resumeHref = resumeLink(member.resume_url)
  const linkedinHref = isHttpUrl(member.linkedin_url) ? member.linkedin_url : null
  const connectionCount = member.connection_count > 0
    ? `${member.connection_count} connection${member.connection_count !== 1 ? 's' : ''}`
    : null

  return (
    <div className="flex flex-col gap-ds-lg">
      <DetailTopBar {...BACK} />
      <DetailLayout
        asideLabel="Member info"
        main={
          <>
            {header}
            {member.bio && (
              <DetailSection title="About">
                <Text size="body-sm" tone="secondary" className="whitespace-pre-line">
                  {member.bio}
                </Text>
              </DetailSection>
            )}
            {skills.length > 0 && (
              <DetailSection title="Skills & Expertise">
                <ul className="flex flex-wrap gap-ds-xs">
                  {skills.map((skill) => (
                    <li key={skill}>
                      <Badge tone="info">{skill}</Badge>
                    </li>
                  ))}
                </ul>
              </DetailSection>
            )}
            {experience.length > 0 && (
              <DetailSection title="Experience">
                <ul className="flex flex-col gap-ds-md">
                  {experience.map((exp) => (
                    <li key={exp.id} className="flex gap-ds-sm">
                      <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-control bg-surface-selected text-text-brand-strong">
                        <Icon icon={Briefcase} size="md" />
                      </span>
                      <div className="flex min-w-0 flex-col gap-ds-xxs">
                        <Heading level={3} size="h4">
                          {exp.title}
                        </Heading>
                        <Text size="body-sm" tone="secondary">
                          {exp.company}
                        </Text>
                        <Caption>
                          {`${exp.start_date || 'Unknown'} - ${exp.is_current ? 'Present' : exp.end_date || 'Unknown'}`}
                        </Caption>
                        {exp.description && (
                          <Text size="body-sm" tone="secondary">
                            {exp.description}
                          </Text>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </DetailSection>
            )}
            {postedJobs.length > 0 && (
              <DetailSection title="Jobs Posted">
                <JobLinkList
                  label="Jobs posted"
                  jobs={postedJobs}
                  to={(job) => `${JOBS_PATH}/${job.id}`}
                  meta={(job) => [job.company, job.location].filter(Boolean).join(' · ')}
                  badge={(job) => <StatusBadge status={job.status} size="sm" />}
                />
              </DetailSection>
            )}
            {completedJobs.length > 0 && (
              <DetailSection title="Completed Jobs">
                <JobLinkList
                  label="Completed jobs"
                  jobs={completedJobs}
                  to={(job) => `${JOBS_PATH}/${job.id}`}
                  meta={(job) => [job.company, job.poster_name && `Posted by ${job.poster_name}`].filter(Boolean).join(' · ')}
                  badge={() => <StatusBadge status="completed" size="sm" />}
                />
              </DetailSection>
            )}
            {reviews.length > 0 && (
              <DetailSection title="Ratings & Reviews">
                <ul className="flex flex-col gap-ds-sm">
                  {reviews.map((review) => (
                    <li key={review.id}>
                      <ReviewCard {...reviewCardProps(review)} />
                    </li>
                  ))}
                </ul>
              </DetailSection>
            )}
            {recommendations.length > 0 && (
              <DetailSection title="Recommendations">
                <ul className="flex flex-col gap-ds-sm">
                  {recommendations.map((rec) => (
                    <li key={rec.id}>
                      <RecommendationCard {...recommendationCardProps(rec)} />
                    </li>
                  ))}
                </ul>
              </DetailSection>
            )}
          </>
        }
        aside={
          <>
            <DetailSection title="Details">
              <DescriptionList
                items={[
                  { key: 'location', label: 'Location', value: member.location },
                  { key: 'industry', label: 'Industry', value: member.industry },
                  {
                    key: 'experience',
                    label: 'Experience',
                    value: member.years_experience ? `${member.years_experience}+ years` : null,
                  },
                  { key: 'connections', label: 'Connections', value: connectionCount },
                  {
                    key: 'since',
                    label: 'Member since',
                    value: formatDate(member.created_at, { month: 'long', year: 'numeric' }),
                  },
                ]}
              />
            </DetailSection>
            {(linkedinHref || resumeHref) && (
              <Card padding="lg" className="flex flex-col gap-ds-sm">
                {linkedinHref && (
                  <Button variant="outline" block leadingIcon={Linkedin} href={linkedinHref}>
                    LinkedIn Profile
                  </Button>
                )}
                {resumeHref && (
                  <Button variant="outline" block leadingIcon={Download} href={resumeHref} download>
                    {member.resume_filename || 'Download Resume'}
                  </Button>
                )}
              </Card>
            )}
          </>
        }
      />
    </div>
  )
}
