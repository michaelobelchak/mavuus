import { CartesianGrid, Line, LineChart as RechartsLineChart, Tooltip, XAxis, YAxis } from 'recharts'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { resolveOption } from '../../lib/resolveOption'
import { chartTheme, resolveSeries, useChartConfig } from './chartConfig'
import { ChartFrame, ChartTooltip } from './ChartParts'

const CURVES = { smooth: 'monotone', linear: 'linear' }

/**
 * Line chart on recharts, with the same API as BarChart: `data`, `xKey`, `series` [{ key,
 * label, color? (1 to 6) }], `valueFormatter`, `xFormatter`, `showDelta`, `height`, and it reads
 * them from a surrounding ChartCard.
 * - `curve`: smooth (default) or linear. Every point gets a dot; the hovered one grows.
 * - `legend`: our legend below the chart (default: when there is more than one series).
 * Animation is off when the user prefers reduced motion. Other props go to the wrapper.
 */
export function LineChart({ data, xKey, series, valueFormatter, xFormatter, height, title, curve, showDelta = false, legend, ...props }) {
  const config = useChartConfig({ data, xKey, series, valueFormatter, xFormatter, height, title })
  const reduced = useReducedMotion()
  const resolved = resolveSeries(config.series, 'LineChart')
  const type = CURVES[resolveOption(curve, Object.keys(CURVES), 'smooth', 'LineChart', 'curve')]
  const tick = { fill: chartTheme.axis, fontSize: chartTheme.fontSize }

  return (
    <ChartFrame height={config.height} legend={legend ?? resolved.length > 1} series={resolved} component="LineChart" {...props}>
      <RechartsLineChart
        data={config.data}
        title={config.title}
        margin={{ top: chartTheme.gap, right: chartTheme.gap, bottom: 0, left: 0 }}
        accessibilityLayer
      >
        <CartesianGrid vertical={false} stroke={chartTheme.grid} />
        <XAxis
          dataKey={config.xKey}
          tickFormatter={config.xFormatter}
          tick={tick}
          axisLine={false}
          tickLine={false}
          padding={{ left: chartTheme.edgePadding, right: chartTheme.edgePadding }}
        />
        <YAxis tickFormatter={config.valueFormatter} tick={tick} axisLine={false} tickLine={false} width="auto" />
        <Tooltip
          cursor={{ stroke: chartTheme.grid }}
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
        {resolved.map((item) => (
          <Line
            key={item.key}
            type={type}
            dataKey={item.key}
            name={item.label}
            stroke={item.color}
            strokeWidth={2}
            dot={{ r: 3, fill: item.color, stroke: item.color }}
            activeDot={{ r: 5, fill: item.color, stroke: item.color }}
            isAnimationActive={!reduced}
          />
        ))}
      </RechartsLineChart>
    </ChartFrame>
  )
}
