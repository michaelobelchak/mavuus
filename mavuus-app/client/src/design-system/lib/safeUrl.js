/**
 * True when `value` is an http(s) URL, or a path on this site (resolved against the page), and
 * not another scheme such as javascript:, data: or mailto:. Use it before putting a URL from the
 * API in an href or src.
 */
export function isHttpUrl(value) {
  if (typeof value !== 'string' || value.trim() === '') return false
  try {
    const base = typeof window !== 'undefined' ? window.location.href : 'http://localhost/'
    const { protocol } = new URL(value.trim(), base)
    return protocol === 'http:' || protocol === 'https:'
  } catch {
    return false
  }
}
