import { Router } from 'express'
import { parsePaging } from '../middleware/validate.js'

const router = Router()

// What members see of a vendor: no admin notes or moderation status.
const PUBLIC_COLUMNS = 'id, user_id, company_name, description, categories, rating, reviews_count, location, website, created_at'

router.get('/', (req, res) => {
  const { category, search } = req.query
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
  const { page: pageNum, limit: limitNum, offset } = parsePaging(req.query)
  const totalPages = Math.ceil(total / limitNum)

  const vendors = db.prepare(
    `SELECT ${PUBLIC_COLUMNS} FROM vendors${whereClause} ORDER BY rating DESC LIMIT ? OFFSET ?`
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
  const vendor = db.prepare(`SELECT ${PUBLIC_COLUMNS} FROM vendors WHERE id = ?`).get(req.params.id)

  if (!vendor) {
    return res.status(404).json({ error: 'Vendor not found' })
  }

  vendor.categories = vendor.categories ? vendor.categories.split(',') : []
  res.json(vendor)
})

export default router
