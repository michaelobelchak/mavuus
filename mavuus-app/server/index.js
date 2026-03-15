import express from 'express'
import cors from 'cors'
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

// Middleware
app.use(cors())
app.use(express.json())
app.use('/uploads', express.static(join(__dirname, 'uploads')))

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/sessions', sessionsRoutes)
app.use('/api/resources', resourcesRoutes)
app.use('/api/members', membersRoutes)
app.use('/api/vendors', vendorsRoutes)
app.use('/api/jobs', jobsRoutes)
app.use('/api/profile', profileRoutes)
app.use('/api/connections', connectionsRoutes)
app.use('/api/messages', messagesRoutes)
app.use('/api/notifications', notificationsRoutes)

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.listen(PORT, () => {
  console.log(`Mavuus API running on http://localhost:${PORT}`)
})
