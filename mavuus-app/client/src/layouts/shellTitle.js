import { matchPath } from 'react-router-dom'
import { findActiveItem } from '@/design-system/organisms'

/**
 * Detail pages get their own title (they keep their own "Back to ..." link in the page). Every
 * other route under the shell takes its title from the nav item it belongs to (findActiveItem),
 * so a new list route only needs a nav item, which nav.test.js already demands.
 */
export const DETAIL_TITLES = [
  { pattern: '/dashboard/live-sessions/:id', title: 'Live session' },
  { pattern: '/dashboard/on-demand/:id', title: 'On-demand video' },
  { pattern: '/dashboard/resources/:id', title: 'Resource' },
  { pattern: '/dashboard/members/:id', title: 'Member profile' },
  { pattern: '/dashboard/vendors/:id', title: 'Vendor' },
  { pattern: '/dashboard/jobs/:id', title: 'Job details' },
  { pattern: '/admin/users/:id', title: 'User details' },
]

/** The top bar title for a location (`{ pathname, search }`), or '' when nothing in `nav` matches. */
export function shellTitle(nav, location) {
  const detail = DETAIL_TITLES.find((route) => matchPath(route.pattern, location.pathname))
  return detail ? detail.title : (findActiveItem(nav, location)?.label ?? '')
}
