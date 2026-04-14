import { Router } from 'express'
import { validateEmail, validateLength, MAX_LENGTHS } from '../middleware/validate.js'

const router = Router()

router.post('/', (req, res) => {
  const { name, email, phone, message } = req.body || {}
  const db = req.app.locals.db

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Name, email, and message are required' })
  }

  if (!validateEmail(email)) {
    return res.status(400).json({ error: 'Invalid email format' })
  }

  if (!validateLength(message, MAX_LENGTHS.message)) {
    return res.status(400).json({ error: `Message must be ${MAX_LENGTHS.message} characters or less` })
  }

  db.prepare(
    'INSERT INTO contact_submissions (name, email, phone, message) VALUES (?, ?, ?, ?)'
  ).run(name, email, phone || null, message)

  res.status(201).json({ success: true, message: 'Thank you! We\'ll get back to you shortly.' })
})

export default router
