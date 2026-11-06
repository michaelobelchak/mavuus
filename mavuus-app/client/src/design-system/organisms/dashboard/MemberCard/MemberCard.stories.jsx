import { MemberCard, MemberCardSkeleton } from './MemberCard'

const members = [
  { id: 1, name: 'Priya Nair', title: 'VP Marketing', company: 'Contoso', tier: 'Pro', connection: 'none' },
  { id: 2, name: 'Marcus Lee', title: 'Chief Marketing Officer', company: 'Fabrikam', tier: 'Pro', connection: 'connected' },
  { id: 3, name: 'Ana Souza', title: 'Head of Brand', company: 'Tailspin Studio', tier: 'Free', connection: 'outgoing' },
  { id: 4, name: 'Hana Kim', title: 'Director of Demand Generation', company: 'Adatum', tier: 'Pro', connection: 'incoming' },
  { id: 5, name: 'Tom Becker', title: 'Growth Lead', company: 'Litware', tier: 'Free', connection: 'none' },
  { id: 6, name: 'Sam Carter', title: 'Fractional CMO for Series A to C B2B SaaS companies', company: 'Independent', tier: 'Pro', connection: 'none' },
]

const handlers = { onConnect: () => {}, onAccept: () => {} }

export default {
  title: 'Organisms/Dashboard/MemberCard',
  component: MemberCard,
  tags: ['autodocs'],
  decorators: [(Story) => <div className="max-w-xs"><Story /></div>],
  args: { ...members[0], ...handlers, to: '/dashboard/members/1' },
  argTypes: { connection: { control: 'select', options: ['none', 'outgoing', 'incoming', 'connected'] } },
}

export const Default = {}

export const Connecting = { args: { connecting: true } }

export const RequestSent = { args: { connection: 'outgoing' } }

export const IncomingRequest = { args: { connection: 'incoming' } }

export const Connected = { args: { connection: 'connected', messageTo: '/dashboard/messages?user=1' } }

export const OwnCard = { args: { isSelf: true } }

export const MissingFields = { args: { name: 'Jordan Ellis', title: undefined, company: undefined, tier: undefined, to: undefined } }

export const LongContent = {
  args: {
    name: 'Alexandra Montgomery-Fitzgerald',
    title: 'Senior Vice President of Global Brand, Communications and Customer Marketing',
    company: 'Contoso Enterprise Software International',
  },
}

export const Loading = { render: () => <MemberCardSkeleton /> }

export const Grid = {
  decorators: [(Story) => <div className="max-w-6xl"><Story /></div>],
  render: () => (
    <ul className="grid grid-cols-1 gap-ds-md md:grid-cols-2 lg:grid-cols-3">
      {members.map((member) => (
        <li key={member.id}>
          <MemberCard
            {...member}
            {...handlers}
            to={`/dashboard/members/${member.id}`}
            messageTo={`/dashboard/messages?user=${member.id}`}
          />
        </li>
      ))}
      <li>
        <MemberCardSkeleton />
      </li>
    </ul>
  ),
}
