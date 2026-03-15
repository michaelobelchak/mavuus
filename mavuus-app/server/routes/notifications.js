import { Router } from 'express'
import { authenticateToken } from '../middleware/auth.js'

const router = Router()
router.use(authenticateToken)

// GET /api/notifications
router.get('/', (req, res) => {
  const db = req.app.locals.db
  const notifications = db.prepare('SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50').all(req.user.id)
  res.json(notifications)
})

// GET /api/notifications/unread-count
router.get('/unread-count', (req, res) => {
  const db = req.app.locals.db
  const result = db.prepare('SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0').get(req.user.id)
  res.json({ count: result.count })
})

// PUT /api/notifications/:id/read
router.put('/:id/read', (req, res) => {
  const db = req.app.locals.db
  db.prepare('UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?').run(req.params.id, req.user.id)
  res.json({ success: true })
})

// PUT /api/notifications/read-all
router.put('/read-all', (req, res) => {
  const db = req.app.locals.db
  db.prepare('UPDATE notifications SET is_read = 1 WHERE user_id = ?').run(req.user.id)
  res.json({ success: true })
})

export default router
