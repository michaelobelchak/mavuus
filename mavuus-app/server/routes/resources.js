import { Router } from 'express'
import { authenticateToken } from '../middleware/auth.js'

const router = Router()

router.get('/', (req, res) => {
  const { category, type, search, page = 1, limit = 20, exclude } = req.query
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
  if (exclude) {
    conditions.push('id != ?')
    params.push(Number(exclude))
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

// Get user's bookmarked resources
router.get('/bookmarked', authenticateToken, (req, res) => {
  const db = req.app.locals.db
  const bookmarks = db.prepare(`
    SELECT r.*, b.created_at as bookmarked_at FROM bookmarks b
    JOIN resources r ON r.id = b.resource_id
    WHERE b.user_id = ?
    ORDER BY b.created_at DESC
  `).all(req.user.id)
  res.json(bookmarks)
})

router.get('/:id', (req, res) => {
  const db = req.app.locals.db
  const resource = db.prepare('SELECT * FROM resources WHERE id = ?').get(req.params.id)

  if (!resource) {
    return res.status(404).json({ error: 'Resource not found' })
  }

  res.json(resource)
})

// Toggle bookmark on a resource
router.post('/:id/bookmark', authenticateToken, (req, res) => {
  const db = req.app.locals.db
  const existing = db.prepare('SELECT id FROM bookmarks WHERE user_id = ? AND resource_id = ?').get(req.user.id, req.params.id)

  if (existing) {
    db.prepare('DELETE FROM bookmarks WHERE user_id = ? AND resource_id = ?').run(req.user.id, req.params.id)
    res.json({ bookmarked: false })
  } else {
    db.prepare('INSERT INTO bookmarks (user_id, resource_id) VALUES (?, ?)').run(req.user.id, req.params.id)
    res.json({ bookmarked: true })
  }
})

// Create resource
router.post('/', authenticateToken, (req, res) => {
  const { title, description, content, author, thumbnail_url, category, type, read_time, url } = req.body
  if (!title) return res.status(400).json({ error: 'Title is required' })

  const db = req.app.locals.db
  const result = db.prepare(
    'INSERT INTO resources (title, description, content, author, thumbnail_url, category, type, read_time, url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
  ).run(title, description || null, content || null, author || null, thumbnail_url || null, category || null, type || null, read_time || null, url || null)

  res.status(201).json(db.prepare('SELECT * FROM resources WHERE id = ?').get(result.lastInsertRowid))
})

// Update resource
router.put('/:id', authenticateToken, (req, res) => {
  const { title, description, content, author, thumbnail_url, category, type, read_time, url } = req.body
  const db = req.app.locals.db

  const existing = db.prepare('SELECT id FROM resources WHERE id = ?').get(req.params.id)
  if (!existing) return res.status(404).json({ error: 'Resource not found' })

  db.prepare(`
    UPDATE resources SET title = COALESCE(?, title), description = COALESCE(?, description),
    content = COALESCE(?, content), author = COALESCE(?, author),
    thumbnail_url = COALESCE(?, thumbnail_url), category = COALESCE(?, category),
    type = COALESCE(?, type), read_time = COALESCE(?, read_time), url = COALESCE(?, url)
    WHERE id = ?
  `).run(title, description, content, author, thumbnail_url, category, type, read_time, url, req.params.id)

  res.json(db.prepare('SELECT * FROM resources WHERE id = ?').get(req.params.id))
})

// Delete resource
router.delete('/:id', authenticateToken, (req, res) => {
  const db = req.app.locals.db
  const result = db.prepare('DELETE FROM resources WHERE id = ?').run(req.params.id)
  if (result.changes === 0) return res.status(404).json({ error: 'Resource not found' })
  res.json({ success: true })
})

export default router
