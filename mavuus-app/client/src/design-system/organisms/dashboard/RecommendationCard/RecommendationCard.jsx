import { useId } from 'react'
import { cn } from '../../../lib/cn'
import { Card } from '../../../patterns'
import { Avatar, Badge, Caption, Skeleton, Text } from '../../../primitives'
import { skeletonA11y } from '../skeletonA11y'

/**
 * A recommendation a member wrote: VendorDetailPage, MemberProfilePage and ProfilePage.
 * - `fromName` (required), `fromTitle`, `fromAvatarSrc` (initials when missing), `message`.
 * - `subject`: the vendor or member it is about, as a badge. `dateLabel`: preformatted
 *   ("Sep 14, 2026", formatDate from lib/formatDate), `dateTime` for the <time> element.
 * An article named "Recommendation from {fromName}". Other props go to the Card.
 */
export function RecommendationCard({ fromName, fromTitle, fromAvatarSrc, message, subject, dateLabel, dateTime, className, ...props }) {
  const prefixId = useId()
  const nameId = useId()
  return (
    <Card
      as="article"
      variant="surface"
      padding="md"
      aria-labelledby={`${prefixId} ${nameId}`}
      className={cn('flex h-full items-start gap-ds-sm', className)}
      {...props}
    >
      <Avatar name={fromName} src={fromAvatarSrc} size="sm" />
      <div className="flex min-w-0 grow flex-col gap-ds-xs">
        <div className="flex flex-col">
          <div className="flex flex-wrap items-center gap-ds-xs">
            <Text as="span" size="body-sm" className="font-semibold">
              <span id={prefixId} hidden>
                Recommendation from
              </span>
              <span id={nameId}>{fromName}</span>
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
        {dateLabel && (
            <Caption as="time" dateTime={dateTime}>
              {dateLabel}
            </Caption>
          )}
      </div>
    </Card>
  )
}

/**
 * Loading placeholder with the RecommendationCard layout. Busy with a hidden `label`; pass `announce={false}` inside a grid that sets
 * aria-busy on the list, so each placeholder isn't read out.
 */
export function RecommendationCardSkeleton({ announce = true, label = 'Loading recommendation', className, ...props }) {
  return (
    <Card variant="surface" padding="md" {...skeletonA11y(announce)} className={cn('flex items-start gap-ds-sm', className)} {...props}>
      <Skeleton shape="circle" className="size-8" />
      <div className="flex grow flex-col gap-ds-xs">
        <Skeleton className="w-1/3" />
        <Skeleton lines={2} />
      </div>
      {announce && <span className="sr-only">{label}</span>}
    </Card>
  )
}
