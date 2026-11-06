// @vitest-environment node
import { readFileSync } from 'node:fs'
import { describe, expect, it, vi } from 'vitest'
import { ADMIN_NAV, buildUserMenuItems, findActiveItem, flattenNav, MEMBER_NAV } from './nav'

const appSource = readFileSync(new URL('../../../App.jsx', import.meta.url), 'utf8')

// The child route paths declared inside <Route path={base}> ... </Route> in App.jsx.
function childRoutes(base) {
  const start = appSource.indexOf(`path="${base}"`)
  expect(start, `App.jsx has a ${base} route`).toBeGreaterThan(-1)
  const open = appSource.indexOf('>', appSource.indexOf('element={', start))
  let depth = 0
  let index = start
  const routes = []
  const tag = /<Route\b[^>]*?(\/?)>|<\/Route>/g
  tag.lastIndex = open
  let match
  while ((match = tag.exec(appSource))) {
    if (match[0] === '</Route>') {
      if (depth === 0) break
      depth -= 1
      continue
    }
    index = match.index
    const element = match[0]
    const path = element.match(/path="([^"]+)"/)?.[1]
    if (/\bindex\b/.test(element)) routes.push(base)
    else if (path) routes.push(`${base}/${path}`)
    if (!match[1]) depth += 1
  }
  expect(index).toBeGreaterThan(start)
  return routes
}

const sample = (route) => route.replace(/:[^/]+/g, '42')

describe('nav config', () => {
  it.each([
    ['/dashboard', MEMBER_NAV],
    ['/admin', ADMIN_NAV],
  ])('should cover every %s route in App.jsx so the nav cannot drift', (base, nav) => {
    const routes = childRoutes(base)
    expect(routes.length).toBeGreaterThan(10)
    for (const route of routes) {
      expect(findActiveItem(nav, { pathname: sample(route) }), route).not.toBeNull()
    }
  })

  it('should point every nav item at a route that exists in App.jsx', () => {
    const routes = [...childRoutes('/dashboard'), ...childRoutes('/admin')]
    for (const item of [...flattenNav(MEMBER_NAV), ...flattenNav(ADMIN_NAV)]) {
      const pathname = item.to.split('?')[0]
      expect(routes, item.label).toContain(pathname)
    }
  })

  it('should list the member items in order with My Jobs under Jobs', () => {
    const labels = MEMBER_NAV.flatMap((section) => section.items.map((item) => item.label))
    expect(labels).toEqual([
      'Home',
      'Live Sessions',
      'On-Demand',
      'Resources',
      'Speakers',
      'Members',
      'Vendors',
      'Jobs',
      'Messages',
      'Connections',
      'Profile',
      'Invite',
    ])
    const jobs = flattenNav(MEMBER_NAV).find((item) => item.label === 'Jobs')
    expect(jobs.children.map((child) => child.label)).toEqual(['My Jobs'])
  })

  it('should group the admin items under Overview, People, Content, Community and Settings', () => {
    expect(ADMIN_NAV.map((section) => section.label)).toEqual([undefined, 'People', 'Content', 'Community', 'Settings'])
    expect(ADMIN_NAV[0].items.map((item) => item.label)).toEqual(['Overview'])
  })
})

describe('findActiveItem', () => {
  it('should match Home only on the exact dashboard path', () => {
    expect(findActiveItem(MEMBER_NAV, { pathname: '/dashboard' }).label).toBe('Home')
    expect(findActiveItem(MEMBER_NAV, { pathname: '/dashboard/jobs' }).label).toBe('Jobs')
  })

  it('should match detail pages to their list item when a path segment follows', () => {
    expect(findActiveItem(MEMBER_NAV, { pathname: '/dashboard/live-sessions/7' }).label).toBe('Live Sessions')
    expect(findActiveItem(ADMIN_NAV, { pathname: '/admin/users/3' }).label).toBe('Users')
  })

  it('should not treat a shared prefix without a slash as a match', () => {
    expect(findActiveItem(MEMBER_NAV, { pathname: '/dashboard/my-jobs' }).label).toBe('My Jobs')
    expect(findActiveItem(MEMBER_NAV, { pathname: '/dashboard/jobsx' })).toBeNull()
  })

  it('should prefer an item whose query matches over the plain path', () => {
    expect(findActiveItem(MEMBER_NAV, { pathname: '/dashboard/members', search: '?filter=connections' }).label).toBe(
      'Connections',
    )
    expect(findActiveItem(MEMBER_NAV, { pathname: '/dashboard/members', search: '' }).label).toBe('Members')
  })
})

describe('buildUserMenuItems', () => {
  it('should add the admin panel only for admins and call onLogout from Log out', () => {
    const onLogout = vi.fn()
    const member = buildUserMenuItems({ user: { role: 'member' }, onLogout })
    expect(member.map((item) => item.label).filter(Boolean)).toEqual(['Profile', 'Settings', 'Log out'])
    const admin = buildUserMenuItems({ user: { role: 'admin' }, onLogout })
    expect(admin.map((item) => item.label).filter(Boolean)).toEqual(['Profile', 'Settings', 'Admin panel', 'Log out'])
    admin.find((item) => item.label === 'Log out').onSelect()
    expect(onLogout).toHaveBeenCalledOnce()
  })
})
