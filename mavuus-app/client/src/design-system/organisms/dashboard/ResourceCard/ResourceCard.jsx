import { FileText } from 'lucide-react'
import { cn } from '../../../lib/cn'
import { resolveHeadingLevel } from '../../../lib/resolveOption'
import { Card, CardAction, CardLink, MediaFrame } from '../../../patterns'
import { Badge, Caption, Heading, Icon, Skeleton, Text } from '../../../primitives'

/**
 * A guide, template or article: ResourcesPage and the resources row on AcademyPage.
 * - `title` (required, two lines), `category` badge, `type` (Guide, Template) as a second badge,
 *   `thumbnailSrc` (decorative; a tinted tile with a document icon when missing),
 *   `description` (two lines).
 * - Footer: `author` and `readTime` ("8 min read"); left out when both are missing.
 * - `to` / `href`: the title is the card's stretched link (external hrefs open in a new tab and
 *   say so). `actions`: buttons above it (Save).
 * - `headingLevel` (default 3), `as` (default article). Other props go to the Card.
 */
export function ResourceCard({
  title,
  category,
  type,
  thumbnailSrc,
  description,
  author,
  readTime,
  to,
  href,
  actions,
  headingLevel,
  as = 'article',
  className,
  ...props
}) {
  const level = resolveHeadingLevel(headingLevel, [2, 3, 4], 3, 'ResourceCard')
  const linked = to !== undefined || href !== undefined

  return (
    <Card
      as={as}
      padding="md"
      interactive={linked}
      className={cn('group flex h-full flex-col gap-ds-sm', className)}
      {...props}
    >
      {thumbnailSrc ? (
        <MediaFrame src={thumbnailSrc} ratio="16/9" />
      ) : (
        <div
          data-media-fallback=""
          className="flex aspect-video items-center justify-center rounded-card bg-surface-sunken text-text-secondary"
        >
          <Icon icon={FileText} size="lg" />
        </div>
      )}
      {(category || type || actions) && (
        <div className="flex items-center justify-between gap-ds-xs">
          <div className="flex flex-wrap gap-ds-xxs">
            {category && <Badge size="sm">{category}</Badge>}
            {type && (
              <Badge size="sm" tone="info">
                {type}
              </Badge>
            )}
          </div>
          {actions && <CardAction className="flex items-center gap-ds-xxs">{actions}</CardAction>}
        </div>
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
      {description && (
        <Text size="body-sm" tone="secondary" className="line-clamp-2">
          {description}
        </Text>
      )}
      {(author || readTime) && (
        <footer className="mt-auto flex items-center justify-between gap-ds-sm border-t border-border-subtle pt-ds-sm">
          <Caption className="truncate">{author}</Caption>
          {readTime && <Caption className="shrink-0">{readTime}</Caption>}
        </footer>
      )}
    </Card>
  )
}

/** Loading placeholder with the ResourceCard layout. */
export function ResourceCardSkeleton({ className, ...props }) {
  return (
    <Card padding="md" aria-busy="true" className={cn('flex h-full flex-col gap-ds-sm', className)} {...props}>
      <Skeleton shape="rect" className="aspect-video h-auto" />
      <Skeleton className="w-1/4" />
      <Skeleton lines={2} />
      <Skeleton className="mt-auto w-1/2" />
      <span className="sr-only">Loading resource</span>
    </Card>
  )
}
