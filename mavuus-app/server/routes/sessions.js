import { Router } from 'express'
import { authenticateToken } from '../middleware/auth.js'

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

// Register current user for a session (Phase A live RSVP)
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

// Get related sessions (same category, excluding current)
router.get('/:id/related', (req, res) => {
  const db = req.app.locals.db
  const session = db.prepare('SELECT category FROM sessions WHERE id = ?').get(req.params.id)
  if (!session) return res.json([])

  const related = db.prepare(
    'SELECT * FROM sessions WHERE category = ? AND id != ? ORDER BY created_at DESC LIMIT 3'
  ).all(session.category, req.params.id)
  res.json(related)
})

// Track view
router.put('/:id/view', (req, res) => {
  const db = req.app.locals.db
  const result = db.prepare('UPDATE sessions SET views = views + 1 WHERE id = ?').run(req.params.id)
  if (result.changes === 0) return res.status(404).json({ error: 'Session not found' })
  res.json({ success: true })
})

// Create session
router.post('/', authenticateToken, (req, res) => {
  const { title, description, speaker_name, speaker_title, speaker_avatar, thumbnail_url, type, category, scheduled_date, duration, video_url } = req.body
  if (!title || !speaker_name || !type) return res.status(400).json({ error: 'Title, speaker_name, and type are required' })

  const db = req.app.locals.db
  const result = db.prepare(
    'INSERT INTO sessions (title, description, speaker_name, speaker_title, speaker_avatar, thumbnail_url, type, category, scheduled_date, duration, video_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
  ).run(title, description || null, speaker_name, speaker_title || null, speaker_avatar || null, thumbnail_url || null, type, category || null, scheduled_date || null, duration || null, video_url || null)

  const session = db.prepare('SELECT * FROM sessions WHERE id = ?').get(result.lastInsertRowid)
  res.status(201).json(session)
})

// Update session
router.put('/:id', authenticateToken, (req, res) => {
  const { title, description, speaker_name, speaker_title, speaker_avatar, thumbnail_url, type, category, scheduled_date, duration, video_url } = req.body
  const db = req.app.locals.db

  const existing = db.prepare('SELECT id FROM sessions WHERE id = ?').get(req.params.id)
  if (!existing) return res.status(404).json({ error: 'Session not found' })

  db.prepare(`
    UPDATE sessions SET title = COALESCE(?, title), description = COALESCE(?, description),
    speaker_name = COALESCE(?, speaker_name), speaker_title = COALESCE(?, speaker_title),
    speaker_avatar = COALESCE(?, speaker_avatar), thumbnail_url = COALESCE(?, thumbnail_url),
    type = COALESCE(?, type), category = COALESCE(?, category),
    scheduled_date = COALESCE(?, scheduled_date), duration = COALESCE(?, duration),
    video_url = COALESCE(?, video_url) WHERE id = ?
  `).run(title, description, speaker_name, speaker_title, speaker_avatar, thumbnail_url, type, category, scheduled_date, duration, video_url, req.params.id)

  res.json(db.prepare('SELECT * FROM sessions WHERE id = ?').get(req.params.id))
})

// Delete session
router.delete('/:id', authenticateToken, (req, res) => {
  const db = req.app.locals.db
  const result = db.prepare('DELETE FROM sessions WHERE id = ?').run(req.params.id)
  if (result.changes === 0) return res.status(404).json({ error: 'Session not found' })
  res.json({ success: true })
})

export default router
