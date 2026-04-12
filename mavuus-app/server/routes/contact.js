import { Router } from 'express'

const router = Router()

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

router.post('/', (req, res) => {
  const { name, email, message } = req.body || {}

  if (!name || typeof name !== 'string' || !name.trim()) {
    return res.status(400).json({ error: 'Name is required' })
  }
  if (!email || typeof email !== 'string' || !EMAIL_RE.test(email)) {
    return res.status(400).json({ error: 'Valid email is required' })
  }
  if (!message || typeof message !== 'string' || !message.trim()) {
    return res.status(400).json({ error: 'Message is required' })
  }
  if (name.length > 200 || email.length > 200 || message.length > 5000) {
    return res.status(400).json({ error: 'Input too long' })
  }

  const db = req.app.locals.db
  const result = db.prepare(
    'INSERT INTO contact_submissions (name, email, message) VALUES (?, ?, ?)'
  ).run(name.trim(), email.trim().toLowerCase(), message.trim())

  res.status(201).json({ success: true, id: result.lastInsertRowid })
})

export default router
