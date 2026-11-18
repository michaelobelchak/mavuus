// @vitest-environment node
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { ADMIN_NAV, MEMBER_NAV } from '@/design-system/organisms'
import { shellTitle } from './shellTitle'

const appSource = readFileSync(new URL('../App.jsx', import.meta.url), 'utf8')

// Child route paths of the <Route path={base}> block in App.jsx, as full sample paths.
function childRoutes(base) {
  const start = appSource.indexOf(`path="${base}"`)
  const end = appSource.indexOf('</Route>', start)
  const block = appSource.slice(start, end)
  const children = [...block.matchAll(/<Route (index|path="([^"]+)")/g)].map(([, , path]) =>
    path ? `${base}/${path}` : base,
  )
  return children.map((path) => path.replace(/:[^/]+/g, '42'))
}

const MEMBER_TITLES = {
  '/dashboard': 'Home',
  '/dashboard/live-sessions': 'Live Sessions',
  '/dashboard/live-sessions/42': 'Live session',
  '/dashboard/on-demand': 'On-Demand',
  '/dashboard/on-demand/42': 'On-demand video',
  '/dashboard/resources': 'Resources',
  '/dashboard/resources/42': 'Resource',
  '/dashboard/members': 'Members',
  '/dashboard/members/42': 'Member profile',
  '/dashboard/vendors': 'Vendors',
  '/dashboard/vendors/42': 'Vendor',
  '/dashboard/jobs': 'Jobs',
  '/dashboard/jobs/42': 'Job details',
  '/dashboard/my-jobs': 'My Jobs',
  '/dashboard/profile': 'Profile',
  '/dashboard/messages': 'Messages',
  '/dashboard/invite': 'Invite',
  '/dashboard/speakers': 'Speakers',
}

const ADMIN_TITLES = {
  '/admin': 'Overview',
  '/admin/users': 'Users',
  '/admin/users/42': 'User details',
  '/admin/connections': 'Connections',
  '/admin/sessions': 'Sessions',
  '/admin/resources': 'Resources',
  '/admin/speakers': 'Speakers',
  '/admin/vendors': 'Vendors',
  '/admin/jobs': 'Jobs',
  '/admin/comments': 'Comments',
  '/admin/reviews': 'Reviews',
  '/admin/recommendations': 'Recommendations',
  '/admin/contact': 'Contact',
  '/admin/site-content': 'Site content',
  '/admin/testimonials': 'Testimonials',
  '/admin/brand-logos': 'Brand logos',
  '/admin/faq': 'FAQ',
  '/admin/categories': 'Categories',
  '/admin/notifications': 'Notifications',
  '/admin/referrals': 'Referrals',
  '/admin/settings': 'Settings',
  '/admin/exports': 'Exports',
  '/admin/audit-log': 'Audit log',
}

describe('shellTitle', () => {
  it.each([
    ['/dashboard', MEMBER_NAV, MEMBER_TITLES],
    ['/admin', ADMIN_NAV, ADMIN_TITLES],
  ])('should give every %s route in App.jsx its title', (base, nav, titles) => {
    const routes = childRoutes(base)
    expect(routes.length).toBeGreaterThan(10)
    expect(Object.keys(titles).sort()).toEqual([...new Set(routes)].sort())
    for (const pathname of routes) {
      expect(shellTitle(nav, { pathname, search: '' }), pathname).toBe(titles[pathname])
    }
  })

  it('should title the members list Connections when the connections filter is on', () => {
    expect(shellTitle(MEMBER_NAV, { pathname: '/dashboard/members', search: '?filter=connections' })).toBe(
      'Connections',
    )
  })

  it('should fall back to an empty title for a path outside the nav', () => {
    expect(shellTitle(MEMBER_NAV, { pathname: '/elsewhere', search: '' })).toBe('')
  })
})
