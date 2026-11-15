import { Router } from 'express'
import multer from 'multer'
import { fileURLToPath } from 'url'
import { dirname, join, extname } from 'path'
import { randomUUID } from 'crypto'
import { existsSync, unlinkSync } from 'fs'
import { authenticateToken } from '../middleware/auth.js'
import { MAX_LENGTHS, validateUrl } from '../middleware/validate.js'
import { RESUMES_DIR, resumeInUse, resumeName, resumePath, resumeUrl, startsLikePdf } from '../db/resumes.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const avatarsDir = join(__dirname, '..', 'uploads', 'avatars')

// Always a random .pdf name: the original name and extension are never trusted.
const resumeStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, RESUMES_DIR),
  filename: (req, file, cb) => cb(null, `${randomUUID()}.pdf`),
})

const resumeUpload = multer({
  storage: resumeStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true)
    } else {
      cb(new Error('Only PDF files are allowed'))
    }
  },
})

// Deletes the member's old resume file unless an application still points at it.
function removeOldResume(db, url) {
  const name = resumeName(url)
  if (!name || resumeInUse(db, name)) return
  const path = resumePath(name)
  if (existsSync(path)) {
    try { unlinkSync(path) } catch { /* ignore */ }
  }
}

const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, avatarsDir),
  filename: (req, file, cb) => {
    const ext = extname(file.originalname)
    cb(null, `avatar-${req.user.id}-${Date.now()}${ext}`)
  },
})

const AVATAR_MIMES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif'])

const avatarUpload = multer({
  storage: avatarStorage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter: (req, file, cb) => {
    if (AVATAR_MIMES.has(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('Only JPEG, PNG, WebP, or GIF images are allowed'))
    }
  },
})

const VISIBILITIES = new Set(['public', 'connections', 'private'])
const TEXT_LIMITS = {
  name: MAX_LENGTHS.name,
  title: MAX_LENGTHS.title,
  company: MAX_LENGTHS.company,
  bio: MAX_LENGTHS.bio,
  industry: 100,
  location: 200,
  timezone: 100,
  linkedin_url: 500,
  website_url: 500,
  avatar_url: 500,
}
const FLAGS = ['notification_email', 'notification_messages', 'notification_connections', 'notification_jobs']

/** The first problem with a profile update, or null. Fields left out (undefined) are not checked. */
function profileUpdateError(body) {
  for (const [field, max] of Object.entries(TEXT_LIMITS)) {
    const value = body[field]
    if (value === undefined || value === null) continue
    if (typeof value !== 'string') return `${field} must be text`
    if (value.length > max) return `${field} can be ${max} characters at most`
  }
  for (const field of ['linkedin_url', 'website_url']) {
    if (body[field] && !validateUrl(body[field])) return 'Links must start with http:// or https://'
  }
  if (body.profile_visibility !== undefined && !VISIBILITIES.has(body.profile_visibility)) {
    return 'Visibility must be public, connections or private'
  }
  const years = body.years_experience
  // An empty value clears it, as before.
  if (years !== undefined && years !== null && years !== '') {
    const number = typeof years === 'string' ? Number(years) : years
    if (!Number.isInteger(number) || number < 0 || number > 70) return 'Years of experience must be a whole number from 0 to 70'
  }
  for (const field of FLAGS) {
    const value = body[field]
    if (value !== undefined && ![0, 1, true, false].includes(value)) return `${field} must be on or off`
  }
  return null
}

const router = Router()

// All routes require auth
router.use(authenticateToken)

// GET /api/profile/me - Get current user's full profile
router.get('/me', (req, res) => {
  const db = req.app.locals.db
  const user = db.prepare(`
    SELECT u.id, u.email, u.name, u.title, u.company, u.avatar_url, u.role, u.membership_tier, u.created_at,
           p.bio, p.industry, p.years_experience, p.linkedin_url, p.website_url, p.location, p.timezone,
           p.resume_filename, p.resume_url, p.profile_visibility, p.notification_email, p.notification_messages,
           p.notification_connections, p.notification_jobs
    FROM users u
    LEFT JOIN user_profiles p ON u.id = p.user_id
    WHERE u.id = ?
  `).get(req.user.id)

  if (!user) return res.status(404).json({ error: 'User not found' })

  const skills = db.prepare('SELECT skill FROM user_skills WHERE user_id = ?').all(req.user.id).map(s => s.skill)
  const experience = db.prepare('SELECT * FROM user_experience WHERE user_id = ? ORDER BY is_current DESC, start_date DESC').all(req.user.id)
  const connections_count = db.prepare("SELECT COUNT(*) as count FROM connections WHERE (requester_id = ? OR receiver_id = ?) AND status = 'accepted'").get(req.user.id, req.user.id)?.count || 0

  res.json({ ...user, skills, experience, connections_count })
})

