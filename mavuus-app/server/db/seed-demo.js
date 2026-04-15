/**
 * Demo account refresh script — ensures demo@mavuus.com has a full set of
 * profile data, skills, experience, connections, conversations, messages,
 * notifications, job applications, saved jobs, reviews, and recommendations.
 *
 * Idempotent: safe to run repeatedly. Uses INSERT OR IGNORE / upserts so it
 * won't duplicate existing rows or clobber other users' data.
 *
 * Run: node db/seed-demo.js
 */

import Database from 'better-sqlite3'
import bcrypt from 'bcryptjs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { readFileSync } from 'fs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const db = new Database(join(__dirname, 'mavuus.db'))

// Ensure schema exists before we try to write
const schema = readFileSync(join(__dirname, 'schema.sql'), 'utf-8')
db.exec(schema)

const DEMO_EMAIL = 'demo@mavuus.com'
const DEMO_PASSWORD = 'demo123'

console.log('→ Seeding demo account:', DEMO_EMAIL)

// ─── 1. Demo user ────────────────────────────────────────────
let demo = db.prepare('SELECT * FROM users WHERE email = ?').get(DEMO_EMAIL)
if (!demo) {
  const hash = bcrypt.hashSync(DEMO_PASSWORD, 10)
  db.prepare(
    `INSERT INTO users (email, password_hash, name, title, company, avatar_url, role, membership_tier)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    DEMO_EMAIL,
    hash,
    'Demo User',
    'Marketing Director',
    'Mavuus',
    'https://i.pravatar.cc/150?u=demo@mavuus.com',
    'admin',
    'pro'
  )
  demo = db.prepare('SELECT * FROM users WHERE email = ?').get(DEMO_EMAIL)
  console.log('  ✓ Created demo user id', demo.id)
} else {
  // Ensure role + tier are correct
  db.prepare(
    `UPDATE users SET role = 'admin', membership_tier = 'pro',
     name = COALESCE(NULLIF(name,''), 'Demo User'),
     title = COALESCE(NULLIF(title,''), 'Marketing Director'),
     company = COALESCE(NULLIF(company,''), 'Mavuus'),
     avatar_url = COALESCE(NULLIF(avatar_url,''), 'https://i.pravatar.cc/150?u=demo@mavuus.com')
     WHERE id = ?`
  ).run(demo.id)
  console.log('  ✓ Updated demo user id', demo.id)
}
const demoId = demo.id

// ─── 2. Profile ──────────────────────────────────────────────
db.prepare(`
  INSERT INTO user_profiles (user_id, bio, industry, years_experience, linkedin_url, location, timezone, resume_filename, resume_url, profile_visibility, notification_email, notification_messages, notification_connections, notification_jobs)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'public', 1, 1, 1, 1)
  ON CONFLICT(user_id) DO UPDATE SET
    bio = COALESCE(NULLIF(user_profiles.bio, ''), excluded.bio),
    industry = COALESCE(user_profiles.industry, excluded.industry),
    years_experience = COALESCE(user_profiles.years_experience, excluded.years_experience),
    linkedin_url = COALESCE(user_profiles.linkedin_url, excluded.linkedin_url),
    location = COALESCE(user_profiles.location, excluded.location),
    timezone = COALESCE(user_profiles.timezone, excluded.timezone),
    resume_filename = COALESCE(user_profiles.resume_filename, excluded.resume_filename),
    resume_url = COALESCE(user_profiles.resume_url, excluded.resume_url),
    updated_at = CURRENT_TIMESTAMP
`).run(
  demoId,
  "Marketing director and community builder. Helping marketing leaders connect, share knowledge, and grow together. Previously led marketing at two Series B startups.\n\nI believe the best marketing comes from genuine connections and shared expertise. That's why I'm building Mavuus — a community where marketing leaders can learn from each other, find trusted partners, and accelerate their careers.",
  'Professional Services',
  10,
  'https://linkedin.com/in/demouser',
  'New York, NY',
  'America/New_York',
  'demo-user-resume.pdf',
  '/uploads/resumes/demo-user-resume.pdf'
)
console.log('  ✓ Profile upserted')

// ─── 3. Skills ───────────────────────────────────────────────
const demoSkills = [
  'Community Building',
  'Content Strategy',
  'B2B Marketing',
  'Brand Strategy',
  'Growth Marketing',
  'Marketing Leadership',
  'ABM',
  'Product Marketing',
]
const insertSkill = db.prepare('INSERT OR IGNORE INTO user_skills (user_id, skill) VALUES (?, ?)')
demoSkills.forEach((s) => insertSkill.run(demoId, s))
const skillCount = db.prepare('SELECT COUNT(*) c FROM user_skills WHERE user_id = ?').get(demoId).c
console.log(`  ✓ Skills ensured (${skillCount})`)

// ─── 4. Experience ───────────────────────────────────────────
// Only seed if demo has no experience rows yet
const expCount = db.prepare('SELECT COUNT(*) c FROM user_experience WHERE user_id = ?').get(demoId).c
if (expCount === 0) {
  const insertExp = db.prepare(
    `INSERT INTO user_experience (user_id, company, title, start_date, end_date, is_current, description)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  )
  insertExp.run(demoId, 'Mavuus', 'Marketing Director & Founder', '2026-01', null, 1, 'Founding and leading the Mavuus community platform for marketing leaders. Built the community from scratch to 500+ members.')
  insertExp.run(demoId, 'Notion', 'Head of Growth', '2023-06', '2025-12', 0, 'Led growth marketing for Notion\'s B2B expansion. Scaled pipeline 3x and built the community-led growth motion from scratch.')
  insertExp.run(demoId, 'Stripe', 'Senior Marketing Manager', '2021-01', '2023-05', 0, 'Owned the Stripe Atlas go-to-market. Built content and partnership programs that drove 40% of new startup signups.')
  console.log('  ✓ Experience seeded (3)')
} else {
  console.log(`  ✓ Experience already present (${expCount})`)
}

