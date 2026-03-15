import { Router } from 'express'
import jwt from 'jsonwebtoken'
import { JWT_SECRET } from '../middleware/auth.js'

const router = Router()

// Optional auth middleware — check token but don't 401 if missing
function optionalAuth(req, res, next) {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]
  if (token) {
    try {
      req.user = jwt.verify(token, JWT_SECRET)
    } catch {
      // Invalid token — treat as unauthenticated
    }
  }
  next()
}

function isConnected(db, userId1, userId2) {
  if (!userId1 || !userId2) return false
  const conn = db.prepare(
    "SELECT id FROM connections WHERE ((requester_id = ? AND receiver_id = ?) OR (requester_id = ? AND receiver_id = ?)) AND status = 'accepted'"
  ).get(userId1, userId2, userId2, userId1)
  return !!conn
}

router.get('/', optionalAuth, (req, res) => {
  const db = req.app.locals.db

  // If user is authenticated, filter out private profiles
  if (req.user) {
    const members = db.prepare(`
      SELECT u.id, u.name, u.email, u.title, u.company, u.avatar_url, u.membership_tier, u.created_at
      FROM users u
      LEFT JOIN user_profiles p ON u.id = p.user_id
      WHERE COALESCE(p.profile_visibility, 'public') != 'private' OR u.id = ?
      ORDER BY u.name
    `).all(req.user.id)
    return res.json(members)
  }

  // Unauthenticated: show only public profiles
  const members = db.prepare(`
    SELECT u.id, u.name, u.email, u.title, u.company, u.avatar_url, u.membership_tier, u.created_at
    FROM users u
    LEFT JOIN user_profiles p ON u.id = p.user_id
    WHERE COALESCE(p.profile_visibility, 'public') = 'public'
    ORDER BY u.name
  `).all()
  res.json(members)
})

// GET /api/members/:id/profile - Get full public profile (privacy-aware)
router.get('/:id/profile', optionalAuth, (req, res) => {
  const db = req.app.locals.db
  const targetId = parseInt(req.params.id)

  const member = db.prepare(`
    SELECT u.id, u.name, u.title, u.company, u.avatar_url, u.membership_tier, u.created_at,
           p.bio, p.industry, p.years_experience, p.linkedin_url, p.website_url, p.location,
           p.profile_visibility, p.resume_filename, p.resume_url
    FROM users u
    LEFT JOIN user_profiles p ON u.id = p.user_id
    WHERE u.id = ?
  `).get(targetId)

  if (!member) return res.status(404).json({ error: 'Member not found' })

  const visibility = member.profile_visibility || 'public'
  const isOwnProfile = req.user && req.user.id === targetId
  const connected = req.user ? isConnected(db, req.user.id, targetId) : false

  // Check if the viewer has access to the full profile
  const hasFullAccess = isOwnProfile || visibility === 'public' || (visibility === 'connections' && connected)

  if (!hasFullAccess) {
    // Return basic info only
    return res.json({
      id: member.id,
      name: member.name,
      title: member.title,
      company: member.company,
      avatar_url: member.avatar_url,
      membership_tier: member.membership_tier,
      profile_visibility: visibility,
      limited: true,
    })
  }

  const skills = db.prepare('SELECT skill FROM user_skills WHERE user_id = ?').all(targetId).map(s => s.skill)
  const experience = db.prepare('SELECT id, company, title, start_date, end_date, is_current, description FROM user_experience WHERE user_id = ? ORDER BY is_current DESC, start_date DESC').all(targetId)
  const connectionCount = db.prepare(
    "SELECT COUNT(*) as count FROM connections WHERE (requester_id = ? OR receiver_id = ?) AND status = 'accepted'"
  ).get(targetId, targetId).count

  res.json({ ...member, skills, experience, connection_count: connectionCount, limited: false })
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
