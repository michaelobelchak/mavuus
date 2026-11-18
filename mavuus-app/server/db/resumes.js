// Resume files: where they live, who may read them and when one can be deleted.
// Resumes are private: they live in server/private/resumes, outside the static /uploads root, and
// are served only by GET /api/files/resumes/:name (routes/files.js). Older rows store
// '/uploads/resumes/<name>'; both forms name the same file.
import { randomUUID } from 'crypto'
import { closeSync, copyFileSync, existsSync, mkdirSync, openSync, readdirSync, readSync, renameSync, unlinkSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))

export const RESUMES_DIR = join(__dirname, '..', 'private', 'resumes')
// Where resumes lived when /uploads was served statically; migrateResumeFiles empties it.
export const LEGACY_RESUMES_DIR = join(__dirname, '..', 'uploads', 'resumes')
const RANDOM_PDF = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.pdf$/
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

/** True when the file starts with "%PDF-". False for a file it can't read. */
export function startsLikePdf(path) {
  let fd
  try {
    fd = openSync(path, 'r')
    const head = Buffer.alloc(5)
    readSync(fd, head, 0, 5, 0)
    return head.toString('latin1') === '%PDF-'
  } catch {
    return false
  } finally {
    if (fd !== undefined) closeSync(fd)
  }
}

function moveFile(source, target) {
  try {
    renameSync(source, target)
  } catch (err) {
    if (err.code !== 'EXDEV') throw err
    copyFileSync(source, target)
    unlinkSync(source)
  }
}

/**
 * Moves resume files out of the static /uploads folder into the private one, then gives every
 * legacy name (resume-<user>-<time>.ext) a random .pdf name when the file really is a PDF, or
 * deletes it and clears the rows that point at it when it isn't. Row updates for each file run
 * in one transaction. Safe to run again: it only touches what is left to do. Returns the counts.
 */
export function migrateResumeFiles(db, { from = LEGACY_RESUMES_DIR, to = RESUMES_DIR } = {}) {
  const counts = { moved: 0, renamed: 0, removed: 0 }
  mkdirSync(to, { recursive: true })
  if (existsSync(from)) {
    for (const name of readdirSync(from)) {
      const source = join(from, name)
      if (existsSync(join(to, name))) unlinkSync(source)
      else {
        moveFile(source, join(to, name))
        counts.moved += 1
      }
    }
  }
  const repoint = db.transaction((oldName, newUrl) => {
    const [url, legacy] = forms(oldName)
    db.prepare('UPDATE user_profiles SET resume_url = ? WHERE resume_url IN (?, ?)').run(newUrl, url, legacy)
    db.prepare('UPDATE job_applications SET resume_url = ? WHERE resume_url IN (?, ?)').run(newUrl, url, legacy)
  })
  const clear = db.transaction((oldName) => {
    const [url, legacy] = forms(oldName)
    db.prepare('UPDATE user_profiles SET resume_url = NULL, resume_filename = NULL WHERE resume_url IN (?, ?)').run(url, legacy)
    db.prepare('UPDATE job_applications SET resume_url = NULL WHERE resume_url IN (?, ?)').run(url, legacy)
  })
  for (const name of readdirSync(to)) {
    if (RANDOM_PDF.test(name)) continue
    const path = join(to, name)
    if (startsLikePdf(path)) {
      const next = `${randomUUID()}.pdf`
      renameSync(path, join(to, next))
      try {
        repoint(name, resumeUrl(next))
      } catch (err) {
        renameSync(join(to, next), path)
        throw err
      }
      counts.renamed += 1
    } else {
      unlinkSync(path)
      clear(name)
      counts.removed += 1
    }
  }
  return counts
}

/**
 * A small one-page PDF with the given lines of text (ASCII), built in code so the demo seed needs
 * no binary files. The cross-reference offsets are computed, so viewers open it without repair.
 */
export function samplePdf(lines) {
  const escape = (text) => String(text).replace(/[\\()]/g, (c) => `\\${c}`)
  const text = lines.map((line, i) => `BT /F1 ${i === 0 ? 20 : 12} Tf 72 ${720 - i * 28} Td (${escape(line)}) Tj ET`).join('\n')
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>',
    `<< /Length ${Buffer.byteLength(text, 'latin1')} >>\nstream\n${text}\nendstream`,
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
  ]
  let body = '%PDF-1.4\n'
  const offsets = objects.map((object, i) => {
    const offset = Buffer.byteLength(body, 'latin1')
    body += `${i + 1} 0 obj\n${object}\nendobj\n`
    return offset
  })
  const xref = Buffer.byteLength(body, 'latin1')
  body += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`
  body += offsets.map((offset) => `${String(offset).padStart(10, '0')} 00000 n \n`).join('')
  body += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`
  return Buffer.from(body, 'latin1')
}