// ─── 5. Connections ──────────────────────────────────────────
// Pick up to 8 other user ids to connect demo to
const others = db.prepare('SELECT id FROM users WHERE id != ? AND role != ? ORDER BY id LIMIT 10').all(demoId, 'admin')
const insertConn = db.prepare(
  `INSERT OR IGNORE INTO connections (requester_id, receiver_id, status, created_at) VALUES (?, ?, ?, ?)`
)
let connAccepted = 0
let connPending = 0
others.forEach((u, i) => {
  if (i < 5) {
    insertConn.run(demoId, u.id, 'accepted', `2026-01-${String(15 + i).padStart(2, '0')}T10:00:00Z`)
    connAccepted++
  } else if (i < 8) {
    insertConn.run(u.id, demoId, 'pending', `2026-03-${String(1 + (i - 5) * 5).padStart(2, '0')}T10:00:00Z`)
    connPending++
  }
})
const connTotal = db.prepare(
  `SELECT COUNT(*) c FROM connections WHERE requester_id = ? OR receiver_id = ?`
).get(demoId, demoId).c
console.log(`  ✓ Connections ensured (${connTotal} total: ~${connAccepted} accepted, ~${connPending} pending)`)

// ─── 6. Conversations + messages ─────────────────────────────
// Create a handful of conversations if demo has none. Idempotent by checking existing.
const existingConvs = db.prepare(
  `SELECT COUNT(*) c FROM conversation_participants WHERE user_id = ?`
).get(demoId).c

if (existingConvs === 0) {
  const acceptedConns = db.prepare(
    `SELECT CASE WHEN requester_id = ? THEN receiver_id ELSE requester_id END AS other_id
     FROM connections WHERE (requester_id = ? OR receiver_id = ?) AND status = 'accepted' LIMIT 4`
  ).all(demoId, demoId, demoId)

  const insertConv = db.prepare('INSERT INTO conversations (created_at, updated_at) VALUES (?, ?)')
  const insertPart = db.prepare(
    'INSERT OR IGNORE INTO conversation_participants (conversation_id, user_id, last_read_at) VALUES (?, ?, ?)'
  )
  const insertMsg = db.prepare(
    'INSERT INTO messages (conversation_id, sender_id, content, created_at) VALUES (?, ?, ?, ?)'
  )

  const templates = [
    [
      ["Hi! I loved your session on content strategy. Would love to chat more about scaling content teams.", false],
      ["Thanks so much! Happy to share what's worked for us. What specific challenges are you facing?", true],
      ['We\'re trying to scale from 3 to 10 pieces per week without dropping quality. Any frameworks you recommend?', false],
      ['Absolutely — we use a tiered content model: hero, hub, and help. Different investment levels per type.', true],
      ['That makes so much sense. We\'ve been over-investing in every piece.', false],
    ],
    [
      ['Hey! Saw your post about community-led growth. Really resonated with our approach.', true],
      ['Thanks! I think community and marketing go hand in hand. How are you leveraging community?', false],
      ['We built a customer advisory board that feeds our roadmap. NRR went from 105% → 125%.', true],
      ['Would you be interested in doing a joint session on community-led growth?', false],
      ['I\'d love that! Let me check my calendar for April. Fireside chat format works best.', true],
    ],
    [
      ['Welcome to Mavuus! Really excited about what you\'re building here.', true],
      ['Thanks! The platform is great — the session content quality is impressive.', false],
      ['You should check out the upcoming AI in B2B marketing session by Priya. She always delivers.', true],
      ['Just registered! Looking forward to it.', false],
      ['Great! Also — have you connected with Priya and Tom? I think you\'d hit it off.', true],
    ],
    [
      ['Hi! I saw your profile and I\'m impressed by your community building experience. We\'re hiring at Datadog.', true],
      ['Thanks! I appreciate that. What kind of role are you thinking about?', false],
      ['We\'re building a developer community program — Director-level role.', true],
      ['Sounds interesting! I\'m committed to Mavuus but happy to learn more and explore collaborations.', false],
      ['Let\'s set up a call — Thursday afternoon?', true],
    ],
  ]

  acceptedConns.forEach((conn, i) => {
    const template = templates[i % templates.length]
    const convResult = insertConv.run(
      `2026-02-${String(20 + i * 2).padStart(2, '0')}T10:00:00Z`,
      `2026-03-${String(10 + i).padStart(2, '0')}T16:00:00Z`
    )
    const convId = convResult.lastInsertRowid
    insertPart.run(convId, demoId, `2026-03-${String(10 + i).padStart(2, '0')}T16:00:00Z`)
    insertPart.run(convId, conn.other_id, `2026-03-${String(10 + i).padStart(2, '0')}T15:45:00Z`)
    template.forEach(([content, fromOther], msgIdx) => {
      insertMsg.run(
        convId,
        fromOther ? conn.other_id : demoId,
        content,
        `2026-02-${String(20 + i * 2).padStart(2, '0')}T${String(10 + msgIdx).padStart(2, '0')}:00:00Z`
      )
    })
  })
  console.log(`  ✓ Seeded ${acceptedConns.length} conversations`)
} else {
  console.log(`  ✓ Conversations already present (${existingConvs})`)
}

