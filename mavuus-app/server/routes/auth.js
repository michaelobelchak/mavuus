import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import passport from 'passport'
import { JWT_SECRET, authenticateToken } from '../middleware/auth.js'
import { validateEmail, validateLength, MAX_LENGTHS } from '../middleware/validate.js'

const router = Router()

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
}

function validatePasswordComplexity(password) {
  if (password.length < 8) return 'Password must be at least 8 characters'
  if (!/[A-Z]/.test(password)) return 'Password must contain at least 1 uppercase letter'
  if (!/[0-9]/.test(password)) return 'Password must contain at least 1 number'
  return null
}

function generateToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, name: user.name, avatar_url: user.avatar_url, membership_tier: user.membership_tier, email_verified: user.email_verified },
    JWT_SECRET,
    { expiresIn: '7d' }
  )
}

// GET /api/auth/me — check auth from cookie or header
router.get('/me', (req, res) => {
  const token = req.cookies?.token || req.headers.authorization?.replace('Bearer ', '')
  if (!token) return res.status(401).json({ error: 'Not authenticated' })

  try {
    const payload = jwt.verify(token, JWT_SECRET)
    const db = req.app.locals.db
    const user = db.prepare('SELECT id, email, name, title, company, avatar_url, role, membership_tier, email_verified FROM users WHERE id = ?').get(payload.id)
    if (!user) return res.status(401).json({ error: 'User not found' })
    res.json({ user })
  } catch {
    return res.status(401).json({ error: 'Invalid token' })
  }
})

// Register
router.post('/register', (req, res) => {
  const { email, password, name, title, company } = req.body

  if (!email || !password || !name) {
    return res.status(400).json({ error: 'Email, password, and name are required' })
  }

  if (!validateEmail(email)) {
    return res.status(400).json({ error: 'Invalid email format' })
  }

  const passwordError = validatePasswordComplexity(password)
  if (passwordError) {
    return res.status(400).json({ error: passwordError })
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
  const verificationToken = crypto.randomUUID()
  const result = db.prepare(
    'INSERT INTO users (email, password_hash, name, title, company, email_verified, verification_token) VALUES (?, ?, ?, ?, ?, 0, ?)'
  ).run(email, passwordHash, name, title || null, company || null, verificationToken)

  console.log(`[Email Verification] Token for ${email}: ${verificationToken}`)
  console.log(`[Email Verification] Link: http://localhost:5173/verify-email?token=${verificationToken}`)

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

  const user = { id: result.lastInsertRowid, email, name, title, company, email_verified: 0 }
  const token = generateToken({ ...user, avatar_url: null, membership_tier: 'pro' })

  res.cookie('token', token, COOKIE_OPTIONS)
  res.status(201).json({ token, user })
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

  if (user.password_hash === 'google-oauth') {
    return res.status(401).json({ error: 'This account uses Google Sign-In. Please use the Google button.' })
  }

  if (!bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).json({ error: 'Invalid credentials' })
  }

  const token = generateToken(user)

  res.cookie('token', token, COOKIE_OPTIONS)
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
      email_verified: user.email_verified,
    },
  })
})

// Logout — clear httpOnly cookie
router.post('/logout', (req, res) => {
  res.clearCookie('token', COOKIE_OPTIONS)
  res.json({ success: true })
})

// Email Verification
router.get('/verify-email', (req, res) => {
  const { token } = req.query
  if (!token) return res.status(400).json({ error: 'Token is required' })

  const db = req.app.locals.db
  const user = db.prepare('SELECT id FROM users WHERE verification_token = ?').get(token)

  if (!user) {
    return res.status(400).json({ error: 'Invalid or expired verification link' })
  }

  db.prepare('UPDATE users SET email_verified = 1, verification_token = NULL WHERE id = ?').run(user.id)
  res.json({ success: true, message: 'Email verified successfully!' })
})

// Resend verification
router.post('/resend-verification', authenticateToken, (req, res) => {
  const db = req.app.locals.db
  const user = db.prepare('SELECT email, email_verified FROM users WHERE id = ?').get(req.user.id)

  if (!user) return res.status(404).json({ error: 'User not found' })
  if (user.email_verified) return res.json({ message: 'Email already verified' })

  const verificationToken = crypto.randomUUID()
  db.prepare('UPDATE users SET verification_token = ? WHERE id = ?').run(verificationToken, req.user.id)

  console.log(`[Email Verification] Resend for ${user.email}: ${verificationToken}`)
  console.log(`[Email Verification] Link: http://localhost:5173/verify-email?token=${verificationToken}`)

  res.json({ message: 'Verification email sent. Check your console.' })
})

// Google OAuth
router.get('/google', (req, res, next) => {
  if (!process.env.GOOGLE_CLIENT_ID) {
    return res.status(501).json({ error: 'Google Sign-In is not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env' })
  }
  passport.authenticate('google', { scope: ['profile', 'email'], session: false })(req, res, next)
})

router.get('/google/callback', (req, res, next) => {
  if (!process.env.GOOGLE_CLIENT_ID) {
    return res.redirect('http://localhost:5173/login?error=oauth_not_configured')
  }
  passport.authenticate('google', { session: false, failureRedirect: 'http://localhost:5173/login?error=oauth_failed' }, (err, user) => {
    if (err || !user) {
      return res.redirect('http://localhost:5173/login?error=oauth_failed')
    }
    const token = generateToken(user)
    res.cookie('token', token, COOKIE_OPTIONS)
    res.redirect(`http://localhost:5173/auth/callback?token=${token}`)
  })(req, res, next)
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

  const passwordError = validatePasswordComplexity(password)
  if (passwordError) return res.status(400).json({ error: passwordError })

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
