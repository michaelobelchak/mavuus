import { Router } from 'express'

const router = Router()

// Global search across all entity types
router.get('/', (req, res) => {
  const { q } = req.query
  const db = req.app.locals.db

  if (!q || q.trim().length < 2) {
    return res.json({ sessions: [], resources: [], members: [], vendors: [], jobs: [] })
  }

  const term = `%${q.trim()}%`

  const sessions = db.prepare(
    `SELECT id, title, speaker_name, type, category, thumbnail_url FROM sessions
     WHERE title LIKE ? OR description LIKE ? OR speaker_name LIKE ?
     ORDER BY created_at DESC LIMIT 5`
  ).all(term, term, term)

  const resources = db.prepare(
    `SELECT id, title, author, category, type, thumbnail_url FROM resources
     WHERE title LIKE ? OR description LIKE ? OR author LIKE ?
     ORDER BY created_at DESC LIMIT 5`
  ).all(term, term, term)

  const members = db.prepare(
    `SELECT id, name, title, company, avatar_url FROM users
     WHERE name LIKE ? OR title LIKE ? OR company LIKE ?
     ORDER BY name LIMIT 5`
  ).all(term, term, term)

  const vendors = db.prepare(
    `SELECT id, company_name, description, categories, rating FROM vendors
     WHERE company_name LIKE ? OR description LIKE ?
     ORDER BY rating DESC LIMIT 5`
  ).all(term, term)

  const jobs = db.prepare(
    `SELECT id, title, company, location, type, salary_range FROM jobs
     WHERE title LIKE ? OR company LIKE ? OR description LIKE ?
     ORDER BY created_at DESC LIMIT 5`
  ).all(term, term, term)

  res.json({ sessions, resources, members, vendors, jobs })
})

export default router
