import { Router } from 'express'

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

export default router
