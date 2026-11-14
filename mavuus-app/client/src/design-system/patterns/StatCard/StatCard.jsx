import { Caption, Icon, Skeleton, TrendBadge } from '../../primitives'
import { trendSpoken } from '../../primitives/TrendBadge/trendText'
import { Card, CardLink } from '../Card/Card'
import { CountUp } from '../CountUp/CountUp'
import { isCountable } from '../CountUp/countFormat'
import { lowerFirst } from '../../lib/text'

/**
 * KPI card: icon tile, label, big value, then the period and a TrendBadge.
 * - `icon`: lucide component, shown in a 40px tinted tile. `label`, `value` (string or number;
 *   numeric-looking values count up with CountUp), `period` ("Last 30 days").
 * - `trend`: { value, direction?, goodWhen? }, passed to TrendBadge.
 * - `loading`: skeleton layout and aria-busy, and no link. `to` / `href`: the whole card is a link
 *   (a CardLink whose name is the summary).
 * Screen readers get one summary ("Users 430, up 32.54 percent, last 30 days"); the visual parts
 * are hidden from them. Other props go to the Card.
 */
export function StatCard({
  icon,
  label,
  value,
  trend,
  period,
  loading = false,
  to,
  href,
  target,
  rel,
  className,
  ...props
}) {
  if (loading) {
    return (
      <Card aria-busy="true" className={className} {...props}>
        <div className="flex flex-col gap-ds-md">
          <Skeleton shape="rect" className="size-10 rounded-control" />
          <Skeleton lines={2} />
          <Skeleton className="w-2/5" />
        </div>
        <span className="sr-only">{`Loading ${label ?? 'stat'}`}</span>
      </Card>
    )
  }

  const isLink = to !== undefined || href !== undefined
  const valueText = typeof value === 'number' ? value.toLocaleString('en-US') : String(value ?? '')
  const summary = [
    [label, valueText].filter(Boolean).join(' '),
    trend && trendSpoken(trend.value, trend.direction),
    lowerFirst(period),
  ]
    .filter(Boolean)
    .join(', ')

  return (
    <Card interactive={isLink} className={className} {...props}>
      <div aria-hidden="true" className="flex flex-col gap-ds-md">
        {icon && (
          <span className="inline-flex size-10 items-center justify-center rounded-control bg-surface-selected text-text-brand-strong">
            <Icon icon={icon} size="md" />
          </span>
        )}
        <div className="flex flex-col gap-ds-xxs">
          <p className="text-body-sm font-medium text-text-secondary">{label}</p>
          <p data-stat-value="" className="text-h2 font-semibold text-text-primary">
            {isCountable(valueText) ? <CountUp value={valueText} /> : valueText}
          </p>
        </div>
        {(period || trend) && (
          <div className="flex flex-wrap items-center justify-between gap-ds-xs">
            {period && <Caption>{period}</Caption>}
            {trend && (
              <TrendBadge size="sm" value={trend.value} direction={trend.direction} goodWhen={trend.goodWhen} />
            )}
          </div>
        )}
      </div>
      {isLink ? (
        // The link holds only the summary, so its name is the summary; its overlay covers the card.
        <CardLink to={to} href={href} target={target} rel={rel}>
          <span className="sr-only">{summary}</span>
        </CardLink>
      ) : (
        <span className="sr-only">{summary}</span>
      )}
    </Card>
  )
}
