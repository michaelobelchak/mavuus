import { Suspense, useId, useRef, useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
// eslint-disable-next-line no-unused-vars -- motion is referenced as <motion.div> in JSX
import { AnimatePresence, motion } from 'motion/react'
import { useReducedMotion } from '@/design-system/hooks'
import { AppShell } from '@/design-system/organisms'
import { Spinner } from '@/design-system/primitives'
import { useAuth } from '../context/AuthContext'
import { EmailVerificationBanner } from './EmailVerificationBanner'
import { NotificationsSheet } from './NotificationsSheet'
import { useShellMounted } from './shellPresence'
import { shellTitle } from './shellTitle'
import { useNotifications } from './useNotifications'

function PageFallback() {
  return (
    <div className="flex justify-center py-ds-section">
      <Spinner size="lg" label="Loading page" />
    </div>
  )
}

// The page fades in on navigation; with reduced motion it just appears.
function ShellOutlet() {
  const { pathname } = useLocation()
  const reduced = useReducedMotion()
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial={reduced ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={reduced ? { opacity: 1 } : { opacity: 0, y: -8 }}
        transition={{ duration: reduced ? 0 : 0.2, ease: [0.4, 0, 0.2, 1] }}
      >
        <Suspense fallback={<PageFallback />}>
          <Outlet />
        </Suspense>
      </motion.div>
    </AnimatePresence>
  )
}

/**
 * The signed-in frame shared by the member area and the admin panel: AppShell with the signed-in
 * user and account menu, the page title from the nav (shellTitle), the notifications bell and
 * sheet, the email verification banner and the routed page in <main>.
 * - `nav`, `navLabel`, `logoTo`, `sidebarFooter`, `badges`, `search` go to AppShell.
 * Route guards (ProtectedRoute, AdminRoute) stay in App.jsx around this layout.
 */
export function ShellLayout({ nav, navLabel, logoTo, sidebarFooter, badges, search }) {
  const { user, token, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const notifications = useNotifications(token, notificationsOpen)
  const bellRef = useRef(null)
  const notificationsId = useId()
  const title = shellTitle(nav, location)
  // AppShell brings its own skip link, so App.jsx's SiteSkipLink steps aside.
  useShellMounted()

  function handleLogout() {
    logout()
    navigate('/')
  }

  return (
    <AppShell
      nav={nav}
      navLabel={navLabel}
      logoTo={logoTo}
      sidebarFooter={sidebarFooter}
      badges={badges}
      search={search}
      user={user}
      onLogout={handleLogout}
      title={title}
      notifications={{
        count: notifications.count,
        pulse: notifications.pulse,
        onClick: () => setNotificationsOpen(true),
        open: notificationsOpen,
        controlsId: notificationsId,
        buttonRef: bellRef,
      }}
    >
      {user?.email_verified === 0 && <EmailVerificationBanner token={token} className="mb-ds-lg" />}
      <ShellOutlet />
      <NotificationsSheet
        id={notificationsId}
        open={notificationsOpen}
        onOpenChange={setNotificationsOpen}
        finalFocus={bellRef}
        items={notifications.items}
        unreadCount={notifications.count}
        loading={notifications.loading}
        error={notifications.error}
        onRetry={notifications.reload}
        onMarkRead={notifications.markRead}
        onMarkAllRead={notifications.markAllRead}
      />
    </AppShell>
  )
}
