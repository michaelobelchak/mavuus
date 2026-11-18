import { Router } from 'express'
import jwt from 'jsonwebtoken'
import { JWT_SECRET } from '../middleware/auth.js'
import { NOT_VENDOR_OWNER } from '../db/vendorOwners.js'
import { parsePaging } from '../middleware/validate.js'

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

const TIERS = ['pro', 'free']

router.get('/', optionalAuth, (req, res) => {
  const { search, tier, connections } = req.query
  const db = req.app.locals.db

  if (tier !== undefined && !TIERS.includes(tier)) {
    return res.status(400).json({ error: `tier must be one of: ${TIERS.join(', ')}` })
  }
  if (connections !== undefined && connections !== '1' && connections !== '0') {
    return res.status(400).json({ error: 'connections must be 1 or 0' })
  }
  const onlyConnections = connections === '1'
  if (onlyConnections && !req.user) {
    return res.status(401).json({ error: 'Sign in to list your connections' })
  }

  // Banned and deleted accounts and vendor owner accounts aren't in the directory.
  const conditions = ['COALESCE(u.is_banned, 0) = 0', 'COALESCE(u.is_deleted, 0) = 0', NOT_VENDOR_OWNER]
  const params = []

  // Privacy filter
  if (req.user) {
    conditions.push("(COALESCE(p.profile_visibility, 'public') != 'private' OR u.id = ?)")
    params.push(req.user.id)
  } else {
    conditions.push("COALESCE(p.profile_visibility, 'public') = 'public'")
  }

  if (search) {
    conditions.push('(u.name LIKE ? OR u.title LIKE ? OR u.company LIKE ?)')
    const term = `%${search}%`
    params.push(term, term, term)
  }

  if (tier) {
    conditions.push('u.membership_tier = ?')
    params.push(tier)
  }

  // Members with an accepted connection to the signed-in member, in either direction.
  if (onlyConnections) {
    conditions.push(`EXISTS (
      SELECT 1 FROM connections c WHERE c.status = 'accepted'
        AND ((c.requester_id = ? AND c.receiver_id = u.id) OR (c.receiver_id = ? AND c.requester_id = u.id))
    )`)
    params.push(req.user.id, req.user.id)
  }

  const whereClause = conditions.length ? ' WHERE ' + conditions.join(' AND ') : ''

  const total = db.prepare(
    `SELECT COUNT(*) as count FROM users u LEFT JOIN user_profiles p ON u.id = p.user_id${whereClause}`
  ).get(...params).count

  const { page: pageNum, limit: limitNum, offset } = parsePaging(req.query)
  const totalPages = Math.ceil(total / limitNum)

  const data = db.prepare(
    `SELECT u.id, u.name, u.title, u.company, u.avatar_url, u.membership_tier, u.created_at
     FROM users u
     LEFT JOIN user_profiles p ON u.id = p.user_id
     ${whereClause}
     ORDER BY u.name
     LIMIT ? OFFSET ?`
  ).all(...params, limitNum, offset)

  res.json({ data, total, page: pageNum, totalPages, limit: limitNum })
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

// GET /api/members/:id - A member's card (no email: this route needs no sign-in). Banned and
// deleted accounts answer 404, as they are left out of the member list.
router.get('/:id', (req, res) => {
  const db = req.app.locals.db
  const member = db.prepare(
    'SELECT id, name, title, company, avatar_url, membership_tier, created_at FROM users WHERE id = ? AND COALESCE(is_banned, 0) = 0 AND COALESCE(is_deleted, 0) = 0'
  ).get(req.params.id)

  if (!member) {
    return res.status(404).json({ error: 'Member not found' })
  }

  res.json(member)
})

export default router
