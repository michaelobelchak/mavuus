import { Plus } from 'lucide-react'
import { storyUser } from '../../../../../.storybook/storyUser'
import { SearchInput } from '../../../patterns'
import { Button } from '../../../primitives'
import { AppTopBar } from './AppTopBar'

export default {
  title: 'Organisms/AppShell/AppTopBar',
  component: AppTopBar,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  args: {
    title: 'Jobs',
    user: storyUser,
    notifications: { count: 3, onClick: () => {} },
    search: <SearchInput label="Search sessions, resources, members" placeholder="Search sessions, resources, members" />,
  },
}

export const Default = {}

export const WithBreadcrumbs = {
  args: {
    title: 'Ada Lovelace',
    breadcrumbs: [{ label: 'Users', to: '/admin/users' }, { label: 'Ada Lovelace' }],
  },
}

export const WithActions = {
  args: { actions: <Button leadingIcon={Plus} size="sm">Post a job</Button> },
}

export const NoUnread = { args: { notifications: { count: 0, onClick: () => {} } } }

export const WithMenuButton = { args: { onOpenNav: () => {} } }

export const NotificationsOpen = {
  args: { notifications: { count: 3, onClick: () => {}, open: true, controlsId: 'notifications-drawer', pulse: true } },
}

export const MobileSearch = { globals: { viewport: { value: 'mobile', isRotated: false } } }
