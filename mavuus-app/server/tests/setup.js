import express from 'express'
import Database from 'better-sqlite3'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import cookieParser from 'cookie-parser'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { mkdirSync } from 'fs'

import { JWT_SECRET } from '../middleware/auth.js'
import { sanitizeBody } from '../middleware/sanitize.js'
import authRoutes from '../routes/auth.js'
import jobsRoutes from '../routes/jobs.js'
import profileRoutes from '../routes/profile.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Ensure uploads directories exist (some routes reference them)
mkdirSync(join(__dirname, '..', 'uploads', 'avatars'), { recursive: true })
mkdirSync(join(__dirname, '..', 'uploads', 'resumes'), { recursive: true })

export function createTestApp() {
  // In-memory database for test isolation
  const db = new Database(':memory:')
  db.pragma('journal_mode = WAL')
  db.pragma('foreign_keys = ON')

  // Run schema
  const schemaPath = join(__dirname, '..', 'db', 'schema.sql')
  const schema = readFileSync(schemaPath, 'utf-8')
  db.exec(schema)

  // Seed test data
  const hash1 = bcrypt.hashSync('Password1', 10)
  const hash2 = bcrypt.hashSync('Password2', 10)

  db.prepare(
    'INSERT INTO users (id, email, password_hash, name, title, company, email_verified) VALUES (?, ?, ?, ?, ?, ?, ?)'
  ).run(1, 'alice@test.com', hash1, 'Alice Test', 'Engineer', 'TestCo', 1)

  db.prepare(
    'INSERT INTO users (id, email, password_hash, name, title, company, email_verified) VALUES (?, ?, ?, ?, ?, ?, ?)'
  ).run(2, 'bob@test.com', hash2, 'Bob Test', 'Designer', 'DesignCo', 1)

  db.prepare(
    'INSERT INTO jobs (id, title, company, description, location, type, category, posted_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
  ).run(1, 'Test Job', 'TestCo', 'A test job description', 'Remote', 'full-time', 'engineering', 1)

  // Build Express app mirroring server/index.js
  const app = express()
  app.locals.db = db

  app.use(cookieParser())
  app.use(express.json({ limit: '1mb' }))
  app.use(sanitizeBody)

  app.use('/api/auth', authRoutes)
  app.use('/api/jobs', jobsRoutes)
  app.use('/api/profile', profileRoutes)

  return { app, db }
}

export function generateTestToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, name: user.name, avatar_url: null, membership_tier: 'pro', email_verified: 1 },
    JWT_SECRET,
    { expiresIn: '1h' }
  )
}
