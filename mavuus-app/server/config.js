// Small env-driven settings shared by the server and the seed scripts.
import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'

export const SERVER_DIR = dirname(fileURLToPath(import.meta.url))

/** SQLite file: DB_PATH relative to the server folder (e2e uses db/e2e.db), default db/mavuus.db. */
export function dbPath(env = process.env) {
  return resolve(SERVER_DIR, env.DB_PATH || 'db/mavuus.db')
}

/**
 * Max requests for a rate limiter. `name` (API_RATE_LIMIT_MAX, AUTH_RATE_LIMIT_MAX) is a
 * test-only override for e2e runs: it is ignored, with a warning, when NODE_ENV is production.
 */
export function rateLimitMax(name, fallback, env = process.env) {
  if (!env[name]) return fallback
  if (env.NODE_ENV === 'production') {
    console.warn(`${name} is a test-only override and is ignored in production; using ${fallback}.`)
    return fallback
  }
  const value = Number(env[name])
  return Number.isFinite(value) && value > 0 ? value : fallback
}
