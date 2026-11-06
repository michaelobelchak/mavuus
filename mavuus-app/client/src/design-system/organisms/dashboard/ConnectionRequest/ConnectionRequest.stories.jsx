import { useState } from 'react'
import { ConnectionRequest, ConnectionRequestSkeleton } from './ConnectionRequest'

const requests = [
  { id: 1, name: 'Hana Kim', title: 'Director of Demand Gen', company: 'Adatum' },
  { id: 2, name: 'Tom Becker', title: 'Growth Lead', company: 'Litware' },
  { id: 3, name: 'Sam Carter', title: 'Fractional CMO' },
]

export default {
  title: 'Organisms/Dashboard/ConnectionRequest',
  component: ConnectionRequest,
  tags: ['autodocs'],
  decorators: [(Story) => <div className="max-w-2xl"><Story /></div>],
  args: { ...requests[0], to: '/dashboard/members/1', onAccept: () => {}, onDecline: () => {} },
  argTypes: { status: { control: 'select', options: ['pending', 'accepted', 'declined'] } },
}

export const Pending = {}

export const Accepting = { args: { accepting: true } }

export const Accepted = { args: { status: 'accepted', messageTo: '/dashboard/messages?user=1' } }

export const Declined = { args: { status: 'declined' } }

export const MissingFields = { args: { title: undefined, company: undefined, to: undefined } }

export const LongContent = {
  args: {
    name: 'Alexandra Montgomery-Fitzgerald',
    title: 'Senior Vice President of Global Brand and Communications',
    company: 'Contoso Enterprise Software International',
  },
}

export const Loading = { render: () => <ConnectionRequestSkeleton /> }

function RequestList() {
  const [statuses, setStatuses] = useState({})
  const set = (id, status) => setStatuses((current) => ({ ...current, [id]: status }))
  return (
    <ul className="flex flex-col gap-ds-xs rounded-panel bg-status-warning-subtle p-ds-md">
      {requests.map((request) => (
        <li key={request.id}>
          <ConnectionRequest
            {...request}
            status={statuses[request.id]}
            to={`/dashboard/members/${request.id}`}
            messageTo={`/dashboard/messages?user=${request.id}`}
            onAccept={() => set(request.id, 'accepted')}
            onDecline={() => set(request.id, 'declined')}
          />
        </li>
      ))}
    </ul>
  )
}

export const List = { render: () => <RequestList /> }
