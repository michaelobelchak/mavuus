import Database from 'better-sqlite3'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import bcrypt from 'bcryptjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const db = new Database(join(__dirname, 'mavuus.db'))

// Enable WAL mode for better performance
db.pragma('journal_mode = WAL')

// Run schema
const schema = readFileSync(join(__dirname, 'schema.sql'), 'utf-8')
db.exec(schema)

// Seed users
const passwordHash = bcrypt.hashSync('demo123', 10)
const insertUser = db.prepare(`
  INSERT OR IGNORE INTO users (email, password_hash, name, title, company, role, membership_tier)
  VALUES (?, ?, ?, ?, ?, ?, ?)
`)

const users = [
  ['sarah@techflow.com', passwordHash, 'Sarah Chen', 'VP of Marketing', 'TechFlow', 'member', 'pro'],
  ['marcus@growthbase.com', passwordHash, 'Marcus Johnson', 'CMO', 'GrowthBase', 'member', 'pro'],
  ['priya@cloudscale.com', passwordHash, 'Priya Patel', 'Director of Demand Gen', 'CloudScale', 'member', 'pro'],
  ['elena@drift.com', passwordHash, 'Elena Rodriguez', 'CMO', 'Drift', 'member', 'pro'],
  ['david@twilio.com', passwordHash, 'David Kim', 'SVP Marketing', 'Twilio', 'member', 'pro'],
  ['aisha@figma.com', passwordHash, 'Aisha Okafor', 'Head of Marketing', 'Figma', 'member', 'pro'],
  ['demo@mavuus.com', passwordHash, 'Demo User', 'Marketing Director', 'Mavuus', 'admin', 'pro'],
]

users.forEach(u => insertUser.run(...u))

// Seed sessions
const insertSession = db.prepare(`
  INSERT OR IGNORE INTO sessions (title, description, speaker_name, speaker_title, type, category, scheduled_date, duration)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`)

const sessions = [
  ['Building a Content Engine That Scales', 'Learn how to build a scalable content machine that drives organic growth.', 'Sarah Chen', 'VP of Marketing, TechFlow', 'live', 'Content Strategy', '2026-03-15T14:00:00Z', '60 min'],
  ['ABM Playbook: From 0 to Enterprise Pipeline', 'A practical guide to implementing account-based marketing from scratch.', 'Marcus Johnson', 'CMO, GrowthBase', 'live', 'ABM', '2026-03-18T16:00:00Z', '45 min'],
  ['The Future of AI in B2B Marketing', 'Exploring how AI is reshaping demand generation and customer engagement.', 'Priya Patel', 'Director of Demand Gen, CloudScale', 'live', 'AI & Tech', '2026-03-20T15:00:00Z', '60 min'],
  ['Mastering LinkedIn Ads for B2B', 'Deep dive into LinkedIn advertising strategies that drive quality leads.', 'Elena Rodriguez', 'CMO, Drift', 'on-demand', 'Paid Media', null, '42 min'],
  ['Brand Storytelling Workshop', 'Craft compelling brand narratives that resonate with your audience.', 'Omar Hassan', 'VP Brand, Canva', 'on-demand', 'Branding', null, '55 min'],
  ['Data-Driven Campaign Optimization', 'Use analytics and data to continuously improve campaign performance.', 'James Wright', 'VP Growth, Amplitude', 'on-demand', 'Analytics', null, '38 min'],
]

sessions.forEach(s => insertSession.run(...s))

// Seed resources
const insertResource = db.prepare(`
  INSERT OR IGNORE INTO resources (title, description, author, category, type, read_time)
  VALUES (?, ?, ?, ?, ?, ?)
`)

const resources = [
  ['The Ultimate Marketing Budget Template', 'A comprehensive spreadsheet template for planning and tracking your marketing budget across channels.', 'Mavuus Team', 'Template', 'template', '5 min read'],
  ['State of B2B Marketing 2026 Report', 'Key insights and trends from surveying 500+ marketing leaders across industries.', 'Mavuus Research', 'Report', 'guide', '15 min read'],
  ['How to Build a Marketing Team from Scratch', 'A step-by-step guide to hiring, structuring, and scaling your marketing organization.', 'Rachel Foster', 'Guide', 'article', '10 min read'],
]

