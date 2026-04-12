import { Router } from 'express'
import { authenticateToken } from '../middleware/auth.js'

const router = Router()

// Get all sessions (with optional type filter)
router.get('/', (req, res) => {
  const { type, category } = req.query
  const db = req.app.locals.db

  let query = 'SELECT * FROM sessions'
  const conditions = []
  const params = []

  if (type) {
    conditions.push('type = ?')
    params.push(type)
  }
  if (category) {
    conditions.push('category = ?')
    params.push(category)
  }

  if (conditions.length) {
    query += ' WHERE ' + conditions.join(' AND ')
  }

  query += ' ORDER BY scheduled_date DESC, created_at DESC'

  const sessions = db.prepare(query).all(...params)
  res.json(sessions)
})

// Get single session
router.get('/:id', (req, res) => {
  const db = req.app.locals.db
  const session = db.prepare('SELECT * FROM sessions WHERE id = ?').get(req.params.id)

  if (!session) {
    return res.status(404).json({ error: 'Session not found' })
  }

  res.json(session)
})

// Register current user for a session
router.post('/:id/register', authenticateToken, (req, res) => {
  const db = req.app.locals.db
  const sessionId = Number(req.params.id)

  const session = db.prepare('SELECT id FROM sessions WHERE id = ?').get(sessionId)
  if (!session) {
    return res.status(404).json({ error: 'Session not found' })
  }

  try {
    db.prepare(
      'INSERT INTO session_registrations (session_id, user_id) VALUES (?, ?)'
    ).run(sessionId, req.user.id)
  } catch (err) {
    if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.status(200).json({ success: true, alreadyRegistered: true })
    }
    throw err
  }

  res.status(201).json({ success: true, alreadyRegistered: false })
})

// Check registration status for current user
router.get('/:id/registration-status', authenticateToken, (req, res) => {
  const db = req.app.locals.db
  const row = db.prepare(
    'SELECT id, registered_at FROM session_registrations WHERE session_id = ? AND user_id = ?'
  ).get(Number(req.params.id), req.user.id)

  res.json({ registered: !!row, registeredAt: row?.registered_at || null })
})

export default router
