import { useId, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useMediaQuery } from '../../../hooks'
import { cn } from '../../../lib/cn'
import { Sheet } from '../../../patterns'
import { AppSidebar } from '../AppSidebar'
import { AppTopBar } from '../AppTopBar'
import { readCollapsed, writeCollapsed } from './sidebarStorage'

/**
 * The signed-in layout: sidebar, top bar and the tinted main panel the page renders into.
 * - 1280px and up: always the full 280px sidebar, with no toggle. 1024 to 1279px: the 80px icon
 *   rail with tooltips by default; a toggle at the bottom of the sidebar expands it, saved in
 *   localStorage under `mv.sidebar.collapsed` (that choice only applies in this band). Below 1024px
 *   the sidebar is hidden and the top bar's menu button opens it in a left Sheet with focus on the
 *   active nav link (or the first one); it closes on Escape (focus goes back to the button) and on
 *   navigation.
 * - `nav`, `badges`, `logo`, `logoTo`, `sidebarFooter` go to AppSidebar, and `navLabel` names its
 *   nav landmark (default "Main", "Admin" for the admin shell); `title`, `breadcrumbs`,
 *   `actions`, `search`, `notifications`, `user`, `userMenuItems`, `onLogout` go to AppTopBar.
 * - `children` render in `<main id="main-content">`, a scrollable panel on `bg-surface-sunken`
 *   with a large top-left radius on desktop. A "Skip to main content" link comes first.
 * - `defaultNavOpen`: open the mobile sheet on the first render (stories).
 * `className` and other props go to the root.
 */
export function AppShell({
  nav,
  navLabel = 'Main',
  badges,
  logo,
  logoTo,
  sidebarFooter,
  user,
  title,
  breadcrumbs,
  actions,
  search,
  notifications,
  userMenuItems,
  onLogout,
  defaultNavOpen = false,
  children,
  className,
  ref,
  ...props
}) {
  const isDesktop = useMediaQuery('(min-width: 80rem)')
  const isLaptop = useMediaQuery('(min-width: 64rem)')
  const [stored, setStored] = useState(readCollapsed)
  // The saved choice only applies to the rail band; 1280px and up always shows the full sidebar.
  const collapsed = isDesktop ? false : (stored ?? true)
  const mobile = !isLaptop

  const { pathname } = useLocation()
  // The sheet belongs to the page it was opened on, so any navigation closes it.
  const [openFor, setOpenFor] = useState(defaultNavOpen ? pathname : null)
  // Leaving the mobile layout closes the sheet, so it doesn't pop open again on the way back.
  const [wasMobile, setWasMobile] = useState(mobile)
  if (wasMobile !== mobile) {
    setWasMobile(mobile)
    if (!mobile) setOpenFor(null)
  }
  const navOpen = mobile && openFor === pathname
  const navId = useId()
  const menuButtonRef = useRef(null)
  const mainRef = useRef(null)
  const sheetRef = useRef(null)

  // Open the sheet on the page's own nav link (or the first one), not on the logo.
  function navFocusTarget() {
    const nav = sheetRef.current?.querySelector('nav')
    return nav?.querySelector('a[aria-current="page"]') ?? nav?.querySelector('a') ?? true
  }

  const sidebarProps = { nav, badges, logo, logoTo, footer: sidebarFooter, 'aria-label': navLabel }

  function changeCollapsed(next) {
    setStored(next)
    writeCollapsed(next)
  }

  return (
    <div ref={ref} className={cn('flex h-dvh bg-surface-raised font-sans text-text-primary', className)} {...props}>
      <a
        href="#main-content"
        onClick={(event) => {
          event.preventDefault()
          mainRef.current?.focus()
        }}
        className="sr-only rounded-control bg-surface-raised px-ds-md py-ds-sm font-semibold text-text-primary shadow-float focus:not-sr-only focus:fixed focus:top-ds-md focus:left-ds-md focus:z-(--ds-z-toast)"
      >
        Skip to main content
      </a>
      {!mobile && (
        <div
          className={cn(
            'flex shrink-0 flex-col transition-[width] duration-300 ease-move motion-reduce:transition-none',
            collapsed ? 'w-20' : 'w-70',
          )}
        >
          <AppSidebar
            {...sidebarProps}
            collapsed={collapsed}
            onCollapsedChange={isDesktop ? undefined : changeCollapsed}
          />
        </div>
      )}
      {mobile && (
        <Sheet
          id={navId}
          side="left"
          size="sm"
          open={navOpen}
          onOpenChange={(open) => setOpenFor(open ? pathname : null)}
          title={<span className="sr-only">Menu</span>}
          ref={sheetRef}
          initialFocus={navFocusTarget}
          finalFocus={menuButtonRef}
          className="gap-ds-none p-ds-none"
        >
          <AppSidebar {...sidebarProps} onNavigate={() => setOpenFor(null)} />
        </Sheet>
      )}
      <div className="flex min-w-0 grow flex-col">
        <AppTopBar
          title={title}
          breadcrumbs={breadcrumbs}
          actions={actions}
          search={search}
          notifications={notifications}
          user={user}
          userMenuItems={userMenuItems}
          onLogout={onLogout}
          onOpenNav={mobile ? () => setOpenFor(pathname) : undefined}
          navOpen={navOpen}
          navId={navId}
          menuButtonRef={menuButtonRef}
        />
        <main
          ref={mainRef}
          id="main-content"
          tabIndex={-1}
          className="min-h-0 grow overflow-y-auto bg-surface-sunken p-ds-md lg:rounded-tl-panel lg:p-ds-xl"
        >
          {children}
        </main>
      </div>
    </div>
  )
}
