const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const URL_REGEX = /^https?:\/\/.+/

export function validateEmail(email) {
  return EMAIL_REGEX.test(email)
}

export function validateUrl(url) {
  if (!url) return true // optional
  return URL_REGEX.test(url)
}

export function validateLength(str, max) {
  if (!str) return true
  return str.length <= max
}

export const MAX_LENGTHS = {
  title: 200,
  description: 5000,
  bio: 2000,
  message: 10000,
  name: 200,
  company: 200,
  email: 254,
}

/**
 * `{ page, limit, offset }` from a list request's query: whole numbers in base 10, page at least
 * 1 and limit from 1 to `max`. A missing or non-numeric value takes the default, never NaN.
 */
export function parsePaging(query = {}, { defaultLimit = 20, max = 100 } = {}) {
  const pageNum = Number.parseInt(query.page, 10)
  const limitNum = Number.parseInt(query.limit, 10)
  const page = Number.isNaN(pageNum) ? 1 : Math.max(1, pageNum)
  const limit = Number.isNaN(limitNum) ? defaultLimit : Math.min(max, Math.max(1, limitNum))
  return { page, limit, offset: (page - 1) * limit }
}
