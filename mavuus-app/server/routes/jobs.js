import { Router } from 'express'
import { authenticateToken } from '../middleware/auth.js'

const router = Router()

// Public: Get all jobs (no auth needed for browsing)
router.get('/', (req, res) => {
  const { type, category, posted_by, status } = req.query
  const db = req.app.locals.db

  let query = 'SELECT * FROM jobs'
  const conditions = []
  const params = []

  if (type) {
    conditions.push('type = ?')
    params.push(type)
  }
  if (category) {
    conditions.push('category = ?')
    params.push(category)
  }
  if (posted_by) {
    conditions.push('posted_by = ?')
    params.push(posted_by)
  }
  if (status) {
    conditions.push('status = ?')
    params.push(status)
  }

  if (conditions.length) {
    query += ' WHERE ' + conditions.join(' AND ')
  }

  query += ' ORDER BY created_at DESC'
  const jobs = db.prepare(query).all(...params)
  res.json(jobs)
})

// Public: Get jobs completed by a user (where user was hired)
router.get('/completed-by/:userId', (req, res) => {
  const db = req.app.locals.db
  const jobs = db.prepare(`
    SELECT j.*, u.name as poster_name, u.avatar_url as poster_avatar
    FROM jobs j
    LEFT JOIN users u ON u.id = j.posted_by
    WHERE j.hired_user_id = ? AND j.status = 'completed'
    ORDER BY j.created_at DESC
  `).all(req.params.userId)
  res.json(jobs)
})

// Auth: Get saved jobs
router.get('/saved', authenticateToken, (req, res) => {
  const db = req.app.locals.db
  const saved = db.prepare(`
    SELECT j.*, sj.saved_at FROM saved_jobs sj
    JOIN jobs j ON j.id = sj.job_id
    WHERE sj.user_id = ?
    ORDER BY sj.saved_at DESC
  `).all(req.user.id)
  res.json(saved)
})

// Auth: Get my applications
router.get('/my-applications', authenticateToken, (req, res) => {
  const db = req.app.locals.db
  const applications = db.prepare(`
    SELECT ja.*, j.title as job_title, j.company as job_company, j.location as job_location, j.type as job_type
    FROM job_applications ja
    JOIN jobs j ON j.id = ja.job_id
    WHERE ja.user_id = ?
    ORDER BY ja.applied_at DESC
  `).all(req.user.id)
  res.json(applications)
})

// Auth: Get jobs I posted
router.get('/my-postings', authenticateToken, (req, res) => {
  const db = req.app.locals.db
  const postings = db.prepare(`
    SELECT j.*,
      (SELECT COUNT(*) FROM job_applications WHERE job_id = j.id) as applicant_count
    FROM jobs j WHERE j.posted_by = ?
    ORDER BY j.created_at DESC
  `).all(req.user.id)
  res.json(postings)
})

// Public: Get single job
router.get('/:id', (req, res) => {
  const db = req.app.locals.db
  const job = db.prepare(`
    SELECT j.*, u.name as poster_name, u.title as poster_title, u.avatar_url as poster_avatar,
           h.name as hired_name, h.avatar_url as hired_avatar
    FROM jobs j
    LEFT JOIN users u ON u.id = j.posted_by
    LEFT JOIN users h ON h.id = j.hired_user_id
    WHERE j.id = ?
  `).get(req.params.id)

  if (!job) return res.status(404).json({ error: 'Job not found' })
  res.json(job)
})

// Auth: Create a job
router.post('/', authenticateToken, (req, res) => {
  const db = req.app.locals.db
  const { title, company, description, location, type, category, salary_range } = req.body
  if (!title || !company) return res.status(400).json({ error: 'Title and company are required' })

  const result = db.prepare(
    'INSERT INTO jobs (title, company, description, location, type, category, salary_range, posted_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
  ).run(title, company, description || null, location || null, type || null, category || null, salary_range || null, req.user.id)

  res.status(201).json({ id: result.lastInsertRowid })
})

// Auth: Update a job I posted
router.put('/:id', authenticateToken, (req, res) => {
  const db = req.app.locals.db
  const existing = db.prepare('SELECT * FROM jobs WHERE id = ? AND posted_by = ?').get(req.params.id, req.user.id)
  if (!existing) return res.status(404).json({ error: 'Job not found or not authorized' })

  const { title, company, description, location, type, category, salary_range, status, hired_user_id } = req.body
  db.prepare('UPDATE jobs SET title = ?, company = ?, description = ?, location = ?, type = ?, category = ?, salary_range = ?, status = ?, hired_user_id = ? WHERE id = ?')
    .run(title || existing.title, company || existing.company, description ?? existing.description, location ?? existing.location, type ?? existing.type, category ?? existing.category, salary_range ?? existing.salary_range, status ?? existing.status, hired_user_id !== undefined ? hired_user_id : existing.hired_user_id, req.params.id)

  res.json({ success: true })
})