resources.forEach(r => insertResource.run(...r))

// Seed vendors
const insertVendor = db.prepare(`
  INSERT OR IGNORE INTO vendors (company_name, description, categories, rating, reviews_count, location)
  VALUES (?, ?, ?, ?, ?, ?)
`)

const vendorData = [
  ['ContentPro Agency', 'Full-service content marketing agency specializing in B2B SaaS companies.', 'Content Marketing,SEO', 4.8, 24, 'New York, NY'],
  ['PipelineHQ', 'Demand generation and ABM strategy consultancy for enterprise companies.', 'Demand Gen,ABM', 4.9, 18, 'San Francisco, CA'],
  ['BrandSpark Studio', 'Creative branding and design agency with a focus on tech startups.', 'Branding,Design', 4.7, 31, 'Austin, TX'],
]

vendorData.forEach(v => insertVendor.run(...v))

// Seed jobs
const insertJob = db.prepare(`
  INSERT OR IGNORE INTO jobs (title, company, description, location, type, category, salary_range)
  VALUES (?, ?, ?, ?, ?, ?, ?)
`)

const jobData = [
  ['Senior Content Strategist', 'TechFlow', 'Lead content strategy for a fast-growing B2B SaaS company.', 'Remote', 'full-time', 'Content', '$120k - $150k'],
  ['Growth Marketing Manager', 'GrowthBase', 'Drive pipeline growth through multi-channel marketing campaigns.', 'New York, NY', 'full-time', 'Growth', '$130k - $160k'],
  ['Freelance Brand Designer', 'BrandSpark Studio', 'Create brand assets and visual identity for tech clients.', 'Remote', 'freelance', 'Design', '$80 - $120/hr'],
]

jobData.forEach(j => insertJob.run(...j))

// Seed speakers
const insertSpeaker = db.prepare(`
  INSERT OR IGNORE INTO speakers (name, title, company, bio)
  VALUES (?, ?, ?, ?)
`)

const speakerData = [
  ['Sarah Chen', 'VP of Marketing', 'TechFlow', 'Sarah leads marketing at TechFlow, driving 3x pipeline growth in 2 years.'],
  ['Marcus Johnson', 'CMO', 'GrowthBase', 'Marcus is a seasoned CMO with 15+ years in B2B marketing.'],
  ['Priya Patel', 'Director of Demand Gen', 'CloudScale', 'Priya specializes in data-driven demand generation strategies.'],
  ['Elena Rodriguez', 'CMO', 'Drift', 'Elena has built marketing teams at three successful startups.'],
]

speakerData.forEach(s => insertSpeaker.run(...s))

// ==============================
// Phase 3: Extended seed data
// ==============================

// More users (IDs 8-12)
const moreUsers = [
  ['jennifer@hubspot.com', passwordHash, 'Jennifer Martinez', 'VP Marketing', 'HubSpot', 'member', 'pro'],
  ['alex@stripe.com', passwordHash, 'Alex Thompson', 'Head of Growth', 'Stripe', 'member', 'pro'],
  ['maya@spotify.com', passwordHash, 'Maya Williams', 'Director of Brand', 'Spotify', 'member', 'free'],
  ['ryan@shopify.com', passwordHash, 'Ryan Cooper', 'CMO', 'Shopify', 'member', 'pro'],
  ['lisa@notion.com', passwordHash, 'Lisa Park', 'VP Demand Gen', 'Notion', 'member', 'free'],
]
moreUsers.forEach(u => insertUser.run(...u))

// User profiles for all users
const insertProfile = db.prepare(`
  INSERT OR IGNORE INTO user_profiles (user_id, bio, industry, years_experience, linkedin_url, location, timezone)
  VALUES (?, ?, ?, ?, ?, ?, ?)
`)

