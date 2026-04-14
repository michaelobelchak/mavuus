import { Router } from 'express'

const router = Router()

// GET /api/categories?type=session
router.get('/categories', (req, res) => {
  const db = req.app.locals.db
  const { type } = req.query
  let query = 'SELECT * FROM categories WHERE is_active = 1'
  const params = []
  if (type) {
    query += ' AND type = ?'
    params.push(type)
  }
  query += ' ORDER BY sort_order ASC'
  const categories = db.prepare(query).all(...params)
  res.json(categories)
})

// GET /api/testimonials
router.get('/testimonials', (req, res) => {
  const db = req.app.locals.db
  const testimonials = db.prepare('SELECT * FROM testimonials WHERE is_active = 1 ORDER BY sort_order ASC').all()
  res.json(testimonials)
})

// GET /api/brand-logos
router.get('/brand-logos', (req, res) => {
  const db = req.app.locals.db
  const logos = db.prepare('SELECT * FROM brand_logos WHERE is_active = 1 ORDER BY sort_order ASC').all()
  res.json(logos)
})

// GET /api/faq?page=contact
router.get('/faq', (req, res) => {
  const db = req.app.locals.db
  const { page } = req.query
  let query = 'SELECT * FROM faq_items WHERE is_active = 1'
  const params = []
  if (page) {
    query += ' AND page = ?'
    params.push(page)
  }
  query += ' ORDER BY sort_order ASC'
  const items = db.prepare(query).all(...params)
  res.json(items)
})

// GET /api/site-content/:page
router.get('/site-content/:page', (req, res) => {
  const db = req.app.locals.db
  const rows = db.prepare('SELECT section, key, value, type FROM site_content WHERE page = ?').all(req.params.page)
  const content = {}
  rows.forEach(row => {
    if (!content[row.section]) content[row.section] = {}
    content[row.section][row.key] = row.value
  })
  res.json(content)
})

// GET /api/settings/public
router.get('/settings/public', (req, res) => {
  const db = req.app.locals.db
  const publicKeys = ['site_name', 'social_twitter', 'social_linkedin', 'social_instagram', 'support_email', 'membership_price_monthly', 'membership_price_yearly']
  const settings = db.prepare(`SELECT key, value FROM platform_settings WHERE key IN (${publicKeys.map(() => '?').join(',')})`).all(...publicKeys)
  const result = {}
  settings.forEach(s => { result[s.key] = s.value })
  res.json(result)
})

export default router
