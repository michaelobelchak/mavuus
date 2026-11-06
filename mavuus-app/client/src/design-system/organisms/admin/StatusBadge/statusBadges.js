import { warnOnce } from '../../../lib/warnOnce'

/**
 * One mapping from every status string the admin pages and the server use to a Badge tone and a
 * label. Keys are lowercase with hyphens; resolveStatus normalizes case, spaces and underscores.
 * Sources: users (active, banned, deleted), content (draft, published, archived), vendor, job and
 * review moderation, job status, connections, job applications, contact submissions, referrals.
 */
export const STATUS_BADGES = {
  active: { tone: 'success', label: 'Active' },
  banned: { tone: 'error', label: 'Banned' },
  deleted: { tone: 'neutral', label: 'Deleted' },
  draft: { tone: 'warning', label: 'Draft' },
  published: { tone: 'success', label: 'Published' },
  archived: { tone: 'neutral', label: 'Archived' },
  approved: { tone: 'success', label: 'Approved' },
  pending: { tone: 'warning', label: 'Pending' },
  suspended: { tone: 'error', label: 'Suspended' },
  flagged: { tone: 'warning', label: 'Flagged' },
  hidden: { tone: 'warning', label: 'Hidden' },
  removed: { tone: 'error', label: 'Removed' },
  open: { tone: 'success', label: 'Open' },
  'in-progress': { tone: 'info', label: 'In progress' },
  completed: { tone: 'success', label: 'Completed' },
  closed: { tone: 'neutral', label: 'Closed' },
  accepted: { tone: 'success', label: 'Accepted' },
  declined: { tone: 'error', label: 'Declined' },
  applied: { tone: 'info', label: 'Applied' },
  reviewing: { tone: 'info', label: 'Reviewing' },
  interview: { tone: 'brand', label: 'Interview' },
  offer: { tone: 'success', label: 'Offer' },
  hired: { tone: 'success', label: 'Hired' },
  rejected: { tone: 'error', label: 'Rejected' },
  withdrawn: { tone: 'neutral', label: 'Withdrawn' },
  new: { tone: 'info', label: 'New' },
  handled: { tone: 'success', label: 'Handled' },
  featured: { tone: 'brand', label: 'Featured' },
}

const normalize = (status) =>
  String(status)
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, '-')

const humanize = (key) => {
  const words = key.replace(/-+/g, ' ').trim()
  return words.charAt(0).toUpperCase() + words.slice(1)
}

/**
 * Returns `{ tone, label }` for a status string. A missing status gives a neutral "Unknown"; an
 * unknown one gives neutral with the status as a readable label and warns once in dev, so a new
 * server status shows up in the console instead of silently looking like the others.
 */
export function resolveStatus(status) {
  if (status === undefined || status === null || String(status).trim() === '') {
    return { tone: 'neutral', label: 'Unknown' }
  }
  const key = normalize(status)
  const known = STATUS_BADGES[key]
  if (known) return { ...known }
  warnOnce(
    `StatusBadge:${key}`,
    `StatusBadge: status "${status}" has no mapping in STATUS_BADGES. Showing it as neutral.`,
  )
  return { tone: 'neutral', label: humanize(key) }
}
