import { cn } from '../../lib/cn'
import { Eyebrow, Heading, Text } from '../../primitives'
import { Breadcrumbs } from '../Breadcrumbs/Breadcrumbs'

/**
 * Top of a page: optional breadcrumbs, then eyebrow, the h1 title and a description, with actions
 * on the right. Actions wrap under the title on small screens.
 * - `title` (h1 at h1 size), `description`, `eyebrow`.
 * - `breadcrumbs`: Breadcrumbs items ([{ label, to }]) or a ready element.
 * - `actions`: buttons or links. Other props go to the root.
 */
export function PageHeader({ title, description, eyebrow, breadcrumbs, actions, className, ref, ...props }) {
  return (
    <div ref={ref} className={cn('flex flex-col gap-ds-md', className)} {...props}>
      {Array.isArray(breadcrumbs) ? <Breadcrumbs items={breadcrumbs} /> : breadcrumbs}
      <div className="flex flex-col gap-ds-md sm:flex-row sm:items-end sm:justify-between">
        <div className="flex min-w-0 flex-col gap-ds-xs">
          {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
          <Heading level={1} size="h1">
            {title}
          </Heading>
          {description && (
            <Text size="lead" tone="secondary" className="max-w-prose">
              {description}
            </Text>
          )}
        </div>
        {actions && (
          <div data-page-header-actions="" className="flex flex-wrap items-center gap-ds-sm sm:shrink-0">
            {actions}
          </div>
        )}
      </div>
    </div>
  )
}
