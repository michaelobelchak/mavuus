import { Router } from 'express'
import { authenticateToken } from '../middleware/auth.js'

const router = Router()
router.use(authenticateToken)

// GET /api/connections - List my accepted connections
router.get('/', (req, res) => {
  const db = req.app.locals.db
  const connections = db.prepare(`
    SELECT c.id, c.status, c.created_at,
      CASE WHEN c.requester_id = ? THEN c.receiver_id ELSE c.requester_id END as connected_user_id,
      u.name, u.title, u.company, u.avatar_url, u.membership_tier
    FROM connections c
    JOIN users u ON u.id = CASE WHEN c.requester_id = ? THEN c.receiver_id ELSE c.requester_id END
    WHERE (c.requester_id = ? OR c.receiver_id = ?) AND c.status = 'accepted'
    ORDER BY c.updated_at DESC
  `).all(req.user.id, req.user.id, req.user.id, req.user.id)
  res.json(connections)
})

// GET /api/connections/pending - List pending requests
router.get('/pending', (req, res) => {
  const db = req.app.locals.db
  const incoming = db.prepare(`
    SELECT c.id, c.created_at, u.id as user_id, u.name, u.title, u.company, u.avatar_url
    FROM connections c JOIN users u ON u.id = c.requester_id
    WHERE c.receiver_id = ? AND c.status = 'pending'
    ORDER BY c.created_at DESC
  `).all(req.user.id)
  const outgoing = db.prepare(`
    SELECT c.id, c.created_at, u.id as user_id, u.name, u.title, u.company, u.avatar_url
    FROM connections c JOIN users u ON u.id = c.receiver_id
    WHERE c.requester_id = ? AND c.status = 'pending'
    ORDER BY c.created_at DESC
  `).all(req.user.id)
  res.json({ incoming, outgoing })
})

// GET /api/connections/status/:userId - Check status with specific user
router.get('/status/:userId', (req, res) => {
  const db = req.app.locals.db
  const otherId = parseInt(req.params.userId)
  const conn = db.prepare(`
    SELECT id, status, requester_id, receiver_id FROM connections
    WHERE (requester_id = ? AND receiver_id = ?) OR (requester_id = ? AND receiver_id = ?)
  `).get(req.user.id, otherId, otherId, req.user.id)
  if (!conn) return res.json({ status: 'none' })
  res.json({ id: conn.id, status: conn.status, direction: conn.requester_id === req.user.id ? 'outgoing' : 'incoming' })
})

// POST /api/connections/request - Send connection request
router.post('/request', (req, res) => {
  const db = req.app.locals.db
  const { userId } = req.body
  if (!userId) return res.status(400).json({ error: 'userId is required' })
  if (userId === req.user.id) return res.status(400).json({ error: 'Cannot connect with yourself' })

  const existing = db.prepare('SELECT * FROM connections WHERE (requester_id = ? AND receiver_id = ?) OR (requester_id = ? AND receiver_id = ?)').get(req.user.id, userId, userId, req.user.id)
  if (existing) return res.status(409).json({ error: 'Connection already exists', status: existing.status })

  const result = db.prepare('INSERT INTO connections (requester_id, receiver_id) VALUES (?, ?)').run(req.user.id, userId)

  // Create notification for receiver
  db.prepare('INSERT INTO notifications (user_id, type, title, message, link) VALUES (?, ?, ?, ?, ?)')
    .run(userId, 'connection', 'New Connection Request', `${req.user.name} wants to connect with you`, `/dashboard/members/${req.user.id}`)

  res.status(201).json({ id: result.lastInsertRowid, status: 'pending' })
})

// PUT /api/connections/:id/accept
router.put('/:id/accept', (req, res) => {
  const db = req.app.locals.db
  const conn = db.prepare('SELECT * FROM connections WHERE id = ? AND receiver_id = ? AND status = ?').get(req.params.id, req.user.id, 'pending')
  if (!conn) return res.status(404).json({ error: 'Pending connection request not found' })
  db.prepare('UPDATE connections SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run('accepted', req.params.id)

  // Notify requester
  db.prepare('INSERT INTO notifications (user_id, type, title, message, link) VALUES (?, ?, ?, ?, ?)')
    .run(conn.requester_id, 'connection', 'Connection Accepted', `${req.user.name} accepted your connection request`, `/dashboard/members/${req.user.id}`)

  res.json({ success: true })
})

// PUT /api/connections/:id/decline
router.put('/:id/decline', (req, res) => {
  const db = req.app.locals.db
  const conn = db.prepare('SELECT * FROM connections WHERE id = ? AND receiver_id = ? AND status = ?').get(req.params.id, req.user.id, 'pending')
  if (!conn) return res.status(404).json({ error: 'Pending connection request not found' })
  db.prepare('UPDATE connections SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run('declined', req.params.id)
  res.json({ success: true })
})

// DELETE /api/connections/:id - Remove connection
router.delete('/:id', (req, res) => {
  const db = req.app.locals.db
  db.prepare('DELETE FROM connections WHERE id = ? AND (requester_id = ? OR receiver_id = ?)').run(req.params.id, req.user.id, req.user.id)
  res.json({ success: true })
})

export default router
