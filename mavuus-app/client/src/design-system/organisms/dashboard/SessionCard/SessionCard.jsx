import { Calendar, Clock, Eye, PlayCircle } from 'lucide-react'
import { cn } from '../../../lib/cn'
import { resolveHeadingLevel, resolveOption } from '../../../lib/resolveOption'
import { Card, CardAction, CardLink, MediaFrame } from '../../../patterns'
import { Avatar, Badge, Caption, Heading, Icon, Skeleton, Text } from '../../../primitives'
import { MetaList } from '../MetaList'

const KINDS = ['live', 'recording']

function SessionMedia({ src, kind }) {
  const play = kind === 'recording' && (
    <span data-play="" className="absolute inset-0 flex items-center justify-center text-text-on-brand">
      <span className="inline-flex size-12 items-center justify-center rounded-chip bg-surface-inverse opacity-80">
        <Icon icon={PlayCircle} size="lg" />
      </span>
    </span>
  )
  if (src) {
    return (
      <MediaFrame src={src} ratio="16/9">
        {play}
      </MediaFrame>
    )
  }
  return (
    <div
      data-media-fallback=""
      className="relative flex aspect-video items-center justify-center rounded-card bg-surface-selected text-text-brand-strong"
    >
      <Icon icon={kind === 'recording' ? PlayCircle : Calendar} size="lg" />
    </div>
  )
}

/**
 * A live session or an on-demand recording: LiveSessionsPage, OnDemandPage, AcademyPage and
 * the related sessions on SessionDetailPage.
 * - `title` (required, two lines), `category` badge, `thumbnailSrc` (decorative; a tinted tile
 *   with a calendar or play icon when missing).
 * - `kind`: live (default) or recording (a play overlay on the image).
 * - Facts: `dateLabel` (preformatted, "Thu, Nov 20"), `duration`, `views` (a number, "1,284 views").
 * - `speaker`: { name, title, avatarSrc } in the footer.
 * - `to` / `href`: the title is the card's stretched link. `actions`: buttons above it (Register).
 * - `headingLevel` (default 3), `as` (default article). Other props go to the Card.
 */
export function SessionCard({
  title,
  category,
  thumbnailSrc,
  kind,
  dateLabel,
  duration,
  views,
  speaker,
  to,
  href,
  actions,
  headingLevel,
  as = 'article',
  className,
  ...props
}) {
  const level = resolveHeadingLevel(headingLevel, [2, 3, 4], 3, 'SessionCard')
  const resolvedKind = resolveOption(kind, KINDS, 'live', 'SessionCard', 'kind')
  const linked = to !== undefined || href !== undefined
  const viewsLabel = typeof views === 'number' ? `${views.toLocaleString('en-US')} views` : null

  return (
    <Card
      as={as}
      padding="md"
      interactive={linked}
      className={cn('group flex h-full flex-col gap-ds-sm', className)}
      {...props}
    >
      <SessionMedia src={thumbnailSrc} kind={resolvedKind} />
      {category && (
        <Badge size="sm" tone="info" className="self-start">
          {category}
        </Badge>
      )}
      <Heading level={level} size="h4" className="line-clamp-2">
        {linked ? (
          <CardLink to={to} href={href}>
            {title}
          </CardLink>
        ) : (
          title
        )}
      </Heading>
      <MetaList
        items={[
          { key: 'date', icon: Calendar, label: dateLabel },
          { key: 'duration', icon: Clock, label: duration },
          { key: 'views', icon: Eye, label: viewsLabel },
        ]}
      />
      {actions && <CardAction className="flex flex-wrap gap-ds-xs">{actions}</CardAction>}
      {speaker?.name && (
        <footer className="mt-auto flex items-center gap-ds-sm border-t border-border-subtle pt-ds-sm">
          <Avatar name={speaker.name} src={speaker.avatarSrc} size="sm" />
          <div className="flex min-w-0 flex-col">
            <Text as="span" size="body-sm" className="truncate font-semibold">
              {speaker.name}
            </Text>
            {speaker.title && <Caption className="truncate">{speaker.title}</Caption>}
          </div>
        </footer>
      )}
    </Card>
  )
}

/** Loading placeholder with the SessionCard layout. */
export function SessionCardSkeleton({ className, ...props }) {
  return (
    <Card padding="md" aria-busy="true" className={cn('flex h-full flex-col gap-ds-sm', className)} {...props}>
      <Skeleton shape="rect" className="aspect-video h-auto" />
      <Skeleton className="w-1/4" />
      <Skeleton lines={2} />
      <div className="mt-auto flex items-center gap-ds-sm pt-ds-sm">
        <Skeleton shape="circle" className="size-8" />
        <Skeleton className="w-1/2" />
      </div>
      <span className="sr-only">Loading session</span>
    </Card>
  )
}
