import { ArrowLeft, Briefcase, MessageCircle, Users } from 'lucide-react'
import { withAuth } from '../../../../../.storybook/decorators'
import { useAuth } from '../../../../context/AuthContext'
import { Card, SearchInput, StatCard } from '../../../patterns'
import { Button, Heading, Text } from '../../../primitives'
import { ADMIN_NAV, MEMBER_NAV } from '../nav'
import { AppShell } from './AppShell'

// Reads the signed-in user from AuthContext, the way the app layouts will wire the shell.
function ShellWithAuth(args) {
  const { user, logout } = useAuth()
  return <AppShell user={user} onLogout={logout} {...args} />
}

function SampleContent() {
  return (
    <div className="flex flex-col gap-ds-lg">
      <div className="grid gap-ds-lg md:grid-cols-3">
        <StatCard icon={Briefcase} label="Open jobs" value="24" period="Last 30 days" trend={{ value: 12 }} />
        <StatCard icon={Users} label="New members" value="132" period="Last 30 days" trend={{ value: 8 }} />
        <StatCard icon={MessageCircle} label="Messages" value="58" period="Last 30 days" trend={{ value: -4 }} />
      </div>
      <Card>
        <Heading level={2} size="h4">
          Head of Growth at TechFlow
        </Heading>
        <Text tone="secondary">Remote, full time. Lead acquisition and lifecycle for a B2B SaaS platform.</Text>
      </Card>
      <Card>
        <Heading level={2} size="h4">
          VP Marketing at CloudScale
        </Heading>
        <Text tone="secondary">Toronto or remote. Build the demand gen team from five to fifteen.</Text>
      </Card>
    </div>
  )
}

const search = <SearchInput label="Search sessions, resources, members" placeholder="Search sessions, resources, members" />

export default {
  title: 'Organisms/AppShell/AppShell',
  component: AppShell,
  tags: ['autodocs'],
  decorators: [withAuth()],
  parameters: { layout: 'fullscreen', router: { initialEntries: ['/dashboard/jobs'] } },
  render: (args) => <ShellWithAuth {...args} />,
  args: {
    nav: MEMBER_NAV,
    title: 'Jobs',
    badges: { messages: 3 },
    notifications: { count: 3, onClick: () => {} },
    search,
    children: <SampleContent />,
  },
}

export const MemberShell = {}

export const AdminShell = {
  args: {
    nav: ADMIN_NAV,
    logoTo: '/admin',
    title: 'Users',
    badges: undefined,
    sidebarFooter: (
      <Button to="/dashboard" variant="ghost" leadingIcon={ArrowLeft} block>
        Back to dashboard
      </Button>
    ),
  },
  parameters: { router: { initialEntries: ['/admin/users'] } },
}

export const Rail = { globals: { viewport: { value: 'rail', isRotated: false } } }

export const Mobile = { globals: { viewport: { value: 'mobile', isRotated: false } } }

export const MobileNavOpen = {
  args: { defaultNavOpen: true },
  globals: { viewport: { value: 'mobile', isRotated: false } },
}
