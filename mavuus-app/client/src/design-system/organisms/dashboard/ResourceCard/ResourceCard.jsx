import { useId } from 'react'
import { Bookmark, FileText } from 'lucide-react'
import { cn } from '../../../lib/cn'
import { resolveHeadingLevel } from '../../../lib/resolveOption'
import { Card, CardAction, CardLink, MediaFrame } from '../../../patterns'
import { Badge, Caption, Heading, Icon, IconButton, Skeleton, Text } from '../../../primitives'
import { skeletonA11y } from '../skeletonA11y'

/**
 * A guide, template or article: ResourcesPage and the resources row on AcademyPage.
 * - `title` (required, two lines), `category` badge, `type` (Guide, Template) as a second badge,
 *   `thumbnailSrc` (decorative; a tinted tile with a document icon when missing),
 *   `description` (two lines).
 * - Footer: `author` and `readTime` ("8 min read"); left out when both are missing.
 * - `to` / `href`: the title is the card's stretched link (external hrefs open in a new tab and
 *   say so). `saved` + `onSavedChange(next)`: a bookmark toggle (aria-pressed), as on
 *   JobCard. `actions`: more buttons above the link.
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
  saved,
  onSavedChange,
  actions,
  headingLevel,
  as = 'article',
  className,
  ...props
}) {
  const level = resolveHeadingLevel(headingLevel, [2, 3, 4], 3, 'ResourceCard')
  const titleId = useId()
  const linked = to !== undefined || href !== undefined
  const hasSave = typeof onSavedChange === 'function'
  const hasActions = hasSave || Boolean(actions)

  return (
    <Card
      aria-labelledby={titleId}
      as={as}
      padding="md"
      interactive={linked}
      className={cn(linked && 'group', 'flex h-full flex-col gap-ds-sm', className)}
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
      {(category || type || hasActions) && (
        <div className="flex items-center justify-between gap-ds-xs">
          <div className="flex flex-wrap gap-ds-xxs">
            {category && <Badge size="sm">{category}</Badge>}
            {type && (
              <Badge size="sm" tone="info">
                {type}
              </Badge>
            )}
          </div>
          {hasActions && (
            <CardAction className="flex items-center gap-ds-xxs">
              {actions}
              {hasSave && (
                <IconButton
                  icon={Bookmark}
                  variant="ghost"
                  size="sm"
                  aria-label={`Save ${title}`}
                  aria-pressed={Boolean(saved)}
                  onClick={() => onSavedChange(!saved)}
                  className={cn(saved && 'text-text-brand-strong [&>svg]:fill-current')}
                />
              )}
            </CardAction>
          )}
        </div>
      )}
      <Heading id={titleId} level={level} size="h4" className="line-clamp-2">
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

/**
 * Loading placeholder with the ResourceCard layout. Busy with a hidden `label`; pass `announce={false}` inside a grid that sets
 * aria-busy on the list, so each placeholder isn't read out.
 */
export function ResourceCardSkeleton({ announce = true, label = 'Loading resource', className, ...props }) {
  return (
    <Card padding="md" {...skeletonA11y(announce)} className={cn('flex h-full flex-col gap-ds-sm', className)} {...props}>
      <Skeleton shape="rect" className="aspect-video h-auto" />
      <Skeleton className="w-1/4" />
      <Skeleton lines={2} />
      <Skeleton className="mt-auto w-1/2" />
      {announce && <span className="sr-only">{label}</span>}
    </Card>
  )
}
