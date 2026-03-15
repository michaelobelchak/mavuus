import { Router } from 'express'
import crypto from 'crypto'
import { authenticateToken } from '../middleware/auth.js'

const router = Router()

// GET /api/referrals/my-code — get or auto-generate referral code
router.get('/my-code', authenticateToken, (req, res) => {
  const db = req.app.locals.db

  let row = db.prepare('SELECT code FROM referral_codes WHERE user_id = ?').get(req.user.id)
  if (!row) {
    const code = crypto.randomBytes(4).toString('hex').toUpperCase()
    db.prepare('INSERT INTO referral_codes (user_id, code) VALUES (?, ?)').run(req.user.id, code)
    row = { code }
  }

  res.json({ code: row.code })
})

// GET /api/referrals/stats — referral count + list
router.get('/stats', authenticateToken, (req, res) => {
  const db = req.app.locals.db

  const referrals = db.prepare(`
    SELECT u.id, u.name, u.title, u.company, u.avatar_url, rt.created_at
    FROM referral_tracking rt
    JOIN users u ON u.id = rt.referred_user_id
    WHERE rt.referrer_id = ?
    ORDER BY rt.created_at DESC
  `).all(req.user.id)

  res.json({ count: referrals.length, referrals })
})

export default router
