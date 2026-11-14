import { ArrowLeft } from 'lucide-react'
import { ADMIN_NAV, SidebarNavItem } from '@/design-system/organisms'
import { ShellLayout } from './ShellLayout'

const BACK_TO_DASHBOARD = { label: 'Back to dashboard', icon: ArrowLeft, to: '/dashboard' }

// Under the admin nav: the way back to the member dashboard (an icon with a tooltip in the rail).
function AdminSidebarFooter({ collapsed }) {
  return (
    <ul aria-label="Leave admin" className="m-ds-none list-none p-ds-none">
      <SidebarNavItem item={BACK_TO_DASHBOARD} activeTo={null} collapsed={collapsed} />
    </ul>
  )
}

/** The admin panel frame (/admin): AppShell with ADMIN_NAV and a link back to the dashboard. */
export default function AdminLayout() {
  return <ShellLayout nav={ADMIN_NAV} navLabel="Admin" logoTo="/admin" sidebarFooter={AdminSidebarFooter} />
}
