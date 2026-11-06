import { useEffect, useRef, useState } from 'react'
import { Bell, ChevronDown, Menu, Search } from 'lucide-react'
import { useMediaQuery } from '../../../hooks'
import { cn } from '../../../lib/cn'
import { Breadcrumbs, DropdownMenu, Popover } from '../../../patterns'
import { Avatar, Badge, Heading, IconButton } from '../../../primitives'
import { buildUserMenuItems } from '../nav'

const shortCount = (count) => (count > 9 ? '9+' : String(count))
const PULSE_MS = 700

function isTyping(target) {
  if (!(target instanceof HTMLElement)) return false
  return target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)
}

const focusField = (container) => container?.querySelector('input, textarea, [contenteditable="true"]')?.focus()

function NotificationsButton({ count, onClick, open, controlsId, buttonRef, pulse }) {
  // A brief pulse when the count goes up (CSS turns it off with reduced motion).
  const [previous, setPrevious] = useState(count)
  const [pulsing, setPulsing] = useState(false)
  if (previous !== count) {
    setPrevious(count)
    if (pulse && count > previous) setPulsing(true)
  }
  useEffect(() => {
    if (!pulsing) return undefined
    const timer = setTimeout(() => setPulsing(false), PULSE_MS)
    return () => clearTimeout(timer)
  }, [pulsing])

  return (
    <span data-pulse={pulsing ? '' : undefined} className={cn('relative inline-flex shrink-0', pulsing && 'ds-animate-pulse')}>
      <IconButton
        ref={buttonRef}
        icon={Bell}
        variant="ghost"
        aria-label={count ? `Notifications, ${count} unread` : 'Notifications'}
        aria-expanded={typeof open === 'boolean' ? open : undefined}
        aria-controls={open && controlsId ? controlsId : undefined}
        onClick={onClick}
      />
      {count > 0 && (
        <Badge tone="inverse" size="sm" aria-hidden="true" className="pointer-events-none absolute top-ds-none right-ds-none">
          {shortCount(count)}
        </Badge>
      )}
    </span>
  )
}

/**
 * The bar above the main panel: page title (an h1) or breadcrumbs on the left; search, actions,
 * notifications and the account menu on the right.
 * - `title`, `breadcrumbs` (`[{ label, to }]`, the last is the current page).
 * - `search`: a SearchInput. From 768px it sits in the bar; below that a Search button opens it in
 *   a full-width popover with focus in the field (Escape closes it and focus returns). `/` focuses
 *   it (or opens it) unless the person is typing in a field. `actions`: page-level buttons.
 * - `notifications`: `{ count, onClick, open?, controlsId?, buttonRef?, pulse? }`. The button is
 *   named "Notifications, 3 unread"; `open` sets aria-expanded (and `controlsId` aria-controls
 *   while open) for a drawer, `buttonRef` reaches the button for focus return, and `pulse` makes
 *   it pulse briefly when the count goes up.
 * - `user` (`{ name, email, avatar_url, role }`), `userMenuItems` (DropdownMenu items; default
 *   Profile, Settings, Admin panel for admins and Log out, which calls `onLogout`).
 * - `onOpenNav`: shows the menu button (below 1024px) that opens the mobile nav; `navOpen` sets
 *   its aria-expanded and `menuButtonRef` reaches it (for focus return).
 * `className` and other props go to the `<header>`.
 */
export function AppTopBar({
  title,
  breadcrumbs,
  search,
  actions,
  notifications,
  user,
  userMenuItems,
  onLogout,
  onOpenNav,
  navOpen = false,
  navId,
  menuButtonRef,
  className,
  ref,
  ...props
}) {
  const count = Number(notifications?.count) > 0 ? Number(notifications.count) : 0
  const wideSearch = useMediaQuery('(min-width: 48rem)')
  const [searchOpen, setSearchOpen] = useState(false)
  const searchBoxRef = useRef(null)
  const mobileSearchRef = useRef(null)
  const hasSearch = Boolean(search)
  const searchVisible = wideSearch ? true : searchOpen

  // "/" jumps to search unless the person is typing somewhere.
  useEffect(() => {
    if (!hasSearch) return undefined
    const onKeyDown = (event) => {
      if (event.key !== '/' || event.metaKey || event.ctrlKey || event.altKey || isTyping(event.target)) return
      event.preventDefault()
      if (wideSearch) focusField(searchBoxRef.current)
      else setSearchOpen(true)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [hasSearch, wideSearch])

  // The mobile popover opens with focus in the search field.
  useEffect(() => {
    if (wideSearch || !searchOpen) return undefined
    const frame = requestAnimationFrame(() => focusField(mobileSearchRef.current))
    return () => cancelAnimationFrame(frame)
  }, [searchOpen, wideSearch])
  const items = userMenuItems ?? buildUserMenuItems({ user, onLogout })
  const menuItems = user?.name ? [{ type: 'label', label: user.name }, ...items] : items

  return (
    <header
      ref={ref}
      className={cn('flex min-h-20 shrink-0 items-center gap-ds-md px-ds-md py-ds-sm lg:px-ds-xl', className)}
      {...props}
    >
      {onOpenNav && (
        <IconButton
          ref={menuButtonRef}
          icon={Menu}
          variant="ghost"
          aria-label="Open menu"
          aria-expanded={navOpen}
          aria-controls={navOpen ? navId : undefined}
          onClick={onOpenNav}
          className="lg:hidden"
        />
      )}
      <div className="flex min-w-0 grow flex-col gap-ds-xxs">
        {breadcrumbs?.length > 0 && <Breadcrumbs items={breadcrumbs} />}
        {title && (
          <Heading level={1} size="h3" className="m-ds-none truncate">
            {title}
          </Heading>
        )}
      </div>
      {search && wideSearch && (
        <div ref={searchBoxRef} className="w-full max-w-sm">
          {search}
        </div>
      )}
      {actions && <div className="flex shrink-0 items-center gap-ds-xs">{actions}</div>}
      {search && !wideSearch && (
        <Popover
          open={searchVisible}
          onOpenChange={setSearchOpen}
          align="end"
          popupClassName="w-(--available-width) p-ds-sm"
          trigger={<IconButton icon={Search} variant="ghost" aria-label="Search" />}
        >
          <div ref={mobileSearchRef}>{search}</div>
        </Popover>
      )}
      {notifications && <NotificationsButton {...notifications} count={count} />}
      {user && (
        <DropdownMenu
          align="end"
          items={menuItems}
          trigger={
            <button
              type="button"
              aria-label="Account menu"
              className="flex h-12 shrink-0 items-center gap-ds-xs rounded-chip pr-ds-xs pl-ds-xxs transition-colors duration-150 ease-enter hover:bg-surface-hover motion-reduce:transition-none"
            >
              <Avatar src={user.avatar_url} name={user.name} size="md" />
              <ChevronDown aria-hidden="true" className="hidden size-4 text-text-muted sm:block" />
            </button>
          }
        />
      )}
    </header>
  )
}
