import { StatusBadge } from './StatusBadge'
import { STATUS_BADGES } from './statusBadges'

export default {
  title: 'Organisms/Admin/StatusBadge',
  component: StatusBadge,
  tags: ['autodocs'],
  args: { status: 'pending' },
  argTypes: { status: { control: 'select', options: Object.keys(STATUS_BADGES) } },
}

export const Default = {}

const groups = [
  ['Users', ['active', 'banned', 'deleted']],
  ['Content', ['draft', 'published', 'archived', 'featured']],
  ['Moderation', ['approved', 'pending', 'flagged', 'hidden', 'removed', 'suspended']],
  ['Jobs', ['open', 'in-progress', 'completed', 'closed']],
  ['Applications', ['applied', 'reviewing', 'interview', 'offer', 'hired', 'rejected', 'withdrawn']],
  ['Connections', ['pending', 'accepted', 'declined']],
  ['Contact', ['new', 'in-progress', 'handled']],
]

export const AllStatuses = {
  render: () => (
    <dl className="grid gap-ds-md">
      {groups.map(([group, statuses]) => (
        <div key={group} className="flex flex-col gap-ds-xs">
          <dt className="text-body-sm font-semibold text-text-secondary">{group}</dt>
          <dd className="flex flex-wrap gap-ds-xs">
            {statuses.map((status) => (
              <StatusBadge key={status} status={status} />
            ))}
          </dd>
        </div>
      ))}
    </dl>
  ),
}

export const Small = { args: { status: 'in-progress', size: 'sm' } }

export const UnknownStatus = { args: { status: 'on-hold' } }

export const Missing = { args: { status: null } }
