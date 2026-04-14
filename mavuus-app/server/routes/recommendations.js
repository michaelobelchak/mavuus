import { Router } from 'express'
import { authenticateToken } from '../middleware/auth.js'

const router = Router()
router.use(authenticateToken)

// GET /api/recommendations/user/:userId - Recommendations received by a user
router.get('/user/:userId', (req, res) => {
  const db = req.app.locals.db
  const recs = db.prepare(`
    SELECT r.*, u.name as from_name, u.title as from_title, u.avatar_url as from_avatar,
           v.company_name as vendor_name
    FROM recommendations r
    JOIN users u ON u.id = r.from_user_id
    LEFT JOIN vendors v ON v.id = r.vendor_id
    WHERE r.to_user_id = ?
    ORDER BY r.created_at DESC
  `).all(req.params.userId)
  res.json(recs)
})

// GET /api/recommendations/vendor/:vendorId - Recommendations for a vendor
router.get('/vendor/:vendorId', (req, res) => {
  const db = req.app.locals.db
  const recs = db.prepare(`
    SELECT r.*, u.name as from_name, u.title as from_title, u.avatar_url as from_avatar
    FROM recommendations r
    JOIN users u ON u.id = r.from_user_id
    WHERE r.vendor_id = ?
    ORDER BY r.created_at DESC
  `).all(req.params.vendorId)
  res.json(recs)
})

// POST /api/recommendations - Create a recommendation
router.post('/', (req, res) => {
  const db = req.app.locals.db
  const { to_user_id, vendor_id, message } = req.body

  if (!to_user_id || !message) {
    return res.status(400).json({ error: 'to_user_id and message are required' })
  }

  const result = db.prepare(
    'INSERT INTO recommendations (from_user_id, to_user_id, vendor_id, message) VALUES (?, ?, ?, ?)'
  ).run(req.user.id, to_user_id, vendor_id || null, message)

  // Notify the recipient
  db.prepare('INSERT INTO notifications (user_id, type, title, message, link) VALUES (?, ?, ?, ?, ?)')
    .run(to_user_id, 'recommendation', 'New Recommendation', `${req.user.name} sent you a recommendation`, `/dashboard/members/${to_user_id}`)

  res.status(201).json({ id: result.lastInsertRowid })
})

export default router
