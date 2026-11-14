import { vi } from 'vitest'

const REPLY = Symbol('mockApi reply')

/**
 * A response with a status for a mockApi route: `reply(404, { error: 'Not found' })`. A route
 * value that isn't a reply is the JSON body of a 200, so bodies may hold any fields (even
 * `status`).
 */
export function reply(status, body = {}) {
  return { [REPLY]: true, status, body }
}

/**
 * Stubs global fetch for page tests. `routes` maps "METHOD /path" to a response:
 * `{ 'GET /api/sessions': body, 'POST /api/sessions/1/register': reply(400, { error }) }`.
 * The query string is ignored unless the matcher has one. A route value may also be a function
 * `(url, init) => body | reply(...) | Error`; an Error makes fetch reject with it (a network
 * failure). Unmatched requests answer 404. Returns the vi.fn, so tests can read
 * `fetch.mock.calls`.
 */
export function mockApi(routes = {}) {
  const entries = Object.entries(routes)
  const respond = (value) => {
    const { status, body } = value && value[REPLY] ? value : { status: 200, body: value }
    return Promise.resolve({ ok: status >= 200 && status < 300, status, json: () => Promise.resolve(body) })
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
    return respond(reply(404, { error: 'Not found' }))
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
