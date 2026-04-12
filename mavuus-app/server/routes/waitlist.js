import { Router } from 'express'

const router = Router()

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

router.post('/', (req, res) => {
  const { email } = req.body || {}

  if (!email || typeof email !== 'string' || !EMAIL_RE.test(email)) {
    return res.status(400).json({ error: 'Valid email is required' })
  }
  if (email.length > 200) {
    return res.status(400).json({ error: 'Email too long' })
  }

  const db = req.app.locals.db
  const normalized = email.trim().toLowerCase()

  try {
    db.prepare('INSERT INTO waitlist (email) VALUES (?)').run(normalized)
  } catch (err) {
    if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.status(200).json({ success: true, alreadyRegistered: true })
    }
    throw err
  }

  res.status(201).json({ success: true })
})

export default router
