# Phase 6: Custom Admin Panel (Complete Platform Management)

## Goal
Build a comprehensive custom admin panel that covers EVERYTHING manageable in the app — users, content, marketplace, moderation, website content, notifications, categories, referrals, exports, settings, and audit logging. After this phase, the founders never need a developer to manage day-to-day operations.

## Claude Code Prompt — Part A (Backend + Core Admin)

```
Read the project at this directory. This is a React + Vite + Tailwind frontend with an Express + SQLite backend. Build a comprehensive custom admin panel. This is Part A — backend routes, database changes, and core admin pages.

1. DATABASE CHANGES:
   Add these new tables to schema.sql:

   -- Categories (dynamic, manageable from admin)
   CREATE TABLE IF NOT EXISTS categories (
     id INTEGER PRIMARY KEY AUTOINCREMENT,
     name TEXT NOT NULL,
     slug TEXT UNIQUE NOT NULL,
     type TEXT NOT NULL CHECK(type IN ('session', 'resource', 'job', 'vendor', 'article')),
     sort_order INTEGER DEFAULT 0,
     is_active INTEGER DEFAULT 1,
     created_at DATETIME DEFAULT CURRENT_TIMESTAMP
   );

   -- Site content (CMS-lite for website pages)
   CREATE TABLE IF NOT EXISTS site_content (
     id INTEGER PRIMARY KEY AUTOINCREMENT,
     page TEXT NOT NULL,
     section TEXT NOT NULL,
     key TEXT NOT NULL,
     value TEXT,
     type TEXT DEFAULT 'text' CHECK(type IN ('text', 'html', 'image', 'number', 'json')),
     updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
     updated_by INTEGER REFERENCES users(id),
     UNIQUE(page, section, key)
   );

   -- Testimonials (manageable from admin)
   CREATE TABLE IF NOT EXISTS testimonials (
     id INTEGER PRIMARY KEY AUTOINCREMENT,
     name TEXT NOT NULL,
     title TEXT,
     company TEXT,
     avatar_url TEXT,
     quote TEXT NOT NULL,
     rating INTEGER DEFAULT 5,
     is_featured INTEGER DEFAULT 0,
     is_active INTEGER DEFAULT 1,
     sort_order INTEGER DEFAULT 0,
     created_at DATETIME DEFAULT CURRENT_TIMESTAMP
   );

   -- Brand logos (manageable from admin)
   CREATE TABLE IF NOT EXISTS brand_logos (
     id INTEGER PRIMARY KEY AUTOINCREMENT,
     name TEXT NOT NULL,
     logo_url TEXT NOT NULL,
     website_url TEXT,
     is_active INTEGER DEFAULT 1,
     sort_order INTEGER DEFAULT 0,
     created_at DATETIME DEFAULT CURRENT_TIMESTAMP
   );

   -- FAQ items (manageable from admin)
   CREATE TABLE IF NOT EXISTS faq_items (
     id INTEGER PRIMARY KEY AUTOINCREMENT,
     question TEXT NOT NULL,
     answer TEXT NOT NULL,
     page TEXT DEFAULT 'general' CHECK(page IN ('general', 'contact', 'pricing', 'about')),
     sort_order INTEGER DEFAULT 0,
     is_active INTEGER DEFAULT 1,
     created_at DATETIME DEFAULT CURRENT_TIMESTAMP
   );

   -- Platform settings (key-value config)
   CREATE TABLE IF NOT EXISTS platform_settings (
     key TEXT PRIMARY KEY,
     value TEXT,
     description TEXT,
     type TEXT DEFAULT 'text' CHECK(type IN ('text', 'number', 'boolean', 'json', 'email', 'url')),
     updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
     updated_by INTEGER REFERENCES users(id)
   );

   -- Audit log (track all admin actions)
   CREATE TABLE IF NOT EXISTS audit_log (
     id INTEGER PRIMARY KEY AUTOINCREMENT,
     admin_id INTEGER REFERENCES users(id),
     action TEXT NOT NULL,
     entity_type TEXT NOT NULL,
     entity_id INTEGER,
     details TEXT,
     ip_address TEXT,
     created_at DATETIME DEFAULT CURRENT_TIMESTAMP
   );

   Add columns to existing tables:
   - users: add is_banned INTEGER DEFAULT 0, ban_reason TEXT, banned_at DATETIME, is_deleted INTEGER DEFAULT 0, deleted_at DATETIME, last_login_at DATETIME
   - jobs: IMPORTANT — the jobs table already has a `status` column for the JOB LIFECYCLE (open/in-progress/completed/closed) and a `hired_user_id` column. Do NOT modify these. Instead add: moderation_status TEXT DEFAULT 'approved' CHECK(moderation_status IN ('approved', 'hidden', 'removed')), admin_notes TEXT
   - vendors: add moderation_status TEXT DEFAULT 'approved' CHECK(moderation_status IN ('approved', 'pending', 'suspended')), admin_notes TEXT
   - IMPORTANT: The reviews table already exists with structure: reviewer_id, reviewee_id, vendor_id (optional), job_id (optional), rating, text. It supports BOTH job reviews and vendor reviews. Do NOT recreate it. The admin panel should handle this dual-purpose structure.

   Seed data:
   - Seed categories for each type (sessions: CRM, SaaS, Marketing Tech, AI, Growth, Branding, Analytics, SEO, Content Strategy, ABM, Paid Media; resources: Guide, Template, Report, Article; jobs: Marketing, Engineering, Design, Sales, Operations; vendors: Design, Web Dev, Copywriting, Social Media, Video, Consulting, SEO, Paid Ads)
   - Seed site_content with all current hardcoded text from homepage, about, pricing pages
   - Seed testimonials from current mockData
   - Seed brand_logos from current mockData
   - Seed faq_items from current mockData
   - Seed platform_settings: site_name=Mavuus, support_email=support@mavuus.com, social_twitter, social_linkedin, social_instagram, membership_price_monthly=15, membership_price_yearly=9.25, maintenance_mode=false, max_upload_size_mb=10
   - Set demo@mavuus.com to role='admin'

2. ADMIN MIDDLEWARE:
   - Create server/middleware/admin.js:
     - isAdmin: checks req.user.role === 'admin', returns 403 if not
     - logAudit(adminId, action, entityType, entityId, details): inserts into audit_log

3. ADMIN API ROUTES:
   Create server/routes/admin.js — ALL endpoints require authenticateToken + isAdmin. Every write action should call logAudit.

   DASHBOARD:
   - GET /api/admin/stats — { totalUsers, activeUsersLast30Days, newUsersThisWeek, newUsersThisMonth, totalJobs, activeJobs, totalSessions, totalResources, totalVendors, totalMessages, totalConnections, totalComments, totalReviews, totalRecommendations, totalReferrals, pendingContactSubmissions }
   - GET /api/admin/stats/growth — weekly signups for last 12 weeks [{week, count}]
   - GET /api/admin/stats/activity — last 20 platform activities [{type, user_name, description, created_at}] (new users, new jobs, new reviews, new connections)

   USERS:
   - GET /api/admin/users — search, filter (role, tier, status: active/banned/deleted), sort (newest/oldest/name), pagination. Return: id, name, email, avatar, role, tier, is_banned, is_deleted, created_at, last_login_at
   - GET /api/admin/users/:id — FULL detail:
     * user + user_profiles + user_skills + user_experience
     * connections: list with names, status, dates + total count
     * messages metadata: conversations with participant names, message counts, last active (NOT message content)
     * jobs_posted: list with applicant counts
     * job_applications: list with job titles, statuses
     * reviews_given: list with vendor names, ratings
     * comments_made: list with entity type, content preview, dates
     * recommendations_given: list with vendor names
     * referrals: referred_by name, list of people referred
     * rsvps: session titles and dates
     * bookmarks: resource titles and dates
     * saved_jobs: job titles
     * notification count (unread)
   - PUT /api/admin/users/:id — update: role, membership_tier, email_verified
   - PUT /api/admin/users/:id/ban — set is_banned=1, ban_reason, banned_at=now. Log audit.
   - PUT /api/admin/users/:id/unban — set is_banned=0, clear ban_reason. Log audit.
   - DELETE /api/admin/users/:id/soft — set is_deleted=1, deleted_at=now. Log audit.
   - PUT /api/admin/users/:id/restore — set is_deleted=0. Log audit.
   - DELETE /api/admin/users/:id/permanent — hard delete CASCADE. Require confirmation token in body. Log audit.

   SESSIONS:
   - GET /api/admin/sessions — search, filter (type, category), sort, pagination. Include RSVP count.
   - POST /api/admin/sessions — create. Log audit.
   - PUT /api/admin/sessions/:id — update. Log audit.
   - DELETE /api/admin/sessions/:id — delete + cascade RSVPs/comments. Log audit.

   RESOURCES:
   - GET /api/admin/resources — search, filter (type, category), sort, pagination. Include bookmark count.
   - POST /api/admin/resources — create. Log audit.
   - PUT /api/admin/resources/:id — update. Log audit.
   - DELETE /api/admin/resources/:id — delete + cascade bookmarks/comments. Log audit.

   SPEAKERS:
   - GET /api/admin/speakers — search, pagination. Include session count.
   - POST /api/admin/speakers — create. Log audit.
   - PUT /api/admin/speakers/:id — update. Log audit.
   - DELETE /api/admin/speakers/:id — delete. Log audit.

   VENDORS:
   - GET /api/admin/vendors — search, filter (category, status), sort (rating/reviews/newest), pagination.
   - PUT /api/admin/vendors/:id — update details, status, admin_notes. Log audit.
   - DELETE /api/admin/vendors/:id — delete + cascade reviews/recommendations/comments. Log audit.

   JOBS:
   - GET /api/admin/jobs — search, filter (type, status), sort, pagination. Include poster name, applicant count.
   - GET /api/admin/jobs/:id/applications — list all applications with applicant info, status, resume URL
   - PUT /api/admin/jobs/:id — update moderation_status (approved/hidden/removed), admin_notes. NOTE: The job's lifecycle `status` (open/in-progress/completed/closed) is managed by the job poster, NOT admin. Admin controls moderation_status. Log audit.
   - PUT /api/admin/jobs/:id/applications/:appId — admin can override application status (for disputes). Log audit.
   - DELETE /api/admin/jobs/:id — hard delete. Log audit.

   COMMENTS:
   - GET /api/admin/comments — search, filter (entity_type), sort (newest), pagination. Include author name, entity title.
   - DELETE /api/admin/comments/:id — delete. Log audit.

   REVIEWS (note: reviews table supports BOTH job reviews and vendor reviews):
   - GET /api/admin/reviews — search, filter by rating, filter by type (job/vendor based on which foreign key is set), sort, pagination. Include reviewer name, reviewee name, vendor name (if vendor review), job title (if job review).
   - DELETE /api/admin/reviews/:id — delete. If vendor review, recalculate vendor rating/reviews_count. Log audit.

   RECOMMENDATIONS:
   - GET /api/admin/recommendations — search, sort, pagination. Include recommender name, vendor name.
   - DELETE /api/admin/recommendations/:id — delete. Log audit.

   CONTACT SUBMISSIONS:
   - GET /api/admin/contact-submissions — filter (status: new/in-progress/handled), sort, pagination.
   - PUT /api/admin/contact-submissions/:id — update status, admin_notes. Log audit.

   CATEGORIES:
   - GET /api/admin/categories — list all, filter by type
   - POST /api/admin/categories — create (name, type, sort_order). Log audit.
   - PUT /api/admin/categories/:id — update name, sort_order, is_active. Log audit.
   - DELETE /api/admin/categories/:id — delete (only if no entities using it, else return error). Log audit.

   NOTIFICATIONS (admin broadcast):
   - GET /api/admin/notifications/sent — list previously sent admin notifications
   - POST /api/admin/notifications/broadcast — send notification to: all users, or by tier (free/pro), or by role. Fields: title, message, link (optional). Creates a notification record for each target user. Log audit.

   SITE CONTENT (CMS-lite):
   - GET /api/admin/site-content — list all, group by page
   - GET /api/admin/site-content/:page — get all content for a specific page
   - PUT /api/admin/site-content/:id — update value. Log audit.
   - (No create/delete — content keys are pre-seeded and fixed)

   TESTIMONIALS:
   - GET /api/admin/testimonials — list all, sort by sort_order
   - POST /api/admin/testimonials — create. Log audit.
   - PUT /api/admin/testimonials/:id — update. Log audit.
   - DELETE /api/admin/testimonials/:id — delete. Log audit.

   BRAND LOGOS:
   - GET /api/admin/brand-logos — list all, sort by sort_order
   - POST /api/admin/brand-logos — create. Log audit.
   - PUT /api/admin/brand-logos/:id — update. Log audit.
   - DELETE /api/admin/brand-logos/:id — delete. Log audit.

   FAQ ITEMS:
   - GET /api/admin/faq — list all, filter by page, sort by sort_order
   - POST /api/admin/faq — create. Log audit.
   - PUT /api/admin/faq/:id — update. Log audit.
   - DELETE /api/admin/faq/:id — delete. Log audit.

   PLATFORM SETTINGS:
   - GET /api/admin/settings — list all settings
   - PUT /api/admin/settings/:key — update value. Log audit.

   REFERRALS:
   - GET /api/admin/referrals/stats — { totalReferrals, topReferrers: [{name, count}], referralsThisMonth, referralsThisWeek }
   - GET /api/admin/referrals — list all referral pairs (referrer name, referred name, date), pagination

   DATA EXPORTS:
   - GET /api/admin/export/users?format=csv — export user list as CSV (name, email, title, company, tier, role, joined, last_login)
   - GET /api/admin/export/jobs?format=csv — export jobs as CSV
   - GET /api/admin/export/vendors?format=csv — export vendors as CSV
   - GET /api/admin/export/analytics?format=csv — export stats summary

   AUDIT LOG:
   - GET /api/admin/audit-log — list all admin actions, filter by admin_id, entity_type, date range, pagination. Include admin name.

   UPDATE PUBLIC API ROUTES:
   - Update public routes to use the new database tables:
     - GET /api/categories?type=session — returns active categories for a given type (used by frontend filter dropdowns)
     - GET /api/testimonials — returns active testimonials (used by public pages)
     - GET /api/brand-logos — returns active logos (used by LogoBar)
     - GET /api/faq?page=contact — returns active FAQ items for a page
     - GET /api/site-content/:page — returns content for a page (used by public pages to render dynamic text)
     - GET /api/settings/public — returns non-sensitive settings (site_name, social links)

   Register: app.use('/api/admin', adminRoutes)

4. UPDATE FRONTEND — PUBLIC PAGES TO USE DYNAMIC CONTENT:
   - Update LogoBar.jsx: fetch from GET /api/brand-logos instead of mockData
   - Update TestimonialsSection.jsx and TestimonialRow.jsx: fetch from GET /api/testimonials
   - Update FAQSection.jsx: fetch from GET /api/faq?page=xxx
   - Update HomePage.jsx, AboutPage.jsx, PricingPage.jsx: fetch text content from GET /api/site-content/:page
     - Use a useSiteContent(page) hook that fetches and returns content keyed by section+key
     - Fallback to hardcoded defaults if API fails (so site still works without backend)
   - Update all category filter dropdowns (sessions, resources, jobs, vendors pages): fetch from GET /api/categories?type=xxx instead of hardcoded arrays
   - Update Footer.jsx: fetch social links from GET /api/settings/public

5. VERIFY BACKEND:
   - Run seed, verify all new tables populated
   - Test each admin endpoint with curl or Postman
   - Verify audit_log records admin actions
   - Verify public API routes return dynamic content
   - Verify category filters on dashboard pages use dynamic categories
```

