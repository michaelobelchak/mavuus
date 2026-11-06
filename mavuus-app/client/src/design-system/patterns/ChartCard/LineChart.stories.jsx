import { formatWeek, weeklySignups } from './chartStoryData'
import { LineChart } from './LineChart'

export default {
  title: 'Patterns/LineChart',
  component: LineChart,
  tags: ['autodocs'],
  args: {
    data: weeklySignups,
    xKey: 'start',
    xFormatter: formatWeek,
    series: [
      { key: 'count', label: 'Signups' },
      { key: 'invites', label: 'Invites sent', color: 2 },
    ],
  },
}

export const Smooth = {}

export const Linear = { args: { curve: 'linear' } }

export const SingleSeries = { args: { series: [{ key: 'count', label: 'Signups' }], legend: true } }
