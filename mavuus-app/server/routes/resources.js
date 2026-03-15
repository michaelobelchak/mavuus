import { Router } from 'express'

const router = Router()

router.get('/', (req, res) => {
  const { category, type, search, page = 1, limit = 20 } = req.query
  const db = req.app.locals.db

  const conditions = []
  const params = []

  if (category) {
    conditions.push('category = ?')
    params.push(category)
  }
  if (type) {
    conditions.push('type = ?')
    params.push(type)
  }
  if (search) {
    conditions.push('(title LIKE ? OR description LIKE ? OR author LIKE ?)')
    const term = `%${search}%`
    params.push(term, term, term)
  }

  const whereClause = conditions.length ? ' WHERE ' + conditions.join(' AND ') : ''

  const total = db.prepare(`SELECT COUNT(*) as count FROM resources${whereClause}`).get(...params).count
  const pageNum = Math.max(1, parseInt(page))
  const limitNum = Math.min(100, Math.max(1, parseInt(limit)))
  const totalPages = Math.ceil(total / limitNum)
  const offset = (pageNum - 1) * limitNum

  const data = db.prepare(
    `SELECT * FROM resources${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`
  ).all(...params, limitNum, offset)

  res.json({ data, total, page: pageNum, totalPages, limit: limitNum })
})

router.get('/:id', (req, res) => {
  const db = req.app.locals.db
  const resource = db.prepare('SELECT * FROM resources WHERE id = ?').get(req.params.id)

  if (!resource) {
    return res.status(404).json({ error: 'Resource not found' })
  }

  res.json(resource)
})

export default router
