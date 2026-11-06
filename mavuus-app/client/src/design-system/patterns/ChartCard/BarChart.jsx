import {
  Bar,
  BarChart as RechartsBarChart,
  CartesianGrid,
  Rectangle,
  Tooltip,
  useActiveTooltipLabel,
  XAxis,
  YAxis,
} from 'recharts'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { chartTheme, MUTED_BAR_OPACITY, resolveSeries, useChartConfig } from './chartConfig'
import { ChartFrame, ChartTooltip } from './ChartParts'

// Bar shape: while a bar is under the pointer or keyboard focus, the other bars fade.
function HighlightBar({ xKey, ...props }) {
  const activeLabel = useActiveTooltipLabel()
  const muted = activeLabel !== undefined && activeLabel !== null && String(props.payload?.[xKey]) !== String(activeLabel)
  return (
    <Rectangle
      {...props}
      fillOpacity={muted ? MUTED_BAR_OPACITY : 1}
      className="transition-[fill-opacity] duration-150 ease-enter motion-reduce:transition-none"
    />
  )
}

/**
 * Bar chart on recharts. Inside a ChartCard it reads `data`, `xKey`, `series`, the formatters
 * and `height` from the card; its own props win.
 * - `data`: rows; `xKey`: the category field; `series`: [{ key, label, color? (1 to 6, chart-1
 *   to chart-6; default by order) }].
 * - `stacked`: stack the series (only the top one gets rounded corners).
 * - `valueFormatter(value)` for the y axis and tooltip, `xFormatter(value)` for the x axis.
 * - `showDelta`: the tooltip adds the change from the previous point.
 * - `legend`: our legend below the chart (default: when there is more than one series).
 * - `height`: sm 240px, md 320px (default), lg 400px.
 * Bars have 8px rounded tops; hovering or arrowing to a bar fades the others. Arrow keys move
 * through the bars once the chart has focus (recharts accessibility layer). Animation is off
 * when the user prefers reduced motion. Other props go to the wrapper.
 */
export function BarChart({ data, xKey, series, valueFormatter, xFormatter, height, title, stacked = false, showDelta = false, legend, ...props }) {
  const config = useChartConfig({ data, xKey, series, valueFormatter, xFormatter, height, title })
  const reduced = useReducedMotion()
  const resolved = resolveSeries(config.series, 'BarChart')
  const tick = { fill: chartTheme.axis, fontSize: chartTheme.fontSize }
  const radius = chartTheme.barRadius

  return (
    <ChartFrame height={config.height} animated={!reduced} legend={legend ?? resolved.length > 1} series={resolved} component="BarChart" {...props}>
      <RechartsBarChart
        data={config.data}
        title={config.title}
        margin={{ top: chartTheme.gap, right: chartTheme.gap, bottom: 0, left: 0 }}
        accessibilityLayer
      >
        <CartesianGrid vertical={false} stroke={chartTheme.grid} />
        <XAxis dataKey={config.xKey} tickFormatter={config.xFormatter} tick={tick} axisLine={false} tickLine={false} />
        <YAxis tickFormatter={config.valueFormatter} tick={tick} axisLine={false} tickLine={false} width="auto" />
        <Tooltip
          cursor={false}
          isAnimationActive={!reduced}
          content={
            <ChartTooltip
              series={resolved}
              data={config.data}
              valueFormatter={config.valueFormatter}
              xFormatter={config.xFormatter}
              showDelta={showDelta}
            />
          }
        />
        {resolved.map((item, index) => {
          const top = !stacked || index === resolved.length - 1
          return (
            <Bar
              key={item.key}
              dataKey={item.key}
              name={item.label}
              fill={item.color}
              stackId={stacked ? 'stack' : undefined}
              radius={top ? [radius, radius, 0, 0] : 0}
              maxBarSize={48}
              shape={<HighlightBar xKey={config.xKey} />}
              isAnimationActive={!reduced}
            />
          )
        })}
      </RechartsBarChart>
    </ChartFrame>
  )
}
