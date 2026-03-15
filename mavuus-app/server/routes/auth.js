import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { JWT_SECRET } from '../middleware/auth.js'

const router = Router()

// Register
router.post('/register', (req, res) => {
  const { email, password, name, title, company } = req.body

  if (!email || !password || !name) {
    return res.status(400).json({ error: 'Email, password, and name are required' })
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
    return res.status(401).json({ error: 'Invalid credentials' })
  }

  if (!bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).json({ error: 'Invalid credentials' })
  }

  const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '7d' })

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

export default router
