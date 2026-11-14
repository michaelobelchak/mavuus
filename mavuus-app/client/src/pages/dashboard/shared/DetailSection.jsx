import { useId } from 'react'
import { cn } from '@/design-system/lib/cn'
import { Card, CardLink } from '@/design-system/patterns'
import { Caption, Heading, Text } from '@/design-system/primitives'

/** A titled card on a detail page: a section named by its h2 (h4 look), `actions` on the right. */
export function DetailSection({ title, actions, className, children }) {
  const titleId = useId()
  return (
    <Card as="section" aria-labelledby={titleId} padding="lg" className={cn('flex flex-col gap-ds-md', className)}>
      <div className="flex flex-wrap items-center justify-between gap-ds-sm">
        <Heading id={titleId} level={2} size="h4">
          {title}
        </Heading>
        {actions}
      </div>
      {children}
    </Card>
  )
}

/**
 * Jobs as a list of link rows (jobs a member posted or finished, a vendor's jobs): the title links
 * to `to(job)`, `meta(job)` is the line below it and `badge(job)` sits on the right.
 */
export function JobLinkList({ jobs, to, meta, badge, label }) {
  return (
    <ul aria-label={label} className="flex flex-col gap-ds-xs">
      {jobs.map((job) => (
        <li key={job.id}>
          <Card variant="surface" padding="sm" interactive className="flex flex-wrap items-center justify-between gap-ds-sm">
            <div className="flex min-w-0 flex-col">
              <Text as="span" size="body-sm" className="font-semibold">
                <CardLink to={to(job)}>{job.title}</CardLink>
              </Text>
              {meta && <Caption>{meta(job)}</Caption>}
            </div>
            {badge && badge(job)}
          </Card>
        </li>
      ))}
    </ul>
  )
}
