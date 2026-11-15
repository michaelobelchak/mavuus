import { useEffect, useState } from 'react'
import { ArrowRight, UserCircle } from 'lucide-react'
import { Card, SectionHeader } from '@/design-system/patterns'
import { ResourceCard, ResourceCardSkeleton, SessionCard, SessionCardSkeleton } from '@/design-system/organisms'
import { Avatar, Badge, Button, Caption, Chip, Eyebrow, Heading, Icon, Link, ProgressBar, Text } from '@/design-system/primitives'
import useApiData from '../../hooks/useApiData'
import { liveSessions as fallbackLive, onDemandVideos as fallbackVideos, communityResources as fallbackResources } from '../../data/mockData'
import { useAuth } from '../../context/AuthContext'
import { profileCompletion } from './shared/profileCompletion'
import { LIVE_PATH, ON_DEMAND_PATH, RESOURCES_PATH, resourceCardProps, sessionCardProps } from './academy/cardProps'

const tabs = ['All', 'Live Sessions', 'On-Demand', 'Resources']
const GRID = 'grid grid-cols-1 gap-ds-md sm:grid-cols-2 xl:grid-cols-4'

function listPhrase(items) {
  if (items.length <= 1) return items.join('')
  return `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`
}

function useProfileCompletion(token) {
  const [completion, setCompletion] = useState(null)
  useEffect(() => {
    if (!token) return
    let active = true
    fetch('/api/profile/me', { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (active && data) setCompletion(profileCompletion(data))
      })
      .catch(() => {})
    return () => {
      active = false
    }
  }, [token])
  return completion
}

function ProfileNudge({ completion }) {
  return (
    <Card variant="panel" padding="md" className="flex flex-col gap-ds-md md:flex-row md:items-center">
      <span className="hidden size-10 shrink-0 items-center justify-center rounded-chip bg-surface-raised text-text-brand-strong md:inline-flex">
        <Icon icon={UserCircle} size="md" />
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-ds-xs">
        <Heading level={2} size="h4">
          Complete your profile
        </Heading>
        <Text size="body-sm" tone="secondary">
          Add {listPhrase(completion.missing)} so members and recruiters can find you.
        </Text>
        <ProgressBar value={completion.percent} label={`Profile ${completion.percent}% complete`} size="sm" className="max-w-sm" />
      </div>
      <Button to="/dashboard/profile" variant="secondary" className="self-start md:self-center">
        Complete profile
      </Button>
    </Card>
  )
}

function ViewAll({ to, what }) {
  return (
    <Link variant="standalone" to={to} aria-label={`View all ${what}`} className="inline-flex items-center gap-ds-xxs">
      View all <Icon icon={ArrowRight} size="sm" />
    </Link>
  )
}

function CardGrid({ loading, label, skeleton: Skeleton, children }) {
  if (loading) {
    return (
      <ul aria-busy="true" aria-label={label} className={GRID}>
        {[0, 1, 2, 3].map((i) => (
          <li key={i}>
            <Skeleton announce={false} />
          </li>
        ))}
      </ul>
    )
  }
  return (
    <ul aria-label={label} className={GRID}>
      {children}
    </ul>
  )
}

function uniqueSpeakers(sessions) {
  const seen = new Set()
  return sessions
    .filter((s) => s.speaker_name && !seen.has(s.speaker_name) && seen.add(s.speaker_name))
    .slice(0, 8)
}

