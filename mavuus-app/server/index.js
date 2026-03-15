import express from 'express'
import cors from 'cors'
import rateLimit from 'express-rate-limit'
import Database from 'better-sqlite3'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { mkdirSync } from 'fs'

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

// Make db available to routes
app.locals.db = db

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

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.listen(PORT, () => {
  console.log(`Mavuus API running on http://localhost:${PORT}`)
})
