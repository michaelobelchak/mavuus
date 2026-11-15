const DAY_MS = 24 * 60 * 60 * 1000

/** The thread list's time: "7:00 AM" today, "Yesterday", "Tue" this week, then "Mar 14". */
export function listTime(value, now = new Date()) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  const days = Math.floor((now - date) / DAY_MS)
  if (days <= 0) return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  if (days === 1) return 'Yesterday'
  if (days < 7) return date.toLocaleDateString('en-US', { weekday: 'short' })
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

/** A message's time of day: "6:30 AM". */
export function messageTime(value) {
  return new Date(value).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
}

/** The day separator in a thread: "Saturday, Mar 14". */
export function dayLabel(value) {
  return new Date(value).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })
}

/** True when two timestamps fall on different local days (a new day separator). */
export function isNewDay(value, previous) {
  return !previous || new Date(value).toDateString() !== new Date(previous).toDateString()
}