// PUT /api/profile/me - Update profile
router.put('/me', (req, res) => {
  const db = req.app.locals.db
  const invalid = profileUpdateError(req.body)
  if (invalid) return res.status(400).json({ error: invalid })
  const { name, title, company, avatar_url, bio, industry, linkedin_url, website_url, location, timezone, profile_visibility } = req.body
  const years_experience = typeof req.body.years_experience === 'string' && req.body.years_experience !== ''
    ? Number(req.body.years_experience)
    : req.body.years_experience
  const flag = (value) => (value === undefined || value === null ? value : value ? 1 : 0)
  const notification_email = flag(req.body.notification_email)
  const notification_messages = flag(req.body.notification_messages)
  const notification_connections = flag(req.body.notification_connections)
  const notification_jobs = flag(req.body.notification_jobs)

  // Update users table fields
  if (name || title !== undefined || company !== undefined || avatar_url !== undefined) {
    db.prepare('UPDATE users SET name = COALESCE(?, name), title = COALESCE(?, title), company = COALESCE(?, company), avatar_url = COALESCE(?, avatar_url) WHERE id = ?')
      .run(name || null, title !== undefined ? title : null, company !== undefined ? company : null, avatar_url !== undefined ? avatar_url : null, req.user.id)
  }

  // Upsert user_profiles
  db.prepare(`
    INSERT INTO user_profiles (user_id, bio, industry, years_experience, linkedin_url, website_url, location, timezone, profile_visibility, notification_email, notification_messages, notification_connections, notification_jobs, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(user_id) DO UPDATE SET
      bio = COALESCE(excluded.bio, bio),
      industry = COALESCE(excluded.industry, industry),
      years_experience = COALESCE(excluded.years_experience, years_experience),
      linkedin_url = COALESCE(excluded.linkedin_url, linkedin_url),
      website_url = COALESCE(excluded.website_url, website_url),
      location = COALESCE(excluded.location, location),
      timezone = COALESCE(excluded.timezone, timezone),
      profile_visibility = COALESCE(excluded.profile_visibility, profile_visibility),
      notification_email = COALESCE(excluded.notification_email, notification_email),
      notification_messages = COALESCE(excluded.notification_messages, notification_messages),
      notification_connections = COALESCE(excluded.notification_connections, notification_connections),
      notification_jobs = COALESCE(excluded.notification_jobs, notification_jobs),
      updated_at = CURRENT_TIMESTAMP
  `).run(req.user.id, bio ?? null, industry ?? null, years_experience ?? null, linkedin_url ?? null, website_url ?? null, location ?? null, timezone ?? null, profile_visibility ?? null, notification_email ?? null, notification_messages ?? null, notification_connections ?? null, notification_jobs ?? null)

  res.json({ success: true })
})

// Skills CRUD
router.get('/me/skills', (req, res) => {
  const db = req.app.locals.db
  const skills = db.prepare('SELECT skill FROM user_skills WHERE user_id = ?').all(req.user.id).map(s => s.skill)
  res.json(skills)
})

router.post('/me/skills', (req, res) => {
  const db = req.app.locals.db
  const { skill } = req.body
  if (!skill) return res.status(400).json({ error: 'Skill is required' })
  try {
    db.prepare('INSERT INTO user_skills (user_id, skill) VALUES (?, ?)').run(req.user.id, skill)
    res.status(201).json({ success: true })
  } catch {
    res.status(409).json({ error: 'Skill already exists' })
  }
})

router.delete('/me/skills/:skill', (req, res) => {
  const db = req.app.locals.db
  db.prepare('DELETE FROM user_skills WHERE user_id = ? AND skill = ?').run(req.user.id, req.params.skill)
  res.json({ success: true })
})

// Experience CRUD
router.get('/me/experience', (req, res) => {
  const db = req.app.locals.db
  const experience = db.prepare('SELECT * FROM user_experience WHERE user_id = ? ORDER BY is_current DESC, start_date DESC').all(req.user.id)
  res.json(experience)
})

