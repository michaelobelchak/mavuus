import {
  Bell,
  BookmarkCheck,
  BookOpen,
  Briefcase,
  Download,
  FileText,
  FolderOpen,
  Gift,
  HelpCircle,
  Home,
  Image,
  LayoutDashboard,
  Link2,
  LogOut,
  Mail,
  MessageCircle,
  MessageSquare,
  Mic,
  PlayCircle,
  Quote,
  Radio,
  Settings,
  Shield,
  ShieldCheck,
  Star,
  Store,
  Tag,
  ThumbsUp,
  User,
  UserCheck,
  UserCircle,
  UserPlus,
  Users,
  Video,
} from 'lucide-react'

/**
 * Sidebar nav configs. A nav is a list of sections `{ label?, items }`; a section with a label
 * gets a heading. An item is `{ label, icon, to, end?, children?, badge? }`:
 * - `to` may carry a query (`/dashboard/members?filter=connections`); it then wins over an item
 *   with the same path and no query.
 * - `end`: only the exact path is active (Home, Overview). Otherwise detail pages under the path
 *   (`/dashboard/jobs/42`) keep the item active.
 * - `children`: sub-pages that expand in place under the item.
 * - `badge`: a key into the sidebar's `badges` prop (`{ messages: 3 }`), so counts stay live
 *   while the config stays static.
 * nav.test.js fails when a route in App.jsx under /dashboard or /admin has no item.
 */
export const MEMBER_NAV = [
  {
    items: [
      { label: 'Home', icon: Home, to: '/dashboard', end: true },
      { label: 'Live Sessions', icon: Radio, to: '/dashboard/live-sessions' },
      { label: 'On-Demand', icon: PlayCircle, to: '/dashboard/on-demand' },
      { label: 'Resources', icon: FolderOpen, to: '/dashboard/resources' },
      { label: 'Speakers', icon: Mic, to: '/dashboard/speakers' },
    ],
  },
  {
    items: [
      { label: 'Members', icon: Users, to: '/dashboard/members' },
      { label: 'Vendors', icon: Store, to: '/dashboard/vendors' },
      {
        label: 'Jobs',
        icon: Briefcase,
        to: '/dashboard/jobs',
        children: [{ label: 'My Jobs', icon: BookmarkCheck, to: '/dashboard/my-jobs' }],
      },
    ],
  },
  {
    items: [
      { label: 'Messages', icon: MessageCircle, to: '/dashboard/messages', badge: 'messages' },
      { label: 'Connections', icon: UserCheck, to: '/dashboard/members?filter=connections' },
      { label: 'Profile', icon: UserCircle, to: '/dashboard/profile' },
      { label: 'Invite', icon: UserPlus, to: '/dashboard/invite' },
    ],
  },
]

export const ADMIN_NAV = [
  { items: [{ label: 'Overview', icon: LayoutDashboard, to: '/admin', end: true }] },
  {
    label: 'People',
    items: [
      { label: 'Users', icon: Users, to: '/admin/users' },
      { label: 'Connections', icon: Link2, to: '/admin/connections' },
      { label: 'Referrals', icon: Gift, to: '/admin/referrals' },
    ],
  },
  {
    label: 'Content',
    items: [
      { label: 'Sessions', icon: Video, to: '/admin/sessions' },
      { label: 'Resources', icon: BookOpen, to: '/admin/resources' },
      { label: 'Speakers', icon: Mic, to: '/admin/speakers' },
      { label: 'Testimonials', icon: Quote, to: '/admin/testimonials' },
      { label: 'Brand logos', icon: Image, to: '/admin/brand-logos' },
      { label: 'Site content', icon: FileText, to: '/admin/site-content' },
      { label: 'FAQ', icon: HelpCircle, to: '/admin/faq' },
      { label: 'Categories', icon: Tag, to: '/admin/categories' },
    ],
  },
  {
    label: 'Community',
    items: [
      { label: 'Jobs', icon: Briefcase, to: '/admin/jobs' },
      { label: 'Vendors', icon: Store, to: '/admin/vendors' },
      { label: 'Reviews', icon: Star, to: '/admin/reviews' },
      { label: 'Recommendations', icon: ThumbsUp, to: '/admin/recommendations' },
      { label: 'Comments', icon: MessageSquare, to: '/admin/comments' },
      { label: 'Contact', icon: Mail, to: '/admin/contact' },
    ],
  },
  {
    label: 'Settings',
    items: [
      { label: 'Notifications', icon: Bell, to: '/admin/notifications' },
      { label: 'Exports', icon: Download, to: '/admin/exports' },
      { label: 'Audit log', icon: Shield, to: '/admin/audit-log' },
      { label: 'Settings', icon: Settings, to: '/admin/settings' },
    ],
  },
]

/** Every item in a nav (or a list of items), children included, in display order. */
export function flattenNav(nav) {
  const items = nav.flatMap((entry) => entry.items ?? [entry])
  return items.flatMap((item) => [item, ...(item.children ?? [])])
}

function splitTo(to) {
  const [pathname, query = ''] = to.split('?')
  return { pathname, params: new URLSearchParams(query) }
}

// How well `item` matches the location: -1 for no match, higher for a closer match. A query that
// matches beats the same path without one; a longer path beats a shorter one.
function matchScore(item, location) {
  const { pathname, params } = splitTo(item.to)
  const current = location.pathname.replace(/\/+$/, '') || '/'
  const exact = current === pathname
  if (!exact && (item.end || !current.startsWith(`${pathname}/`))) return -1
  const search = new URLSearchParams(location.search ?? '')
  for (const [key, value] of params) {
    if (search.get(key) !== value) return -1
  }
  return pathname.length + (exact ? 1 : 0) + [...params].length * 1000
}

/**
 * The single item (child items included) that `location` ({ pathname, search }) belongs to, or
 * null. One item is active at a time, so Members and Connections never light up together.
 */
export function findActiveItem(nav, location) {
  let best = null
  let bestScore = -1
  for (const item of flattenNav(nav)) {
    const score = matchScore(item, location)
    if (score > bestScore) {
      best = item
      bestScore = score
    }
  }
  return best
}

/**
 * The default avatar menu: Profile, Settings, Admin panel (admins only) and Log out, in the
 * DropdownMenu items shape. `onLogout` runs from Log out.
 */
export function buildUserMenuItems({ user, onLogout } = {}) {
  return [
    { label: 'Profile', icon: User, to: '/dashboard/profile' },
    { label: 'Settings', icon: Settings, to: '/dashboard/profile?tab=account' },
    ...(user?.role === 'admin' ? [{ label: 'Admin panel', icon: ShieldCheck, to: '/admin' }] : []),
    { type: 'separator' },
    { label: 'Log out', icon: LogOut, onSelect: onLogout },
  ]
}