// Auth: Delete a job I posted
router.delete('/:id', authenticateToken, (req, res) => {
  const db = req.app.locals.db
  db.prepare('DELETE FROM jobs WHERE id = ? AND posted_by = ?').run(req.params.id, req.user.id)
  res.json({ success: true })
})

// Auth: Apply to a job
router.post('/:id/apply', authenticateToken, (req, res) => {
  const db = req.app.locals.db
  const { cover_letter } = req.body

  const job = db.prepare('SELECT * FROM jobs WHERE id = ?').get(req.params.id)
  if (!job) return res.status(404).json({ error: 'Job not found' })

  try {
    db.prepare('INSERT INTO job_applications (job_id, user_id, cover_letter) VALUES (?, ?, ?)').run(req.params.id, req.user.id, cover_letter || null)

    // Notify job poster
    if (job.posted_by) {
      db.prepare('INSERT INTO notifications (user_id, type, title, message, link) VALUES (?, ?, ?, ?, ?)')
        .run(job.posted_by, 'job', 'New Application', `${req.user.name} applied for ${job.title}`, `/dashboard/my-jobs`)
    }

    res.status(201).json({ success: true })
  } catch {
    res.status(409).json({ error: 'Already applied to this job' })
  }
})

// Auth: Get applicants for my job
router.get('/:id/applicants', authenticateToken, (req, res) => {
  const db = req.app.locals.db
  const job = db.prepare('SELECT * FROM jobs WHERE id = ? AND posted_by = ?').get(req.params.id, req.user.id)
  if (!job) return res.status(404).json({ error: 'Job not found or not authorized' })

  const applicants = db.prepare(`
    SELECT ja.*, u.name, u.title as user_title, u.company as user_company, u.avatar_url, u.email
    FROM job_applications ja
    JOIN users u ON u.id = ja.user_id
    WHERE ja.job_id = ?
    ORDER BY ja.applied_at DESC
  `).all(req.params.id)

  res.json(applicants)
})

// Auth: Update application status
router.put('/applications/:id/status', authenticateToken, (req, res) => {
  const db = req.app.locals.db
  const { status } = req.body
  const validStatuses = ['applied', 'reviewing', 'interview', 'offer', 'rejected', 'hired']
  if (!validStatuses.includes(status)) return res.status(400).json({ error: 'Invalid status' })

  const app = db.prepare(`
    SELECT ja.*, j.posted_by, j.title as job_title, j.id as the_job_id FROM job_applications ja
    JOIN jobs j ON j.id = ja.job_id WHERE ja.id = ?
  `).get(req.params.id)
  if (!app || app.posted_by !== req.user.id) return res.status(404).json({ error: 'Application not found or not authorized' })

  db.prepare('UPDATE job_applications SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(status, req.params.id)

  // When hired, set job to in-progress and hired_user_id
  if (status === 'hired') {
    db.prepare('UPDATE jobs SET status = ?, hired_user_id = ? WHERE id = ?')
      .run('in-progress', app.user_id, app.the_job_id)
  }

  // Notify applicant
  db.prepare('INSERT INTO notifications (user_id, type, title, message, link) VALUES (?, ?, ?, ?, ?)')
    .run(app.user_id, 'job', 'Application Update', `Your application for ${app.job_title} status changed to ${status}`, `/dashboard/my-jobs`)

  res.json({ success: true })
})

// Auth: Save a job
router.post('/:id/save', authenticateToken, (req, res) => {
  const db = req.app.locals.db
  try {
    db.prepare('INSERT INTO saved_jobs (user_id, job_id) VALUES (?, ?)').run(req.user.id, req.params.id)
    res.status(201).json({ success: true })
  } catch {
    res.status(409).json({ error: 'Job already saved' })
  }
})

// Auth: Unsave a job
router.delete('/:id/save', authenticateToken, (req, res) => {
  const db = req.app.locals.db
  db.prepare('DELETE FROM saved_jobs WHERE user_id = ? AND job_id = ?').run(req.user.id, req.params.id)
  res.json({ success: true })
})

export default router
