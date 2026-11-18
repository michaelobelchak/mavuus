import { useLocation } from 'react-router-dom'
import { ShieldCheck } from 'lucide-react'
import { MEMBER_NAV } from '@/design-system/organisms'
import { useAuth } from '../context/AuthContext'
import { ShellLayout } from './ShellLayout'
import { ShellSearch } from './ShellSearch'
import { sidebarFooterLink } from './sidebarFooterLink'
import { useMessagesReadKey } from './messagesRead'
import { usePolledCount } from './useNotifications'
import { useSignOut } from './useSignOut'

// Admins get a way into the admin panel under the member nav (an icon with a tooltip in the rail).
const adminPanelFooter = sidebarFooterLink({ label: 'Admin panel', icon: ShieldCheck, to: '/admin' }, 'Admin')

/**
 * The member dashboard frame (/dashboard): AppShell with MEMBER_NAV, the global search, the
 * unread messages count on the Messages item (refreshed on every navigation, every 30 seconds
 * and when the Messages page marks a thread read) and, for admins, an Admin panel link under the nav.
 */
export default function MemberLayout() {
  const { user, token } = useAuth()
  const { pathname } = useLocation()
  const { sessionExpired } = useSignOut()
  const readKey = useMessagesReadKey()
  const [messages] = usePolledCount('/api/messages/unread-count', token, {
    refreshKey: `${pathname}#${readKey}`,
    onUnauthorized: sessionExpired,
  })
  return (
    <ShellLayout
      nav={MEMBER_NAV}
      badges={{ messages }}
      search={<ShellSearch />}
      sidebarFooter={user?.role === 'admin' ? adminPanelFooter : undefined}
    />
  )
}
