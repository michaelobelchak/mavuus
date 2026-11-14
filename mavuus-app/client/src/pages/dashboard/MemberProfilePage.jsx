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
import { listOf, recommendationCardProps, reviewCardProps } from './shared/reviewProps'

const BACK = { backTo: MEMBERS_PATH, backLabel: 'Back to Members' }
const NO_EXTRAS = { postedJobs: [], completedJobs: [], reviews: [], recommendations: [] }

/** The connect, accept or message actions for the profile header. */
function ConnectionActions({ status, connecting, onConnect, onAccept, onMessage }) {
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
      <Button size="sm" leadingIcon={UserPlus} onClick={onAccept}>
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
  // Per-member state is stored with the id it belongs to, so another :id never shows it.
  const [status, setStatus] = useState({ id: null, value: { status: 'none' } })
  const [extras, setExtras] = useState({ id: null, ...NO_EXTRAS })
  const [connecting, setConnecting] = useState(false)
  const connection = status.id === id ? status.value : { status: 'none' }
  const { postedJobs, completedJobs, reviews, recommendations } = extras.id === id ? extras : NO_EXTRAS
  const limited = member?.limited

  // Your own profile lives on the Profile page.
  useEffect(() => {
    if (isSelf) navigate('/dashboard/profile', { replace: true })
  }, [isSelf, navigate])

  useEffect(() => {
    const controller = new AbortController()
    fetch(`/api/connections/status/${id}`, { headers: { Authorization: `Bearer ${token}` }, signal: controller.signal })
      .then((res) => (res.ok ? res.json() : null))
      .then((value) => {
        if (value && !controller.signal.aborted) setStatus({ id, value })
      })
      .catch(() => {})
    return () => controller.abort()
  }, [id, token])

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
      setExtras({ id, postedJobs: posted, completedJobs: completed, reviews: memberReviews, recommendations: recs })
    })
    return () => controller.abort()
  }, [member, limited, id, token])

  const handleConnect = async () => {
    setConnecting(true)
    try {
      const res = await fetch('/api/connections/request', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: parseInt(id, 10) }),
      })
      if (res.ok) {
        setStatus({ id, value: { status: 'pending', direction: 'outgoing' } })
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
    try {
      const res = await fetch(`/api/connections/${connection.id}/accept`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      setStatus({ id, value: { ...connection, status: 'accepted' } })
      toast.success('Connection accepted!')
    } catch {
      toast.error('Failed to accept connection')
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
          onConnect={handleConnect}
          onAccept={handleAccept}
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
  const resumeHref = isHttpUrl(member.resume_url) ? member.resume_url : null
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