## Claude Code Prompt — Part B (Admin Frontend Pages)

```
Continue building the admin panel frontend. The backend from Part A should already be in place. Build all admin pages:

1. ADMIN LAYOUT (src/components/layout/AdminLayout.jsx):
   - Left sidebar with dark indigo/navy background (#1E1B4B or similar) to distinguish from member dashboard
   - Sidebar sections with icons (use lucide-react icons):
     OVERVIEW:
       - Dashboard (LayoutDashboard icon)
     USERS:
       - User Management (Users icon)
     CONTENT:
       - Sessions (Video icon)
       - Resources (BookOpen icon)
       - Speakers (Mic icon)
     MARKETPLACE:
       - Vendors (Store icon)
       - Jobs (Briefcase icon)
     MODERATION:
       - Comments (MessageSquare icon)
       - Reviews (Star icon)
       - Recommendations (ThumbsUp icon)
     WEBSITE:
       - Page Content (FileText icon)
       - Testimonials (Quote icon)
       - Brand Logos (Image icon)
       - FAQ (HelpCircle icon)
       - Categories (Tag icon)
     SYSTEM:
       - Notifications (Bell icon)
       - Referrals (Gift icon)
       - Settings (Settings icon)
       - Audit Log (Shield icon)
       - Data Exports (Download icon)
   - Top bar: "Mavuus Admin" text, breadcrumbs, "← Back to Dashboard" link, admin name + avatar
   - Active sidebar item highlighted with brand-pink accent
   - Collapsible sidebar sections (click section header to expand/collapse)

2. AdminRoute (src/components/layout/AdminRoute.jsx):
   - Extends ProtectedRoute, checks user.role === 'admin'
   - Redirects to /dashboard with toast "Admin access required"

3. ADMIN PAGES — build each of these:

   DASHBOARD (src/pages/admin/AdminDashboardPage.jsx):
   - 4 stat cards: Total Users (+X this week badge), Active Jobs, Total Sessions, Total Vendors
   - Growth chart: recharts LineChart of weekly signups (12 weeks)
   - Two columns:
     - Left: "Recent Signups" table (10 rows: avatar, name, email, tier badge, date)
     - Right: "Recent Activity" feed (15 items: icon + "[Name] [action]" + timestamp)
   - Quick action buttons: Add Session, Add Resource, Add Speaker, View Contact Forms

   USER LIST (src/pages/admin/AdminUsersPage.jsx):
   - Search bar + Role/Tier/Status filter dropdowns + Sort dropdown
   - Results count: "Showing 1-20 of X users"
   - Table: checkbox, avatar, name, email, role badge (purple for admin), tier badge (gold for pro), status badge (green=active, red=banned, gray=deleted), joined date, last login, actions
   - Actions: "View" (navigates to detail), quick Ban/Unban toggle
   - Bulk actions bar (appears when checkboxes selected): "Ban Selected (X)", "Delete Selected (X)" with confirmation
   - Pagination

   USER DETAIL (src/pages/admin/AdminUserDetailPage.jsx):
   - Route: /admin/users/:id
   - Header card: large avatar, name, email, title @ company, role badge, tier badge, status badge, member since date
   - Action buttons row: Change Role (dropdown), Change Tier (dropdown), Ban/Unban (with reason modal), Soft Delete, Restore, Permanent Delete (double confirm)
   - 6 Tabs:
     Tab 1 — PROFILE: bio, industry, years experience, location, timezone, linkedin, website, skills (as badges), visibility setting, email verified status
     Tab 2 — EXPERIENCE: work history cards (company, title, dates, current badge, description)
     Tab 3 — CONNECTIONS: table (avatar, name, title, status badge, who initiated, date). Count header.
     Tab 4 — ACTIVITY: sub-sections for jobs posted (table), job applications (table with status), reviews written (vendor, rating stars, comment), comments (entity type, preview, date), recommendations (vendor, message), RSVPs (session, date), bookmarks (resource, date), saved jobs (title, date)
     Tab 5 — MESSAGES: conversations table (participant avatar+name, message count, last active). Privacy note: "Message content is private — only metadata shown." Total count.
     Tab 6 — ACCOUNT: created date, last login, email verified (with override toggle), tier (with change dropdown + save), role (with change dropdown + save), referral info (referred by, people referred list), ban section (status, reason, date, ban/unban button), danger zone (permanent delete with confirmation modal requiring typing "DELETE" to confirm)

   SESSIONS MANAGEMENT (src/pages/admin/AdminSessionsPage.jsx):
   - Search + type filter (all/live/on-demand) + category filter (from /api/categories?type=session)
   - Table: small thumbnail, title, speaker, type badge, category, date, views, RSVP count, actions (Edit, Delete)
   - "Add New Session" button opens modal
   - Create/Edit modal: title, description (textarea), speaker_name, speaker_title, speaker_avatar (URL input), type dropdown, category dropdown (from API), scheduled_date (date input), duration, video_url, thumbnail_url
   - Delete confirmation dialog

   RESOURCES MANAGEMENT (src/pages/admin/AdminResourcesPage.jsx):
   - Search + type filter + category filter
   - Table: thumbnail, title, author, type badge, category, read_time, bookmark count, actions
   - Create/Edit modal: title, description (textarea), content (large textarea), author, type dropdown, category dropdown, read_time, url, thumbnail_url
   - Delete confirmation

   SPEAKERS MANAGEMENT (src/pages/admin/AdminSpeakersPage.jsx):
   - Search
   - Table: avatar, name, title, company, sessions count, LinkedIn link, actions
   - Create/Edit modal: name, title, company, avatar_url, bio (textarea), linkedin_url
   - Delete confirmation

   VENDORS MANAGEMENT (src/pages/admin/AdminVendorsPage.jsx):
   - Search + category filter + status filter (active/pending/suspended)
   - Table: company name, contact user (link to user detail), categories, rating (stars), reviews count, recommendations count, status badge, actions
   - Edit modal: company details + status dropdown + admin_notes textarea
   - "View Reviews" link (opens modal with reviews list and delete buttons)
   - Delete confirmation

   JOBS MODERATION (src/pages/admin/AdminJobsPage.jsx):
   - Search + type filter + moderation_status filter (approved/hidden/removed) + lifecycle status filter (open/in-progress/completed/closed)
   - Table: title, company, posted by (link to user detail), date, applicant count, status badge, actions
   - Actions: View Applications (modal with applicant list, statuses, resume download links, admin can override status), Hide/Restore, Remove, Edit admin notes
   - Inline admin_notes field

   COMMENTS MODERATION (src/pages/admin/AdminCommentsPage.jsx):
   - Search + entity type filter
   - Table: content preview (truncated 100 chars), author (link to user detail), entity type badge, entity title, date, actions
   - Actions: View full (modal), Delete (confirmation)

   REVIEWS MODERATION (src/pages/admin/AdminReviewsPage.jsx):
   - Search + rating filter (1-5 dropdown) + type filter (Job Review / Vendor Review)
   - Table: type badge (Job/Vendor), reviewer (link to user detail), reviewee (link to user detail), vendor name or job title (depending on type), rating (stars), text preview, date, actions
   - Actions: View full, Delete (confirmation — if vendor review, note that vendor rating will be recalculated)

   RECOMMENDATIONS MODERATION (src/pages/admin/AdminRecommendationsPage.jsx):
   - Table: recommender (link to user), vendor name, message preview, date, actions
   - Actions: View full, Delete

   CONTACT SUBMISSIONS (src/pages/admin/AdminContactPage.jsx):
   - Status filter (new/in-progress/handled)
   - Table: name, email, phone, message preview, date, status badge
   - Click row to expand: full message, admin_notes textarea, status dropdown (new/in-progress/handled), Save button
   - Quick "Mark as Handled" action

   PAGE CONTENT — CMS LITE (src/pages/admin/AdminSiteContentPage.jsx):
   - Tabs for each page: Homepage, About, Pricing
   - Each tab shows all editable content grouped by section:
     Homepage sections: Hero (title, subtitle, CTA text), Features (card titles, descriptions), Stats (numbers, labels)
     About sections: Hero (headline, badge text), Founder Story (paragraphs), Stats (numbers, labels)
     Pricing sections: Plan name, prices (monthly, yearly), subtitle, feature list description
   - Each field has an inline edit button — click to make editable, Save/Cancel buttons appear
   - Show "Last updated by [admin] on [date]" for each field
   - Preview button that opens the public page in a new tab

   TESTIMONIALS MANAGEMENT (src/pages/admin/AdminTestimonialsPage.jsx):
   - Sortable list (drag to reorder, or sort_order number inputs)
   - Table: avatar, name, title @ company, quote preview, rating stars, featured badge, active toggle, actions
   - Create/Edit modal: name, title, company, avatar_url, quote (textarea), rating (1-5), is_featured checkbox
   - Toggle active/inactive inline
   - Delete confirmation

   BRAND LOGOS MANAGEMENT (src/pages/admin/AdminBrandLogosPage.jsx):
   - Sortable list
   - Grid: logo image, company name, active toggle, actions
   - Create/Edit modal: name, logo_url (with preview), website_url, sort_order
   - Toggle active/inactive inline
   - Delete confirmation

   FAQ MANAGEMENT (src/pages/admin/AdminFaqPage.jsx):
   - Tab filter by page (General, Contact, Pricing, About)
   - Sortable list
   - Table: question (truncated), answer preview, page badge, sort order, active toggle, actions
   - Create/Edit modal: question, answer (textarea), page dropdown, sort_order
   - Toggle active/inactive inline
   - Delete confirmation

   CATEGORIES MANAGEMENT (src/pages/admin/AdminCategoriesPage.jsx):
   - Tab filter by type (Session, Resource, Job, Vendor, Article)
   - Table: name, slug, type badge, sort order, active toggle, entity count (how many sessions/resources/etc use this category), actions
   - Create modal: name (auto-generate slug), type dropdown, sort_order
   - Edit: name, sort_order, active toggle
   - Delete: only if entity count = 0, else show error "X sessions are using this category"
   - Reorder with sort_order

   NOTIFICATIONS BROADCAST (src/pages/admin/AdminNotificationsPage.jsx):
   - "Send New Notification" form:
     - Title input
     - Message textarea
     - Link input (optional, e.g. /dashboard/sessions/5)
     - Target: radio buttons — All Users, Pro Members Only, Free Members Only
     - Preview card showing how the notification will look
     - "Send to X users" button with confirmation
   - Below: "Previously Sent" table: title, message preview, target, sent by, date, recipients count

   REFERRALS (src/pages/admin/AdminReferralsPage.jsx):
   - Stats cards: Total Referrals, This Month, This Week, Top Referrer
   - Top Referrers table (top 20): rank, avatar, name, referral count, referral code
   - Full referral list table: referrer name, referred user name, date joined, pagination

   PLATFORM SETTINGS (src/pages/admin/AdminSettingsPage.jsx):
   - Grouped sections:
     GENERAL: Site Name, Support Email
     SOCIAL MEDIA: Twitter URL, LinkedIn URL, Instagram URL
     MEMBERSHIP: Monthly Price, Yearly Price
     SYSTEM: Maintenance Mode (toggle), Max Upload Size (MB)
   - Each field with label, current value, edit button
   - Save button per section (or per field)
   - Show "Updated by [admin] on [date]" for each setting

   DATA EXPORTS (src/pages/admin/AdminExportsPage.jsx):
   - Cards for each export type:
     - Users Export: "Download all user data as CSV" + Download button
     - Jobs Export: "Download all job listings as CSV" + Download button
     - Vendors Export: "Download all vendor data as CSV" + Download button
     - Analytics Export: "Download platform stats summary as CSV" + Download button
   - Each button triggers GET /api/admin/export/xxx?format=csv and downloads the file
   - Show last export date if tracked

   AUDIT LOG (src/pages/admin/AdminAuditLogPage.jsx):
   - Filter: admin user dropdown, entity type dropdown, date range
   - Table: timestamp, admin name (avatar + name), action, entity type badge, entity ID (link if applicable), details preview
   - Click row to expand full details JSON
   - Pagination
   - "Last 500 actions" default view

4. ROUTING — add ALL to App.jsx wrapped in AdminRoute:
   /admin → AdminDashboardPage
   /admin/users → AdminUsersPage
   /admin/users/:id → AdminUserDetailPage
   /admin/sessions → AdminSessionsPage
   /admin/resources → AdminResourcesPage
   /admin/speakers → AdminSpeakersPage
   /admin/vendors → AdminVendorsPage
   /admin/jobs → AdminJobsPage
   /admin/comments → AdminCommentsPage
   /admin/reviews → AdminReviewsPage
   /admin/recommendations → AdminRecommendationsPage
   /admin/contact → AdminContactPage
   /admin/site-content → AdminSiteContentPage
   /admin/testimonials → AdminTestimonialsPage
   /admin/brand-logos → AdminBrandLogosPage
   /admin/faq → AdminFaqPage
   /admin/categories → AdminCategoriesPage
   /admin/notifications → AdminNotificationsPage
   /admin/referrals → AdminReferralsPage
   /admin/settings → AdminSettingsPage
   /admin/exports → AdminExportsPage
   /admin/audit-log → AdminAuditLogPage

   Add "Admin Panel" link in DashboardSidebar — visible only if user.role === 'admin'

5. VERIFY:
   - Login as demo@mavuus.com (admin)
   - Admin dashboard: verify stats match database
   - Users: search, filter, click into detail, verify all 6 tabs load
   - Change a user's role and tier from detail page
   - Ban a user with a reason, verify banner shows
   - Create a session, verify it appears in member dashboard
   - Create a resource, verify it appears
   - Create a speaker, verify speakers page shows them
   - Delete a comment from moderation
   - Delete a review, verify vendor rating recalculates
   - Delete a recommendation
   - Mark a contact submission as handled
   - Hide a job, verify hidden from member view
   - View job applications as admin, override an application status
   - Edit homepage hero text in Site Content, verify public homepage updates
   - Add a testimonial, verify it appears on public pages
   - Add a brand logo, verify it appears in LogoBar
   - Add a FAQ item, verify it appears on contact page
   - Add a new category, verify it appears in filter dropdowns
   - Send a broadcast notification to all users, verify it appears in their notification bell
   - View referral stats and top referrers
   - Change a platform setting (e.g. support email)
   - Export users as CSV, open and verify data
   - Check audit log shows all actions you just performed
   - Verify non-admin user gets redirected from /admin
   - No console errors
```