const profiles = [
  [1, 'Passionate about scaling content programs and building high-performing marketing teams. 10+ years in B2B SaaS marketing.', 'Technology', 12, 'https://linkedin.com/in/sarahchen', 'San Francisco, CA', 'America/Los_Angeles'],
  [2, 'Data-driven CMO focused on pipeline growth and revenue marketing. Love mentoring emerging leaders.', 'Technology', 15, 'https://linkedin.com/in/marcusjohnson', 'New York, NY', 'America/New_York'],
  [3, 'Demand gen specialist with a knack for turning data into actionable strategies. Cloud infrastructure enthusiast.', 'Cloud Computing', 8, 'https://linkedin.com/in/priyapatel', 'Boston, MA', 'America/New_York'],
  [4, 'Marketing leader who believes in the power of brand storytelling. Built teams at 3 successful startups.', 'SaaS', 14, 'https://linkedin.com/in/elenarodriguez', 'Miami, FL', 'America/New_York'],
  [5, 'Strategic marketing executive driving innovation at scale. Focused on digital transformation.', 'Communications', 18, 'https://linkedin.com/in/davidkim', 'Seattle, WA', 'America/Los_Angeles'],
  [6, 'Creative marketing leader passionate about design-driven growth. Champion of inclusive marketing.', 'Design & Tech', 9, 'https://linkedin.com/in/aishaokafor', 'San Francisco, CA', 'America/Los_Angeles'],
  [7, 'Marketing director and community builder. Helping marketing leaders connect and grow together.', 'Professional Services', 10, 'https://linkedin.com/in/demouser', 'New York, NY', 'America/New_York'],
  [8, 'Inbound marketing pioneer focused on creating remarkable customer experiences.', 'Marketing Technology', 16, 'https://linkedin.com/in/jennifermartinez', 'Cambridge, MA', 'America/New_York'],
  [9, 'Growth leader obsessed with product-led growth and conversion optimization.', 'Fintech', 7, 'https://linkedin.com/in/alexthompson', 'San Francisco, CA', 'America/Los_Angeles'],
  [10, 'Brand strategist passionate about cultural marketing and creative storytelling.', 'Entertainment', 11, 'https://linkedin.com/in/mayawilliams', 'Los Angeles, CA', 'America/Los_Angeles'],
  [11, 'E-commerce marketing executive focused on DTC growth and retention strategies.', 'E-commerce', 13, 'https://linkedin.com/in/ryancooper', 'Toronto, ON', 'America/Toronto'],
  [12, 'Demand generation expert building scalable pipelines for PLG companies.', 'Productivity Software', 6, 'https://linkedin.com/in/lisapark', 'San Francisco, CA', 'America/Los_Angeles'],
]
profiles.forEach(p => insertProfile.run(...p))

// User skills
const insertSkill = db.prepare('INSERT OR IGNORE INTO user_skills (user_id, skill) VALUES (?, ?)')

const skills = [
  [1, 'Content Strategy'], [1, 'SEO'], [1, 'B2B Marketing'], [1, 'Team Building'],
  [2, 'Revenue Marketing'], [2, 'ABM'], [2, 'Pipeline Generation'], [2, 'Leadership'],
  [3, 'Demand Generation'], [3, 'Marketing Analytics'], [3, 'Marketing Automation'], [3, 'Data Analysis'],
  [4, 'Brand Strategy'], [4, 'Creative Direction'], [4, 'Startup Marketing'], [4, 'Public Speaking'],
  [5, 'Digital Marketing'], [5, 'Marketing Strategy'], [5, 'Communications'], [5, 'Executive Leadership'],
  [6, 'Growth Marketing'], [6, 'Product Marketing'], [6, 'Design Thinking'], [6, 'Community Building'],
  [7, 'Community Management'], [7, 'Content Marketing'], [7, 'Event Planning'], [7, 'Marketing Operations'],
  [8, 'Inbound Marketing'], [8, 'Customer Experience'], [8, 'Marketing Automation'], [8, 'Content Strategy'],
  [9, 'Growth Hacking'], [9, 'Conversion Optimization'], [9, 'Product-Led Growth'], [9, 'A/B Testing'],
  [10, 'Brand Marketing'], [10, 'Cultural Marketing'], [10, 'Creative Strategy'], [10, 'Social Media'],
  [11, 'E-commerce'], [11, 'DTC Marketing'], [11, 'Retention Marketing'], [11, 'Performance Marketing'],
  [12, 'Demand Generation'], [12, 'PLG Marketing'], [12, 'Marketing Analytics'], [12, 'Lead Scoring'],
]
skills.forEach(s => insertSkill.run(...s))

