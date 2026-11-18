/**
 * What a complete profile has: a photo, a bio, 3+ skills, 1+ role and a resume. The home page
 * nudge and the profile page both read it, so they always agree. `action` is the button text on the
 * profile page and `tab` the profile tab where it's done.
 */
const PROFILE_CHECKS = [
  { key: 'photo', label: 'a photo', action: 'Add a photo', tab: 'about', done: (p) => Boolean(p.avatar_url) },
  { key: 'bio', label: 'a bio', action: 'Write a short bio', tab: 'about', done: (p) => Boolean(p.bio && p.bio.trim()) },
  { key: 'skills', label: 'three skills', action: 'Add three skills', tab: 'about', done: (p) => (p.skills?.length || 0) >= 3 },
  { key: 'experience', label: 'your experience', action: 'Add your experience', tab: 'experience', done: (p) => (p.experience?.length || 0) >= 1 },
  { key: 'resume', label: 'a resume', action: 'Upload a resume', tab: 'experience', done: (p) => Boolean(p.resume_filename) },
]

/**
 * `{ percent, done, total, missing, steps }` for a profile from /api/profile/me, or null without
 * one. `missing` lists what to add, in words; `steps` are the missing checks as
 * `{ key, action, tab }`.
 */
export function profileCompletion(profile) {
  if (!profile) return null
  const open = PROFILE_CHECKS.filter((check) => !check.done(profile))
  const total = PROFILE_CHECKS.length
  return {
    percent: Math.round(((total - open.length) / total) * 100),
    done: total - open.length,
    total,
    missing: open.map((check) => check.label),
    steps: open.map(({ key, action, tab }) => ({ key, action, tab })),
  }
}
