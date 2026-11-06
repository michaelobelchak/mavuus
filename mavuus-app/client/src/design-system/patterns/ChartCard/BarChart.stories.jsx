import { BarChart } from './BarChart'
import { formatWeek, weeklySignups } from './chartStoryData'

export default {
  title: 'Patterns/BarChart',
  component: BarChart,
  tags: ['autodocs'],
  args: { data: weeklySignups, xKey: 'start', xFormatter: formatWeek, series: [{ key: 'count', label: 'Signups' }] },
}

export const Default = {}

export const WithDelta = { args: { showDelta: true } }

export const Stacked = {
  args: {
    stacked: true,
    series: [
      { key: 'count', label: 'Signups' },
      { key: 'invites', label: 'Invites', color: 3 },
    ],
  },
}

export const Grouped = {
  args: {
    series: [
      { key: 'count', label: 'Signups' },
      { key: 'invites', label: 'Invites', color: 2 },
    ],
  },
}
