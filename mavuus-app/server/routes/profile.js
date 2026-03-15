import { Router } from 'express'
import { authenticateToken } from '../middleware/auth.js'

const router = Router()

// All routes require auth
router.use(authenticateToken)

// GET /api/profile/me - Get current user's full profile
router.get('/me', (req, res) => {
  const db = req.app.locals.db
  const user = db.prepare(`
    SELECT u.id, u.email, u.name, u.title, u.company, u.avatar_url, u.role, u.membership_tier, u.created_at,
           p.bio, p.industry, p.years_experience, p.linkedin_url, p.website_url, p.location, p.timezone,
           p.resume_filename, p.profile_visibility, p.notification_email, p.notification_messages,
           p.notification_connections, p.notification_jobs
    FROM users u
    LEFT JOIN user_profiles p ON u.id = p.user_id
    WHERE u.id = ?
  `).get(req.user.id)

  if (!user) return res.status(404).json({ error: 'User not found' })

  const skills = db.prepare('SELECT skill FROM user_skills WHERE user_id = ?').all(req.user.id).map(s => s.skill)
  const experience = db.prepare('SELECT * FROM user_experience WHERE user_id = ? ORDER BY is_current DESC, start_date DESC').all(req.user.id)

  res.json({ ...user, skills, experience })
})

// PUT /api/profile/me - Update profile
router.put('/me', (req, res) => {
  const db = req.app.locals.db
  const { name, title, company, bio, industry, years_experience, linkedin_url, website_url, location, timezone, profile_visibility, notification_email, notification_messages, notification_connections, notification_jobs } = req.body

  // Update users table fields
  if (name || title !== undefined || company !== undefined) {
    db.prepare('UPDATE users SET name = COALESCE(?, name), title = COALESCE(?, title), company = COALESCE(?, company) WHERE id = ?')
      .run(name || null, title !== undefined ? title : null, company !== undefined ? company : null, req.user.id)
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

export default router
