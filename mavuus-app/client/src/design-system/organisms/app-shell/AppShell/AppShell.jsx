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
 * - 1280px and up: the full 280px sidebar. 1024 to 1279px: the 80px icon rail with tooltips. A
 *   toggle at the bottom of the sidebar switches between them, saved in localStorage under
 *   `mv.sidebar.collapsed`. Below 1024px the sidebar is hidden and the top bar's menu button opens
 *   it in a left Sheet, which closes on Escape (focus goes back to the button) and on navigation.
 * - `nav`, `badges`, `logo`, `logoTo`, `sidebarFooter` go to AppSidebar; `title`, `breadcrumbs`,
 *   `actions`, `search`, `notifications`, `user`, `userMenuItems`, `onLogout` go to AppTopBar.
 * - `children` render in `<main id="main-content">`, a scrollable panel on `bg-surface-sunken`
 *   with a large top-left radius on desktop. A "Skip to main content" link comes first.
 * - `defaultNavOpen`: open the mobile sheet on the first render (stories).
 * `className` and other props go to the root.
 */
export function AppShell({
  nav,
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
  const collapsed = stored ?? !isDesktop
  const mobile = !isLaptop

  const { pathname } = useLocation()
  // The sheet belongs to the page it was opened on, so any navigation closes it.
  const [openFor, setOpenFor] = useState(defaultNavOpen ? pathname : null)
  const navOpen = mobile && openFor === pathname
  const navId = useId()
  const menuButtonRef = useRef(null)
  const mainRef = useRef(null)

  const sidebarProps = { nav, badges, logo, logoTo, footer: sidebarFooter }

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
        <aside
          className={cn(
            'flex shrink-0 flex-col transition-[width] duration-300 ease-move motion-reduce:transition-none',
            collapsed ? 'w-20' : 'w-70',
          )}
        >
          <AppSidebar {...sidebarProps} collapsed={collapsed} onCollapsedChange={changeCollapsed} />
        </aside>
      )}
      {mobile && (
        <Sheet
          id={navId}
          side="left"
          size="sm"
          open={navOpen}
          onOpenChange={(open) => setOpenFor(open ? pathname : null)}
          title={<span className="sr-only">Menu</span>}
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
