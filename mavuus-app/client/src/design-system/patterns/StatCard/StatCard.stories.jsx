import { MemoryRouter } from 'react-router-dom'
import { Briefcase, Users } from 'lucide-react'
import { StatCard } from './StatCard'

export default {
  title: 'Patterns/StatCard',
  component: StatCard,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <MemoryRouter>
        <div className="max-w-xs">
          <Story />
        </div>
      </MemoryRouter>
    ),
  ],
  args: { icon: Users, label: 'Users', value: 430, trend: { value: 32.54 }, period: 'Last 30 days' },
}

export const Default = {}

export const TrendDown = { args: { label: 'Churn', value: '2.1%', trend: { value: -0.4, goodWhen: 'down' } } }

export const NoTrend = { args: { icon: Briefcase, label: 'Open jobs', value: 12, trend: undefined, period: undefined } }

export const Loading = { args: { loading: true } }

export const AsLink = { args: { to: '/admin/users' } }
