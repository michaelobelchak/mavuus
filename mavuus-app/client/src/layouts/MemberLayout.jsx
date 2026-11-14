import { useLocation } from 'react-router-dom'
import { MEMBER_NAV } from '@/design-system/organisms'
import { useAuth } from '../context/AuthContext'
import { ShellLayout } from './ShellLayout'
import { ShellSearch } from './ShellSearch'
import { usePolledCount } from './useNotifications'

/**
 * The member dashboard frame (/dashboard): AppShell with MEMBER_NAV, the global search and the
 * unread messages count on the Messages item (refreshed on every navigation and every 30 seconds).
 */
export default function MemberLayout() {
  const { token } = useAuth()
  const { pathname } = useLocation()
  const [messages] = usePolledCount('/api/messages/unread-count', token, pathname)
  return <ShellLayout nav={MEMBER_NAV} badges={{ messages }} search={<ShellSearch />} />
}