router.post('/me/experience', (req, res) => {
  const db = req.app.locals.db
  const { company, title, start_date, end_date, is_current, description } = req.body
  if (!company || !title) return res.status(400).json({ error: 'Company and title are required' })
  const result = db.prepare('INSERT INTO user_experience (user_id, company, title, start_date, end_date, is_current, description) VALUES (?, ?, ?, ?, ?, ?, ?)')
    .run(req.user.id, company, title, start_date || null, end_date || null, is_current ? 1 : 0, description || null)
  res.status(201).json({ id: result.lastInsertRowid })
})

router.put('/me/experience/:id', (req, res) => {
  const db = req.app.locals.db
  const { company, title, start_date, end_date, is_current, description } = req.body
  const existing = db.prepare('SELECT * FROM user_experience WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id)
  if (!existing) return res.status(404).json({ error: 'Experience not found' })
  db.prepare('UPDATE user_experience SET company = ?, title = ?, start_date = ?, end_date = ?, is_current = ?, description = ? WHERE id = ? AND user_id = ?')
    .run(company || existing.company, title || existing.title, start_date ?? existing.start_date, end_date ?? existing.end_date, is_current !== undefined ? (is_current ? 1 : 0) : existing.is_current, description ?? existing.description, req.params.id, req.user.id)
  res.json({ success: true })
})

router.delete('/me/experience/:id', (req, res) => {
  const db = req.app.locals.db
  db.prepare('DELETE FROM user_experience WHERE id = ? AND user_id = ?').run(req.params.id, req.user.id)
  res.json({ success: true })
})

// Resume upload
router.post('/me/resume', (req, res) => {
  resumeUpload.single('resume')(req, res, (err) => {
    if (err) {
      const error = err.code === 'LIMIT_FILE_SIZE' ? 'Resume must be 5 MB or less' : err.message || 'Upload failed'
      return res.status(400).json({ error })
    }
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' })
    }
    // The browser's mimetype is only a claim; a PDF starts with "%PDF-". An unreadable file fails too.
    if (!startsLikePdf(req.file.path)) {
      try { unlinkSync(req.file.path) } catch { /* ignore */ }
      return res.status(400).json({ error: 'Only PDF files are allowed' })
    }

    const db = req.app.locals.db
    const newUrl = resumeUrl(req.file.filename)

    // The old file goes unless an application still uses it.
    const existing = db.prepare('SELECT resume_url FROM user_profiles WHERE user_id = ?').get(req.user.id)
    if (existing?.resume_url) removeOldResume(db, existing.resume_url)

    db.prepare(`
      INSERT INTO user_profiles (user_id, resume_filename, resume_url, updated_at)
      VALUES (?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(user_id) DO UPDATE SET
        resume_filename = excluded.resume_filename,
        resume_url = excluded.resume_url,
        updated_at = CURRENT_TIMESTAMP
    `).run(req.user.id, req.file.originalname, newUrl)

    res.json({ success: true, filename: req.file.originalname, url: newUrl })
  })
})

// Avatar upload
router.post('/me/avatar', (req, res) => {
  avatarUpload.single('avatar')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ error: err.message || 'Upload failed' })
    }
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' })
    }

    const db = req.app.locals.db
    const avatarUrl = `/uploads/avatars/${req.file.filename}`

    const existing = db.prepare('SELECT avatar_url FROM users WHERE id = ?').get(req.user.id)
    if (existing?.avatar_url && existing.avatar_url.startsWith('/uploads/avatars/')) {
      const oldPath = join(__dirname, '..', existing.avatar_url)
      if (existsSync(oldPath)) {
        try { unlinkSync(oldPath) } catch { /* ignore */ }
      }
    }

    db.prepare('UPDATE users SET avatar_url = ? WHERE id = ?').run(avatarUrl, req.user.id)

    res.json({ success: true, avatar_url: avatarUrl })
  })
})

// Resume delete
router.delete('/me/resume', (req, res) => {
  const db = req.app.locals.db
  const existing = db.prepare('SELECT resume_url FROM user_profiles WHERE user_id = ?').get(req.user.id)

  if (existing?.resume_url) removeOldResume(db, existing.resume_url)

  db.prepare('UPDATE user_profiles SET resume_filename = NULL, resume_url = NULL, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?')
    .run(req.user.id)

  res.json({ success: true })
})

export default router
