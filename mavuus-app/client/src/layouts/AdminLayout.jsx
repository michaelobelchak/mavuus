import { ArrowLeft } from 'lucide-react'
import { ADMIN_NAV } from '@/design-system/organisms'
import { ShellLayout } from './ShellLayout'
import { sidebarFooterLink } from './sidebarFooterLink'

// Under the admin nav: the way back to the member dashboard (an icon with a tooltip in the rail).
const adminFooter = sidebarFooterLink({ label: 'Back to dashboard', icon: ArrowLeft, to: '/dashboard' }, 'Leave admin')

/** The admin panel frame (/admin): AppShell with ADMIN_NAV and a link back to the dashboard. */
export default function AdminLayout() {
  return <ShellLayout nav={ADMIN_NAV} navLabel="Admin" logoTo="/admin" sidebarFooter={adminFooter} />
}
