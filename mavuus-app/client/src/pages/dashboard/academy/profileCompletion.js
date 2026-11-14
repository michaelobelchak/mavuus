/** The checks the old sidebar's completion ring used: photo, bio, 3+ skills, 1+ role and a resume. */
const PROFILE_CHECKS = [
  { label: 'a photo', done: (p) => Boolean(p.avatar_url) },
  { label: 'a bio', done: (p) => Boolean(p.bio && p.bio.trim()) },
  { label: 'three skills', done: (p) => (p.skills?.length || 0) >= 3 },
  { label: 'your experience', done: (p) => (p.experience?.length || 0) >= 1 },
  { label: 'a resume', done: (p) => Boolean(p.resume_filename) },
]

/**
 * `{ percent, missing }` for a profile from /api/profile/me (`missing` lists what to add, in
 * words), or null without a profile.
 */
export function profileCompletion(profile) {
  if (!profile) return null
  const missing = PROFILE_CHECKS.filter((check) => !check.done(profile)).map((check) => check.label)
  const percent = Math.round(((PROFILE_CHECKS.length - missing.length) / PROFILE_CHECKS.length) * 100)
  return { percent, missing }
}
