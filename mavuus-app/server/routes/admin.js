import { Router } from 'express'
import { authenticateToken } from '../middleware/auth.js'
import { isAdmin, logAudit } from '../middleware/admin.js'

const router = Router()
router.use(authenticateToken, isAdmin)

// ─── DASHBOARD ───────────────────────────────────────────
router.get('/stats', (req, res) => {
  const db = req.app.locals.db
  const now = new Date()
  const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000).toISOString()
  const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

  res.json({
    totalUsers: db.prepare('SELECT COUNT(*) as c FROM users WHERE is_deleted = 0').get().c,
    activeUsersLast30Days: db.prepare('SELECT COUNT(*) as c FROM users WHERE last_login_at > ? AND is_deleted = 0').get(thirtyDaysAgo).c,
    newUsersThisWeek: db.prepare('SELECT COUNT(*) as c FROM users WHERE created_at > ?').get(weekAgo).c,
    newUsersThisMonth: db.prepare('SELECT COUNT(*) as c FROM users WHERE created_at > ?').get(monthStart).c,
    totalJobs: db.prepare('SELECT COUNT(*) as c FROM jobs').get().c,
    activeJobs: db.prepare("SELECT COUNT(*) as c FROM jobs WHERE status = 'open'").get().c,
    totalSessions: db.prepare('SELECT COUNT(*) as c FROM sessions').get().c,
    totalResources: db.prepare('SELECT COUNT(*) as c FROM resources').get().c,
    totalVendors: db.prepare('SELECT COUNT(*) as c FROM vendors').get().c,
    totalMessages: db.prepare('SELECT COUNT(*) as c FROM messages').get().c,
    totalConnections: db.prepare("SELECT COUNT(*) as c FROM connections WHERE status = 'accepted'").get().c,
    totalComments: db.prepare('SELECT COUNT(*) as c FROM comments').get().c,
    totalReviews: db.prepare('SELECT COUNT(*) as c FROM reviews').get().c,
    totalRecommendations: db.prepare('SELECT COUNT(*) as c FROM recommendations').get().c,
    totalReferrals: db.prepare('SELECT COUNT(*) as c FROM referral_tracking').get().c,
    pendingContactSubmissions: db.prepare("SELECT COUNT(*) as c FROM contact_submissions WHERE status = 'new'").get().c,
  })
})

router.get('/stats/growth', (req, res) => {
  const db = req.app.locals.db
  const weeks = []
  for (let i = 11; i >= 0; i--) {
    const start = new Date(Date.now() - (i + 1) * 7 * 24 * 60 * 60 * 1000).toISOString()
    const end = new Date(Date.now() - i * 7 * 24 * 60 * 60 * 1000).toISOString()
    const count = db.prepare('SELECT COUNT(*) as c FROM users WHERE created_at BETWEEN ? AND ?').get(start, end).c
    weeks.push({ week: 12 - i, start: start.split('T')[0], count })
  }
  res.json(weeks)
})

router.get('/stats/activity', (req, res) => {
  const db = req.app.locals.db
  const activities = []

  const newUsers = db.prepare('SELECT name, created_at FROM users ORDER BY created_at DESC LIMIT 5').all()
  newUsers.forEach(u => activities.push({ type: 'user', user_name: u.name, description: 'joined the platform', created_at: u.created_at }))

  const newJobs = db.prepare('SELECT j.title, u.name, j.created_at FROM jobs j JOIN users u ON u.id = j.posted_by ORDER BY j.created_at DESC LIMIT 5').all()
  newJobs.forEach(j => activities.push({ type: 'job', user_name: j.name, description: `posted "${j.title}"`, created_at: j.created_at }))

  const newReviews = db.prepare('SELECT u.name, r.created_at FROM reviews r JOIN users u ON u.id = r.reviewer_id ORDER BY r.created_at DESC LIMIT 5').all()
  newReviews.forEach(r => activities.push({ type: 'review', user_name: r.name, description: 'wrote a review', created_at: r.created_at }))

  const newConnections = db.prepare("SELECT u.name, c.created_at FROM connections c JOIN users u ON u.id = c.requester_id WHERE c.status = 'accepted' ORDER BY c.created_at DESC LIMIT 5").all()
  newConnections.forEach(c => activities.push({ type: 'connection', user_name: c.name, description: 'made a connection', created_at: c.created_at }))

  activities.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  res.json(activities.slice(0, 20))
})

// ─── USERS ───────────────────────────────────────────────
router.get('/users', (req, res) => {
  const db = req.app.locals.db
  const { search, role, tier, status, sort = 'newest', page = 1, limit = 20 } = req.query
  const conditions = []
  const params = []

  if (search) { conditions.push('(u.name LIKE ? OR u.email LIKE ?)'); const t = `%${search}%`; params.push(t, t) }
  if (role) { conditions.push('u.role = ?'); params.push(role) }
  if (tier) { conditions.push('u.membership_tier = ?'); params.push(tier) }
  if (status === 'active') conditions.push('u.is_banned = 0 AND u.is_deleted = 0')
  if (status === 'banned') conditions.push('u.is_banned = 1')
  if (status === 'deleted') conditions.push('u.is_deleted = 1')

  const where = conditions.length ? ' WHERE ' + conditions.join(' AND ') : ''
  const orderMap = { newest: 'u.created_at DESC', oldest: 'u.created_at ASC', name: 'u.name ASC' }
  const order = orderMap[sort] || 'u.created_at DESC'

  const total = db.prepare(`SELECT COUNT(*) as c FROM users u${where}`).get(...params).c
  const pageNum = Math.max(1, parseInt(page))
  const limitNum = Math.min(100, Math.max(1, parseInt(limit)))
  const offset = (pageNum - 1) * limitNum

  const data = db.prepare(`SELECT u.id, u.name, u.email, u.avatar_url, u.role, u.membership_tier, u.is_banned, u.is_deleted, u.created_at, u.last_login_at FROM users u${where} ORDER BY ${order} LIMIT ? OFFSET ?`).all(...params, limitNum, offset)
  res.json({ data, total, page: pageNum, totalPages: Math.ceil(total / limitNum), limit: limitNum })
})

