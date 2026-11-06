import { cn } from '../../../lib/cn'
import { Card } from '../../../patterns'
import { Avatar, Badge, Caption, Skeleton, Text } from '../../../primitives'
import { formatCardDate } from '../formatDate'

/**
 * A recommendation a member wrote: VendorDetailPage, MemberProfilePage and ProfilePage.
 * - `fromName` (required), `fromTitle`, `fromAvatarSrc` (initials when missing), `message`.
 * - `subject`: the vendor or member it is about, as a badge. `date`: a Date or ISO string, shown
 *   as "Sep 14, 2026" (other text shows as is).
 * An article named "Recommendation from {fromName}". Other props go to the Card.
 */
export function RecommendationCard({ fromName, fromTitle, fromAvatarSrc, message, subject, date, className, ...props }) {
  const formatted = formatCardDate(date)
  return (
    <Card
      as="article"
      variant="surface"
      padding="md"
      aria-label={`Recommendation from ${fromName}`}
      className={cn('flex h-full items-start gap-ds-sm', className)}
      {...props}
    >
      <Avatar name={fromName} src={fromAvatarSrc} size="sm" />
      <div className="flex min-w-0 grow flex-col gap-ds-xs">
        <div className="flex flex-col">
          <div className="flex flex-wrap items-center gap-ds-xs">
            <Text as="span" size="body-sm" className="font-semibold">
              {fromName}
            </Text>
            {subject && (
              <Badge size="sm" tone="info" className="max-w-full min-w-0">
                <span className="truncate">{subject}</span>
              </Badge>
            )}
          </div>
          {fromTitle && <Caption className="truncate">{fromTitle}</Caption>}
        </div>
        {message && (
          <Text size="body-sm" tone="secondary" className="break-words">
            {message}
          </Text>
        )}
        {formatted && (
          <Caption as="time" dateTime={formatted.dateTime}>
            {formatted.text}
          </Caption>
        )}
      </div>
    </Card>
  )
}

/** Loading placeholder with the RecommendationCard layout. */
export function RecommendationCardSkeleton({ className, ...props }) {
  return (
    <Card variant="surface" padding="md" aria-busy="true" className={cn('flex items-start gap-ds-sm', className)} {...props}>
      <Skeleton shape="circle" className="size-8" />
      <div className="flex grow flex-col gap-ds-xs">
        <Skeleton className="w-1/3" />
        <Skeleton lines={2} />
      </div>
      <span className="sr-only">Loading recommendation</span>
    </Card>
  )
}
