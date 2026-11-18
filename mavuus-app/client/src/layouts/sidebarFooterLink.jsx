import { SidebarNavItem } from '@/design-system/organisms'

/**
 * An AppShell `sidebarFooter` (the function form) with one link under the nav: a full row, or an
 * icon with a tooltip in the rail. `item` is a nav item `{ label, icon, to }`; `label` names the list.
 */
export function sidebarFooterLink(item, label) {
  return function SidebarFooterLink({ collapsed }) {
    return (
      <ul aria-label={label} className="m-ds-none list-none p-ds-none">
        <SidebarNavItem item={item} activeTo={null} collapsed={collapsed} />
      </ul>
    )
  }
}