router.get('/users/:id', (req, res) => {
  const db = req.app.locals.db
  const user = db.prepare('SELECT u.*, up.bio, up.industry, up.years_experience, up.linkedin_url, up.website_url, up.location, up.timezone, up.resume_url, up.profile_visibility FROM users u LEFT JOIN user_profiles up ON up.user_id = u.id WHERE u.id = ?').get(req.params.id)
  if (!user) return res.status(404).json({ error: 'User not found' })

  const skills = db.prepare('SELECT skill FROM user_skills WHERE user_id = ?').all(req.params.id).map(s => s.skill)
  const experience = db.prepare('SELECT * FROM user_experience WHERE user_id = ? ORDER BY is_current DESC, start_date DESC').all(req.params.id)
  const connections = db.prepare(`SELECT c.*, u1.name as requester_name, u2.name as receiver_name FROM connections c JOIN users u1 ON u1.id = c.requester_id JOIN users u2 ON u2.id = c.receiver_id WHERE c.requester_id = ? OR c.receiver_id = ?`).all(req.params.id, req.params.id)
  const jobsPosted = db.prepare('SELECT j.*, (SELECT COUNT(*) FROM job_applications WHERE job_id = j.id) as applicant_count FROM jobs j WHERE j.posted_by = ?').all(req.params.id)
  const jobApplications = db.prepare('SELECT ja.*, j.title as job_title, j.company FROM job_applications ja JOIN jobs j ON j.id = ja.job_id WHERE ja.user_id = ?').all(req.params.id)
  const reviewsGiven = db.prepare('SELECT r.*, v.company_name as vendor_name FROM reviews r LEFT JOIN vendors v ON v.id = r.vendor_id WHERE r.reviewer_id = ?').all(req.params.id)
  const comments = db.prepare('SELECT * FROM comments WHERE user_id = ? ORDER BY created_at DESC LIMIT 20').all(req.params.id)
  const recommendations = db.prepare('SELECT rec.*, v.company_name as vendor_name FROM recommendations rec LEFT JOIN vendors v ON v.id = rec.vendor_id WHERE rec.from_user_id = ?').all(req.params.id)
  const referralCode = db.prepare('SELECT code FROM referral_codes WHERE user_id = ?').get(req.params.id)
  const referrals = db.prepare('SELECT u.name, u.avatar_url, rt.created_at FROM referral_tracking rt JOIN users u ON u.id = rt.referred_user_id WHERE rt.referrer_id = ?').all(req.params.id)
  const referredBy = db.prepare('SELECT u.name FROM referral_tracking rt JOIN users u ON u.id = rt.referrer_id WHERE rt.referred_user_id = ?').get(req.params.id)

  delete user.password_hash
  res.json({ ...user, skills, experience, connections, jobsPosted, jobApplications, reviewsGiven, comments, recommendations, referralCode: referralCode?.code, referrals, referredBy: referredBy?.name })
})

router.put('/users/:id', (req, res) => {
  const db = req.app.locals.db
  const { role, membership_tier, email_verified } = req.body
  if (role) db.prepare('UPDATE users SET role = ? WHERE id = ?').run(role, req.params.id)
  if (membership_tier) db.prepare('UPDATE users SET membership_tier = ? WHERE id = ?').run(membership_tier, req.params.id)
  if (email_verified !== undefined) db.prepare('UPDATE users SET email_verified = ? WHERE id = ?').run(email_verified ? 1 : 0, req.params.id)
  logAudit(db, req.user.id, 'update_user', 'user', parseInt(req.params.id), req.body, req.ip)
  res.json({ success: true })
})

router.put('/users/:id/ban', (req, res) => {
  const db = req.app.locals.db
  const { reason } = req.body
  db.prepare('UPDATE users SET is_banned = 1, ban_reason = ?, banned_at = CURRENT_TIMESTAMP WHERE id = ?').run(reason || null, req.params.id)
  logAudit(db, req.user.id, 'ban_user', 'user', parseInt(req.params.id), { reason }, req.ip)
  res.json({ success: true })
})

router.put('/users/:id/unban', (req, res) => {
  const db = req.app.locals.db
  db.prepare('UPDATE users SET is_banned = 0, ban_reason = NULL, banned_at = NULL WHERE id = ?').run(req.params.id)
  logAudit(db, req.user.id, 'unban_user', 'user', parseInt(req.params.id), null, req.ip)
  res.json({ success: true })
})

router.delete('/users/:id/soft', (req, res) => {
  const db = req.app.locals.db
  db.prepare('UPDATE users SET is_deleted = 1, deleted_at = CURRENT_TIMESTAMP WHERE id = ?').run(req.params.id)
  logAudit(db, req.user.id, 'soft_delete_user', 'user', parseInt(req.params.id), null, req.ip)
  res.json({ success: true })
})

router.put('/users/:id/restore', (req, res) => {
  const db = req.app.locals.db
  db.prepare('UPDATE users SET is_deleted = 0, deleted_at = NULL WHERE id = ?').run(req.params.id)
  logAudit(db, req.user.id, 'restore_user', 'user', parseInt(req.params.id), null, req.ip)
  res.json({ success: true })
})

router.delete('/users/:id/permanent', (req, res) => {
  const db = req.app.locals.db
  const { confirmation } = req.body
  if (confirmation !== 'DELETE') return res.status(400).json({ error: 'Type DELETE to confirm' })
  db.prepare('DELETE FROM users WHERE id = ?').run(req.params.id)
  logAudit(db, req.user.id, 'permanent_delete_user', 'user', parseInt(req.params.id), null, req.ip)
  res.json({ success: true })
})

// ─── SESSIONS ────────────────────────────────────────────
router.get('/sessions', (req, res) => {
  const db = req.app.locals.db
  const { search, type, category, page = 1, limit = 20 } = req.query
  const conditions = []; const params = []
  if (search) { conditions.push('(title LIKE ? OR speaker_name LIKE ?)'); const t = `%${search}%`; params.push(t, t) }
  if (type) { conditions.push('type = ?'); params.push(type) }
  if (category) { conditions.push('category = ?'); params.push(category) }
  const where = conditions.length ? ' WHERE ' + conditions.join(' AND ') : ''
  const total = db.prepare(`SELECT COUNT(*) as c FROM sessions${where}`).get(...params).c
  const pageNum = Math.max(1, parseInt(page)); const limitNum = Math.min(100, Math.max(1, parseInt(limit)))
  const data = db.prepare(`SELECT * FROM sessions${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`).all(...params, limitNum, (pageNum - 1) * limitNum)
  res.json({ data, total, page: pageNum, totalPages: Math.ceil(total / limitNum), limit: limitNum })
})

