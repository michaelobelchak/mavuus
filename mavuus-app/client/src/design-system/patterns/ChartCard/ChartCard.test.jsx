import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { resetWarnings } from '../../lib/warnOnce'
import { mockReducedMotion, mockResizeObserver } from '../../test/browserMocks'
import { chartColors } from '../../tokens/tokens'
import { BarChart } from './BarChart'
import { ChartCard } from './ChartCard'
import { LineChart } from './LineChart'

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
  resetWarnings()
})

const growth = [
  { week: 'Oct 5', signups: 12, invites: 4 },
  { week: 'Oct 12', signups: 18, invites: 7 },
  { week: 'Oct 19', signups: 1500, invites: 9 },
]
const series = [
  { key: 'signups', label: 'Signups' },
  { key: 'invites', label: 'Invites', color: 3 },
]

function setup() {
  mockResizeObserver({ width: 640, height: 320 })
  mockReducedMotion(true)
}

describe('ChartCard', () => {
  it('should render the title as an h3 by default with the description and actions', () => {
    setup()
    render(
      <ChartCard title="Weekly signups" description="Last 12 weeks" actions={<button type="button">6 months</button>} data={growth} xKey="week" series={series}>
        <BarChart />
      </ChartCard>,
    )
    expect(screen.getByRole('heading', { level: 3, name: 'Weekly signups' })).toBeInTheDocument()
    expect(screen.getByText('Last 12 weeks')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '6 months' })).toBeInTheDocument()
  })

  it('should take headingLevel for the title', () => {
    setup()
    render(
      <ChartCard title="Weekly signups" headingLevel={2} data={growth} xKey="week" series={series}>
        <BarChart />
      </ChartCard>,
    )
    expect(screen.getByRole('heading', { level: 2, name: 'Weekly signups' })).toBeInTheDocument()
  })

  it('should swap the chart for a table of the same values when View as table is pressed', async () => {
    setup()
    const user = userEvent.setup()
    const { container } = render(
      <ChartCard title="Weekly signups" data={growth} xKey="week" xLabel="Week" series={series} valueFormatter={(value) => value.toLocaleString('en-US')}>
        <BarChart />
      </ChartCard>,
    )
    expect(screen.queryByRole('table')).toBeNull()
    expect(container.querySelector('.recharts-responsive-container')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'View as table' }))
    const table = screen.getByRole('table', { name: 'Weekly signups' })
    expect(container.querySelector('.recharts-responsive-container')).toBeNull()
    expect(within(table).getAllByRole('columnheader').map((th) => th.textContent)).toEqual(['Week', 'Signups', 'Invites'])
    const lastRow = within(table).getAllByRole('row')[3]
    expect(within(lastRow).getByRole('rowheader', { name: 'Oct 19' })).toBeInTheDocument()
    expect(within(lastRow).getByRole('cell', { name: '1,500' })).toBeInTheDocument()
    expect(within(lastRow).getByRole('cell', { name: '9' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'View as chart' }))
    expect(screen.queryByRole('table')).toBeNull()
  })

  it('should size the chart area with the height prop', () => {
    setup()
    const { container } = render(
      <ChartCard title="Weekly signups" height="lg" data={growth} xKey="week" series={series}>
        <BarChart />
      </ChartCard>,
    )
    expect(container.querySelector('[data-chart-plot]')).toHaveClass('h-100')
  })

  it('should hide the table toggle and warn in dev when it has no data or series', () => {
    setup()
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})
    render(
      <ChartCard title="Weekly signups">
        <BarChart data={growth} xKey="week" series={series} />
      </ChartCard>,
    )
    expect(screen.queryByRole('button', { name: 'View as table' })).toBeNull()
    expect(error).toHaveBeenCalledWith(expect.stringMatching(/ChartCard: .*data/))
  })
})

