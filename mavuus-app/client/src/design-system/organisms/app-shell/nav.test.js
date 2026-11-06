// @vitest-environment node
import { readFileSync } from 'node:fs'
import { parse } from '@babel/parser'
import { describe, expect, it, vi } from 'vitest'
import { ADMIN_NAV, buildUserMenuItems, findActiveItem, flattenNav, MEMBER_NAV } from './nav'

const appSource = readFileSync(new URL('../../../App.jsx', import.meta.url), 'utf8')

function attribute(element, name) {
  return element.openingElement.attributes.find((attr) => attr.type === 'JSXAttribute' && attr.name.name === name)
}

/**
 * Every route path declared with <Route> in `source`, as full paths: nested paths are joined to
 * their parent's, index routes take the parent's path and pathless layout routes pass theirs on.
 * Parsed with @babel/parser (already installed with Vite), so attribute order, JSX inside
 * `element={...}` and self-closing tags don't matter.
 */
function routePaths(source) {
  const ast = parse(source, { sourceType: 'module', plugins: ['jsx'] })
  const paths = []
  const join = (base, path) => (path.startsWith('/') ? path : `${base.replace(/\/$/, '')}/${path}`)
  const visit = (node, base) => {
    if (!node || typeof node !== 'object') return
    if (Array.isArray(node)) return node.forEach((child) => visit(child, base))
    if (node.type === 'JSXElement' && node.openingElement.name.name === 'Route') {
      const pathAttr = attribute(node, 'path')
      const path = pathAttr?.value?.type === 'StringLiteral' ? join(base, pathAttr.value.value) : base
      if (pathAttr || attribute(node, 'index')) paths.push(path || '/')
      return node.children.forEach((child) => visit(child, path))
    }
    for (const [key, value] of Object.entries(node)) {
      if (key !== 'loc' && key !== 'start' && key !== 'end') visit(value, base)
    }
  }
  visit(ast.program, '')
  return paths
}

const appRoutes = routePaths(appSource)
const routesUnder = (base) => appRoutes.filter((path) => path === base || path.startsWith(`${base}/`))
const sample = (route) => route.replace(/:[^/]+/g, '42')

describe('routePaths', () => {
  it('should build full nested paths, index routes and routes after a nested layout', () => {
    const fixture = `
      export const routes = (
        <Routes>
          <Route element={<Public />}>
            <Route path="/" element={<Home />} />
          </Route>
          <Route path="/dashboard" element={<Guard><Layout /></Guard>}>
            <Route index element={<Academy />} />
            <Route element={<Nested />}>
              <Route path="jobs/:id" element={<Job kind="a" />} />
            </Route>
            <Route element={<Settings />} path="settings" />
          </Route>
          <Route path="/after" element={<After />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      )`
    expect(routePaths(fixture)).toEqual([
      '/',
      '/dashboard',
      '/dashboard',
      '/dashboard/jobs/:id',
      '/dashboard/settings',
      '/after',
      '/*',
    ])
  })
})

describe('nav config', () => {
  it.each([
    ['/dashboard', MEMBER_NAV],
    ['/admin', ADMIN_NAV],
  ])('should cover every %s route in App.jsx so the nav cannot drift', (base, nav) => {
    const routes = routesUnder(base)
    expect(routes.length).toBeGreaterThan(10)
    for (const route of routes) {
      expect(findActiveItem(nav, { pathname: sample(route) }), route).not.toBeNull()
    }
  })

  it('should point every nav item at a route that exists in App.jsx', () => {
    const routes = [...routesUnder('/dashboard'), ...routesUnder('/admin')]
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
