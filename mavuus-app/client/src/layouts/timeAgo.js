import { formatDate, parseDate } from '@/design-system/lib/formatDate'

/** "Just now", "5m ago", "3h ago", "2d ago", then a short date ("Mar 4") after a week. */
export function timeAgo(value, now = new Date()) {
  const date = parseDate(value)
  if (!date) return ''
  const minutes = Math.floor((now - date) / 60000)
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return formatDate(date, { month: 'short', day: 'numeric' })
}
