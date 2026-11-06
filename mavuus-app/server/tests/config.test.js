import { describe, it, expect, vi, afterEach } from 'vitest'
import { join } from 'path'
import { SERVER_DIR, dbPath, rateLimitMax } from '../config.js'

afterEach(() => {
  vi.restoreAllMocks()
})

describe('dbPath', () => {
  it('should default to db/mavuus.db in the server folder', () => {
    expect(dbPath({})).toBe(join(SERVER_DIR, 'db', 'mavuus.db'))
  })

  it('should resolve DB_PATH relative to the server folder', () => {
    expect(dbPath({ DB_PATH: 'db/e2e.db' })).toBe(join(SERVER_DIR, 'db', 'e2e.db'))
  })
})

describe('rateLimitMax', () => {
  it('should use the default when the override is unset or not a positive number', () => {
    expect(rateLimitMax('API_RATE_LIMIT_MAX', 100, {})).toBe(100)
    expect(rateLimitMax('API_RATE_LIMIT_MAX', 100, { API_RATE_LIMIT_MAX: 'lots' })).toBe(100)
    expect(rateLimitMax('API_RATE_LIMIT_MAX', 100, { API_RATE_LIMIT_MAX: '0' })).toBe(100)
  })

  it('should use the override outside production', () => {
    expect(rateLimitMax('API_RATE_LIMIT_MAX', 100, { API_RATE_LIMIT_MAX: '5000' })).toBe(5000)
  })

  it('should ignore the override in production and warn', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    expect(rateLimitMax('AUTH_RATE_LIMIT_MAX', 20, { NODE_ENV: 'production', AUTH_RATE_LIMIT_MAX: '5000' })).toBe(20)
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('AUTH_RATE_LIMIT_MAX'))
  })
})