// User experience entries
const insertExperience = db.prepare(`
  INSERT OR IGNORE INTO user_experience (user_id, company, title, start_date, end_date, is_current, description)
  VALUES (?, ?, ?, ?, ?, ?, ?)
`)

const experiences = [
  [1, 'TechFlow', 'VP of Marketing', '2022-01', null, 1, 'Leading all marketing efforts including content, demand gen, and brand strategy.'],
  [1, 'ContentPro', 'Director of Content', '2019-06', '2021-12', 0, 'Built and scaled the content marketing team from 2 to 15 people.'],
  [2, 'GrowthBase', 'CMO', '2021-03', null, 1, 'Driving 3x pipeline growth through integrated marketing campaigns.'],
  [2, 'Salesforce', 'VP Marketing', '2017-01', '2021-02', 0, 'Led enterprise marketing for the North America region.'],
  [3, 'CloudScale', 'Director of Demand Gen', '2023-01', null, 1, 'Building data-driven demand generation programs across channels.'],
  [4, 'Drift', 'CMO', '2022-06', null, 1, 'Overseeing brand, content, demand gen, and product marketing.'],
  [5, 'Twilio', 'SVP Marketing', '2020-01', null, 1, 'Leading global marketing organization of 200+ people.'],
  [6, 'Figma', 'Head of Marketing', '2023-03', null, 1, 'Scaling marketing programs for the design-first audience.'],
  [7, 'Mavuus', 'Marketing Director', '2024-01', null, 1, 'Building and growing the Mavuus community platform.'],
  [8, 'HubSpot', 'VP Marketing', '2021-06', null, 1, 'Leading inbound marketing strategy and customer experience initiatives.'],
  [9, 'Stripe', 'Head of Growth', '2022-09', null, 1, 'Driving product-led growth and conversion optimization.'],
  [10, 'Spotify', 'Director of Brand', '2023-01', null, 1, 'Leading brand strategy and cultural marketing campaigns.'],
  [11, 'Shopify', 'CMO', '2022-03', null, 1, 'Overseeing all marketing for the commerce platform.'],
  [12, 'Notion', 'VP Demand Gen', '2023-06', null, 1, 'Building demand generation engine for PLG growth.'],
]
experiences.forEach(e => insertExperience.run(...e))

// Connections (demo user connected to several members, plus other connections)
const insertConnection = db.prepare(`
  INSERT OR IGNORE INTO connections (requester_id, receiver_id, status, created_at)
  VALUES (?, ?, ?, ?)
`)

const connectionData = [
  [7, 1, 'accepted', '2026-01-15T10:00:00Z'],
  [7, 2, 'accepted', '2026-01-20T14:00:00Z'],
  [7, 4, 'accepted', '2026-02-01T09:00:00Z'],
  [7, 8, 'accepted', '2026-02-15T11:00:00Z'],
  [3, 7, 'pending', '2026-03-01T16:00:00Z'],
  [9, 7, 'pending', '2026-03-05T10:00:00Z'],
  [1, 2, 'accepted', '2026-01-10T08:00:00Z'],
  [1, 3, 'accepted', '2026-01-12T12:00:00Z'],
  [4, 6, 'accepted', '2026-02-20T15:00:00Z'],
]
connectionData.forEach(c => insertConnection.run(...c))

// Conversations and messages
const insertConversation = db.prepare('INSERT INTO conversations (created_at, updated_at) VALUES (?, ?)')
const insertParticipant = db.prepare('INSERT OR IGNORE INTO conversation_participants (conversation_id, user_id, last_read_at) VALUES (?, ?, ?)')
const insertMessage = db.prepare('INSERT INTO messages (conversation_id, sender_id, content, created_at) VALUES (?, ?, ?, ?)')

