import { cn } from '../../../lib/cn'
import { Card } from '../../../patterns'
import { Avatar, Caption, Skeleton, Text } from '../../../primitives'
import { formatCardDate } from '../formatDate'
import { StarRating } from '../StarRating'

/**
 * A review of a vendor or a member: VendorDetailPage, MemberProfilePage and ProfilePage.
 * - `reviewerName` (required), `reviewerTitle`, `reviewerAvatarSrc` (initials when missing).
 * - `rating` (0 to 5, read as "4 out of 5 stars"), `text`, `subject` (what was reviewed, shown as
 *   "Re: Northwind Growth"), `date` (a Date or ISO string, shown as "Oct 28, 2026"; other text
 *   shows as is).
 * - `clamp`: cut the text at four lines (for grids). `actions`: a slot on the right (Report).
 * An article named "Review by {reviewerName}". Other props go to the Card.
 */
export function ReviewCard({
  reviewerName,
  reviewerTitle,
  reviewerAvatarSrc,
  rating,
  text,
  subject,
  date,
  clamp = false,
  actions,
  className,
  ...props
}) {
  const formatted = formatCardDate(date)
  return (
    <Card
      as="article"
      variant="surface"
      padding="md"
      aria-label={`Review by ${reviewerName}`}
      className={cn('flex h-full items-start gap-ds-sm', className)}
      {...props}
    >
      <Avatar name={reviewerName} src={reviewerAvatarSrc} size="sm" />
      <div className="flex min-w-0 grow flex-col gap-ds-xs">
        <div className="flex flex-wrap items-start justify-between gap-ds-xs">
          <div className="flex min-w-0 flex-col">
            <Text as="span" size="body-sm" className="font-semibold">
              {reviewerName}
            </Text>
            {reviewerTitle && <Caption className="truncate">{reviewerTitle}</Caption>}
          </div>
          {rating !== undefined && rating !== null && <StarRating value={rating} />}
        </div>
        {subject && (
          <Text size="caption" tone="brand" className="font-semibold">
            {`Re: ${subject}`}
          </Text>
        )}
        {text && (
          <Text size="body-sm" tone="secondary" className={cn('break-words', clamp && 'line-clamp-4')}>
            {text}
          </Text>
        )}
        <div className="flex items-center justify-between gap-ds-xs">
          {formatted && (
            <Caption as="time" dateTime={formatted.dateTime}>
              {formatted.text}
            </Caption>
          )}
          {actions && <div className="ml-auto flex items-center gap-ds-xs">{actions}</div>}
        </div>
      </div>
    </Card>
  )
}

/** Loading placeholder with the ReviewCard layout. */
export function ReviewCardSkeleton({ className, ...props }) {
  return (
    <Card variant="surface" padding="md" aria-busy="true" className={cn('flex items-start gap-ds-sm', className)} {...props}>
      <Skeleton shape="circle" className="size-8" />
      <div className="flex grow flex-col gap-ds-xs">
        <Skeleton className="w-1/3" />
        <Skeleton lines={2} />
      </div>
      <span className="sr-only">Loading review</span>
    </Card>
  )
}
