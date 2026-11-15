// Resume files: where they live, who may read them and when one can be deleted.
// Resumes are private: they are served by GET /api/files/resumes/:name (routes/files.js), never
// as static files. Older rows store '/uploads/resumes/<name>'; both forms name the same file.
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))

export const RESUMES_DIR = join(__dirname, '..', 'uploads', 'resumes')
export const RESUME_ROUTE = '/api/files/resumes/'
const LEGACY_PREFIX = '/uploads/resumes/'
const SAFE_NAME = /^[A-Za-z0-9][A-Za-z0-9._-]*$/

/** The stored url for a resume file name. */
export const resumeUrl = (name) => `${RESUME_ROUTE}${name}`

/** The file name in a stored resume url (new or legacy form), or null for anything else. */
export function resumeName(url) {
  if (typeof url !== 'string') return null
  const prefix = [RESUME_ROUTE, LEGACY_PREFIX].find((p) => url.startsWith(p))
  if (!prefix) return null
  const name = url.slice(prefix.length)
  return SAFE_NAME.test(name) && !name.includes('..') ? name : null
}

/** Both stored forms of a file name, for `resume_url IN (?, ?)`. */
const forms = (name) => [resumeUrl(name), `${LEGACY_PREFIX}${name}`]

function isConnected(db, a, b) {
  return Boolean(
    db.prepare(
      "SELECT 1 FROM connections WHERE ((requester_id = ? AND receiver_id = ?) OR (requester_id = ? AND receiver_id = ?)) AND status = 'accepted'",
    ).get(a, b, b, a),
  )
}

/** True when the file is the member's own: their profile resume or one they applied with. */
export function ownsResume(db, userId, name) {
  const [url, legacy] = forms(name)
  return Boolean(
    db.prepare('SELECT 1 FROM user_profiles WHERE user_id = ? AND resume_url IN (?, ?)').get(userId, url, legacy) ||
      db.prepare('SELECT 1 FROM job_applications WHERE user_id = ? AND resume_url IN (?, ?)').get(userId, url, legacy),
  )
}

/**
 * Who may read a resume file:
 * - admins;
 * - its owner;
 * - the poster of a job the owner applied to with that file, or whose profile resume it is
 *   (the applicants list falls back to the profile resume);
 * - a member who may see the owner's full profile (public, or connections-only and connected),
 *   for the owner's current profile resume, as the member profile page links it.
 */
export function canReadResume(db, user, name) {
  if (!user) return false
  if (user.role === 'admin') return true
  const userId = Number(user.id)
  if (ownsResume(db, userId, name)) return true
  const [url, legacy] = forms(name)
  const posterOfApplication = db.prepare(`
    SELECT 1 FROM job_applications ja JOIN jobs j ON j.id = ja.job_id
    WHERE j.posted_by = ? AND ja.resume_url IN (?, ?)
  `).get(userId, url, legacy)
  if (posterOfApplication) return true
  const profile = db.prepare('SELECT user_id, profile_visibility FROM user_profiles WHERE resume_url IN (?, ?)').get(url, legacy)
  if (!profile) return false
  const posterOfApplicant = db.prepare(`
    SELECT 1 FROM job_applications ja JOIN jobs j ON j.id = ja.job_id WHERE j.posted_by = ? AND ja.user_id = ?
  `).get(userId, profile.user_id)
  if (posterOfApplicant) return true
  const visibility = profile.profile_visibility || 'public'
  return visibility === 'public' || (visibility === 'connections' && isConnected(db, userId, profile.user_id))
}

/** True when an application still points at the file, so it must not be deleted. */
export function resumeInUse(db, name) {
  const [url, legacy] = forms(name)
  return Boolean(db.prepare('SELECT 1 FROM job_applications WHERE resume_url IN (?, ?)').get(url, legacy))
}

/** The path of a resume file on disk. Only call with a name from resumeName. */
export const resumePath = (name) => join(RESUMES_DIR, name)