// Conversation 1: Demo User <-> Sarah Chen
const conv1 = insertConversation.run('2026-02-20T10:00:00Z', '2026-03-06T14:30:00Z')
insertParticipant.run(conv1.lastInsertRowid, 7, '2026-03-06T14:30:00Z')
insertParticipant.run(conv1.lastInsertRowid, 1, '2026-03-06T14:20:00Z')
insertMessage.run(conv1.lastInsertRowid, 7, 'Hi Sarah! I loved your session on content strategy. Would love to chat more about scaling content teams.', '2026-02-20T10:00:00Z')
insertMessage.run(conv1.lastInsertRowid, 1, 'Thanks so much! I\'d be happy to share what\'s worked for us at TechFlow. What specific challenges are you facing?', '2026-02-20T10:15:00Z')
insertMessage.run(conv1.lastInsertRowid, 7, 'We\'re trying to go from 3 to 10 content pieces per week without sacrificing quality. Any frameworks you recommend?', '2026-02-20T10:30:00Z')
insertMessage.run(conv1.lastInsertRowid, 1, 'Absolutely! We use a tiered content model - hero, hub, and help content. I can walk you through our process.', '2026-02-20T11:00:00Z')
insertMessage.run(conv1.lastInsertRowid, 7, 'That sounds perfect. Are you free for a 30-min call next week?', '2026-03-06T14:00:00Z')
insertMessage.run(conv1.lastInsertRowid, 1, 'Sure! How about Tuesday at 2pm PT?', '2026-03-06T14:30:00Z')

// Conversation 2: Demo User <-> Marcus Johnson
const conv2 = insertConversation.run('2026-02-25T09:00:00Z', '2026-03-05T16:00:00Z')
insertParticipant.run(conv2.lastInsertRowid, 7, '2026-03-05T16:00:00Z')
insertParticipant.run(conv2.lastInsertRowid, 2, '2026-03-05T15:45:00Z')
insertMessage.run(conv2.lastInsertRowid, 2, 'Hey! Saw your post about community-led growth. Really resonated with our approach at GrowthBase.', '2026-02-25T09:00:00Z')
insertMessage.run(conv2.lastInsertRowid, 7, 'Thanks Marcus! I think community and marketing go hand in hand. How are you leveraging community at GrowthBase?', '2026-02-25T09:30:00Z')
insertMessage.run(conv2.lastInsertRowid, 2, 'We built a customer advisory board that feeds directly into our product roadmap. It\'s been a game changer for retention.', '2026-02-25T10:00:00Z')
insertMessage.run(conv2.lastInsertRowid, 7, 'That\'s brilliant. We should compare notes sometime!', '2026-03-05T16:00:00Z')

// Conversation 3: Demo User <-> Jennifer Martinez
const conv3 = insertConversation.run('2026-03-01T11:00:00Z', '2026-03-07T09:00:00Z')
insertParticipant.run(conv3.lastInsertRowid, 7, '2026-03-06T09:00:00Z')
insertParticipant.run(conv3.lastInsertRowid, 8, '2026-03-07T09:00:00Z')
insertMessage.run(conv3.lastInsertRowid, 8, 'Welcome to Mavuus! Let me know if you need any help getting started.', '2026-03-01T11:00:00Z')
insertMessage.run(conv3.lastInsertRowid, 7, 'Thanks Jennifer! The platform is great. I\'m particularly interested in the live sessions.', '2026-03-01T11:30:00Z')
insertMessage.run(conv3.lastInsertRowid, 8, 'You should check out the upcoming session on AI in B2B marketing - it\'s going to be excellent!', '2026-03-01T12:00:00Z')
insertMessage.run(conv3.lastInsertRowid, 7, 'Just registered! Looking forward to it.', '2026-03-06T09:00:00Z')
insertMessage.run(conv3.lastInsertRowid, 8, 'Great! See you there. Also, have you connected with Priya? She\'s doing amazing work in demand gen.', '2026-03-07T09:00:00Z')

// Update existing jobs to have posted_by
db.prepare('UPDATE jobs SET posted_by = 1 WHERE title = ?').run('Senior Content Strategist')
db.prepare('UPDATE jobs SET posted_by = 2 WHERE title = ?').run('Growth Marketing Manager')
db.prepare('UPDATE jobs SET posted_by = 6 WHERE title = ?').run('Freelance Brand Designer')

