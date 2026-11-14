import { Router } from 'express'
import { authenticateToken } from '../middleware/auth.js'
import { recalcVendorRating } from '../db/vendorReviews.js'

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

// POST /api/reviews - Create a review. A vendor review (vendor_id) is written to the vendor's
// owner account, whatever reviewee_id the body sends, and once per member and vendor.
router.post('/', (req, res) => {
  const db = req.app.locals.db
  const { vendor_id, job_id, rating, text } = req.body
  const userId = Number(req.user.id)
  let revieweeId = req.body.reviewee_id
  let vendorId = null

  if (vendor_id !== undefined && vendor_id !== null && vendor_id !== '') {
    vendorId = Number(vendor_id)
    const vendor = Number.isInteger(vendorId) ? db.prepare('SELECT id, user_id FROM vendors WHERE id = ?').get(vendorId) : null
    if (!vendor) return res.status(404).json({ error: 'Vendor not found' })
    if (!vendor.user_id) return res.status(400).json({ error: "This vendor can't be reviewed yet" })
    if (Number(vendor.user_id) === userId) return res.status(400).json({ error: "You can't review your own vendor" })
    revieweeId = vendor.user_id
  }

  if (!revieweeId || !rating) {
    return res.status(400).json({ error: 'reviewee_id and rating are required' })
  }
  const ratingNum = Number(rating)
  if (!Number.isInteger(ratingNum) || ratingNum < 1 || ratingNum > 5) {
    return res.status(400).json({ error: 'Rating must be between 1 and 5' })
  }
  if (Number(revieweeId) === userId) {
    return res.status(400).json({ error: 'Cannot review yourself' })
  }
  if (vendorId && db.prepare('SELECT 1 FROM reviews WHERE reviewer_id = ? AND vendor_id = ?').get(userId, vendorId)) {
    return res.status(409).json({ error: 'You already reviewed this vendor' })
  }

  try {
    const result = db.prepare(
      'INSERT INTO reviews (reviewer_id, reviewee_id, vendor_id, job_id, rating, text) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(userId, Number(revieweeId), vendorId, job_id || null, ratingNum, text || null)
    if (vendorId) recalcVendorRating(db, vendorId)
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
  if (review.vendor_id) recalcVendorRating(db, review.vendor_id)

  res.json({ success: true })
})

export default router
