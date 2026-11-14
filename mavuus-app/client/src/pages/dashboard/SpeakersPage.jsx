import { useSearchParams } from 'react-router-dom'
import { Linkedin } from 'lucide-react'
import { Alert, Card, CardLink } from '@/design-system/patterns'
import { MemberCard, MemberCardSkeleton } from '@/design-system/organisms'
import { Avatar, Badge, Button, Caption, Heading, Skeleton, Text } from '@/design-system/primitives'
import { useAuth } from '../../context/AuthContext'
import { useDetailResource } from '../../hooks/useDetailResource'
import { CatalogList } from './shared/CatalogList'

// Two columns beside the details panel; the panel takes the room the third column had.
const GRID_WITH_PANEL = 'grid grid-cols-1 gap-ds-md sm:grid-cols-2 xl:grid-cols-3'

const sessionPath = (session) => `/dashboard/${session.type === 'live' ? 'live-sessions' : 'on-demand'}/${session.id}`

/** The picked speaker: bio, LinkedIn and their sessions, from /api/speakers/:id. */
function SpeakerDetails({ id }) {
  const { token } = useAuth()
  const { data: speaker, loading, error, notFound, retry } = useDetailResource(`/api/speakers/${id}`, token)

  if (loading) {
    return (
      <div aria-busy="true" className="flex flex-col items-center gap-ds-sm">
        <span className="sr-only">Loading speaker</span>
        <Skeleton shape="circle" className="size-14" />
        <Skeleton className="w-1/2" />
        <Skeleton lines={3} />
      </div>
    )
  }
  if (error) {
    return (
      <Alert
        tone="error"
        title="We couldn't load this speaker"
        description="Check your connection and try again."
        actions={
          <Button size="sm" variant="outline" onClick={retry}>
            Try again
          </Button>
        }
      />
    )
  }
  if (notFound || !speaker) return <Text tone="secondary">Speaker not found.</Text>

  const sessions = speaker.sessions || []
  return (
    <div className="flex flex-col gap-ds-md">
      <div className="flex flex-col items-center gap-ds-xxs text-center">
        <Avatar name={speaker.name} src={speaker.avatar_url} size="lg" className="mb-ds-xs" />
        <Heading level={2} size="h3">
          {speaker.name}
        </Heading>
        {speaker.title && (
          <Text size="body-sm" tone="secondary">
            {speaker.title}
          </Text>
        )}
        {speaker.company && <Caption>{speaker.company}</Caption>}
      </div>
      {speaker.bio && (
        <Text size="body-sm" tone="secondary">
          {speaker.bio}
        </Text>
      )}
      {speaker.linkedin_url && (
        <Button variant="outline" size="sm" block leadingIcon={Linkedin} href={speaker.linkedin_url}>
          LinkedIn Profile
        </Button>
      )}
      {sessions.length > 0 && (
        <section aria-labelledby="speaker-sessions-title" className="flex flex-col gap-ds-xs">
          <Heading id="speaker-sessions-title" level={3} size="h4">
            {`Sessions (${sessions.length})`}
          </Heading>
          <ul className="flex flex-col gap-ds-xs">
            {sessions.map((session) => (
              <li key={session.id}>
                <Card variant="surface" padding="sm" interactive className="flex flex-col gap-ds-xxs">
                  <Text as="span" size="body-sm" className="line-clamp-2 font-semibold">
                    <CardLink to={sessionPath(session)}>{session.title}</CardLink>
                  </Text>
                  <div className="flex items-center gap-ds-xs">
                    <Badge size="sm" tone={session.type === 'live' ? 'info' : 'brand'} className="capitalize">
                      {session.type}
                    </Badge>
                    {session.duration && <Caption>{session.duration}</Caption>}
                  </div>
                </Card>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}

export default function SpeakersPage() {
  const [searchParams] = useSearchParams()
  const selected = searchParams.get('speaker')
  // A card keeps the search in the link and only swaps the picked speaker.
  const linkFor = (id) => {
    const next = new URLSearchParams(searchParams)
    next.set('speaker', String(id))
    return `?${next}`
  }

  return (
    <div className="flex flex-col gap-ds-lg lg:flex-row lg:items-start">
      <div className="min-w-0 flex-1">
        <CatalogList
          endpoint="/api/speakers"
          paged={false}
          intro="The marketing leaders who teach our live sessions and on-demand videos."
          searchLabel="Search speakers"
          searchPlaceholder="Search speakers..."
          listLabel="Speakers"
          emptyTitle="No speakers found"
          emptyDescription="Try a different name, title or company."
          errorTitle="We couldn't load the speakers"
          gridClassName={selected ? GRID_WITH_PANEL : undefined}
          skeleton={MemberCardSkeleton}
          renderItem={(speaker) => (
            <MemberCard
              name={speaker.name}
              title={speaker.title}
              company={speaker.company}
              avatarSrc={speaker.avatar_url}
              to={linkFor(speaker.id)}
              className={String(speaker.id) === selected ? 'ring-2 ring-border-brand' : undefined}
            />
          )}
        />
      </div>
      {selected && (
        <aside
          aria-label="Speaker details"
          className="w-full shrink-0 lg:sticky lg:top-[calc(var(--shell-topbar-h)+var(--ds-space-md))] lg:w-80"
        >
          <Card padding="lg">
            <SpeakerDetails key={selected} id={selected} />
          </Card>
        </aside>
      )}
    </div>
  )
}
