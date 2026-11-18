import { formatDate, toDateTime } from '@/design-system/lib/formatDate'

/** ReviewCard props for a row of /api/reviews/user/:id or /api/reviews/vendor/:id. */
export function reviewCardProps(review) {
  return {
    reviewerName: review.reviewer_name,
    reviewerTitle: review.reviewer_title,
    reviewerAvatarSrc: review.reviewer_avatar || undefined,
    rating: review.rating,
    text: review.text,
    subject: review.vendor_name || undefined,
    dateLabel: formatDate(review.created_at),
    dateTime: toDateTime(review.created_at),
  }
}

/** RecommendationCard props for a row of /api/recommendations/user/:id or /vendor/:id. */
export function recommendationCardProps(rec) {
  return {
    fromName: rec.from_name,
    fromTitle: rec.from_title,
    fromAvatarSrc: rec.from_avatar || undefined,
    message: rec.message,
    subject: rec.vendor_name || undefined,
    dateLabel: formatDate(rec.created_at),
    dateTime: toDateTime(rec.created_at),
  }
}

/** A list from an API that answers either an array or `{ data: [...] }`; anything else is empty. */
export function listOf(json) {
  if (Array.isArray(json)) return json
  return Array.isArray(json?.data) ? json.data : []
}
