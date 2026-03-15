import { Router } from 'express'

const router = Router()

router.get('/', (req, res) => {
  const db = req.app.locals.db
  const members = db.prepare(
    'SELECT id, name, email, title, company, avatar_url, membership_tier, created_at FROM users ORDER BY name'
  ).all()
  res.json(members)
})

// GET /api/members/:id/profile - Get full public profile
router.get('/:id/profile', (req, res) => {
  const db = req.app.locals.db
  const member = db.prepare(`
    SELECT u.id, u.name, u.title, u.company, u.avatar_url, u.membership_tier, u.created_at,
           p.bio, p.industry, p.years_experience, p.linkedin_url, p.website_url, p.location, p.profile_visibility
    FROM users u
    LEFT JOIN user_profiles p ON u.id = p.user_id
    WHERE u.id = ?
  `).get(req.params.id)

  if (!member) return res.status(404).json({ error: 'Member not found' })

  const skills = db.prepare('SELECT skill FROM user_skills WHERE user_id = ?').all(req.params.id).map(s => s.skill)
  const experience = db.prepare('SELECT id, company, title, start_date, end_date, is_current, description FROM user_experience WHERE user_id = ? ORDER BY is_current DESC, start_date DESC').all(req.params.id)

  res.json({ ...member, skills, experience })
})

router.get('/:id', (req, res) => {
  const db = req.app.locals.db
  const member = db.prepare(
    'SELECT id, name, email, title, company, avatar_url, membership_tier, created_at FROM users WHERE id = ?'
  ).get(req.params.id)

  if (!member) {
    return res.status(404).json({ error: 'Member not found' })
  }

  res.json(member)
})

export default router