router.post('/sessions', (req, res) => {
  const db = req.app.locals.db
  const { title, description, speaker_name, speaker_title, speaker_avatar, thumbnail_url, type, category, scheduled_date, duration, video_url, status } = req.body
  if (!title || !speaker_name || !type) return res.status(400).json({ error: 'Title, speaker, and type required' })
  const result = db.prepare('INSERT INTO sessions (title, description, speaker_name, speaker_title, speaker_avatar, thumbnail_url, type, category, scheduled_date, duration, video_url, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').run(title, description, speaker_name, speaker_title, speaker_avatar, thumbnail_url, type, category, scheduled_date, duration, video_url, status || 'published')
  logAudit(db, req.user.id, 'create_session', 'session', result.lastInsertRowid, { title }, req.ip)
  res.status(201).json(db.prepare('SELECT * FROM sessions WHERE id = ?').get(result.lastInsertRowid))
})

router.put('/sessions/:id', (req, res) => {
  const db = req.app.locals.db
  const fields = ['title', 'description', 'speaker_name', 'speaker_title', 'speaker_avatar', 'thumbnail_url', 'type', 'category', 'scheduled_date', 'duration', 'video_url', 'status']
  const updates = []; const params = []
  fields.forEach(f => { if (req.body[f] !== undefined) { updates.push(`${f} = ?`); params.push(req.body[f]) } })
  if (updates.length) { params.push(req.params.id); db.prepare(`UPDATE sessions SET ${updates.join(', ')} WHERE id = ?`).run(...params) }
  logAudit(db, req.user.id, 'update_session', 'session', parseInt(req.params.id), req.body, req.ip)
  res.json(db.prepare('SELECT * FROM sessions WHERE id = ?').get(req.params.id))
})

router.delete('/sessions/:id', (req, res) => {
  const db = req.app.locals.db
  db.prepare("DELETE FROM comments WHERE entity_type = 'session' AND entity_id = ?").run(req.params.id)
  db.prepare('DELETE FROM sessions WHERE id = ?').run(req.params.id)
  logAudit(db, req.user.id, 'delete_session', 'session', parseInt(req.params.id), null, req.ip)
  res.json({ success: true })
})

// ─── RESOURCES ───────────────────────────────────────────
router.get('/resources', (req, res) => {
  const db = req.app.locals.db
  const { search, type, category, page = 1, limit = 20 } = req.query
  const conditions = []; const params = []
  if (search) { conditions.push('(title LIKE ? OR author LIKE ?)'); const t = `%${search}%`; params.push(t, t) }
  if (type) { conditions.push('type = ?'); params.push(type) }
  if (category) { conditions.push('category = ?'); params.push(category) }
  const where = conditions.length ? ' WHERE ' + conditions.join(' AND ') : ''
  const total = db.prepare(`SELECT COUNT(*) as c FROM resources${where}`).get(...params).c
  const pageNum = Math.max(1, parseInt(page)); const limitNum = Math.min(100, Math.max(1, parseInt(limit)))
  const data = db.prepare(`SELECT r.*, (SELECT COUNT(*) FROM bookmarks WHERE resource_id = r.id) as bookmark_count FROM resources r${where} ORDER BY r.created_at DESC LIMIT ? OFFSET ?`).all(...params, limitNum, (pageNum - 1) * limitNum)
  res.json({ data, total, page: pageNum, totalPages: Math.ceil(total / limitNum), limit: limitNum })
})

router.post('/resources', (req, res) => {
  const db = req.app.locals.db
  const { title, description, content, author, thumbnail_url, category, type, read_time, url, status } = req.body
  if (!title) return res.status(400).json({ error: 'Title required' })
  const result = db.prepare('INSERT INTO resources (title, description, content, author, thumbnail_url, category, type, read_time, url, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').run(title, description, content, author, thumbnail_url, category, type, read_time, url, status || 'published')
  logAudit(db, req.user.id, 'create_resource', 'resource', result.lastInsertRowid, { title }, req.ip)
  res.status(201).json(db.prepare('SELECT * FROM resources WHERE id = ?').get(result.lastInsertRowid))
})

router.put('/resources/:id', (req, res) => {
  const db = req.app.locals.db
  const fields = ['title', 'description', 'content', 'author', 'thumbnail_url', 'category', 'type', 'read_time', 'url', 'status']
  const updates = []; const params = []
  fields.forEach(f => { if (req.body[f] !== undefined) { updates.push(`${f} = ?`); params.push(req.body[f]) } })
  if (updates.length) { params.push(req.params.id); db.prepare(`UPDATE resources SET ${updates.join(', ')} WHERE id = ?`).run(...params) }
  logAudit(db, req.user.id, 'update_resource', 'resource', parseInt(req.params.id), req.body, req.ip)
  res.json(db.prepare('SELECT * FROM resources WHERE id = ?').get(req.params.id))
})

router.delete('/resources/:id', (req, res) => {
  const db = req.app.locals.db
  db.prepare('DELETE FROM bookmarks WHERE resource_id = ?').run(req.params.id)
  db.prepare("DELETE FROM comments WHERE entity_type = 'resource' AND entity_id = ?").run(req.params.id)
  db.prepare('DELETE FROM resources WHERE id = ?').run(req.params.id)
  logAudit(db, req.user.id, 'delete_resource', 'resource', parseInt(req.params.id), null, req.ip)
  res.json({ success: true })
})

// ─── SPEAKERS ────────────────────────────────────────────
router.get('/speakers', (req, res) => {
  const db = req.app.locals.db
  const { search, page = 1, limit = 20 } = req.query
  let where = ''; const params = []
  if (search) { where = ' WHERE name LIKE ? OR company LIKE ?'; const t = `%${search}%`; params.push(t, t) }
  const total = db.prepare(`SELECT COUNT(*) as c FROM speakers${where}`).get(...params).c
  const pageNum = Math.max(1, parseInt(page)); const limitNum = Math.min(100, Math.max(1, parseInt(limit)))
  const data = db.prepare(`SELECT s.*, (SELECT COUNT(*) FROM sessions WHERE speaker_name = s.name) as session_count FROM speakers s${where} ORDER BY s.name ASC LIMIT ? OFFSET ?`).all(...params, limitNum, (pageNum - 1) * limitNum)
  res.json({ data, total, page: pageNum, totalPages: Math.ceil(total / limitNum), limit: limitNum })
})

router.post('/speakers', (req, res) => {
  const db = req.app.locals.db
  const { name, title, company, avatar_url, bio, linkedin_url } = req.body
  if (!name) return res.status(400).json({ error: 'Name required' })
  const result = db.prepare('INSERT INTO speakers (name, title, company, avatar_url, bio, linkedin_url) VALUES (?, ?, ?, ?, ?, ?)').run(name, title, company, avatar_url, bio, linkedin_url)
  logAudit(db, req.user.id, 'create_speaker', 'speaker', result.lastInsertRowid, { name }, req.ip)
  res.status(201).json(db.prepare('SELECT * FROM speakers WHERE id = ?').get(result.lastInsertRowid))
})

