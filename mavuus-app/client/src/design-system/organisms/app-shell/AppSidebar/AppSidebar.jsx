import { useId } from 'react'
import { Link as RouterLink, useLocation } from 'react-router-dom'
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { MAVUUS_LOGO_URL, MAVUUS_MARK_URL } from '../../../lib/brand'
import { cn } from '../../../lib/cn'
import { IconButton, Tooltip } from '../../../primitives'
import { findActiveItem } from '../nav'
import { SidebarNavItem } from '../SidebarNavItem'

function DefaultLogo({ collapsed }) {
  return collapsed ? (
    <img src={MAVUUS_MARK_URL} alt="Mavuus" width="29" height="31" className="h-8 w-auto" />
  ) : (
    <img src={MAVUUS_LOGO_URL} alt="Mavuus" width="155" height="40" className="h-10 w-auto" />
  )
}

function Section({ section, collapsed, ...itemProps }) {
  const labelId = useId()
  return (
    <div className="flex flex-col gap-ds-xxs">
      {section.label && (
        <h2
          id={labelId}
          className={cn(
            'm-ds-none px-ds-md pt-ds-md pb-ds-xxs text-caption font-semibold tracking-wide text-text-muted uppercase',
            collapsed && 'sr-only',
          )}
        >
          {section.label}
        </h2>
      )}
      <ul
        aria-labelledby={section.label ? labelId : undefined}
        className={cn('m-ds-none flex list-none flex-col gap-ds-xxs p-ds-none', collapsed && 'items-center')}
      >
        {section.items.map((item) => (
          <SidebarNavItem key={item.to} item={item} collapsed={collapsed} {...itemProps} />
        ))}
      </ul>
    </div>
  )
}

/**
 * The app sidebar: logo, nav sections and a footer slot, on a white surface.
 * - `nav`: sections `[{ label?, items }]` (MEMBER_NAV, ADMIN_NAV from nav.js). Labeled sections get
 *   an h2 that names their list; one item is active at a time (`findActiveItem`).
 * - `collapsed`: the icon rail (labels become tooltips, the logo becomes the mark).
 * - `badges`: counts per badge key (`{ messages: 3 }`). `onNavigate(event, item)`: a link was followed.
 * - `logo` replaces the Mavuus logo; `logoTo` is where it links (default '/dashboard').
 * - `footer`: content under the nav (a user card, "Back to site").
 * - `onCollapsedChange(next)`: shows a collapse toggle at the bottom when set.
 * `aria-label` names the nav (default "Main"); `className` and other props go to the root.
 */
export function AppSidebar({
  nav = [],
  collapsed = false,
  badges,
  onNavigate,
  logo,
  logoTo = '/dashboard',
  footer,
  onCollapsedChange,
  'aria-label': ariaLabel = 'Main',
  className,
  ref,
  ...props
}) {
  const location = useLocation()
  const activeTo = findActiveItem(nav, location)?.to ?? null
  const toggleLabel = collapsed ? 'Expand sidebar' : 'Collapse sidebar'
  const toggle = onCollapsedChange && (
    <IconButton
      icon={collapsed ? PanelLeftOpen : PanelLeftClose}
      variant="ghost"
      aria-label={toggleLabel}
      onClick={() => onCollapsedChange(!collapsed)}
    />
  )

  return (
    <div
      ref={ref}
      className={cn('flex h-full min-h-0 flex-col bg-surface-raised text-text-primary', className)}
      {...props}
    >
      <div className={cn('flex h-20 shrink-0 items-center', collapsed ? 'justify-center px-ds-sm' : 'px-ds-lg')}>
        <RouterLink
          to={logoTo}
          aria-label="Mavuus home"
          onClick={(event) => onNavigate?.(event, { to: logoTo })}
          className="flex items-center rounded-control"
        >
          {logo ?? <DefaultLogo collapsed={collapsed} />}
        </RouterLink>
      </div>
      <nav
        aria-label={ariaLabel}
        className={cn('flex min-h-0 grow flex-col gap-ds-sm overflow-y-auto py-ds-xs', collapsed ? 'px-ds-sm' : 'px-ds-md')}
      >
        {nav.map((section, index) => (
          <Section
            key={section.label ?? `section-${index}`}
            section={section}
            collapsed={collapsed}
            activeTo={activeTo}
            badges={badges}
            onNavigate={onNavigate}
          />
        ))}
      </nav>
      {(footer || toggle) && (
        <div
          className={cn(
            'flex shrink-0 flex-col gap-ds-xs border-t border-border-subtle py-ds-md',
            collapsed ? 'items-center px-ds-sm' : 'px-ds-md',
          )}
        >
          {footer}
          {toggle &&
            (collapsed ? (
              <Tooltip content={toggleLabel} side="right">
                {toggle}
              </Tooltip>
            ) : (
              <div className="flex justify-end">{toggle}</div>
            ))}
        </div>
      )}
    </div>
  )
}
