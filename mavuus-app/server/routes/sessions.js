import { Router } from 'express'

const router = Router()

// Get all sessions (with optional type/category filter, pagination, search)
router.get('/', (req, res) => {
  const { type, category, search, page = 1, limit = 20 } = req.query
  const db = req.app.locals.db

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
  if (search) {
    conditions.push('(title LIKE ? OR description LIKE ? OR speaker_name LIKE ?)')
    const term = `%${search}%`
    params.push(term, term, term)
  }

  const whereClause = conditions.length ? ' WHERE ' + conditions.join(' AND ') : ''

  const total = db.prepare(`SELECT COUNT(*) as count FROM sessions${whereClause}`).get(...params).count
  const pageNum = Math.max(1, parseInt(page))
  const limitNum = Math.min(100, Math.max(1, parseInt(limit)))
  const totalPages = Math.ceil(total / limitNum)
  const offset = (pageNum - 1) * limitNum

  const data = db.prepare(
    `SELECT * FROM sessions${whereClause} ORDER BY scheduled_date DESC, created_at DESC LIMIT ? OFFSET ?`
  ).all(...params, limitNum, offset)

  res.json({ data, total, page: pageNum, totalPages, limit: limitNum })
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