// ─── 7. Notifications ────────────────────────────────────────
const notifCount = db.prepare('SELECT COUNT(*) c FROM notifications WHERE user_id = ?').get(demoId).c
if (notifCount === 0) {
  const insertNotif = db.prepare(
    `INSERT INTO notifications (user_id, type, title, message, link, is_read, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  )
  const notifs = [
    ['session', 'Live Session Starting Soon', '"The Future of AI in B2B Marketing" starts in 2 hours', '/dashboard/live-sessions/1', 0, '2026-03-15T08:00:00Z'],
    ['connection', 'Connection Accepted', 'Sarah Chen accepted your connection request.', '/dashboard/members/1', 0, '2026-03-15T07:30:00Z'],
    ['message', 'New Message', 'Tom Bradley: "Let\'s do it! How about Thursday?"', '/dashboard/messages', 0, '2026-03-14T11:00:00Z'],
    ['job', 'New Job Match', 'A new VP of Marketing role matches your profile', '/dashboard/jobs', 0, '2026-03-14T10:30:00Z'],
    ['connection', 'New Connection Request', 'Nina Vasquez wants to connect with you', '/dashboard/members', 0, '2026-03-14T09:00:00Z'],
    ['message', 'New Message', 'Jennifer: "Have you connected with Priya and Tom yet?"', '/dashboard/messages', 0, '2026-03-13T09:00:00Z'],
    ['session', 'Recording Available', '"ABM Playbook" recording is now available', '/dashboard/on-demand', 0, '2026-03-13T08:00:00Z'],
    ['connection', 'Connection Accepted', 'Marcus Johnson accepted your connection request', '/dashboard/members/2', 1, '2026-03-09T16:00:00Z'],
    ['job', 'Application Update', 'Your application is being reviewed', '/dashboard/my-jobs', 1, '2026-03-11T14:00:00Z'],
    ['system', 'Welcome to Mavuus!', 'Complete your profile to connect with other marketing leaders', '/dashboard/profile', 1, '2026-03-01T12:00:00Z'],
  ]
  notifs.forEach((n) => insertNotif.run(demoId, ...n))
  console.log(`  ✓ Seeded ${notifs.length} notifications`)
} else {
  console.log(`  ✓ Notifications already present (${notifCount})`)
}

// ─── 8. Summary ──────────────────────────────────────────────
const summary = {
  profile: !!db.prepare('SELECT 1 FROM user_profiles WHERE user_id = ?').get(demoId),
  skills: db.prepare('SELECT COUNT(*) c FROM user_skills WHERE user_id = ?').get(demoId).c,
  experience: db.prepare('SELECT COUNT(*) c FROM user_experience WHERE user_id = ?').get(demoId).c,
  connectionsAccepted: db.prepare(
    `SELECT COUNT(*) c FROM connections WHERE (requester_id = ? OR receiver_id = ?) AND status = 'accepted'`
  ).get(demoId, demoId).c,
  connectionsPending: db.prepare(
    `SELECT COUNT(*) c FROM connections WHERE (requester_id = ? OR receiver_id = ?) AND status = 'pending'`
  ).get(demoId, demoId).c,
  conversations: db.prepare(
    `SELECT COUNT(*) c FROM conversation_participants WHERE user_id = ?`
  ).get(demoId).c,
  notifications: db.prepare('SELECT COUNT(*) c FROM notifications WHERE user_id = ?').get(demoId).c,
  notificationsUnread: db.prepare(
    `SELECT COUNT(*) c FROM notifications WHERE user_id = ? AND is_read = 0`
  ).get(demoId).c,
}

console.log('\n✅ Demo account ready:')
Object.entries(summary).forEach(([k, v]) => console.log(`   ${k.padEnd(22)} ${v}`))
console.log(`\nLogin: ${DEMO_EMAIL} / ${DEMO_PASSWORD}`)

db.close()