describe('BarChart', () => {
  it('should color bars and legend swatches from chartColors, using the series color index', () => {
    setup()
    const { container } = render(<BarChart data={growth} xKey="week" series={series} />)
    const legend = screen.getByRole('list', { name: 'Legend' })
    const items = within(legend).getAllByRole('listitem')
    expect(items.map((item) => item.textContent)).toEqual(['Signups', 'Invites'])
    expect(items[0].querySelector('[data-swatch]')).toHaveStyle({ backgroundColor: chartColors[0] })
    expect(items[1].querySelector('[data-swatch]')).toHaveStyle({ backgroundColor: chartColors[2] })
    const fills = [...container.querySelectorAll('.recharts-bar-rectangle path')].map((path) => path.getAttribute('fill'))
    expect(fills.length).toBeGreaterThan(0)
    expect(new Set(fills)).toEqual(new Set([chartColors[0], chartColors[2]]))
  })

  it('should fade the other bars and show the styled tooltip when a bar gets keyboard focus', async () => {
    setup()
    const user = userEvent.setup()
    const { container } = render(<BarChart data={growth} xKey="week" series={[series[0]]} showDelta />)
    const bars = () => [...container.querySelectorAll('.recharts-bar-rectangle path')]
    expect(bars().every((bar) => bar.getAttribute('fill-opacity') === '1')).toBe(true)
    container.querySelector('svg.recharts-surface').focus()
    await user.keyboard('{ArrowRight}')
    const opacities = bars().map((bar) => bar.getAttribute('fill-opacity'))
    expect(opacities.filter((value) => value === '1')).toHaveLength(1)
    expect(opacities.filter((value) => value === String(0.4))).toHaveLength(2)
    const tooltip = container.querySelector('.bg-chart-tooltip-bg')
    expect(tooltip).toHaveClass('text-chart-tooltip-text', 'rounded-control', 'shadow-float')
    expect(tooltip).toHaveTextContent('Oct 12Signups18+50%')
    await user.keyboard('{ArrowRight}')
    expect(container.querySelector('.bg-chart-tooltip-bg')).toHaveTextContent('Oct 19Signups1,500+8,233.3%')
  })

  it('should leave out the legend for a single series unless asked', () => {
    setup()
    const { rerender } = render(<BarChart data={growth} xKey="week" series={[series[0]]} />)
    expect(screen.queryByRole('list', { name: 'Legend' })).toBeNull()
    rerender(<BarChart data={growth} xKey="week" series={[series[0]]} legend />)
    expect(screen.getByRole('list', { name: 'Legend' })).toBeInTheDocument()
  })

  it('should warn in dev and fall back when a series color is outside 1 to 6', () => {
    setup()
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})
    render(<BarChart data={growth} xKey="week" series={[{ key: 'signups', label: 'Signups', color: 9 }]} legend />)
    expect(error).toHaveBeenCalledWith(expect.stringMatching(/BarChart: .*color/))
    expect(document.querySelector('[data-swatch]')).toHaveStyle({ backgroundColor: chartColors[0] })
  })
})

describe('LineChart', () => {
  it('should draw a line per series in its chart color and list the series in the legend', () => {
    setup()
    const { container } = render(<LineChart data={growth} xKey="week" series={series} />)
    const legend = screen.getByRole('list', { name: 'Legend' })
    expect(within(legend).getAllByRole('listitem').map((item) => item.textContent)).toEqual(['Signups', 'Invites'])
    const strokes = [...container.querySelectorAll('.recharts-line-curve')].map((path) => path.getAttribute('stroke'))
    expect(strokes).toEqual([chartColors[0], chartColors[2]])
  })

  it('should read data and series from a surrounding ChartCard', async () => {
    setup()
    const user = userEvent.setup()
    render(
      <ChartCard title="Active members" data={growth} xKey="week" series={series}>
        <LineChart curve="linear" />
      </ChartCard>,
    )
    expect(screen.getByRole('list', { name: 'Legend' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'View as table' }))
    expect(screen.getByRole('table', { name: 'Active members' })).toBeInTheDocument()
  })

})
