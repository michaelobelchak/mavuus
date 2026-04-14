import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import cookieParser from 'cookie-parser'
import rateLimit from 'express-rate-limit'
import passport from 'passport'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
import jwt from 'jsonwebtoken'
import Database from 'better-sqlite3'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { mkdirSync, readFileSync } from 'fs'

import { JWT_SECRET } from './middleware/auth.js'
import authRoutes from './routes/auth.js'
import sessionsRoutes from './routes/sessions.js'
import resourcesRoutes from './routes/resources.js'
import membersRoutes from './routes/members.js'
import vendorsRoutes from './routes/vendors.js'
import jobsRoutes from './routes/jobs.js'
import profileRoutes from './routes/profile.js'
import connectionsRoutes from './routes/connections.js'
import messagesRoutes from './routes/messages.js'
import notificationsRoutes from './routes/notifications.js'
import reviewsRoutes from './routes/reviews.js'
import recommendationsRoutes from './routes/recommendations.js'
import contactRoutes from './routes/contact.js'
import waitlistRoutes from './routes/waitlist.js'
import statsRoutes from './routes/stats.js'
import searchRoutes from './routes/search.js'
import commentsRoutes from './routes/comments.js'
import referralsRoutes from './routes/referrals.js'
import speakersRoutes from './routes/speakers.js'
import uploadRoutes from './routes/upload.js'
import adminRoutes from './routes/admin.js'
import publicContentRoutes from './routes/public-content.js'
import { sanitizeBody } from './middleware/sanitize.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const app = express()
const PORT = process.env.PORT || 3001

// Ensure uploads directory exists
mkdirSync(join(__dirname, 'uploads', 'avatars'), { recursive: true })
mkdirSync(join(__dirname, 'uploads', 'resumes'), { recursive: true })

// Database
const db = new Database(join(__dirname, 'db', 'mavuus.db'))
db.pragma('journal_mode = WAL')

// Ensure schema is applied (idempotent — uses CREATE TABLE IF NOT EXISTS)
const schemaSQL = readFileSync(join(__dirname, 'db', 'schema.sql'), 'utf-8')
db.exec(schemaSQL)

// Make db available to routes
app.locals.db = db

// Security headers
app.use(helmet({
  contentSecurityPolicy: false, // Allow inline scripts for dev
  crossOriginEmbedderPolicy: false,
}))

// Cookie parser
app.use(cookieParser())

// CORS — allow frontend origin in production
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',')
  : ['http://localhost:5173', 'http://localhost:4173']

app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? allowedOrigins : true,
  credentials: true,
}))

// Body parser with size limit + input sanitization
app.use(express.json({ limit: '1mb' }))
app.use(sanitizeBody)

// Static uploads
app.use('/uploads', express.static(join(__dirname, 'uploads')))

// Passport Google OAuth setup
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3001/api/auth/google/callback',
  }, (accessToken, refreshToken, profile, done) => {
    const email = profile.emails?.[0]?.value
    if (!email) return done(null, false)

    let user = db.prepare('SELECT * FROM users WHERE email = ?').get(email)
    if (!user) {
      const result = db.prepare(
        'INSERT INTO users (email, password_hash, name, avatar_url, email_verified, google_id) VALUES (?, ?, ?, ?, 1, ?)'
      ).run(email, 'google-oauth', profile.displayName || email.split('@')[0], profile.photos?.[0]?.value || null, profile.id)
      user = db.prepare('SELECT * FROM users WHERE id = ?').get(result.lastInsertRowid)
    } else if (!user.google_id) {
      db.prepare('UPDATE users SET google_id = ?, email_verified = 1 WHERE id = ?').run(profile.id, user.id)
    }

    done(null, user)
  }))

  app.use(passport.initialize())
}

// Rate limiting on auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 attempts per window
  message: { error: 'Too many attempts, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
})

// General API rate limiter
const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
  message: { error: 'Too many requests, please slow down' },
  standardHeaders: true,
  legacyHeaders: false,
})

app.use('/api/', apiLimiter)
app.use('/api/auth', authLimiter, authRoutes)

// Routes
app.use('/api/sessions', sessionsRoutes)
app.use('/api/resources', resourcesRoutes)
app.use('/api/members', membersRoutes)
app.use('/api/vendors', vendorsRoutes)
app.use('/api/jobs', jobsRoutes)
app.use('/api/profile', profileRoutes)
app.use('/api/connections', connectionsRoutes)
app.use('/api/messages', messagesRoutes)
app.use('/api/notifications', notificationsRoutes)
app.use('/api/reviews', reviewsRoutes)
app.use('/api/recommendations', recommendationsRoutes)
app.use('/api/contact', contactRoutes)
app.use('/api/waitlist', waitlistRoutes)
app.use('/api/stats', statsRoutes)
app.use('/api/search', searchRoutes)
app.use('/api/comments', commentsRoutes)
app.use('/api/referrals', referralsRoutes)
app.use('/api/speakers', speakersRoutes)
app.use('/api/upload', uploadRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api', publicContentRoutes)

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Serve client in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(join(__dirname, '../client/dist')))
  app.get('*', (req, res) => {
    res.sendFile(join(__dirname, '../client/dist/index.html'))
  })
}

app.listen(PORT, () => {
  console.log(`Mavuus API running on http://localhost:${PORT}`)
})
