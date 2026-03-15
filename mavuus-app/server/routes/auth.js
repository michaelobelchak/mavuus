import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import { JWT_SECRET } from '../middleware/auth.js'
import { validateEmail, validateLength, MAX_LENGTHS } from '../middleware/validate.js'

const router = Router()

// Register
router.post('/register', (req, res) => {
  const { email, password, name, title, company } = req.body

  if (!email || !password || !name) {
    return res.status(400).json({ error: 'Email, password, and name are required' })
  }

  if (!validateEmail(email)) {
    return res.status(400).json({ error: 'Invalid email format' })
  }

  if (password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters' })
  }

  if (!validateLength(name, MAX_LENGTHS.name)) {
    return res.status(400).json({ error: `Name must be ${MAX_LENGTHS.name} characters or less` })
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

  // Track referral if ref code provided
  const { ref } = req.query || {}
  if (ref) {
    const referralCode = db.prepare('SELECT user_id FROM referral_codes WHERE code = ?').get(ref)
    if (referralCode) {
      try {
        db.prepare('INSERT INTO referral_tracking (referrer_id, referred_user_id) VALUES (?, ?)').run(referralCode.user_id, result.lastInsertRowid)
      } catch {} // ignore duplicate
    }
  }

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

// Forgot Password
router.post('/forgot-password', (req, res) => {
  const { email } = req.body
  if (!email) return res.status(400).json({ error: 'Email is required' })

  const db = req.app.locals.db
  const user = db.prepare('SELECT id FROM users WHERE email = ?').get(email)

  if (user) {
    const token = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString() // 1 hour
    db.prepare('INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES (?, ?, ?)').run(user.id, token, expiresAt)
    console.log(`[Password Reset] Token for ${email}: ${token}`)
    console.log(`[Password Reset] Link: http://localhost:5173/reset-password?token=${token}`)
  }

  // Always return success to prevent email enumeration
  res.json({ message: 'If an account exists, a reset link has been sent.' })
})

// Reset Password
router.post('/reset-password', (req, res) => {
  const { token, password } = req.body
  if (!token || !password) return res.status(400).json({ error: 'Token and password are required' })
  if (password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters' })

  const db = req.app.locals.db
  const resetToken = db.prepare(
    'SELECT * FROM password_reset_tokens WHERE token = ? AND used = 0 AND expires_at > ?'
  ).get(token, new Date().toISOString())

  if (!resetToken) {
    return res.status(400).json({ error: 'Invalid or expired reset token' })
  }

  const passwordHash = bcrypt.hashSync(password, 10)
  db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(passwordHash, resetToken.user_id)
  db.prepare('UPDATE password_reset_tokens SET used = 1 WHERE id = ?').run(resetToken.id)

  res.json({ message: 'Password reset successfully' })
})

export default router
