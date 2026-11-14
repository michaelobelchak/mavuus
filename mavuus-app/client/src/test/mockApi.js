import { vi } from 'vitest'

/**
 * Stubs global fetch for page tests. `routes` maps a matcher to a response:
 * `{ 'GET /api/sessions': body, 'POST /api/sessions/1/register': { status: 400, body } }`.
 * A matcher is "METHOD /path" (the query string is ignored unless the matcher has one) or a
 * function `(url, init) => response`; a function that returns an Error makes fetch reject with it
 * (a network failure). Unmatched requests answer 404.
 * Returns the vi.fn, so tests can read `fetch.mock.calls`.
 */
export function mockApi(routes = {}) {
  const entries = Object.entries(routes)
  const respond = (value) => {
    const { status = 200, body } = value && typeof value === 'object' && 'status' in value ? value : { body: value }
    return Promise.resolve({ ok: status < 400, status, json: () => Promise.resolve(body) })
  }
  const fetchMock = vi.fn((input, init = {}) => {
    const url = typeof input === 'string' ? input : input.url
    const method = (init.method || 'GET').toUpperCase()
    const [pathOnly] = url.split('?')
    for (const [matcher, value] of entries) {
      const [m, p] = matcher.split(' ')
      if (m !== method) continue
      if (p === url || (!p.includes('?') && p === pathOnly)) {
        const result = typeof value === 'function' ? value(url, init) : value
        return result instanceof Error ? Promise.reject(result) : respond(result)
      }
    }
    return respond({ status: 404, body: { error: 'Not found' } })
  })
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

/** The value useAuth() returns for the signed-in demo member in page tests. */
export const demoAuth = {
  user: { id: 7, name: 'Demo User', email: 'demo@mavuus.com', avatar_url: '/images/avatars/avatar-06.webp', role: 'admin' },
  token: 'test-token',
  loading: false,
  logout: () => {},
}
