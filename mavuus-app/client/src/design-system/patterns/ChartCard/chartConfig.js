import { createContext, use } from 'react'
import { warnOnce } from '../../lib/warnOnce'
import { chartColors, tokens } from '../../tokens/tokens'

export const CHART_HEIGHTS = ['sm', 'md', 'lg']
export const DEFAULT_CHART_HEIGHT = 'md'

// 240, 320 and 400px plot areas.
export const chartHeightClasses = { sm: 'h-60', md: 'h-80', lg: 'h-100' }

// Recharts takes colors and sizes as values, not classes, so they come from tokens.js.
const px = (name) => Number.parseFloat(tokens[name])
export const chartTheme = {
  axis: tokens['chart-axis'],
  grid: tokens['chart-grid'],
  fontSize: px('ds-font-size-caption'),
  barRadius: px('ds-radius-sm'),
  gap: px('ds-space-xs'),
  // Space between the plot edge and the first and last points, so edge labels and dots aren't clipped.
  edgePadding: px('ds-space-lg'),
}

// Bars that aren't under the pointer or keyboard focus fade to this opacity.
export const MUTED_BAR_OPACITY = 0.4

export const defaultFormatter = (value) =>
  typeof value === 'number' ? value.toLocaleString('en-US') : String(value ?? '')

// Each series gets a chart color: `color` picks chart-1 to chart-6, otherwise the series order does.
export function resolveSeries(series = [], component) {
  return series.map((item, index) => {
    let colorIndex = index % chartColors.length
    if (item.color !== undefined) {
      if (Number.isInteger(item.color) && item.color >= 1 && item.color <= chartColors.length) {
        colorIndex = item.color - 1
      } else {
        warnOnce(
          `${component}:color:${item.color}`,
          `${component}: series color ${item.color} is not supported (use 1 to ${chartColors.length}). Falling back to chart-${colorIndex + 1}.`,
        )
      }
    }
    return { ...item, label: item.label ?? item.key, color: chartColors[colorIndex] }
  })
}

// ChartCard shares one config with the chart inside it and with its table view.
export const ChartContext = createContext(null)

// The chart's own props win; anything it leaves out comes from the surrounding ChartCard.
export function useChartConfig(props) {
  const card = use(ChartContext) ?? {}
  const pick = (name) => (props[name] !== undefined ? props[name] : card[name])
  return {
    data: pick('data') ?? [],
    xKey: pick('xKey'),
    series: pick('series') ?? [],
    valueFormatter: pick('valueFormatter') ?? defaultFormatter,
    xFormatter: pick('xFormatter') ?? defaultFormatter,
    height: pick('height'),
    title: pick('title'),
  }
}
