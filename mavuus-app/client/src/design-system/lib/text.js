/** "Last 30 days" -> "last 30 days", for text dropped into the middle of a sentence. Null for empty or non-string values. */
export function lowerFirst(text) {
  return typeof text === 'string' && text ? text.charAt(0).toLowerCase() + text.slice(1) : null
}

/** A count capped for a small badge: shortCount(120) is "99+", shortCount(12, 9) is "9+". */
export function shortCount(count, max = 99) {
  return count > max ? `${max}+` : String(count)
}
