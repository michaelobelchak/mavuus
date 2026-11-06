import { MapPin, Star } from 'lucide-react'
import { cn } from '../../../lib/cn'
import { resolveHeadingLevel } from '../../../lib/resolveOption'
import { Card, CardAction, CardLink } from '../../../patterns'
import { Badge, Caption, Heading, Icon, Skeleton, Text } from '../../../primitives'
import { CompanyLogo } from '../CompanyLogo'
import { MetaList } from '../MetaList'

const MAX_CATEGORIES = 3

function Rating({ rating, reviewCount }) {
  if (rating === undefined || rating === null || Number.isNaN(Number(rating))) {
    return <Caption className="whitespace-nowrap">No reviews yet</Caption>
  }
  const value = Number(rating).toFixed(1)
  const count = Number(reviewCount) || 0
  return (
    <span data-rating="" className="inline-flex shrink-0 items-center gap-ds-xxs text-body-sm">
      <Icon icon={Star} size="sm" className="fill-current text-status-warning" />
      <span className="font-semibold text-text-primary">
        {value}
        <span className="sr-only"> out of 5</span>
      </span>
      <span className="text-text-muted">
        <span className="sr-only"> </span>({count}
        <span className="sr-only">{count === 1 ? ' review' : ' reviews'}</span>)
      </span>
    </span>
  )
}

/**
 * A vendor or agency in the directory (VendorsPage) and on related lists.
 * - `name` (required), `logoSrc` (initials when missing), `description` (three lines).
 * - `rating` (0 to 5) and `reviewCount`, read as "4.8 out of 5 (32 reviews)"; no rating shows
 *   "No reviews yet".
 * - `categories`: the first three show as badges, the rest as "+2 more". `location`.
 * - `to` / `href`: the name is the card's stretched link. `actions`: buttons above it.
 * - `headingLevel` (default 3), `as` (default article). Other props go to the Card.
 */
export function VendorCard({
  name,
  logoSrc,
  description,
  rating,
  reviewCount,
  categories = [],
  location,
  to,
  href,
  actions,
  headingLevel,
  as = 'article',
  className,
  ...props
}) {
  const level = resolveHeadingLevel(headingLevel, [2, 3, 4], 3, 'VendorCard')
  const linked = to !== undefined || href !== undefined
  const shown = categories.slice(0, MAX_CATEGORIES)
  const rest = categories.length - shown.length

  return (
    <Card as={as} padding="md" interactive={linked} className={cn('flex h-full flex-col gap-ds-sm', className)} {...props}>
      <div className="flex items-start gap-ds-sm">
        <CompanyLogo name={name} src={logoSrc} />
        <div className="flex min-w-0 grow flex-col gap-ds-xxs">
          <Heading level={level} size="h4" className="line-clamp-2 break-words">
            {linked ? (
              <CardLink to={to} href={href}>
                {name}
              </CardLink>
            ) : (
              name
            )}
          </Heading>
          <Rating rating={rating} reviewCount={reviewCount} />
        </div>
      </div>
      {description && (
        <Text size="body-sm" tone="secondary" className="line-clamp-3">
          {description}
        </Text>
      )}
      {shown.length > 0 && (
        <ul className="flex flex-wrap gap-ds-xxs">
          {shown.map((category) => (
            <li key={category}>
              <Badge size="sm" tone="info">
                {category}
              </Badge>
            </li>
          ))}
          {rest > 0 && (
            <li>
              <Badge size="sm">{`+${rest} more`}</Badge>
            </li>
          )}
        </ul>
      )}
      <div className="mt-auto flex flex-wrap items-center justify-between gap-ds-xs pt-ds-xs">
        <MetaList items={[{ key: 'location', icon: MapPin, label: location }]} />
        {actions && <CardAction className="flex items-center gap-ds-xs">{actions}</CardAction>}
      </div>
    </Card>
  )
}

/** Loading placeholder with the VendorCard layout. */
export function VendorCardSkeleton({ className, ...props }) {
  return (
    <Card padding="md" aria-busy="true" className={cn('flex h-full flex-col gap-ds-sm', className)} {...props}>
      <div className="flex items-start gap-ds-sm">
        <Skeleton shape="rect" className="size-10 rounded-control" />
        <div className="flex grow flex-col gap-ds-xs">
          <Skeleton className="w-2/3" />
          <Skeleton className="w-1/3" />
        </div>
      </div>
      <Skeleton lines={3} />
      <Skeleton className="mt-auto w-1/3" />
      <span className="sr-only">Loading vendor</span>
    </Card>
  )
}