// Add more jobs
const insertJobFull = db.prepare(`
  INSERT OR IGNORE INTO jobs (title, company, description, location, type, category, salary_range, posted_by, created_at)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
`)

const moreJobs = [
  ['Marketing Analytics Lead', 'Stripe', 'Drive marketing measurement and attribution strategy. Own the marketing data infrastructure and reporting. Collaborate with growth, product, and finance teams to optimize marketing spend.', 'San Francisco, CA', 'full-time', 'Analytics', '$140k - $180k', 9, '2026-03-01T10:00:00Z'],
  ['Content Marketing Manager', 'Notion', 'Create and manage content programs that drive awareness and adoption. Work cross-functionally with product, design, and community teams.', 'Remote', 'full-time', 'Content', '$110k - $140k', 12, '2026-03-02T14:00:00Z'],
  ['Head of Brand Strategy', 'Spotify', 'Lead brand strategy and creative direction for marketing campaigns. Build and mentor a team of brand marketers.', 'Los Angeles, CA', 'full-time', 'Brand', '$160k - $200k', 10, '2026-03-03T09:00:00Z'],
  ['Demand Gen Specialist', 'HubSpot', 'Execute multi-channel demand generation campaigns. Manage paid media, email nurture, and webinar programs.', 'Cambridge, MA', 'full-time', 'Growth', '$90k - $120k', 8, '2026-03-04T11:00:00Z'],
  ['Freelance SEO Consultant', 'Mavuus', 'Help our community platform improve organic search visibility. Audit existing content and develop keyword strategy.', 'Remote', 'freelance', 'SEO', '$100 - $150/hr', 7, '2026-03-05T16:00:00Z'],
]
moreJobs.forEach(j => insertJobFull.run(...j))

// Job applications (demo user has applied to some jobs)
const insertApplication = db.prepare(`
  INSERT OR IGNORE INTO job_applications (job_id, user_id, cover_letter, status, applied_at)
  VALUES (?, ?, ?, ?, ?)
`)

const applications = [
  [1, 7, 'I am excited about this Senior Content Strategist role. With 10+ years in content marketing and community building, I believe I can make a significant impact at TechFlow.', 'reviewing', '2026-03-02T10:00:00Z'],
  [4, 7, 'As a marketing analytics enthusiast, I would love to bring my data-driven approach to Stripe. I have extensive experience with marketing attribution and measurement.', 'applied', '2026-03-04T15:00:00Z'],
]
applications.forEach(a => insertApplication.run(...a))

// Saved jobs
const insertSavedJob = db.prepare('INSERT OR IGNORE INTO saved_jobs (user_id, job_id) VALUES (?, ?)')
insertSavedJob.run(7, 2)
insertSavedJob.run(7, 5)
insertSavedJob.run(7, 6)

// Notifications for demo user
const insertNotification = db.prepare(`
  INSERT INTO notifications (user_id, type, title, message, link, is_read, created_at)
  VALUES (?, ?, ?, ?, ?, ?, ?)
`)

const notificationData = [
  [7, 'connection', 'New Connection Request', 'Priya Patel wants to connect with you', '/dashboard/members/3', 0, '2026-03-01T16:00:00Z'],
  [7, 'connection', 'New Connection Request', 'Alex Thompson wants to connect with you', '/dashboard/members/9', 0, '2026-03-05T10:00:00Z'],
  [7, 'message', 'New Message', 'Jennifer Martinez sent you a message', '/dashboard/messages', 0, '2026-03-07T09:00:00Z'],
  [7, 'job', 'Application Update', 'Your application for Senior Content Strategist is being reviewed', '/dashboard/my-jobs', 1, '2026-03-03T14:00:00Z'],
  [7, 'job', 'New Job Posted', 'A new Content Marketing Manager position was posted', '/dashboard/jobs/5', 1, '2026-03-02T14:00:00Z'],
]
notificationData.forEach(n => insertNotification.run(...n))

console.log('Database seeded successfully!')
db.close()
