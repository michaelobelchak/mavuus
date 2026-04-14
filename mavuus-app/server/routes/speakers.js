import { Router } from 'express'

const router = Router()

// GET /api/speakers — list all speakers
router.get('/', (req, res) => {
  const db = req.app.locals.db
  const { search } = req.query

  let query = 'SELECT * FROM speakers'
  const params = []

  if (search) {
    query += ' WHERE name LIKE ? OR company LIKE ? OR title LIKE ?'
    const term = `%${search}%`
    params.push(term, term, term)
  }

  query += ' ORDER BY name ASC'
  const speakers = db.prepare(query).all(...params)
  res.json(speakers)
})

// GET /api/speakers/:id — single speaker with their sessions
router.get('/:id', (req, res) => {
  const db = req.app.locals.db
  const speaker = db.prepare('SELECT * FROM speakers WHERE id = ?').get(req.params.id)

  if (!speaker) {
    return res.status(404).json({ error: 'Speaker not found' })
  }

  const sessions = db.prepare(
    'SELECT * FROM sessions WHERE speaker_name = ? ORDER BY scheduled_date DESC'
  ).all(speaker.name)

  res.json({ ...speaker, sessions })
})

export default router
