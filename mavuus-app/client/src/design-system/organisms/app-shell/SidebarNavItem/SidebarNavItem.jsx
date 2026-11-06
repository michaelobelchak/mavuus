import { useId, useState } from 'react'
import { Link as RouterLink, useLocation } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { cn } from '../../../lib/cn'
import { shortCount } from '../../../lib/text'
import { Badge, Icon, Tooltip } from '../../../primitives'
import { findActiveItem } from '../nav'

// 48px rows; the active row is the gradient pill with white text and icon.
const rowClass = [
  'flex h-12 min-w-0 items-center gap-ds-sm rounded-chip text-body font-medium',
  'transition-colors duration-150 ease-enter motion-reduce:transition-none',
]
const idleClass = 'text-text-secondary hover:bg-surface-hover hover:text-text-primary'
const activeClass = 'bg-(image:--gradient-active) text-text-on-brand shadow-card'

function countFor(item, badges) {
  const count = typeof item.badge === 'number' ? item.badge : badges?.[item.badge]
  return Number.isFinite(count) && count > 0 ? count : 0
}

function ItemLink({ item, active, collapsed, badges, onNavigate, className }) {
  const count = countFor(item, badges)
  const link = (
    <RouterLink
      to={item.to}
      aria-current={active ? 'page' : undefined}
      aria-label={collapsed ? (count ? `${item.label}, ${count} new` : item.label) : undefined}
      onClick={(event) => onNavigate?.(event, item)}
      className={cn(
        rowClass,
        active ? activeClass : idleClass,
        collapsed ? 'relative w-12 justify-center' : 'w-full px-ds-md',
        className,
      )}
    >
      {item.icon && <Icon icon={item.icon} size="md" />}
      {collapsed ? (
        count > 0 && (
          <span aria-hidden="true" className="absolute top-ds-xs right-ds-xs size-2 rounded-chip bg-surface-brand" />
        )
      ) : (
        <>
          <span className="min-w-0 grow truncate">{item.label}</span>
          {count > 0 && (
            <>
              <Badge tone="brand" size="sm" aria-hidden="true">
                {shortCount(count)}
              </Badge>
              <span className="sr-only">, {count} new</span>
            </>
          )}
        </>
      )}
    </RouterLink>
  )
  if (!collapsed) return link
  return (
    <Tooltip content={item.label} side="right">
      {link}
    </Tooltip>
  )
}

/**
 * One sidebar row: a router link with an icon (20px), the label and an optional badge count.
 * - `item`: `{ label, icon, to, end?, children?, badge? }` (see nav.js). `badges` maps a badge key
 *   to its count; a count of 0 hides the badge.
 * - Active: `aria-current="page"` and the gradient pill. The sidebar passes `activeTo` (the `to` of
 *   the one active item, or null); without it the item matches the current location itself.
 * - `children`: a chevron button (aria-expanded, aria-controls) shows the sub-pages in place. The
 *   group opens on its own when a child route is active.
 * - `collapsed` (rail): icon-only 48px squares with the label as a Tooltip and as the link name;
 *   children render as their own icons under the parent.
 * - `onNavigate(event, item)` runs when a link is followed (the mobile drawer closes on it).
 * `className` and other props go to the `<li>`.
 */
export function SidebarNavItem({ item, activeTo, collapsed = false, badges, onNavigate, className, ref, ...props }) {
  const location = useLocation()
  const listId = useId()
  const children = item.children ?? []
  const currentTo = activeTo !== undefined ? activeTo : (findActiveItem([item], location)?.to ?? null)
  const childActive = children.some((child) => child.to === currentTo)

  // Open when the person asks, and again whenever a child route becomes active.
  const [open, setOpen] = useState(childActive)
  const [seenChildActive, setSeenChildActive] = useState(childActive)
  if (seenChildActive !== childActive) {
    setSeenChildActive(childActive)
    if (childActive) setOpen(true)
  }

  const linkProps = { collapsed, badges, onNavigate }
  const active = currentTo === item.to

  if (collapsed) {
    return (
      <li ref={ref} className={cn('flex flex-col items-center gap-ds-xxs', className)} {...props}>
        <ItemLink item={item} active={active} {...linkProps} />
        {children.length > 0 && (
          <ul className="m-ds-none flex list-none flex-col items-center gap-ds-xxs p-ds-none">
            {children.map((child) => (
              <li key={child.to}>
                <ItemLink item={child} active={currentTo === child.to} {...linkProps} />
              </li>
            ))}
          </ul>
        )}
      </li>
    )
  }

  return (
    <li ref={ref} className={cn('flex flex-col gap-ds-xxs', className)} {...props}>
      <div className="relative flex items-center">
        <ItemLink item={item} active={active} className={children.length > 0 && 'pr-ds-xxl'} {...linkProps} />
        {children.length > 0 && (
          <button
            type="button"
            aria-label={`${item.label} pages`}
            aria-expanded={open}
            aria-controls={listId}
            onClick={() => setOpen((value) => !value)}
            className={cn(
              'absolute right-ds-xxs flex size-11 items-center justify-center rounded-chip',
              'transition-colors duration-150 ease-enter motion-reduce:transition-none',
              active ? 'text-text-on-brand hover:bg-surface-hover' : 'text-text-muted hover:bg-surface-hover hover:text-text-primary',
            )}
          >
            <ChevronRight
              aria-hidden="true"
              className={cn(
                'size-4 transition-transform duration-200 ease-move motion-reduce:transition-none',
                open && 'rotate-90',
              )}
            />
          </button>
        )}
      </div>
      {children.length > 0 && (
        <ul id={listId} hidden={!open} className="m-ds-none flex list-none flex-col gap-ds-xxs p-ds-none pl-ds-lg">
          {children.map((child) => (
            <li key={child.to}>
              <ItemLink item={child} active={currentTo === child.to} {...linkProps} />
            </li>
          ))}
        </ul>
      )}
    </li>
  )
}
