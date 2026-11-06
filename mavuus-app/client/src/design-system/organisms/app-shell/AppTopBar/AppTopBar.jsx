import { Bell, ChevronDown, Menu } from 'lucide-react'
import { cn } from '../../../lib/cn'
import { Breadcrumbs, DropdownMenu } from '../../../patterns'
import { Avatar, Badge, Heading, IconButton } from '../../../primitives'
import { buildUserMenuItems } from '../nav'

const shortCount = (count) => (count > 9 ? '9+' : String(count))

/**
 * The bar above the main panel: page title (an h1) or breadcrumbs on the left; search, actions,
 * notifications and the account menu on the right.
 * - `title`, `breadcrumbs` (`[{ label, to }]`, the last is the current page).
 * - `search`: a SearchInput (hidden below 768px). `actions`: page-level buttons.
 * - `notifications`: `{ count, onClick }`. The button is named "Notifications, 3 unread".
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
      {search && <div className="hidden w-full max-w-sm md:block">{search}</div>}
      {actions && <div className="flex shrink-0 items-center gap-ds-xs">{actions}</div>}
      {notifications && (
        <span className="relative inline-flex shrink-0">
          <IconButton
            icon={Bell}
            variant="ghost"
            aria-label={count ? `Notifications, ${count} unread` : 'Notifications'}
            onClick={notifications.onClick}
          />
          {count > 0 && (
            <Badge
              tone="brand"
              size="sm"
              aria-hidden="true"
              className="pointer-events-none absolute top-ds-none right-ds-none bg-surface-inverse text-text-on-brand"
            >
              {shortCount(count)}
            </Badge>
          )}
        </span>
      )}
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
