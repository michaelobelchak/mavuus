import { Router } from 'express'

const router = Router()

router.get('/', (req, res) => {
  const { category, search, page = 1, limit = 20 } = req.query
  const db = req.app.locals.db

  const conditions = []
  const params = []

  if (category) {
    conditions.push('categories LIKE ?')
    params.push(`%${category}%`)
  }
  if (search) {
    conditions.push('(company_name LIKE ? OR description LIKE ?)')
    const term = `%${search}%`
    params.push(term, term)
  }

  const whereClause = conditions.length ? ' WHERE ' + conditions.join(' AND ') : ''

  const total = db.prepare(`SELECT COUNT(*) as count FROM vendors${whereClause}`).get(...params).count
  const pageNum = Math.max(1, parseInt(page))
  const limitNum = Math.min(100, Math.max(1, parseInt(limit)))
  const totalPages = Math.ceil(total / limitNum)
  const offset = (pageNum - 1) * limitNum

  const vendors = db.prepare(
    `SELECT * FROM vendors${whereClause} ORDER BY rating DESC LIMIT ? OFFSET ?`
  ).all(...params, limitNum, offset)

  // Parse categories from comma-separated string
  const data = vendors.map(v => ({
    ...v,
    categories: v.categories ? v.categories.split(',') : [],
  }))

  res.json({ data, total, page: pageNum, totalPages, limit: limitNum })
})

router.get('/:id', (req, res) => {
  const db = req.app.locals.db
  const vendor = db.prepare('SELECT * FROM vendors WHERE id = ?').get(req.params.id)

  if (!vendor) {
    return res.status(404).json({ error: 'Vendor not found' })
  }

  vendor.categories = vendor.categories ? vendor.categories.split(',') : []
  res.json(vendor)
})

export default router