router.put('/speakers/:id', (req, res) => {
  const db = req.app.locals.db
  const fields = ['name', 'title', 'company', 'avatar_url', 'bio', 'linkedin_url']
  const updates = []; const params = []
  fields.forEach(f => { if (req.body[f] !== undefined) { updates.push(`${f} = ?`); params.push(req.body[f]) } })
  if (updates.length) { params.push(req.params.id); db.prepare(`UPDATE speakers SET ${updates.join(', ')} WHERE id = ?`).run(...params) }
  logAudit(db, req.user.id, 'update_speaker', 'speaker', parseInt(req.params.id), req.body, req.ip)
  res.json(db.prepare('SELECT * FROM speakers WHERE id = ?').get(req.params.id))
})

router.delete('/speakers/:id', (req, res) => {
  const db = req.app.locals.db
  db.prepare('DELETE FROM speakers WHERE id = ?').run(req.params.id)
  logAudit(db, req.user.id, 'delete_speaker', 'speaker', parseInt(req.params.id), null, req.ip)
  res.json({ success: true })
})

// ─── VENDORS ─────────────────────────────────────────────
router.get('/vendors', (req, res) => {
  const db = req.app.locals.db
  const { search, category, status, sort = 'newest', page = 1, limit = 20 } = req.query
  const conditions = []; const params = []
  if (search) { conditions.push('company_name LIKE ?'); params.push(`%${search}%`) }
  if (category) { conditions.push('categories LIKE ?'); params.push(`%${category}%`) }
  if (status) { conditions.push('moderation_status = ?'); params.push(status) }
  const where = conditions.length ? ' WHERE ' + conditions.join(' AND ') : ''
  const orderMap = { newest: 'created_at DESC', rating: 'rating DESC', reviews: 'reviews_count DESC' }
  const total = db.prepare(`SELECT COUNT(*) as c FROM vendors${where}`).get(...params).c
  const pageNum = Math.max(1, parseInt(page)); const limitNum = Math.min(100, Math.max(1, parseInt(limit)))
  const data = db.prepare(`SELECT * FROM vendors${where} ORDER BY ${orderMap[sort] || 'created_at DESC'} LIMIT ? OFFSET ?`).all(...params, limitNum, (pageNum - 1) * limitNum)
  res.json({ data, total, page: pageNum, totalPages: Math.ceil(total / limitNum), limit: limitNum })
})

router.put('/vendors/:id', (req, res) => {
  const db = req.app.locals.db
  const fields = ['company_name', 'description', 'categories', 'location', 'website', 'moderation_status', 'admin_notes']
  const updates = []; const params = []
  fields.forEach(f => { if (req.body[f] !== undefined) { updates.push(`${f} = ?`); params.push(req.body[f]) } })
  if (updates.length) { params.push(req.params.id); db.prepare(`UPDATE vendors SET ${updates.join(', ')} WHERE id = ?`).run(...params) }
  logAudit(db, req.user.id, 'update_vendor', 'vendor', parseInt(req.params.id), req.body, req.ip)
  res.json(db.prepare('SELECT * FROM vendors WHERE id = ?').get(req.params.id))
})

router.delete('/vendors/:id', (req, res) => {
  const db = req.app.locals.db
  db.prepare('DELETE FROM reviews WHERE vendor_id = ?').run(req.params.id)
  db.prepare('DELETE FROM recommendations WHERE vendor_id = ?').run(req.params.id)
  db.prepare("DELETE FROM comments WHERE entity_type = 'vendor' AND entity_id = ?").run(req.params.id)
  db.prepare('DELETE FROM vendors WHERE id = ?').run(req.params.id)
  logAudit(db, req.user.id, 'delete_vendor', 'vendor', parseInt(req.params.id), null, req.ip)
  res.json({ success: true })
})

// ─── JOBS ────────────────────────────────────────────────
router.get('/jobs', (req, res) => {
  const db = req.app.locals.db
  const { search, type, status, moderation_status, page = 1, limit = 20 } = req.query
  const conditions = []; const params = []
  if (search) { conditions.push('(j.title LIKE ? OR j.company LIKE ?)'); const t = `%${search}%`; params.push(t, t) }
  if (type) { conditions.push('j.type = ?'); params.push(type) }
  if (status) { conditions.push('j.status = ?'); params.push(status) }
  if (moderation_status) { conditions.push('j.moderation_status = ?'); params.push(moderation_status) }
  const where = conditions.length ? ' WHERE ' + conditions.join(' AND ') : ''
  const total = db.prepare(`SELECT COUNT(*) as c FROM jobs j${where}`).get(...params).c
  const pageNum = Math.max(1, parseInt(page)); const limitNum = Math.min(100, Math.max(1, parseInt(limit)))
  const data = db.prepare(`SELECT j.*, u.name as poster_name, (SELECT COUNT(*) FROM job_applications WHERE job_id = j.id) as applicant_count FROM jobs j LEFT JOIN users u ON u.id = j.posted_by${where} ORDER BY j.created_at DESC LIMIT ? OFFSET ?`).all(...params, limitNum, (pageNum - 1) * limitNum)
  res.json({ data, total, page: pageNum, totalPages: Math.ceil(total / limitNum), limit: limitNum })
})

router.get('/jobs/:id/applications', (req, res) => {
  const db = req.app.locals.db
  const apps = db.prepare('SELECT ja.*, u.name, u.email, u.avatar_url, u.title as user_title FROM job_applications ja JOIN users u ON u.id = ja.user_id WHERE ja.job_id = ? ORDER BY ja.applied_at DESC').all(req.params.id)
  res.json(apps)
})

router.put('/jobs/:id', (req, res) => {
  const db = req.app.locals.db
  const { moderation_status, admin_notes, status } = req.body
  const updates = []; const params = []
  if (moderation_status) { updates.push('moderation_status = ?'); params.push(moderation_status) }
  if (admin_notes !== undefined) { updates.push('admin_notes = ?'); params.push(admin_notes) }
  if (status) { updates.push('status = ?'); params.push(status) }
  if (updates.length) { params.push(req.params.id); db.prepare(`UPDATE jobs SET ${updates.join(', ')} WHERE id = ?`).run(...params) }
  logAudit(db, req.user.id, 'update_job', 'job', parseInt(req.params.id), req.body, req.ip)
  res.json({ success: true })
})

