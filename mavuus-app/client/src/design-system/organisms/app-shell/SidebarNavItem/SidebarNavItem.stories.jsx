import { Briefcase, BookmarkCheck, MessageCircle, Users } from 'lucide-react'
import { SidebarNavItem } from './SidebarNavItem'

const jobs = {
  label: 'Jobs',
  icon: Briefcase,
  to: '/dashboard/jobs',
  children: [{ label: 'My Jobs', icon: BookmarkCheck, to: '/dashboard/my-jobs' }],
}
const messages = { label: 'Messages', icon: MessageCircle, to: '/dashboard/messages', badge: 'messages' }
const members = { label: 'Members', icon: Users, to: '/dashboard/members' }

export default {
  title: 'Organisms/AppShell/SidebarNavItem',
  component: SidebarNavItem,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <ul className="m-ds-none flex w-70 list-none flex-col gap-ds-xxs bg-surface-raised p-ds-md">
        <Story />
      </ul>
    ),
  ],
  args: { item: members },
}

export const Idle = {}

export const Active = { parameters: { router: { initialEntries: ['/dashboard/members'] } } }

export const WithBadge = { args: { item: messages, badges: { messages: 3 } } }

export const GroupClosed = { args: { item: jobs } }

export const GroupActiveParent = {
  args: { item: jobs },
  parameters: { router: { initialEntries: ['/dashboard/jobs'] } },
}

export const GroupActiveChild = {
  args: { item: jobs },
  parameters: { router: { initialEntries: ['/dashboard/my-jobs'] } },
}

export const Rail = {
  args: { item: jobs, collapsed: true, badges: { messages: 3 } },
  parameters: { router: { initialEntries: ['/dashboard/my-jobs'] } },
  decorators: [
    (Story) => (
      <div className="w-20">
        <Story />
      </div>
    ),
  ],
}

export const RailWithBadge = {
  args: { item: messages, collapsed: true, badges: { messages: 3 } },
}
