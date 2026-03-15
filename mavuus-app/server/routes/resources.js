import { Router } from 'express'

const router = Router()

router.get('/', (req, res) => {
  const { category, type } = req.query
  const db = req.app.locals.db

  let query = 'SELECT * FROM resources'
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

  if (conditions.length) {
    query += ' WHERE ' + conditions.join(' AND ')
  }

  query += ' ORDER BY created_at DESC'

  const resources = db.prepare(query).all(...params)
  res.json(resources)
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
