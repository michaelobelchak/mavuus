import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { JWT_SECRET, authenticateToken } from '../middleware/auth.js'

const router = Router()

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Register
router.post('/register', (req, res) => {
  const { email, password, name, title, company } = req.body

  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Name is required' })
  }
  if (!email || !EMAIL_RE.test(email)) {
    return res.status(400).json({ error: 'Valid email is required' })
  }
  if (!password || password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters' })
  }

  const db = req.app.locals.db

  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email)
  if (existing) {
    return res.status(409).json({ error: 'Email already registered' })
  }

  const passwordHash = bcrypt.hashSync(password, 10)
  const result = db.prepare(
    'INSERT INTO users (email, password_hash, name, title, company) VALUES (?, ?, ?, ?, ?)'
  ).run(email, passwordHash, name, title || null, company || null)

  const token = jwt.sign({ id: result.lastInsertRowid, email, name }, JWT_SECRET, { expiresIn: '7d' })

  res.status(201).json({ token, user: { id: result.lastInsertRowid, email, name, title, company } })
})

// Login
router.post('/login', (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' })
  }

  const db = req.app.locals.db

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email)
  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password' })
  }

  if (!bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).json({ error: 'Invalid email or password' })
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, name: user.name, avatar_url: user.avatar_url, membership_tier: user.membership_tier },
    JWT_SECRET,
    { expiresIn: '7d' }
  )

  res.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      title: user.title,
      company: user.company,
      role: user.role,
      membership_tier: user.membership_tier,
    },
  })
})

// Change password (auth required)
router.put('/change-password', authenticateToken, (req, res) => {
  const { currentPassword, newPassword } = req.body || {}

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Current and new password are required' })
  }
  if (newPassword.length < 8) {
    return res.status(400).json({ error: 'New password must be at least 8 characters' })
  }

  const db = req.app.locals.db
  const user = db.prepare('SELECT id, password_hash FROM users WHERE id = ?').get(req.user.id)
  if (!user) {
    return res.status(404).json({ error: 'User not found' })
  }
  if (!bcrypt.compareSync(currentPassword, user.password_hash)) {
    return res.status(401).json({ error: 'Current password is incorrect' })
  }

  const newHash = bcrypt.hashSync(newPassword, 10)
  db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(newHash, user.id)

  res.json({ success: true })
})

export default router
