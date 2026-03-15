import { Router } from 'express'

const router = Router()

router.get('/', (req, res) => {
  const { category } = req.query
  const db = req.app.locals.db

  let query = 'SELECT * FROM vendors'
  const params = []

  if (category) {
    query += ' WHERE categories LIKE ?'
    params.push(`%${category}%`)
  }

  query += ' ORDER BY rating DESC'

  const vendors = db.prepare(query).all(...params)
  // Parse categories from comma-separated string
  const parsed = vendors.map(v => ({
    ...v,
    categories: v.categories ? v.categories.split(',') : [],
  }))
  res.json(parsed)
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
