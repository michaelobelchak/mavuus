import { Router } from 'express'
import { authenticateToken } from '../middleware/auth.js'
import { MAX_LENGTHS } from '../middleware/validate.js'

const router = Router()
router.use(authenticateToken)

// A message body: text that isn't blank (sanitizeBody already trimmed it) and fits the limit.
function messageError(content) {
  if (typeof content !== 'string' || !content) return 'Message text is required'
  if (content.length > MAX_LENGTHS.message) return `Messages can be ${MAX_LENGTHS.message.toLocaleString('en-US')} characters at most`
  return null
}

const isParticipant = (db, conversationId, userId) =>
  Boolean(db.prepare('SELECT 1 FROM conversation_participants WHERE conversation_id = ? AND user_id = ?').get(conversationId, userId))

// GET /api/messages/conversations - List my conversations
router.get('/conversations', (req, res) => {
  const db = req.app.locals.db
  const conversations = db.prepare(`
    SELECT c.id, c.updated_at,
      cp2.user_id as other_user_id,
      u.name as other_user_name, u.title as other_user_title, u.avatar_url as other_user_avatar,
      (SELECT content FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC, id DESC LIMIT 1) as last_message,
      (SELECT sender_id FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC, id DESC LIMIT 1) as last_message_sender_id,
      (SELECT created_at FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC, id DESC LIMIT 1) as last_message_at,
      (SELECT COUNT(*) FROM messages m WHERE m.conversation_id = c.id AND m.created_at > COALESCE(cp.last_read_at, '1970-01-01') AND m.sender_id != ?) as unread_count
    FROM conversations c
    JOIN conversation_participants cp ON cp.conversation_id = c.id AND cp.user_id = ?
    JOIN conversation_participants cp2 ON cp2.conversation_id = c.id AND cp2.user_id != ?
    JOIN users u ON u.id = cp2.user_id
    ORDER BY c.updated_at DESC
  `).all(req.user.id, req.user.id, req.user.id)
  res.json(conversations)
})

// POST /api/messages/conversations - Start new conversation
router.post('/conversations', (req, res) => {
  const db = req.app.locals.db
  const { message } = req.body
  const userId = Number(req.body.userId)
  if (!req.body.userId || !message) return res.status(400).json({ error: 'userId and message are required' })
  const invalid = messageError(message)
  if (invalid) return res.status(400).json({ error: invalid })
  if (userId === req.user.id) return res.status(400).json({ error: "You can't message yourself" })
  // Only an active member: not a missing id, and not a banned or deleted account.
  const recipient = Number.isInteger(userId)
    ? db.prepare('SELECT id FROM users WHERE id = ? AND COALESCE(is_banned, 0) = 0 AND COALESCE(is_deleted, 0) = 0').get(userId)
    : null
  if (!recipient) return res.status(404).json({ error: 'Member not found' })

  // Check if conversation already exists between these two users
  const existing = db.prepare(`
    SELECT c.id FROM conversations c
    JOIN conversation_participants cp1 ON cp1.conversation_id = c.id AND cp1.user_id = ?
    JOIN conversation_participants cp2 ON cp2.conversation_id = c.id AND cp2.user_id = ?
  `).get(req.user.id, userId)

  let conversationId
  if (existing) {
    conversationId = existing.id
  } else {
    const result = db.prepare('INSERT INTO conversations (created_at, updated_at) VALUES (CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)').run()
    conversationId = result.lastInsertRowid
    db.prepare('INSERT INTO conversation_participants (conversation_id, user_id) VALUES (?, ?)').run(conversationId, req.user.id)
    db.prepare('INSERT INTO conversation_participants (conversation_id, user_id) VALUES (?, ?)').run(conversationId, userId)
  }

  // Send message
  db.prepare('INSERT INTO messages (conversation_id, sender_id, content) VALUES (?, ?, ?)').run(conversationId, req.user.id, message)
  db.prepare('UPDATE conversations SET updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(conversationId)
  db.prepare('UPDATE conversation_participants SET last_read_at = CURRENT_TIMESTAMP WHERE conversation_id = ? AND user_id = ?').run(conversationId, req.user.id)

  res.status(201).json({ conversationId })
})

// GET /api/messages/conversations/:id/messages - Get messages
router.get('/conversations/:id/messages', (req, res) => {
  const db = req.app.locals.db
  // Verify user is participant
  const participant = db.prepare('SELECT * FROM conversation_participants WHERE conversation_id = ? AND user_id = ?').get(req.params.id, req.user.id)
  if (!participant) return res.status(403).json({ error: 'Not a participant' })

  const messages = db.prepare(`
    SELECT m.id, m.sender_id, m.content, m.created_at, u.name as sender_name, u.avatar_url as sender_avatar
    FROM messages m JOIN users u ON u.id = m.sender_id
    WHERE m.conversation_id = ?
    ORDER BY m.created_at ASC, m.id ASC
  `).all(req.params.id)

  res.json(messages)
})

// POST /api/messages/conversations/:id/messages - Send message
router.post('/conversations/:id/messages', (req, res) => {
  const db = req.app.locals.db
  const { content } = req.body
  const invalid = messageError(content)
  if (invalid) return res.status(400).json({ error: invalid })

  if (!isParticipant(db, req.params.id, req.user.id)) return res.status(403).json({ error: 'Not a participant' })

  const result = db.prepare('INSERT INTO messages (conversation_id, sender_id, content) VALUES (?, ?, ?)').run(req.params.id, req.user.id, content)
  db.prepare('UPDATE conversations SET updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(req.params.id)
  db.prepare('UPDATE conversation_participants SET last_read_at = CURRENT_TIMESTAMP WHERE conversation_id = ? AND user_id = ?').run(req.params.id, req.user.id)

  res.status(201).json({ id: result.lastInsertRowid })
})

// PUT /api/messages/conversations/:id/read - Mark as read
router.put('/conversations/:id/read', (req, res) => {
  const db = req.app.locals.db
  if (!isParticipant(db, req.params.id, req.user.id)) return res.status(403).json({ error: 'Not a participant' })
  db.prepare('UPDATE conversation_participants SET last_read_at = CURRENT_TIMESTAMP WHERE conversation_id = ? AND user_id = ?').run(req.params.id, req.user.id)
  res.json({ success: true })
})

// GET /api/messages/unread-count
router.get('/unread-count', (req, res) => {
  const db = req.app.locals.db
  const result = db.prepare(`
    SELECT COUNT(*) as count FROM messages m
    JOIN conversation_participants cp ON cp.conversation_id = m.conversation_id AND cp.user_id = ?
    WHERE m.sender_id != ? AND m.created_at > COALESCE(cp.last_read_at, '1970-01-01')
  `).get(req.user.id, req.user.id)
  res.json({ count: result.count })
})

export default router