## Admin Panel Coverage Map

| What Needs Managing | Admin Page | Status |
|---|---|---|
| Users (profile, ban, delete, roles) | User Management + Detail | ✅ |
| User connections | User Detail → Connections tab | ✅ |
| User activity (jobs, reviews, comments) | User Detail → Activity tab | ✅ |
| User messages (metadata only) | User Detail → Messages tab | ✅ |
| User account (tier, role, verify) | User Detail → Account tab | ✅ |
| Sessions (CRUD) | Sessions Management | ✅ |
| Resources (CRUD) | Resources Management | ✅ |
| Speakers (CRUD) | Speakers Management | ✅ |
| Vendors (edit, status, notes) | Vendors Management | ✅ |
| Jobs (moderate, hide, remove) | Jobs Moderation | ✅ |
| Job applications (oversight, override) | Jobs → View Applications | ✅ |
| Comments (view, delete) | Comments Moderation | ✅ |
| Reviews (view, delete) | Reviews Moderation | ✅ |
| Recommendations (view, delete) | Recommendations Moderation | ✅ |
| Contact submissions | Contact Page | ✅ |
| Categories (dynamic management) | Categories Management | ✅ |
| Broadcast notifications | Notifications Page | ✅ |
| Homepage/About/Pricing text | Site Content (CMS-lite) | ✅ |
| Testimonials (CRUD) | Testimonials Management | ✅ |
| Brand logos (CRUD) | Brand Logos Management | ✅ |
| FAQ items (CRUD) | FAQ Management | ✅ |
| Platform settings | Settings Page | ✅ |
| Referral program stats | Referrals Page | ✅ |
| Data exports (CSV) | Exports Page | ✅ |
| Admin action history | Audit Log | ✅ |
| Platform stats + growth | Dashboard | ✅ |

## Acceptance Criteria
- [ ] All 7 new database tables created and seeded
- [ ] Admin middleware blocks non-admins, audit log records all actions
- [ ] User list: search, filter, sort, pagination, bulk actions
- [ ] User detail: all 6 tabs with real data, all account actions work
- [ ] Session/Resource/Speaker full CRUD from admin
- [ ] Vendor management with status and admin notes
- [ ] Job moderation + application oversight
- [ ] Comment/Review/Recommendation moderation
- [ ] Contact submissions management
- [ ] Dynamic categories used by all frontend filter dropdowns
- [ ] Site content editable from admin, reflected on public pages
- [ ] Testimonials/Logos/FAQ CRUD reflected on public pages
- [ ] Broadcast notifications reach target users
- [ ] Referral stats visible
- [ ] Platform settings editable
- [ ] CSV exports download correctly
- [ ] Audit log shows all admin actions with details
- [ ] Public pages fetch dynamic content with hardcoded fallbacks
- [ ] Admin panel visually distinct (dark indigo sidebar)
- [ ] Non-admins cannot access /admin
