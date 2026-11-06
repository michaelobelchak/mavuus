import { useState } from 'react'
import { MessageThreadItem, MessageThreadItemSkeleton } from './MessageThreadItem'

const threads = [
  { id: 1, name: 'Marcus Lee', preview: 'Happy to share the deck from the pipeline review. Does Thursday work?', time: '10:42 AM', unreadCount: 2 },
  { id: 2, name: 'Priya Nair', preview: 'Thanks for the intro to Northwind, we start next week.', time: 'Yesterday', fromSelf: true },
  { id: 3, name: 'Hana Kim', preview: 'Are you going to the Mavuus CMO dinner in Austin?', time: 'Mon' },
  { id: 4, name: 'Ana Souza', time: 'Oct 28' },
]

export default {
  title: 'Organisms/Dashboard/MessageThreadItem',
  component: MessageThreadItem,
  tags: ['autodocs'],
  decorators: [(Story) => <div className="w-sm max-w-full overflow-hidden rounded-card border border-border-subtle bg-surface-raised"><Story /></div>],
  args: { ...threads[0], onSelect: () => {} },
}

export const Default = { args: { unreadCount: 0 } }

export const Unread = {}

export const ManyUnread = { args: { unreadCount: 128 } }

export const Selected = { args: { selected: true, unreadCount: 0 } }

export const AsLink = { args: { onSelect: undefined, to: '/dashboard/messages/1' } }

export const NoMessagesYet = { args: { ...threads[3] } }

export const LongContent = {
  args: {
    name: 'Alexandra Montgomery-Fitzgerald',
    preview: 'Following up on the analyst relations budget, the events calendar for next year and the agency review we talked about at dinner.',
  },
}

export const Loading = { render: () => <MessageThreadItemSkeleton /> }

function ThreadList() {
  const [selected, setSelected] = useState(1)
  return (
    <ul className="divide-y divide-border-subtle">
      {threads.map((thread) => (
        <li key={thread.id}>
          <MessageThreadItem
            {...thread}
            unreadCount={thread.id === selected ? 0 : thread.unreadCount}
            selected={thread.id === selected}
            onSelect={() => setSelected(thread.id)}
          />
        </li>
      ))}
      <li>
        <MessageThreadItemSkeleton announce={false} />
      </li>
    </ul>
  )
}

export const List = { render: () => <ThreadList /> }
