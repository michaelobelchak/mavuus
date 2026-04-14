import { Router } from 'express'
import { authenticateToken } from '../middleware/auth.js'
import { validateLength } from '../middleware/validate.js'

const router = Router()

// Get comments for an entity
router.get('/', (req, res) => {
  const { entity_type, entity_id } = req.query
  const db = req.app.locals.db

  if (!entity_type || !entity_id) {
    return res.status(400).json({ error: 'entity_type and entity_id are required' })
  }

  const comments = db.prepare(`
    SELECT c.*, u.name as user_name, u.avatar_url as user_avatar
    FROM comments c
    JOIN users u ON u.id = c.user_id
    WHERE c.entity_type = ? AND c.entity_id = ? AND c.parent_id IS NULL
    ORDER BY c.created_at DESC
  `).all(entity_type, entity_id)

  // Fetch replies for each comment
  const withReplies = comments.map(comment => {
    const replies = db.prepare(`
      SELECT c.*, u.name as user_name, u.avatar_url as user_avatar
      FROM comments c
      JOIN users u ON u.id = c.user_id
      WHERE c.parent_id = ?
      ORDER BY c.created_at ASC
    `).all(comment.id)
    return { ...comment, replies }
  })

  res.json(withReplies)
})

// Create comment
router.post('/', authenticateToken, (req, res) => {
  const { entity_type, entity_id, content, parent_id } = req.body
  const db = req.app.locals.db

  if (!entity_type || !entity_id || !content) {
    return res.status(400).json({ error: 'entity_type, entity_id, and content are required' })
  }

  if (!validateLength(content, 5000)) {
    return res.status(400).json({ error: 'Comment must be 5000 characters or less' })
  }

  const result = db.prepare(
    'INSERT INTO comments (entity_type, entity_id, user_id, content, parent_id) VALUES (?, ?, ?, ?, ?)'
  ).run(entity_type, entity_id, req.user.id, content, parent_id || null)

  const comment = db.prepare(`
    SELECT c.*, u.name as user_name, u.avatar_url as user_avatar
    FROM comments c JOIN users u ON u.id = c.user_id
    WHERE c.id = ?
  `).get(result.lastInsertRowid)

  res.status(201).json(comment)
})

// Delete own comment
router.delete('/:id', authenticateToken, (req, res) => {
  const db = req.app.locals.db
  const comment = db.prepare('SELECT * FROM comments WHERE id = ?').get(req.params.id)

  if (!comment) return res.status(404).json({ error: 'Comment not found' })
  if (comment.user_id !== req.user.id) return res.status(403).json({ error: 'Not authorized' })

  db.prepare('DELETE FROM comments WHERE id = ? OR parent_id = ?').run(req.params.id, req.params.id)
  res.json({ success: true })
})

export default router
