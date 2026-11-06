const DATE_FORMAT = { month: 'short', day: 'numeric', year: 'numeric' }

/**
 * Formats a review or recommendation date as "Oct 28, 2026". Takes a Date, a timestamp or an ISO
 * string; anything that doesn't parse ("Last week") is returned as is, and an empty value gives null.
 * Returns { text, dateTime } so the card can render a <time> element.
 */
export function formatCardDate(value) {
  if (value === undefined || value === null || value === '') return null
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return { text: String(value), dateTime: undefined }
  return { text: date.toLocaleDateString('en-US', DATE_FORMAT), dateTime: date.toISOString() }
}
