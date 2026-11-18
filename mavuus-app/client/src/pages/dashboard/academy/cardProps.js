import { formatDate } from '@/design-system/lib/formatDate'

export const LIVE_PATH = '/dashboard/live-sessions'
export const ON_DEMAND_PATH = '/dashboard/on-demand'
export const RESOURCES_PATH = '/dashboard/resources'

/**
 * SessionCard props for a session from /api/sessions. Live sessions link under LIVE_PATH and show
 * their date ("Apr 5, 2026" unless `dateFormat` says otherwise); recordings link under
 * ON_DEMAND_PATH and show their views.
 */
export function sessionCardProps(session, { dateFormat } = {}) {
  const live = session.type ? session.type === 'live' : Boolean(session.scheduled_date)
  return {
    title: session.title,
    category: session.category,
    thumbnailSrc: session.thumbnail_url || undefined,
    kind: live ? 'live' : 'recording',
    dateLabel: live ? formatDate(session.scheduled_date, dateFormat) || 'TBD' : undefined,
    duration: session.duration,
    views: live ? undefined : session.views || 0,
    speaker: session.speaker_name
      ? { name: session.speaker_name, title: session.speaker_title, avatarSrc: session.speaker_avatar }
      : undefined,
    to: `${live ? LIVE_PATH : ON_DEMAND_PATH}/${session.id}`,
  }
}

/** ResourceCard props for a resource from /api/resources. */
export function resourceCardProps(resource) {
  return {
    title: resource.title,
    category: resource.category,
    thumbnailSrc: resource.thumbnail_url || undefined,
    description: resource.description,
    author: resource.author,
    readTime: resource.read_time,
    to: `${RESOURCES_PATH}/${resource.id}`,
  }
}
