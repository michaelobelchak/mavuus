import { Select } from '../../primitives'
import { BarChart } from './BarChart'
import { ChartCard } from './ChartCard'
import { formatWeek, weeklySignups } from './chartStoryData'
import { LineChart } from './LineChart'

const range = (
  <Select
    aria-label="Range"
    size="sm"
    defaultValue="12w"
    items={[
      { value: '12w', label: '12 weeks' },
      { value: '6m', label: '6 months' },
    ]}
  />
)

export default {
  title: 'Patterns/ChartCard',
  component: ChartCard,
  tags: ['autodocs'],
  args: {
    title: 'Weekly signups',
    description: 'New members per week, last 12 weeks',
    data: weeklySignups,
    xKey: 'start',
    xLabel: 'Week of',
    xFormatter: formatWeek,
    series: [{ key: 'count', label: 'Signups' }],
  },
}

export const Bars = { render: (args) => <ChartCard {...args} actions={range}><BarChart showDelta /></ChartCard> }

export const Lines = {
  args: {
    title: 'Signups and invites',
    series: [
      { key: 'count', label: 'Signups' },
      { key: 'invites', label: 'Invites sent', color: 2 },
    ],
  },
  render: (args) => (
    <ChartCard {...args}>
      <LineChart />
    </ChartCard>
  ),
}

export const TableView = {
  args: { defaultView: 'table' },
  render: (args) => (
    <ChartCard {...args}>
      <BarChart />
    </ChartCard>
  ),
}

export const Small = {
  args: { height: 'sm' },
  render: (args) => (
    <ChartCard {...args}>
      <BarChart />
    </ChartCard>
  ),
}
