import { ArrowLeft } from 'lucide-react'
import { Button } from '../../../primitives'
import { ADMIN_NAV, MEMBER_NAV } from '../nav'
import { AppSidebar } from './AppSidebar'

export default {
  title: 'Organisms/AppShell/AppSidebar',
  component: AppSidebar,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen', router: { initialEntries: ['/dashboard/jobs'] } },
  decorators: [
    (Story, { args }) => (
      <div className={args.collapsed ? 'h-dvh w-20 border-r border-border-subtle' : 'h-dvh w-70 border-r border-border-subtle'}>
        <Story />
      </div>
    ),
  ],
  args: { nav: MEMBER_NAV, badges: { messages: 3 } },
}

export const Member = {}

export const Admin = {
  args: {
    nav: ADMIN_NAV,
    'aria-label': 'Admin',
    logoTo: '/admin',
    footer: (
      <Button to="/dashboard" variant="ghost" leadingIcon={ArrowLeft} block>
        Back to dashboard
      </Button>
    ),
  },
  parameters: { router: { initialEntries: ['/admin/users'] } },
}

export const Rail = { args: { collapsed: true, onCollapsedChange: () => {} } }

export const WithCollapseToggle = { args: { onCollapsedChange: () => {} } }
