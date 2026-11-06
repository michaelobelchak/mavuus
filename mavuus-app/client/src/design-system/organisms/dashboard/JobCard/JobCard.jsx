import { useId } from 'react'
import { Bookmark, Clock, DollarSign, MapPin, Trash2, Users } from 'lucide-react'
import { cn } from '../../../lib/cn'
import { resolveHeadingLevel } from '../../../lib/resolveOption'
import { Card, CardAction, CardLink } from '../../../patterns'
import { Badge, Caption, Heading, IconButton, Skeleton, Text } from '../../../primitives'
import { CompanyLogo } from '../CompanyLogo'
import { MetaList } from '../MetaList'
import { skeletonA11y } from '../skeletonA11y'

const applicants = (count) => `${count} ${count === 1 ? 'applicant' : 'applicants'}`

/**
 * A job in a list: JobsPage results, MyJobsPage applications, saved jobs and postings, and the
 * jobs on a vendor profile.
 * - `title` (required), `company`, `logoSrc` (initials when missing), `description` (two lines).
 * - Facts: `location`, `type`, `salary`, `applicantCount`, plus `meta` ([{ key, icon, label }])
 *   for anything else. `category` and `seniority` show as badges, `status` is a slot for a
 *   StatusBadge ("Applied", "Open"), `postedLabel` is preformatted text ("2d ago", "Applied Oct 3").
 * - `to` / `href`: the title becomes the card's stretched link.
 * - `saved` + `onSavedChange(next)`: a bookmark toggle (aria-pressed). `onRemove`: a remove button
 *   for saved lists, named by `removeLabel` (default "Remove {title} from saved jobs"). `actions`: more buttons on the right. All sit above the card link.
 * - `headingLevel` (default 3), `as` (default article). Other props go to the Card.
 */
export function JobCard({
  title,
  company,
  logoSrc,
  description,
  location,
  type,
  salary,
  applicantCount,
  meta = [],
  category,
  seniority,
  status,
  postedLabel,
  to,
  href,
  saved,
  onSavedChange,
  onRemove,
  removeLabel,
  actions,
  headingLevel,
  as = 'article',
  className,
  ...props
}) {
  const level = resolveHeadingLevel(headingLevel, [2, 3, 4], 3, 'JobCard')
  const titleId = useId()
  const linked = to !== undefined || href !== undefined
  const facts = [
    { key: 'location', icon: MapPin, label: location },
    { key: 'type', icon: Clock, label: type },
    { key: 'salary', icon: DollarSign, label: salary },
    { key: 'applicants', icon: Users, label: applicantCount !== undefined && applicantCount !== null ? applicants(applicantCount) : null },
    ...meta,
  ]
  const hasSave = typeof onSavedChange === 'function'
  const hasSide = hasSave || onRemove || actions

  return (
    <Card aria-labelledby={titleId} as={as} padding="md" interactive={linked} className={cn('flex h-full gap-ds-md', className)} {...props}>
      <CompanyLogo name={company} src={logoSrc} size="lg" className="max-sm:size-10 max-sm:text-body-sm" />
      <div className="flex min-w-0 grow flex-col gap-ds-xs">
        <div className="flex flex-wrap items-center gap-ds-xs">
          <Heading id={titleId} level={level} size="h4" className="line-clamp-2 min-w-0 break-words">
            {linked ? (
              <CardLink to={to} href={href}>
                {title}
              </CardLink>
            ) : (
              title
            )}
          </Heading>
          {seniority && <Badge size="sm">{seniority}</Badge>}
          {status}
        </div>
        {company && (
          <Text size="body-sm" tone="brand" className="truncate font-semibold">
            {company}
          </Text>
        )}
        {description && (
          <Text size="body-sm" tone="secondary" className="line-clamp-2">
            {description}
          </Text>
        )}
        {(facts.some((fact) => fact.label) || category || postedLabel) && (
          <div className="flex flex-wrap items-center gap-ds-sm">
            <MetaList items={facts} />
            {category && (
              <Badge size="sm" tone="info">
                {category}
              </Badge>
            )}
            {postedLabel && <Caption className="ml-auto whitespace-nowrap">{postedLabel}</Caption>}
          </div>
        )}
      </div>
      {hasSide && (
        <CardAction className="flex shrink-0 items-start gap-ds-xxs self-start">
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
          {onRemove && (
            <IconButton
              icon={Trash2}
              variant="ghost"
              size="sm"
              aria-label={removeLabel ?? `Remove ${title} from saved jobs`}
              onClick={onRemove}
            />
          )}
        </CardAction>
      )}
    </Card>
  )
}

/**
 * Loading placeholder with the JobCard layout. Busy with a hidden `label`; pass `announce={false}` inside a grid that sets
 * aria-busy on the list, so each placeholder isn't read out.
 */
export function JobCardSkeleton({ announce = true, label = 'Loading job', className, ...props }) {
  return (
    <Card padding="md" {...skeletonA11y(announce)} className={cn('flex h-full gap-ds-md', className)} {...props}>
      <Skeleton shape="rect" className="size-12 rounded-control" />
      <div className="flex grow flex-col gap-ds-sm">
        <Skeleton className="w-1/2" />
        <Skeleton className="w-1/4" />
        <Skeleton lines={2} />
      </div>
      {announce && <span className="sr-only">{label}</span>}
    </Card>
  )
}