router.put('/jobs/:id/applications/:appId', (req, res) => {
  const db = req.app.locals.db
  const { status } = req.body
  db.prepare('UPDATE job_applications SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(status, req.params.appId)
  logAudit(db, req.user.id, 'update_application_status', 'job_application', parseInt(req.params.appId), { status }, req.ip)
  res.json({ success: true })
})

router.delete('/jobs/:id', (req, res) => {
  const db = req.app.locals.db
  db.prepare('DELETE FROM job_applications WHERE job_id = ?').run(req.params.id)
  db.prepare('DELETE FROM jobs WHERE id = ?').run(req.params.id)
  logAudit(db, req.user.id, 'delete_job', 'job', parseInt(req.params.id), null, req.ip)
  res.json({ success: true })
})

// ─── COMMENTS ────────────────────────────────────────────
router.get('/comments', (req, res) => {
  const db = req.app.locals.db
  const { search, entity_type, page = 1, limit = 20 } = req.query
  const conditions = []; const params = []
  if (search) { conditions.push('c.content LIKE ?'); params.push(`%${search}%`) }
  if (entity_type) { conditions.push('c.entity_type = ?'); params.push(entity_type) }
  const where = conditions.length ? ' WHERE ' + conditions.join(' AND ') : ''
  const total = db.prepare(`SELECT COUNT(*) as c FROM comments c${where}`).get(...params).c
  const pageNum = Math.max(1, parseInt(page)); const limitNum = Math.min(100, Math.max(1, parseInt(limit)))
  const data = db.prepare(`SELECT c.*, u.name as user_name, u.avatar_url FROM comments c JOIN users u ON u.id = c.user_id${where} ORDER BY c.created_at DESC LIMIT ? OFFSET ?`).all(...params, limitNum, (pageNum - 1) * limitNum)
  res.json({ data, total, page: pageNum, totalPages: Math.ceil(total / limitNum), limit: limitNum })
})

router.delete('/comments/:id', (req, res) => {
  const db = req.app.locals.db
  db.prepare('DELETE FROM comments WHERE id = ?').run(req.params.id)
  logAudit(db, req.user.id, 'delete_comment', 'comment', parseInt(req.params.id), null, req.ip)
  res.json({ success: true })
})

// ─── REVIEWS ─────────────────────────────────────────────
router.get('/reviews', (req, res) => {
  const db = req.app.locals.db
  const { search, rating, type, page = 1, limit = 20 } = req.query
  const conditions = []; const params = []
  if (search) { conditions.push('r.text LIKE ?'); params.push(`%${search}%`) }
  if (rating) { conditions.push('r.rating = ?'); params.push(parseInt(rating)) }
  if (type === 'vendor') conditions.push('r.vendor_id IS NOT NULL')
  if (type === 'job') conditions.push('r.job_id IS NOT NULL')
  const where = conditions.length ? ' WHERE ' + conditions.join(' AND ') : ''
  const total = db.prepare(`SELECT COUNT(*) as c FROM reviews r${where}`).get(...params).c
  const pageNum = Math.max(1, parseInt(page)); const limitNum = Math.min(100, Math.max(1, parseInt(limit)))
  const data = db.prepare(`SELECT r.*, u1.name as reviewer_name, u2.name as reviewee_name, v.company_name as vendor_name, j.title as job_title FROM reviews r JOIN users u1 ON u1.id = r.reviewer_id JOIN users u2 ON u2.id = r.reviewee_id LEFT JOIN vendors v ON v.id = r.vendor_id LEFT JOIN jobs j ON j.id = r.job_id${where} ORDER BY r.created_at DESC LIMIT ? OFFSET ?`).all(...params, limitNum, (pageNum - 1) * limitNum)
  res.json({ data, total, page: pageNum, totalPages: Math.ceil(total / limitNum), limit: limitNum })
})

router.put('/reviews/:id', (req, res) => {
  const db = req.app.locals.db
  const { moderation_status } = req.body
  if (moderation_status) {
    db.prepare('UPDATE reviews SET moderation_status = ? WHERE id = ?').run(moderation_status, req.params.id)
  }
  logAudit(db, req.user.id, 'update_review', 'review', parseInt(req.params.id), { moderation_status }, req.ip)
  res.json({ success: true })
})

router.delete('/reviews/:id', (req, res) => {
  const db = req.app.locals.db
  const review = db.prepare('SELECT vendor_id FROM reviews WHERE id = ?').get(req.params.id)
  db.prepare('DELETE FROM reviews WHERE id = ?').run(req.params.id)
  if (review?.vendor_id) {
    db.prepare('UPDATE vendors SET rating = COALESCE((SELECT ROUND(AVG(rating), 1) FROM reviews WHERE vendor_id = ?), 0), reviews_count = (SELECT COUNT(*) FROM reviews WHERE vendor_id = ?) WHERE id = ?').run(review.vendor_id, review.vendor_id, review.vendor_id)
  }
  logAudit(db, req.user.id, 'delete_review', 'review', parseInt(req.params.id), null, req.ip)
  res.json({ success: true })
})

// ─── RECOMMENDATIONS ─────────────────────────────────────
router.get('/recommendations', (req, res) => {
  const db = req.app.locals.db
  const { page = 1, limit = 20 } = req.query
  const total = db.prepare('SELECT COUNT(*) as c FROM recommendations').get().c
  const pageNum = Math.max(1, parseInt(page)); const limitNum = Math.min(100, Math.max(1, parseInt(limit)))
  const data = db.prepare('SELECT rec.*, u.name as from_name, v.company_name as vendor_name FROM recommendations rec JOIN users u ON u.id = rec.from_user_id LEFT JOIN vendors v ON v.id = rec.vendor_id ORDER BY rec.created_at DESC LIMIT ? OFFSET ?').all(limitNum, (pageNum - 1) * limitNum)
  res.json({ data, total, page: pageNum, totalPages: Math.ceil(total / limitNum), limit: limitNum })
})

router.delete('/recommendations/:id', (req, res) => {
  const db = req.app.locals.db
  db.prepare('DELETE FROM recommendations WHERE id = ?').run(req.params.id)
  logAudit(db, req.user.id, 'delete_recommendation', 'recommendation', parseInt(req.params.id), null, req.ip)
  res.json({ success: true })
})

// ─── CONNECTIONS ────────────────────────────────────────
router.get('/connections', (req, res) => {
  const db = req.app.locals.db
  const { status, page = 1, limit = 20 } = req.query
  const conditions = []; const params = []
  if (status) { conditions.push('c.status = ?'); params.push(status) }
  const where = conditions.length ? ' WHERE ' + conditions.join(' AND ') : ''
  const total = db.prepare(`SELECT COUNT(*) as cnt FROM connections c${where}`).get(...params).cnt
  const pageNum = Math.max(1, parseInt(page)); const limitNum = Math.min(100, Math.max(1, parseInt(limit)))
  const data = db.prepare(`SELECT c.*, u1.name as requester_name, u1.email as requester_email, u2.name as receiver_name, u2.email as receiver_email FROM connections c JOIN users u1 ON u1.id = c.requester_id JOIN users u2 ON u2.id = c.receiver_id${where} ORDER BY c.created_at DESC LIMIT ? OFFSET ?`).all(...params, limitNum, (pageNum - 1) * limitNum)
  res.json({ data, total, page: pageNum, totalPages: Math.ceil(total / limitNum), limit: limitNum })
})

router.put('/connections/:id', (req, res) => {
  const db = req.app.locals.db
  const { status } = req.body
  if (status) {
    db.prepare('UPDATE connections SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(status, req.params.id)
  }
  logAudit(db, req.user.id, 'update_connection', 'connection', parseInt(req.params.id), { status }, req.ip)
  res.json({ success: true })
})

router.delete('/connections/:id', (req, res) => {
  const db = req.app.locals.db
  db.prepare('DELETE FROM connections WHERE id = ?').run(req.params.id)
  logAudit(db, req.user.id, 'delete_connection', 'connection', parseInt(req.params.id), null, req.ip)
  res.json({ success: true })
})

// ─── CONTACT SUBMISSIONS ────────────────────────────────
router.get('/contact-submissions', (req, res) => {
  const db = req.app.locals.db
  const { status, page = 1, limit = 20 } = req.query
  let where = ''; const params = []
  if (status) { where = ' WHERE status = ?'; params.push(status) }
  const total = db.prepare(`SELECT COUNT(*) as c FROM contact_submissions${where}`).get(...params).c
  const pageNum = Math.max(1, parseInt(page)); const limitNum = Math.min(100, Math.max(1, parseInt(limit)))
  const data = db.prepare(`SELECT * FROM contact_submissions${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`).all(...params, limitNum, (pageNum - 1) * limitNum)
  res.json({ data, total, page: pageNum, totalPages: Math.ceil(total / limitNum), limit: limitNum })
})

router.put('/contact-submissions/:id', (req, res) => {
  const db = req.app.locals.db
  const { status } = req.body
  if (status) db.prepare('UPDATE contact_submissions SET status = ? WHERE id = ?').run(status, req.params.id)
  logAudit(db, req.user.id, 'update_contact_submission', 'contact_submission', parseInt(req.params.id), { status }, req.ip)
  res.json({ success: true })
})

// ─── CATEGORIES ──────────────────────────────────────────
router.get('/categories', (req, res) => {
  const db = req.app.locals.db
  const { type } = req.query
  let where = ''; const params = []
  if (type) { where = ' WHERE type = ?'; params.push(type) }
  res.json(db.prepare(`SELECT * FROM categories${where} ORDER BY type, sort_order`).all(...params))
})

router.post('/categories', (req, res) => {
  const db = req.app.locals.db
  const { name, type, sort_order } = req.body
  if (!name || !type) return res.status(400).json({ error: 'Name and type required' })
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  const result = db.prepare('INSERT INTO categories (name, slug, type, sort_order) VALUES (?, ?, ?, ?)').run(name, slug, type, sort_order || 0)
  logAudit(db, req.user.id, 'create_category', 'category', result.lastInsertRowid, { name, type }, req.ip)
  res.status(201).json(db.prepare('SELECT * FROM categories WHERE id = ?').get(result.lastInsertRowid))
})

router.put('/categories/:id', (req, res) => {
  const db = req.app.locals.db
  const { name, sort_order, is_active } = req.body
  const updates = []; const params = []
  if (name) { updates.push('name = ?', 'slug = ?'); params.push(name, name.toLowerCase().replace(/[^a-z0-9]+/g, '-')) }
  if (sort_order !== undefined) { updates.push('sort_order = ?'); params.push(sort_order) }
  if (is_active !== undefined) { updates.push('is_active = ?'); params.push(is_active) }
  if (updates.length) { params.push(req.params.id); db.prepare(`UPDATE categories SET ${updates.join(', ')} WHERE id = ?`).run(...params) }
  logAudit(db, req.user.id, 'update_category', 'category', parseInt(req.params.id), req.body, req.ip)
  res.json(db.prepare('SELECT * FROM categories WHERE id = ?').get(req.params.id))
})

router.delete('/categories/:id', (req, res) => {
  const db = req.app.locals.db
  db.prepare('DELETE FROM categories WHERE id = ?').run(req.params.id)
  logAudit(db, req.user.id, 'delete_category', 'category', parseInt(req.params.id), null, req.ip)
  res.json({ success: true })
})

// ─── NOTIFICATIONS ───────────────────────────────────────
router.post('/notifications/broadcast', (req, res) => {
  const db = req.app.locals.db
  const { title, message, link, target = 'all' } = req.body
  if (!title || !message) return res.status(400).json({ error: 'Title and message required' })

  let users
  if (target === 'pro') users = db.prepare("SELECT id FROM users WHERE membership_tier = 'pro' AND is_deleted = 0").all()
  else if (target === 'free') users = db.prepare("SELECT id FROM users WHERE membership_tier = 'free' AND is_deleted = 0").all()
  else users = db.prepare('SELECT id FROM users WHERE is_deleted = 0').all()

  const insert = db.prepare('INSERT INTO notifications (user_id, type, title, message, link) VALUES (?, ?, ?, ?, ?)')
  users.forEach(u => insert.run(u.id, 'system', title, message, link || null))

  logAudit(db, req.user.id, 'broadcast_notification', 'notification', null, { title, target, recipientCount: users.length }, req.ip)
  res.json({ success: true, recipientCount: users.length })
})

router.get('/notifications/sent', (req, res) => {
  const db = req.app.locals.db
  const logs = db.prepare("SELECT * FROM audit_log WHERE action = 'broadcast_notification' ORDER BY created_at DESC LIMIT 50").all()
  res.json(logs.map(l => ({ ...l, details: l.details ? JSON.parse(l.details) : null })))
})

// ─── SITE CONTENT ────────────────────────────────────────
router.get('/site-content', (req, res) => {
  const db = req.app.locals.db
  res.json(db.prepare('SELECT * FROM site_content ORDER BY page, section, key').all())
})

router.get('/site-content/:page', (req, res) => {
  const db = req.app.locals.db
  res.json(db.prepare('SELECT * FROM site_content WHERE page = ? ORDER BY section, key').all(req.params.page))
})

router.put('/site-content/:id', (req, res) => {
  const db = req.app.locals.db
  const { value } = req.body
  db.prepare('UPDATE site_content SET value = ?, updated_at = CURRENT_TIMESTAMP, updated_by = ? WHERE id = ?').run(value, req.user.id, req.params.id)
  logAudit(db, req.user.id, 'update_site_content', 'site_content', parseInt(req.params.id), { value }, req.ip)
  res.json({ success: true })
})

// ─── TESTIMONIALS ────────────────────────────────────────
router.get('/testimonials', (req, res) => {
  res.json(req.app.locals.db.prepare('SELECT * FROM testimonials ORDER BY sort_order').all())
})

router.post('/testimonials', (req, res) => {
  const db = req.app.locals.db
  const { name, title, company, avatar_url, quote, rating, is_featured } = req.body
  const result = db.prepare('INSERT INTO testimonials (name, title, company, avatar_url, quote, rating, is_featured) VALUES (?, ?, ?, ?, ?, ?, ?)').run(name, title, company, avatar_url, quote, rating || 5, is_featured || 0)
  logAudit(db, req.user.id, 'create_testimonial', 'testimonial', result.lastInsertRowid, { name }, req.ip)
  res.status(201).json(db.prepare('SELECT * FROM testimonials WHERE id = ?').get(result.lastInsertRowid))
})

router.put('/testimonials/:id', (req, res) => {
  const db = req.app.locals.db
  const fields = ['name', 'title', 'company', 'avatar_url', 'quote', 'rating', 'is_featured', 'is_active', 'sort_order']
  const updates = []; const params = []
  fields.forEach(f => { if (req.body[f] !== undefined) { updates.push(`${f} = ?`); params.push(req.body[f]) } })
  if (updates.length) { params.push(req.params.id); db.prepare(`UPDATE testimonials SET ${updates.join(', ')} WHERE id = ?`).run(...params) }
  logAudit(db, req.user.id, 'update_testimonial', 'testimonial', parseInt(req.params.id), req.body, req.ip)
  res.json(db.prepare('SELECT * FROM testimonials WHERE id = ?').get(req.params.id))
})

router.delete('/testimonials/:id', (req, res) => {
  const db = req.app.locals.db
  db.prepare('DELETE FROM testimonials WHERE id = ?').run(req.params.id)
  logAudit(db, req.user.id, 'delete_testimonial', 'testimonial', parseInt(req.params.id), null, req.ip)
  res.json({ success: true })
})

// ─── BRAND LOGOS ─────────────────────────────────────────
router.get('/brand-logos', (req, res) => {
  res.json(req.app.locals.db.prepare('SELECT * FROM brand_logos ORDER BY sort_order').all())
})

router.post('/brand-logos', (req, res) => {
  const db = req.app.locals.db
  const { name, logo_url, website_url, sort_order } = req.body
  const result = db.prepare('INSERT INTO brand_logos (name, logo_url, website_url, sort_order) VALUES (?, ?, ?, ?)').run(name, logo_url, website_url, sort_order || 0)
  logAudit(db, req.user.id, 'create_brand_logo', 'brand_logo', result.lastInsertRowid, { name }, req.ip)
  res.status(201).json(db.prepare('SELECT * FROM brand_logos WHERE id = ?').get(result.lastInsertRowid))
})

router.put('/brand-logos/:id', (req, res) => {
  const db = req.app.locals.db
  const fields = ['name', 'logo_url', 'website_url', 'is_active', 'sort_order']
  const updates = []; const params = []
  fields.forEach(f => { if (req.body[f] !== undefined) { updates.push(`${f} = ?`); params.push(req.body[f]) } })
  if (updates.length) { params.push(req.params.id); db.prepare(`UPDATE brand_logos SET ${updates.join(', ')} WHERE id = ?`).run(...params) }
  logAudit(db, req.user.id, 'update_brand_logo', 'brand_logo', parseInt(req.params.id), req.body, req.ip)
  res.json(db.prepare('SELECT * FROM brand_logos WHERE id = ?').get(req.params.id))
})

router.delete('/brand-logos/:id', (req, res) => {
  const db = req.app.locals.db
  db.prepare('DELETE FROM brand_logos WHERE id = ?').run(req.params.id)
  logAudit(db, req.user.id, 'delete_brand_logo', 'brand_logo', parseInt(req.params.id), null, req.ip)
  res.json({ success: true })
})

// ─── FAQ ─────────────────────────────────────────────────
router.get('/faq', (req, res) => {
  const { page: faqPage } = req.query
  let where = ''; const params = []
  if (faqPage) { where = ' WHERE page = ?'; params.push(faqPage) }
  res.json(req.app.locals.db.prepare(`SELECT * FROM faq_items${where} ORDER BY sort_order`).all(...params))
})

router.post('/faq', (req, res) => {
  const db = req.app.locals.db
  const { question, answer, page, sort_order } = req.body
  const result = db.prepare('INSERT INTO faq_items (question, answer, page, sort_order) VALUES (?, ?, ?, ?)').run(question, answer, page || 'general', sort_order || 0)
  logAudit(db, req.user.id, 'create_faq', 'faq', result.lastInsertRowid, { question }, req.ip)
  res.status(201).json(db.prepare('SELECT * FROM faq_items WHERE id = ?').get(result.lastInsertRowid))
})

router.put('/faq/:id', (req, res) => {
  const db = req.app.locals.db
  const fields = ['question', 'answer', 'page', 'sort_order', 'is_active']
  const updates = []; const params = []
  fields.forEach(f => { if (req.body[f] !== undefined) { updates.push(`${f} = ?`); params.push(req.body[f]) } })
  if (updates.length) { params.push(req.params.id); db.prepare(`UPDATE faq_items SET ${updates.join(', ')} WHERE id = ?`).run(...params) }
  logAudit(db, req.user.id, 'update_faq', 'faq', parseInt(req.params.id), req.body, req.ip)
  res.json(db.prepare('SELECT * FROM faq_items WHERE id = ?').get(req.params.id))
})

router.delete('/faq/:id', (req, res) => {
  const db = req.app.locals.db
  db.prepare('DELETE FROM faq_items WHERE id = ?').run(req.params.id)
  logAudit(db, req.user.id, 'delete_faq', 'faq', parseInt(req.params.id), null, req.ip)
  res.json({ success: true })
})

// ─── PLATFORM SETTINGS ──────────────────────────────────
router.get('/settings', (req, res) => {
  res.json(req.app.locals.db.prepare('SELECT * FROM platform_settings ORDER BY key').all())
})

router.put('/settings/:key', (req, res) => {
  const db = req.app.locals.db
  const { value } = req.body
  db.prepare('UPDATE platform_settings SET value = ?, updated_at = CURRENT_TIMESTAMP, updated_by = ? WHERE key = ?').run(value, req.user.id, req.params.key)
  logAudit(db, req.user.id, 'update_setting', 'setting', null, { key: req.params.key, value }, req.ip)
  res.json({ success: true })
})

// ─── REFERRALS ───────────────────────────────────────────
router.get('/referrals/stats', (req, res) => {
  const db = req.app.locals.db
  const now = new Date()
  const monthAgo = new Date(now - 30 * 24 * 60 * 60 * 1000).toISOString()
  const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString()

  res.json({
    totalReferrals: db.prepare('SELECT COUNT(*) as c FROM referral_tracking').get().c,
    referralsThisMonth: db.prepare('SELECT COUNT(*) as c FROM referral_tracking WHERE created_at > ?').get(monthAgo).c,
    referralsThisWeek: db.prepare('SELECT COUNT(*) as c FROM referral_tracking WHERE created_at > ?').get(weekAgo).c,
    topReferrers: db.prepare('SELECT u.name, u.avatar_url, rc.code, COUNT(rt.id) as count FROM referral_tracking rt JOIN users u ON u.id = rt.referrer_id LEFT JOIN referral_codes rc ON rc.user_id = u.id GROUP BY rt.referrer_id ORDER BY count DESC LIMIT 20').all(),
  })
})

router.get('/referrals', (req, res) => {
  const db = req.app.locals.db
  const { page = 1, limit = 20 } = req.query
  const total = db.prepare('SELECT COUNT(*) as c FROM referral_tracking').get().c
  const pageNum = Math.max(1, parseInt(page)); const limitNum = Math.min(100, Math.max(1, parseInt(limit)))
  const data = db.prepare('SELECT rt.*, u1.name as referrer_name, u2.name as referred_name FROM referral_tracking rt JOIN users u1 ON u1.id = rt.referrer_id JOIN users u2 ON u2.id = rt.referred_user_id ORDER BY rt.created_at DESC LIMIT ? OFFSET ?').all(limitNum, (pageNum - 1) * limitNum)
  res.json({ data, total, page: pageNum, totalPages: Math.ceil(total / limitNum), limit: limitNum })
})

// ─── DATA EXPORTS ────────────────────────────────────────
router.get('/export/users', (req, res) => {
  const db = req.app.locals.db
  const users = db.prepare('SELECT name, email, title, company, membership_tier, role, created_at, last_login_at FROM users WHERE is_deleted = 0').all()
  const csv = 'Name,Email,Title,Company,Tier,Role,Joined,Last Login\n' + users.map(u => `"${u.name}","${u.email}","${u.title || ''}","${u.company || ''}","${u.membership_tier}","${u.role}","${u.created_at}","${u.last_login_at || ''}"`).join('\n')
  res.setHeader('Content-Type', 'text/csv')
  res.setHeader('Content-Disposition', 'attachment; filename=users.csv')
  res.send(csv)
})

router.get('/export/jobs', (req, res) => {
  const db = req.app.locals.db
  const jobs = db.prepare('SELECT title, company, location, type, category, salary_range, status, created_at FROM jobs').all()
  const csv = 'Title,Company,Location,Type,Category,Salary,Status,Created\n' + jobs.map(j => `"${j.title}","${j.company}","${j.location || ''}","${j.type}","${j.category || ''}","${j.salary_range || ''}","${j.status}","${j.created_at}"`).join('\n')
  res.setHeader('Content-Type', 'text/csv')
  res.setHeader('Content-Disposition', 'attachment; filename=jobs.csv')
  res.send(csv)
})

router.get('/export/vendors', (req, res) => {
  const db = req.app.locals.db
  const vendors = db.prepare('SELECT company_name, description, categories, rating, reviews_count, location, website FROM vendors').all()
  const csv = 'Company,Description,Categories,Rating,Reviews,Location,Website\n' + vendors.map(v => `"${v.company_name}","${(v.description || '').replace(/"/g, '""')}","${v.categories}","${v.rating}","${v.reviews_count}","${v.location || ''}","${v.website || ''}"`).join('\n')
  res.setHeader('Content-Type', 'text/csv')
  res.setHeader('Content-Disposition', 'attachment; filename=vendors.csv')
  res.send(csv)
})

router.get('/export/analytics', (req, res) => {
  const db = req.app.locals.db
  const stats = {
    users: db.prepare('SELECT COUNT(*) as c FROM users WHERE is_deleted = 0').get().c,
    jobs: db.prepare('SELECT COUNT(*) as c FROM jobs').get().c,
    sessions: db.prepare('SELECT COUNT(*) as c FROM sessions').get().c,
    resources: db.prepare('SELECT COUNT(*) as c FROM resources').get().c,
    vendors: db.prepare('SELECT COUNT(*) as c FROM vendors').get().c,
    reviews: db.prepare('SELECT COUNT(*) as c FROM reviews').get().c,
    connections: db.prepare("SELECT COUNT(*) as c FROM connections WHERE status = 'accepted'").get().c,
  }
  const csv = 'Metric,Count\n' + Object.entries(stats).map(([k, v]) => `"${k}","${v}"`).join('\n')
  res.setHeader('Content-Type', 'text/csv')
  res.setHeader('Content-Disposition', 'attachment; filename=analytics.csv')
  res.send(csv)
})

// ─── AUDIT LOG ───────────────────────────────────────────
router.get('/audit-log', (req, res) => {
  const db = req.app.locals.db
  const { admin_id, entity_type, page = 1, limit = 50 } = req.query
  const conditions = []; const params = []
  if (admin_id) { conditions.push('al.admin_id = ?'); params.push(parseInt(admin_id)) }
  if (entity_type) { conditions.push('al.entity_type = ?'); params.push(entity_type) }
  const where = conditions.length ? ' WHERE ' + conditions.join(' AND ') : ''
  const total = db.prepare(`SELECT COUNT(*) as c FROM audit_log al${where}`).get(...params).c
  const pageNum = Math.max(1, parseInt(page)); const limitNum = Math.min(500, Math.max(1, parseInt(limit)))
  const data = db.prepare(`SELECT al.*, u.name as admin_name, u.avatar_url as admin_avatar FROM audit_log al JOIN users u ON u.id = al.admin_id${where} ORDER BY al.created_at DESC LIMIT ? OFFSET ?`).all(...params, limitNum, (pageNum - 1) * limitNum)
  res.json({ data: data.map(d => ({ ...d, details: d.details ? JSON.parse(d.details) : null })), total, page: pageNum, totalPages: Math.ceil(total / limitNum), limit: limitNum })
})

export default router