export default function AcademyPage() {
  const [activeTab, setActiveTab] = useState('All')
  const { user, token } = useAuth()
  const completion = useProfileCompletion(token)

  const { data: sessionsRaw, loading: loadingSessions } = useApiData('/api/sessions', [])
  const { data: resourcesRaw, loading: loadingResources } = useApiData('/api/resources', [])

  // Handle both paginated { data: [...] } and plain array responses
  const sessions = Array.isArray(sessionsRaw) ? sessionsRaw : sessionsRaw?.data || []
  const resources = Array.isArray(resourcesRaw) ? resourcesRaw : resourcesRaw?.data || []

  const liveSessions = sessions.filter((s) => s.type === 'live').slice(0, 4)
  const onDemandVideos = sessions.filter((s) => s.type === 'on-demand').slice(0, 4)
  const communityResources = resources.slice(0, 4)

  // Use fallbacks if API returns empty
  const displayLive = liveSessions.length > 0 ? liveSessions : fallbackLive
  const displayVideos = onDemandVideos.length > 0 ? onDemandVideos : fallbackVideos
  const displayResources = communityResources.length > 0 ? communityResources : fallbackResources

  const show = (tab) => activeTab === 'All' || activeTab === tab
  const firstName = user?.name ? `, ${user.name.split(' ')[0]}` : ''
  const speakers = uniqueSpeakers(sessions)

  return (
    <div className="flex flex-col gap-ds-xl">
      <div className="flex flex-col gap-ds-xxs">
        <Eyebrow tone="brand">Mavuus academy</Eyebrow>
        <Text tone="secondary">Welcome back{firstName}. Here&apos;s what&apos;s new in the community.</Text>
      </div>

      {completion && completion.percent < 100 && <ProfileNudge completion={completion} />}

      <div role="group" aria-label="Show" className="flex flex-wrap gap-ds-xs">
        {tabs.map((tab) => (
          <Chip key={tab} selected={activeTab === tab} onClick={() => setActiveTab(tab)}>
            {tab}
          </Chip>
        ))}
      </div>

      {show('Live Sessions') && (
        <section className="flex flex-col gap-ds-md">
          <SectionHeader size="h3" title="Upcoming Live Sessions" actions={<ViewAll to={LIVE_PATH} what="live sessions" />} />
          <CardGrid loading={loadingSessions} label="Upcoming live sessions" skeleton={SessionCardSkeleton}>
            {displayLive.map((session) => (
              <li key={session.id}>
                <SessionCard {...sessionCardProps({ ...session, type: 'live' })} />
              </li>
            ))}
          </CardGrid>
        </section>
      )}

      {show('On-Demand') && (
        <section className="flex flex-col gap-ds-md">
          <SectionHeader size="h3" title="On-Demand Videos" actions={<ViewAll to={ON_DEMAND_PATH} what="on-demand videos" />} />
          <CardGrid loading={loadingSessions} label="On-demand videos" skeleton={SessionCardSkeleton}>
            {displayVideos.map((video) => (
              <li key={video.id}>
                <SessionCard {...sessionCardProps({ ...video, type: 'on-demand' })} />
              </li>
            ))}
          </CardGrid>
        </section>
      )}

      {show('Resources') && (
        <section className="flex flex-col gap-ds-md">
          <SectionHeader size="h3" title="Community Resources" actions={<ViewAll to={RESOURCES_PATH} what="community resources" />} />
          <CardGrid loading={loadingResources} label="Community resources" skeleton={ResourceCardSkeleton}>
            {displayResources.map((resource) => (
              <li key={resource.id}>
                <ResourceCard {...resourceCardProps(resource)} />
              </li>
            ))}
          </CardGrid>
        </section>
      )}

      {/* Past speakers, derived from the session speakers */}
      {activeTab === 'All' && speakers.length > 0 && (
        <section className="flex flex-col gap-ds-md">
          <SectionHeader size="h3" title="Past Speakers" />
          <ul className="grid grid-cols-2 gap-ds-lg sm:grid-cols-4 xl:grid-cols-8">
            {speakers.map((s) => {
              const [role, company] = (s.speaker_title || '').split(',').map((part) => part.trim())
              return (
                <li key={s.speaker_name} className="flex flex-col items-center gap-ds-xxs text-center">
                  <Avatar name={s.speaker_name} src={s.speaker_avatar} size="lg" className="mb-ds-xxs" />
                  {/* The old avatar ring marked every speaker Pro; the system marks Pro with a badge (as on MemberCard). */}
                  <Badge size="sm" tone="brand">
                    Pro member
                  </Badge>
                  <Text as="span" size="body-sm" className="font-semibold">
                    {s.speaker_name}
                  </Text>
                  {role && <Caption>{role}</Caption>}
                  {company && <Caption tone="brand">{company}</Caption>}
                </li>
              )
            })}
          </ul>
        </section>
      )}
    </div>
  )
}
