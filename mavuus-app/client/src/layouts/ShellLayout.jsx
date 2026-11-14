import { Suspense, useCallback, useId, useRef, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
// eslint-disable-next-line no-unused-vars -- motion is referenced as <motion.div> in JSX
import { motion } from 'motion/react'
import { useReducedMotion } from '@/design-system/hooks'
import { AppShell } from '@/design-system/organisms'
import { Spinner } from '@/design-system/primitives'
import { useAuth } from '../context/AuthContext'
import { EmailVerificationBanner } from './EmailVerificationBanner'
import { NotificationsSheet } from './NotificationsSheet'
import { useShellMounted } from './shellPresence'
import { shellTitle } from './shellTitle'
import { useNotifications } from './useNotifications'
import { useSignOut } from './useSignOut'

// Tracks an element's height (with its bottom padding), so the shell can publish the banner's
// height as --shell-banner-h for pages that size themselves to the screen (MessagesPage).
function useBlockHeight() {
  const [height, setHeight] = useState(0)
  const observerRef = useRef(null)
  const ref = useCallback((element) => {
    observerRef.current?.disconnect()
    observerRef.current = null
    if (!element) {
      setHeight(0)
      return
    }
    const measure = () => setHeight(Math.round(element.getBoundingClientRect().height))
    measure()
    if (typeof ResizeObserver === 'undefined') return
    observerRef.current = new ResizeObserver(measure)
    observerRef.current.observe(element)
  }, [])
  return [ref, height]
}

function PageFallback() {
  return (
    <div className="flex justify-center py-ds-section">
      <Spinner size="lg" label="Loading page" />
    </div>
  )
}

// The page fades in on navigation (no exit animation, so the new page never waits for the old
// one); with reduced motion it just appears.
function ShellOutlet() {
  const { pathname } = useLocation()
  const reduced = useReducedMotion()
  return (
    <motion.div
      key={pathname}
      initial={reduced ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduced ? 0 : 0.2, ease: [0.4, 0, 0.2, 1] }}
    >
      <Suspense fallback={<PageFallback />}>
        <Outlet />
      </Suspense>
    </motion.div>
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
  const { user, token } = useAuth()
  const { signOut, sessionExpired } = useSignOut()
  const location = useLocation()
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const notifications = useNotifications(token, notificationsOpen, { onUnauthorized: sessionExpired })
  const bellRef = useRef(null)
  const [bannerRef, bannerHeight] = useBlockHeight()
  // Closing the sheet returns focus to the bell, unless a notification link was followed: then
  // the new page's title gets it (AppShell focuses it after a navigation).
  const followedLinkRef = useRef(false)
  function notificationsFinalFocus() {
    if (!followedLinkRef.current) return bellRef.current
    return document.querySelector('[data-app-shell] header h1') ?? bellRef.current
  }
  const notificationsId = useId()
  const title = shellTitle(nav, location)
  // AppShell brings its own skip link, so App.jsx's SiteSkipLink steps aside.
  useShellMounted()


  return (
    <AppShell
      style={bannerHeight ? { '--shell-banner-h': `${bannerHeight}px` } : undefined}
      nav={nav}
      navLabel={navLabel}
      logoTo={logoTo}
      sidebarFooter={sidebarFooter}
      badges={badges}
      search={search}
      user={user}
      onLogout={() => signOut('/')}
      title={title}
      notifications={{
        count: notifications.count,
        pulse: notifications.pulse,
        onClick: () => {
          followedLinkRef.current = false
          setNotificationsOpen(true)
        },
        open: notificationsOpen,
        controlsId: notificationsId,
        buttonRef: bellRef,
      }}
    >
      {user?.email_verified === 0 && (
        <div ref={bannerRef} className="pb-ds-lg">
          <EmailVerificationBanner token={token} />
        </div>
      )}
      <ShellOutlet />
      <NotificationsSheet
        id={notificationsId}
        open={notificationsOpen}
        onOpenChange={setNotificationsOpen}
        finalFocus={notificationsFinalFocus}
        onFollowLink={() => {
          followedLinkRef.current = true
        }}
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
