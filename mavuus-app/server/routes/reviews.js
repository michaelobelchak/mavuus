import { Router } from 'express'
import { authenticateToken } from '../middleware/auth.js'

const router = Router()
router.use(authenticateToken)

// GET /api/reviews/user/:userId - Reviews received by a user
router.get('/user/:userId', (req, res) => {
  const db = req.app.locals.db
  const reviews = db.prepare(`
    SELECT r.*, u.name as reviewer_name, u.title as reviewer_title, u.avatar_url as reviewer_avatar,
           v.company_name as vendor_name
    FROM reviews r
    JOIN users u ON u.id = r.reviewer_id
    LEFT JOIN vendors v ON v.id = r.vendor_id
    WHERE r.reviewee_id = ?
    ORDER BY r.created_at DESC
  `).all(req.params.userId)
  res.json(reviews)
})

// GET /api/reviews/vendor/:vendorId - Reviews for a vendor
router.get('/vendor/:vendorId', (req, res) => {
  const db = req.app.locals.db
  const reviews = db.prepare(`
    SELECT r.*, u.name as reviewer_name, u.title as reviewer_title, u.avatar_url as reviewer_avatar
    FROM reviews r
    JOIN users u ON u.id = r.reviewer_id
    WHERE r.vendor_id = ?
    ORDER BY r.created_at DESC
  `).all(req.params.vendorId)
  res.json(reviews)
})

// POST /api/reviews - Create a review
router.post('/', (req, res) => {
  const db = req.app.locals.db
  const { reviewee_id, vendor_id, job_id, rating, text } = req.body

  if (!reviewee_id || !rating) {
    return res.status(400).json({ error: 'reviewee_id and rating are required' })
  }
  if (rating < 1 || rating > 5) {
    return res.status(400).json({ error: 'Rating must be between 1 and 5' })
  }
  if (reviewee_id === req.user.id) {
    return res.status(400).json({ error: 'Cannot review yourself' })
  }

  try {
    const result = db.prepare(
      'INSERT INTO reviews (reviewer_id, reviewee_id, vendor_id, job_id, rating, text) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(req.user.id, reviewee_id, vendor_id || null, job_id || null, rating, text || null)

    // Recalculate vendor rating if vendor_id provided
    if (vendor_id) {
      db.prepare(`
        UPDATE vendors SET
          rating = (SELECT ROUND(AVG(rating), 1) FROM reviews WHERE vendor_id = ?),
          reviews_count = (SELECT COUNT(*) FROM reviews WHERE vendor_id = ?)
        WHERE id = ?
      `).run(vendor_id, vendor_id, vendor_id)
    }

    res.status(201).json({ id: result.lastInsertRowid })
  } catch {
    res.status(409).json({ error: 'Review already exists for this combination' })
  }
})

// DELETE /api/reviews/:id - Delete own review
router.delete('/:id', (req, res) => {
  const db = req.app.locals.db
  const review = db.prepare('SELECT * FROM reviews WHERE id = ? AND reviewer_id = ?').get(req.params.id, req.user.id)
  if (!review) return res.status(404).json({ error: 'Review not found or not authorized' })

  db.prepare('DELETE FROM reviews WHERE id = ?').run(req.params.id)

  // Recalculate vendor rating if it was a vendor review
  if (review.vendor_id) {
    const stats = db.prepare('SELECT COUNT(*) as cnt, AVG(rating) as avg FROM reviews WHERE vendor_id = ?').get(review.vendor_id)
    db.prepare('UPDATE vendors SET rating = ?, reviews_count = ? WHERE id = ?')
      .run(stats.avg ? Math.round(stats.avg * 10) / 10 : 0, stats.cnt, review.vendor_id)
  }

  res.json({ success: true })
})

export default router
