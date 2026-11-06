import { ResponsiveContainer } from 'recharts'
import { cn } from '../../lib/cn'
import { resolveOption } from '../../lib/resolveOption'
import { CHART_HEIGHTS, chartHeightClasses, DEFAULT_CHART_HEIGHT } from './chartConfig'

/** Our legend markup: a swatch and the label per series. */
export function ChartLegend({ series }) {
  return (
    <ul aria-label="Legend" className="m-ds-none flex list-none flex-wrap items-center gap-ds-md p-ds-none">
      {series.map((item) => (
        <li key={item.key} className="inline-flex items-center gap-ds-xs text-caption text-text-secondary">
          <span data-swatch="" aria-hidden="true" className="size-3 shrink-0 rounded-chip" style={{ backgroundColor: item.color }} />
          {item.label}
        </li>
      ))}
    </ul>
  )
}

function deltaText(value, previous) {
  if (typeof value !== 'number' || typeof previous !== 'number' || previous === 0) return null
  const change = ((value - previous) / Math.abs(previous)) * 100
  const rounded = Math.round(change * 10) / 10
  return `${rounded > 0 ? '+' : ''}${rounded.toLocaleString('en-US')}%`
}

/**
 * Tooltip content in the tooltip tokens. Recharts passes `active`, `payload` and `label`.
 * `showDelta` adds the change from the previous data point.
 */
export function ChartTooltip({ active, payload, label, series, data, valueFormatter, xFormatter, showDelta }) {
  if (!active || !payload?.length) return null
  const row = payload[0].payload
  const index = data.indexOf(row)
  const previous = index > 0 ? data[index - 1] : undefined
  return (
    <div className="flex min-w-32 flex-col gap-ds-xxs rounded-control bg-chart-tooltip-bg px-ds-sm py-ds-xs text-caption text-chart-tooltip-text shadow-float">
      <p className="m-ds-none font-semibold">{xFormatter(label)}</p>
      <ul className="m-ds-none flex list-none flex-col gap-ds-xxs p-ds-none">
        {series.map((item) => {
          const value = row[item.key]
          const delta = showDelta && previous ? deltaText(value, previous[item.key]) : null
          return (
            <li key={item.key} className="flex items-center gap-ds-xs">
              <span aria-hidden="true" className="size-2 shrink-0 rounded-chip" style={{ backgroundColor: item.color }} />
              <span className="grow">{item.label}</span>
              <span className="font-semibold tabular-nums">{valueFormatter(value)}</span>
              {delta && <span className="tabular-nums">{delta}</span>}
            </li>
          )
        })}
      </ul>
    </div>
  )
}

/**
 * Shared chart wrapper: a fixed-height plot area with a ResponsiveContainer, then the legend.
 * The svg text inherits Fixel from `font-sans`. `data-animated` mirrors isAnimationActive.
 */
export function ChartFrame({ height, animated, legend, series, component, className, children, ref, ...props }) {
  const resolvedHeight = resolveOption(height, CHART_HEIGHTS, DEFAULT_CHART_HEIGHT, component, 'height')
  return (
    <div ref={ref} data-chart="" data-animated={String(animated)} className={cn('flex flex-col gap-ds-sm font-sans', className)} {...props}>
      <div data-chart-plot="" className={cn('w-full', chartHeightClasses[resolvedHeight])}>
        <ResponsiveContainer width="100%" height="100%">
          {children}
        </ResponsiveContainer>
      </div>
      {legend && <ChartLegend series={series} />}
    </div>
  )
}
