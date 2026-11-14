// Dates as the API sends them, shown the same way on every card and page.
const DATE_ONLY = /^(\d{4})-(\d{2})-(\d{2})$/
// SQLite CURRENT_TIMESTAMP: "2026-10-28 23:30:00", always UTC, with no zone marker.
const SQLITE_TIMESTAMP = /^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2})(?::(\d{2}))?$/
const DEFAULT_FORMAT = { month: 'short', day: 'numeric', year: 'numeric' }

const valid = (date) => (Number.isNaN(date.getTime()) ? null : date)

/**
 * Turns an API date into a Date, or null when it is empty or doesn't parse.
 * - "2026-10-28" (date only) is a local calendar date, so it never shifts a day in other zones.
 * - "2026-10-28 23:30:00" (SQLite) is UTC.
 * - Anything else goes through `new Date` (ISO strings, timestamps, Date objects).
 */
export function parseDate(value) {
  if (value === undefined || value === null || value === '') return null
  if (value instanceof Date) return valid(new Date(value.getTime()))
  if (typeof value === 'number') return valid(new Date(value))
  const text = String(value).trim()
  const dateOnly = DATE_ONLY.exec(text)
  if (dateOnly) {
    const [year, month, day] = dateOnly.slice(1).map(Number)
    const date = new Date(year, month - 1, day)
    return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day ? date : null
  }
  const sqlite = SQLITE_TIMESTAMP.exec(text)
  if (sqlite) {
    const [year, month, day, hour, minute, second = 0] = sqlite.slice(1).map((part) => Number(part ?? 0))
    const date = new Date(Date.UTC(year, month - 1, day, hour, minute, second))
    return date.getUTCMonth() === month - 1 && date.getUTCDate() === day ? date : null
  }
  return valid(new Date(text))
}

/** "Oct 28, 2026" in the reader's time zone, or '' when the value is empty or invalid. `options` are Intl date options. */
export function formatDate(value, options = DEFAULT_FORMAT) {
  const date = parseDate(value)
  return date ? date.toLocaleDateString('en-US', options) : ''
}

/** The machine-readable value for `<time dateTime>`: "2026-10-28" for date-only input, else ISO, or ''. */
export function toDateTime(value) {
  const date = parseDate(value)
  if (!date) return ''
  if (typeof value === 'string' && DATE_ONLY.test(value.trim())) return value.trim()
  return date.toISOString()
}
