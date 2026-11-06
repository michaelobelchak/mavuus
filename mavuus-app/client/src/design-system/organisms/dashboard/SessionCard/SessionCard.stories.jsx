import { CalendarPlus } from 'lucide-react'
import { Button } from '../../../primitives'
import { SessionCard, SessionCardSkeleton } from './SessionCard'

const sessions = [
  {
    id: 1,
    title: 'Building a category from zero: lessons from three B2B launches',
    category: 'Brand',
    dateLabel: 'Thu, Nov 20',
    duration: '45 min',
    speaker: { name: 'Elmira Abushayeva', title: 'Co-founder, Mavuus' },
  },
  {
    id: 2,
    title: 'Pipeline math for CMOs',
    category: 'Demand Gen',
    dateLabel: 'Tue, Dec 2',
    duration: '60 min',
    speaker: { name: 'Priya Nair', title: 'VP Marketing, Contoso' },
  },
  {
    id: 3,
    title: 'How we cut CAC by 30 percent with partner marketing',
    category: 'Partnerships',
    kind: 'recording',
    duration: '38 min',
    views: 1284,
    speaker: { name: 'Marcus Lee', title: 'CMO, Fabrikam' },
  },
  {
    id: 4,
    title: 'Board reporting that survives the CFO',
    category: 'Leadership',
    kind: 'recording',
    duration: '52 min',
    views: 864,
  },
]

export default {
  title: 'Organisms/Dashboard/SessionCard',
  component: SessionCard,
  tags: ['autodocs'],
  decorators: [(Story, { parameters }) => <div className={parameters.wide ? 'w-6xl max-w-full' : 'w-sm max-w-full'}><Story /></div>],
  args: { ...sessions[0], to: '/dashboard/live-sessions/1' },
  argTypes: { kind: { control: 'select', options: ['live', 'recording'] } },
}

export const Default = {}

export const Recording = { args: { ...sessions[2], to: '/dashboard/on-demand/3' } }

export const WithActions = {
  args: {
    actions: (
      <Button size="sm" variant="outline" leadingIcon={CalendarPlus}>
        Add to calendar
      </Button>
    ),
  },
}

export const MissingFields = { args: { category: undefined, dateLabel: undefined, speaker: undefined } }

export const LongContent = {
  args: {
    title: 'From brand awareness to revenue: a working session on measuring the full funnel when attribution breaks and the board still wants a number',
    speaker: { name: 'Alexandra Montgomery-Fitzgerald', title: 'Senior Vice President of Global Brand and Communications, Contoso' },
  },
}

export const Loading = { render: () => <SessionCardSkeleton /> }

export const Grid = {
  parameters: { wide: true },
  render: () => (
    <ul className="grid grid-cols-1 gap-ds-md md:grid-cols-2 lg:grid-cols-3">
      {sessions.map((session) => (
        <li key={session.id}>
          <SessionCard {...session} to={`/dashboard/live-sessions/${session.id}`} />
        </li>
      ))}
      <li>
        <SessionCardSkeleton announce={false} />
      </li>
    </ul>
  ),
}
