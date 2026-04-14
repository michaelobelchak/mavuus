# Mavuus Platform — Comprehensive Analysis & Execution Plan

---

## Part 1: Current State of the Build

### What Exists Today

The project is a **React + Vite frontend** with an **Express + SQLite backend**, already substantially built. Here's the full inventory:

---

### Public Website Pages (7 pages)

| Page | Status | What's Built |
|------|--------|-------------|
| **Homepage** | ✅ Complete | Hero with tab-based CTA (For Marketers / For Business), email signup, avatar stacking, filter tabs, scroll animations |
| **About** | ✅ Complete | Two-column hero, logo bar, testimonials, marketing leaders grid, CTA banner with quote |
| **Pricing** | ✅ Complete | Pricing card with monthly/yearly toggle, feature checklist, logo bar, testimonials |
| **Contact** | ⚠️ Partial | Form UI works (name, email, phone, message), FAQ accordion — but **no backend submission, no email sending** |
| **Articles** | ✅ Complete | Articles from mock data grouped by date, breadcrumbs, date formatting |
| **Events** | ✅ Complete | Events in date-organized sections, status badges, speaker info |
| **Resources Hub** | ✅ Complete | Featured article card, multiple resource sections, category display |
| **Blog Detail** | ⚠️ Shell | Route exists (`/blog/:slug`) but minimal implementation |

---

### Dashboard Pages (14 pages)

| Page | Status | What's Built | What's Missing |
|------|--------|-------------|----------------|
| **Academy (Home)** | ✅ Complete | Tab filters, fetches from API with mock fallback, 3 sections (live, on-demand, resources), greeting, loading skeletons | — |
| **Live Sessions** | ✅ Complete | Lists all live sessions, search + category filtering, grid cards, speaker info | — |
| **On-Demand Videos** | ✅ Complete | Same as live sessions but filtered for on-demand, view counts | — |
| **Resources** | ✅ Complete | Resource cards, search + category filtering, links to detail pages | — |
| **Session Detail** | ⚠️ Shell | Fetches session, basic display | No RSVP, no comments, no related sessions, no video player, minimal styling |
| **Resource Detail** | ⚠️ Shell | Shows resource details | No downloads, no comments, no related resources |
| **Members** | ✅ Complete | Member directory, search, tier filtering, connection requests, message button | — |
| **Member Profile** | ✅ Functional | Full profile (bio, skills, experience, connections), connection + message buttons | No recommended connections, no endorsements |
| **Vendors** | ✅ Complete | Vendor listing, search, category filtering, grid layout | — |
| **Vendor Detail** | ⚠️ Shell | Basic vendor info displayed | No reviews, no recommendation system, no contact/inquiry form |
| **Jobs** | ✅ Complete | Full listing with advanced filters (type, seniority, category), save/unsave | — |
| **Job Detail** | ✅ Complete | Full details, apply with cover letter + resume, shows applicants | No similar jobs, no share |
| **My Jobs** | ✅ Complete | 3 tabs (Applications, Saved, Postings), post new job modal, CRUD | — |
| **Messages** | ✅ Complete | Conversation list, message thread, search, send, auto-polling (5-10s), unread counts, mark as read | No attachments, no typing indicators, no reactions |
| **Profile** | ✅ Complete | 4 tabs (About, Experience, Settings, Account), inline editing, skills management, notification preferences | File uploads not wired to backend, password change may be stubbed |

---

### Backend API (10 route files, 40+ endpoints)

| Route Group | Endpoints | CRUD Status |
|-------------|-----------|-------------|
| **Auth** (`/api/auth`) | POST register, POST login | ✅ Full (JWT, bcrypt, rate limited) |
| **Sessions** (`/api/sessions`) | GET list, GET detail | ⚠️ Read-only (no create/edit/delete) |
| **Resources** (`/api/resources`) | GET list, GET detail | ⚠️ Read-only |
| **Members** (`/api/members`) | GET list, GET detail, GET profile | ⚠️ Read-only |
| **Vendors** (`/api/vendors`) | GET list, GET detail | ⚠️ Read-only |
| **Jobs** (`/api/jobs`) | Full CRUD + apply, save, applicants, status | ✅ Feature complete |
| **Profile** (`/api/profile`) | GET/PUT profile, skills CRUD, experience CRUD | ✅ Feature complete |
| **Connections** (`/api/connections`) | List, pending, status, request, accept, decline, remove | ✅ Feature complete |
| **Messages** (`/api/messages`) | Conversations, messages, send, mark read, unread count | ✅ Feature complete |
| **Notifications** (`/api/notifications`) | List, unread count, mark read, mark all read | ✅ Feature complete |

---

### Database (17 tables in SQLite)

users, user_profiles, user_skills, user_experience, sessions, resources, vendors, jobs, job_applications, saved_jobs, speakers, recommendations, connections, conversations, conversation_participants, messages, notifications

Seeded with 12 demo users + content. WAL mode enabled. Foreign keys with cascading deletes.

---

### UI Component Library (18 reusable components)

Button, Card, Avatar, Badge, Input, Modal, Select, Tabs, TagInput, Toast, Toggle, Breadcrumbs, Accordion, Skeleton, AnimatedSection, EmptyState, ConfirmDialog, ScrollToTop

---

### What's NOT Built At All

| Missing Feature | Notes |
|----------------|-------|
| Global search | Search bar in dashboard header is non-functional |
| File/image uploads | UI exists but no backend integration |
| Admin panel | No admin routes, no admin pages |
| Comments/reviews system | No tables, no endpoints, no UI |
| Recommendation engine | Table exists but completely unused |
| Video player | No playback component for sessions |
| Live streaming / RSVP | No registration flow for live sessions |
| Payment / billing | No Stripe, no subscription management |
| Email service | No transactional emails, no verification |
| Password reset | No forgot password flow |
| Social login (Google OAuth) | Not implemented |
| Email verification | Not implemented |
| Analytics / metrics | No tracking dashboard |
| Speakers page | Table exists, not exposed as a page |
| Waitlist backend | Homepage form not connected |

---

### Technical Debt

| Issue | Severity |
|-------|----------|
| No pagination on any API endpoint | 🔴 High — will break with real data |
| No server-side search (all client-side) | 🔴 High |
| JWT secret hardcoded (not env var) | 🔴 High — security |
| No input format validation (emails, URLs) | 🟡 Medium |
| No error boundaries in React | 🟡 Medium |
| No automated tests (zero) | 🟡 Medium |
| CORS wide open in dev mode | 🟡 Medium |
| JWT stored in localStorage (XSS risk) | 🟡 Medium |
| No caching headers | 🟠 Low |
| No database migration system | 🟠 Low |
| No audit trail / soft deletes | 🟠 Low |

---

## Part 2: Competitive Landscape

### Direct Competitors

| Competitor | What They Do | Pricing | Key Advantage |
|-----------|-------------|---------|---------------|
| **The CMO Club** (club-cmo.com) | Exclusive CMO peer community, 2,000 members, 40+ local chapters | Free + paid events | Established network, in-person events |
| **CMO Council** (cmocouncil.org) | Global network of 16,000+ marketing executives | $495/yr premium | Massive reach, research library |
| **Mayple** (mayple.com) | Hire vetted on-demand marketing talent and agencies | Commission-based | Talent vetting, project matching |
| **MarketerHire** (marketerhire.com) | Elite fractional marketing talent marketplace | Commission-based | Specialized expertise, trial periods |
| **Toptal** (toptal.com) | Top 3% vetted freelancers across all disciplines | Premium rates | Ultra-premium vetting, 98% success rate |
| **Twine** (twine.net) | 750K+ vetted creative/marketing freelancers | Commission-based | Massive network, 250+ categories |

### Indirect Competitors

| Competitor | What They Do | Pricing | Key Advantage |
|-----------|-------------|---------|---------------|
| **LinkedIn** | Professional networking + Services Marketplace | Free + $40-200/mo premium | 900M+ users, credibility |
| **Circle** (circle.so) | All-in-one branded community platform | $89-419/mo | White-label, automation, courses |
| **Mighty Networks** (mightynetworks.com) | Community + learning platform | $41-219/mo | Native mobile apps, courses |
| **Skool** (skool.com) | Creator community with gamification | Mid-market pricing | Gamification, leaderboards |
| **Kajabi** (kajabi.com) | Course + membership platform | $89-399/mo | Course creation, email marketing |
| **Wellfound** (wellfound.com) | Startup talent marketplace (10M+ candidates) | Free/premium | Free job posting, AI sourcing |

### What Competitors Have That Mavuus Doesn't

| Feature | Who Has It | Priority for Mavuus |
|---------|-----------|-------------------|
| Native mobile app | Mighty Networks, Kajabi | 🔴 High — 60% of community activity is mobile |
| AI-powered matching/recommendations | LinkedIn, Wellfound | 🔴 High — huge differentiator opportunity |
| Advanced analytics dashboard | Higher Logic, Circle, Bettermode | 🟡 Medium |
| Gamification (points, levels, leaderboards) | Skool, Mighty Networks | 🟡 Medium |
| Course/content creation tools | Kajabi, Circle, Mighty Networks | 🟡 Medium |
| White-label/branding customization | Circle, Bettermode, Higher Logic | 🟠 Low for now |
| Integrations marketplace (HubSpot, Salesforce) | Most enterprise platforms | 🟠 Low for now |
| In-person event management | CMO Club, CMO Council | 🟠 Low |

### Mavuus's Unique Differentiators

1. **Recommendation-based matching** — trust-driven, not algorithm-driven (unique in this space)
2. **All-in-one for marketing** — vendor marketplace + job board + community + learning in one platform
3. **Affordable pricing** ($9.25/mo vs $89-495/yr for competitors)
4. **CMO + freelancer + vendor ecosystem** — serves all sides of the marketing industry
5. **Combined networking + marketplace** — not just a community, not just a marketplace

---

## Part 3: Information Architecture

### Complete Platform Map

```
MAVUUS PLATFORM
│
├── PUBLIC WEBSITE
│   ├── Homepage
│   │   ├── Hero (dual CTA: Marketers / Business)
│   │   ├── Trusted Brands Logo Bar
│   │   ├── Value Propositions (3 cards)
│   │   ├── How It Works (3 steps)
│   │   ├── Testimonials Carousel
│   │   ├── Marketing Leaders Grid
│   │   ├── Stats Section (members, events, vendors, satisfaction)
│   │   ├── CTA Banner
│   │   └── Footer
│   │
│   ├── About
│   │   ├── Hero (mission statement)
│   │   ├── Founder Story (Dilya & Elmira)
│   │   ├── Team Grid
│   │   ├── Logo Bar
│   │   ├── Testimonials
│   │   ├── Stats
│   │   └── CTA Banner
│   │
│   ├── Pricing
│   │   ├── Plan Card (Pro Access - $9.25/mo yearly)
│   │   ├── Monthly/Yearly Toggle
│   │   ├── Feature Checklist
│   │   ├── Logo Bar
│   │   ├── Testimonials
│   │   └── CTA Banner
│   │
│   ├── Contact
│   │   ├── Contact Form (name, email, phone, message)
│   │   ├── FAQ Accordion
│   │   ├── Logo Bar
│   │   ├── Testimonials
│   │   └── CTA Banner
│   │
│   ├── Resources Hub ← NEW PUBLIC SECTION
│   │   ├── Featured Article
│   │   ├── Articles Grid
│   │   ├── Events Grid
│   │   └── Videos Grid
│   │
│   ├── Articles Page (date-grouped listing)
│   ├── Events Page (date-grouped listing)
│   ├── Blog Detail Page (individual article)
│   │
│   └── Shared Components
│       ├── Public Header (logo, nav, CTA buttons)
│       ├── Footer (links, social, legal)
│       ├── Logo Bar
│       ├── Testimonials Section
│       ├── CTA Banner
│       └── Stats Section
│
├── AUTHENTICATION
│   ├── Login (split screen: testimonial left, form right)
│   │   ├── Email + Password
│   │   ├── Google Sign-In ← NOT BUILT
│   │   ├── Demo Login
│   │   └── Forgot Password ← NOT BUILT
│   │
│   └── Register
│       ├── Name + Email + Password
│       ├── Google Sign-Up ← NOT BUILT
│       └── Email Verification ← NOT BUILT
│
├── DASHBOARD (authenticated)
│   │
│   ├── Top Navigation Bar
│   │   ├── Logo
│   │   ├── Global Search ← NOT FUNCTIONAL
│   │   ├── Notifications Bell (with count)
│   │   ├── Messages Icon (with unread count)
│   │   ├── Settings Icon
│   │   └── Profile Avatar
│   │
│   ├── Left Sidebar
│   │   ├── User Avatar + Name + Title
│   │   ├── Navigation Menu:
│   │   │   ├── Home (Academy)
│   │   │   ├── Live Sessions
│   │   │   ├── On-Demand Videos
│   │   │   ├── Community Resources
│   │   │   ├── Meet The Members
│   │   │   ├── Search for Vendors
│   │   │   ├── Search for Jobs
│   │   │   └── My Jobs
│   │   └── Invite a Friend CTA Card
│   │
│   ├── HOME / ACADEMY ✅
│   │   ├── "Welcome back, [Name]" greeting
│   │   ├── Filter Tabs (CRM, SaaS, CMO, Marketing Tech, AI, MasterMind, View All)
│   │   ├── Upcoming Live Sessions (3 cards, carousel arrows)
│   │   ├── On-Demand Sessions (8 cards in 2 rows, View All link)
│   │   ├── Community Resources (8 cards in 2 rows, View All link)
│   │   └── Past Speakers (8 cards in 2 rows, View All link)
│   │
│   ├── LIVE SESSIONS ✅
│   │   ├── Search bar
│   │   ├── Category filter
│   │   ├── Session cards (image, title, speaker, date, duration, RSVP button)
│   │   └── → Session Detail Page ⚠️
│   │       ├── Session info (basic display)
│   │       ├── Video Player ← NOT BUILT
│   │       ├── RSVP / Register ← NOT BUILT
│   │       ├── Speaker bio ← NOT BUILT
│   │       ├── Related sessions ← NOT BUILT
│   │       └── Comments / Q&A ← NOT BUILT
│   │
│   ├── ON-DEMAND VIDEOS ✅
│   │   ├── Search bar
│   │   ├── Category filter
│   │   ├── Video cards (image, title, speaker, views, Watch Now button)
│   │   └── → Video Detail Page ⚠️ (same issues as session detail)
│   │
│   ├── COMMUNITY RESOURCES ✅
│   │   ├── Search bar
│   │   ├── Category filter
│   │   ├── Resource cards (image, title, author, type, read time)
│   │   └── → Resource Detail Page ⚠️
│   │       ├── Resource content (basic display)
│   │       ├── Download / Bookmark ← NOT BUILT
│   │       ├── Related resources ← NOT BUILT
│   │       └── Comments ← NOT BUILT
│   │
│   ├── MEET THE MEMBERS ✅
│   │   ├── Search bar
│   │   ├── Tier filter (All, Pro, Free)
│   │   ├── Member cards (avatar, name, title, company, tier badge)
│   │   ├── Connect / Message buttons
│   │   └── → Member Profile Page ✅
│   │       ├── Full profile display (bio, industry, experience)
│   │       ├── Skills list
│   │       ├── Work experience timeline
│   │       ├── Connection count
│   │       ├── Connect / Message buttons
│   │       ├── LinkedIn / website links
│   │       ├── Skill Endorsements ← NOT BUILT
│   │       └── Recommended Connections ← NOT BUILT
│   │
│   ├── SEARCH FOR VENDORS ✅
│   │   ├── Search bar
│   │   ├── Category filter
│   │   ├── Vendor cards (company, description, rating, reviews)
│   │   └── → Vendor Detail Page ⚠️
│   │       ├── Vendor info (basic)
│   │       ├── Reviews list ← NOT BUILT
│   │       ├── Write a review ← NOT BUILT
│   │       ├── Recommendation system ← NOT BUILT (table exists, unused)
│   │       ├── Contact / inquiry form ← NOT BUILT
│   │       └── Portfolio / case studies ← NOT BUILT
│   │
│   ├── SEARCH FOR JOBS ✅
│   │   ├── Search bar
│   │   ├── Filters: job type, seniority, category
│   │   ├── Job cards (title, company, location, salary, date, save button)
│   │   └── → Job Detail Page ✅
│   │       ├── Full job description
│   │       ├── Poster info (avatar, name, title)
│   │       ├── Apply button → application modal
│   │       ├── Cover letter field
│   │       ├── Resume upload (UI only, no backend)
│   │       ├── Applicant count
│   │       ├── Similar Jobs ← NOT BUILT
│   │       └── Share button ← NOT BUILT
│   │
│   ├── MY JOBS ✅
│   │   ├── Tab: My Applications (status badges)
│   │   ├── Tab: Saved Jobs (unsave option)
│   │   ├── Tab: My Postings (applicant count, delete option)
│   │   └── Post New Job modal (title, company, description, location, type, category, salary)
│   │
│   ├── MESSAGES ✅
│   │   ├── Conversation list (search, last message preview, unread count)
│   │   ├── Message thread (send, auto-poll, mark read)
│   │   ├── File Attachments ← NOT BUILT
│   │   ├── Typing Indicators ← NOT BUILT
│   │   └── Message Reactions ← NOT BUILT
│   │
│   ├── PROFILE ✅
│   │   ├── About Tab (name, title, company, bio, industry, experience, skills, visibility, links)
│   │   ├── Experience Tab (add/edit/delete work history)
│   │   ├── Settings Tab (notification preferences toggles)
│   │   └── Account Tab (change password — likely stubbed)
│   │
│   ├── NOTIFICATIONS ✅
│   │   ├── Bell icon with unread count
│   │   ├── Notification dropdown (last 50)
│   │   ├── Mark individual / all as read
│   │   └── Links to relevant content
│   │
│   └── NOT YET BUILT — FUTURE DASHBOARD PAGES
│       ├── Admin Panel (user management, content moderation, analytics)
│       ├── Speakers Directory
│       ├── Invite / Referral Page
│       ├── Billing / Subscription Management
│       ├── Analytics Dashboard (for members: profile views, connection growth)
│       └── Settings Page (separate from profile)
│
└── ADMIN PANEL ← ENTIRELY MISSING
    ├── User Management (approve, ban, tier changes)
    ├── Content Management (sessions, resources, articles)
    ├── Vendor Approval / Moderation
    ├── Job Moderation
    ├── Analytics Dashboard
    ├── Recommendation Engine Management
    └── Platform Settings
```

---

## Part 4: Feature Roadmap — What to Build

### Priority 1: Complete What's Started (Critical)

These features are partially built or clearly broken. Finishing them makes the existing platform functional.

| # | Feature | What Needs to Happen | Effort |
|---|---------|---------------------|--------|
| 1.1 | **Session Detail Page** | Add video player component, RSVP/register button, speaker bio section, related sessions | Medium |
| 1.2 | **Resource Detail Page** | Add full content rendering, download/bookmark buttons, related resources | Medium |
| 1.3 | **Vendor Detail Page** | Add reviews list, write review form, contact/inquiry form, portfolio section | Large |
| 1.4 | **Contact form backend** | Create POST endpoint, add email sending (Resend or SendGrid), confirmation | Small |
| 1.5 | **Global search** | Implement server-side search across sessions, resources, members, vendors, jobs | Medium |
| 1.6 | **File uploads** | Add multer middleware, S3/local storage, wire profile avatar + resume uploads | Medium |
| 1.7 | **API pagination** | Add limit/offset to all GET list endpoints, update frontend | Medium |
| 1.8 | **Blog Detail Page** | Full article rendering with rich content, author info, related articles | Small |

### Priority 2: Missing Core Features (High Value)

These features are expected by users and competitors all have them.

| # | Feature | What Needs to Happen | Effort |
|---|---------|---------------------|--------|
| 2.1 | **Recommendation engine** | Activate recommendations table, build UI for giving/receiving vendor recommendations, display on vendor profiles | Large |
| 2.2 | **Comments / reviews system** | New comments table, API endpoints, UI components for sessions, resources, vendors | Large |
| 2.3 | **Password reset flow** | Forgot password page, email token generation, reset page | Medium |
| 2.4 | **Google OAuth** | Add passport-google-oauth20, Google Sign-In button on login/register | Medium |
| 2.5 | **Email verification** | Verification token on register, verification page, resend option | Medium |
| 2.6 | **Email notifications** | Transactional emails for connection requests, messages, job applications | Medium |
| 2.7 | **Invite / referral system** | Referral codes, invite page, tracking, rewards | Medium |
| 2.8 | **Speakers directory page** | New dashboard page listing all speakers from the speakers table | Small |

### Priority 3: Competitive Features (Differentiators)

These put Mavuus ahead of competitors.

| # | Feature | What It Does | Effort |
|---|---------|-------------|--------|
| 3.1 | **AI-powered matching** | Smart vendor/member recommendations based on profile, activity, and stated needs | Large |
| 3.2 | **Admin panel** | User management, content moderation, analytics, vendor approval | Very Large |
| 3.3 | **Payment / billing (Stripe)** | Subscription management, upgrade/downgrade, invoicing | Large |
| 3.4 | **Mobile app (React Native)** | iOS/Android app sharing the same API | Very Large |
| 3.5 | **Gamification** | Points for activity, levels, leaderboard, badges | Medium |
| 3.6 | **Advanced analytics** | Profile views, connection growth, job post performance, session attendance | Large |
| 3.7 | **Skill endorsements** | Members can endorse each other's skills (LinkedIn-style) | Medium |
| 3.8 | **Event RSVP + calendar** | Register for live sessions, add to calendar, reminders | Medium |
| 3.9 | **Video player + progress** | Embedded video player for on-demand content, track watch progress | Medium |
| 3.10 | **Content creation tools** | Allow members to publish articles, create guides | Large |

### Priority 4: Technical Improvements

| # | Item | Why |
|---|------|-----|
| 4.1 | **Server-side search** | Client-side search won't scale beyond 100 records |
| 4.2 | **Proper env config** | JWT secret, API URLs, CORS origins should come from .env |
| 4.3 | **Error boundaries** | Prevent full-page crashes, show graceful error states |
| 4.4 | **Input validation** | Email format, URL format, password strength, field lengths |
| 4.5 | **httpOnly cookies for JWT** | Move tokens out of localStorage to prevent XSS |
| 4.6 | **Rate limiting on all endpoints** | Prevent abuse beyond just auth routes |
| 4.7 | **Database migrations** | Proper migration system instead of raw schema.sql |
| 4.8 | **Automated tests** | At minimum: auth flow, job CRUD, connection flow |
| 4.9 | **SEO meta tags** | React Helmet for public pages, proper Open Graph tags |
| 4.10 | **Production build config** | Docker, deploy scripts, proper env handling |

---

## Part 5: Claude Code Execution Plan

This is a phase-by-phase plan you can feed directly to Claude Code. Each phase is designed to be one Claude Code session.

---

### Phase 1: Fix Technical Foundation

**Prompt for Claude Code:**

```
Read the project at mavuus-app/. Fix the following technical issues:

1. Create a .env file with JWT_SECRET, PORT, CORS_ORIGIN, NODE_ENV
2. Update server/index.js to use env vars instead of hardcoded values
3. Add API pagination to ALL GET list endpoints (sessions, resources, members, vendors, jobs) — support ?page=1&limit=20 query params, return { data, total, page, totalPages }
4. Update all frontend pages that fetch lists to support pagination (add "Load More" or page numbers)
5. Add server-side search to all list endpoints — support ?search=keyword query param that searches across relevant text fields
6. Wire up the global search bar in DashboardLayout to actually search and show results
7. Add React Error Boundary component wrapping the main app and each dashboard page
8. Add proper input validation on the server: email format, URL format, password min 8 chars, field max lengths
9. Run the app and verify everything works: npm run dev for both client and server
```

---

### Phase 2: Complete Incomplete Pages

**Prompt for Claude Code:**

```
Read the project at mavuus-app/. Complete these partially-built pages:

1. SESSION DETAIL PAGE (src/pages/dashboard/SessionDetailPage.jsx):
   - Add a hero section with session thumbnail, title, speaker info, date/time, duration
   - Add RSVP button that creates a record (add rsvps table to schema: session_id, user_id, created_at)
   - Add API endpoint: POST /api/sessions/:id/rsvp and GET /api/sessions/:id/rsvps
   - Add "Related Sessions" section showing 3 sessions in same category
   - Add speaker bio section
   - Style to match the card design system (brand-pink CTAs, rounded corners)

2. RESOURCE DETAIL PAGE (src/pages/dashboard/ResourceDetailPage.jsx):
   - Add full content rendering with proper typography
   - Add "Bookmark" button (add bookmarks table: resource_id, user_id)
   - Add API endpoint: POST /api/resources/:id/bookmark
   - Add "Related Resources" section showing 3 resources in same category
   - Add author info section

3. VENDOR DETAIL PAGE (src/pages/dashboard/VendorDetailPage.jsx):
   - Add full vendor profile: company description, categories, location, website
   - Add reviews section (add reviews table: vendor_id, user_id, rating 1-5, comment, created_at)
   - Add API endpoints: GET /api/vendors/:id/reviews, POST /api/vendors/:id/reviews
   - Add "Write a Review" form (star rating + comment)
   - Add "Request Introduction" button (uses recommendations table)
   - Add portfolio/case studies section placeholder

4. BLOG DETAIL PAGE (src/pages/public/BlogDetailPage.jsx):
   - Add full article rendering with rich content
   - Add author info with avatar
   - Add related articles sidebar
   - Add breadcrumbs

5. CONTACT FORM BACKEND:
   - Add POST /api/contact endpoint
   - Store submissions in new contact_submissions table
   - Wire the ContactPage form to submit to this endpoint
   - Show success confirmation

Run and test each page after building it.
```

---

### Phase 3: Add Missing Core Features

**Prompt for Claude Code:**

```
Read the project at mavuus-app/. Add these missing features:

1. RECOMMENDATION ENGINE:
   - The recommendations table already exists in schema.sql
   - Add API endpoints:
     - POST /api/recommendations (from_user_id, to_user_id, vendor_id, message)
     - GET /api/vendors/:id/recommendations
     - GET /api/members/:id/recommendations-given
   - Add "Recommend this Vendor" button on VendorDetailPage
   - Show recommendations on vendor detail page
   - Add recommendation count to vendor cards

2. COMMENTS SYSTEM:
   - Create comments table (id, entity_type, entity_id, user_id, content, parent_id for replies, created_at)
   - Add generic API endpoints: POST /api/comments, GET /api/comments?entity_type=session&entity_id=1
   - Add CommentSection component (reusable for sessions, resources, vendors)
   - Add to SessionDetailPage, ResourceDetailPage, VendorDetailPage

3. PASSWORD RESET:
   - Add password_reset_tokens table (user_id, token, expires_at)
   - Add POST /api/auth/forgot-password (generates token, stores it — log to console for now instead of email)
   - Add POST /api/auth/reset-password (validates token, updates password)
   - Create ForgotPasswordPage and ResetPasswordPage
   - Add "Forgot password?" link on LoginPage

4. INVITE / REFERRAL SYSTEM:
   - Add referral_codes table (user_id, code, uses_count, created_at)
   - Add referral_tracking table (referrer_id, referred_user_id, created_at)
   - Add GET /api/referrals/my-code and POST /api/referrals/generate
   - Create InvitePage in dashboard with shareable link and tracking stats
   - Wire the "Invite a Friend" CTA in the sidebar to this page

5. SPEAKERS DIRECTORY:
   - Add SpeakersPage to dashboard
   - Add to sidebar navigation
   - Add GET /api/speakers endpoint
   - Show speaker cards with bio, LinkedIn, past sessions

Run and test each feature.
```

---

### Phase 4: File Uploads & Media

**Prompt for Claude Code:**

```
Read the project at mavuus-app/. Add file upload support:

1. UPLOAD INFRASTRUCTURE:
   - npm install multer in server
   - Create /uploads directory for local file storage
   - Add upload middleware configured for images (max 5MB) and documents (max 10MB)
   - Serve static files from /uploads
   - Add POST /api/upload endpoint returning file URL

2. PROFILE AVATAR UPLOAD:
   - Add avatar upload button on ProfilePage
   - Upload to server, update user avatar_url
   - Show preview before upload

3. RESUME UPLOAD:
   - Wire resume upload on ProfilePage and JobDetailPage (apply modal)
   - Store resume URL in user_profiles and job_applications tables
   - Allow download from member profile and job applicant view

4. SESSION/RESOURCE THUMBNAILS:
   - Add admin-only endpoints: POST /api/sessions (create), PUT /api/sessions/:id (update)
   - Same for resources: POST /api/resources, PUT /api/resources/:id
   - Support thumbnail image upload

5. VIDEO PLAYER:
   - Create a VideoPlayer component using HTML5 video or embed (YouTube/Vimeo URLs)
   - Add to SessionDetailPage for on-demand sessions
   - Track view count: PUT /api/sessions/:id/view

Run and test all upload flows.
```

---

### Phase 5: Authentication Enhancements

**Prompt for Claude Code:**

```
Read the project at mavuus-app/. Enhance the authentication system:

1. GOOGLE OAUTH:
   - npm install passport passport-google-oauth20
   - Add Google OAuth strategy to server
   - Add GET /api/auth/google and GET /api/auth/google/callback endpoints
   - Add "Sign in with Google" button on LoginPage and RegisterPage
   - Handle account linking (if Google email matches existing account)
   - Use environment variables for Google client ID and secret

2. EMAIL VERIFICATION:
   - Add email_verified (boolean) and verification_token columns to users table
   - On register, set email_verified = false, generate token
   - Add GET /api/auth/verify-email?token=xxx endpoint
   - Create EmailVerificationPage
   - Show "Please verify your email" banner in dashboard until verified
   - For now, log verification link to console (no email service yet)

3. SECURITY IMPROVEMENTS:
   - Move JWT from localStorage to httpOnly cookies
   - Update AuthContext to work with cookie-based auth
   - Add CSRF protection middleware
   - Add rate limiting to all API endpoints (100 req/min general)
   - Add password complexity rules (min 8 chars, 1 uppercase, 1 number)

Run and test all auth flows.
```

---

### Phase 6: Admin Panel

**Prompt for Claude Code:**

```
Read the project at mavuus-app/. Build an admin panel:

1. ADMIN MIDDLEWARE:
   - Add isAdmin middleware that checks user.role === 'admin'
   - Update seed data to make first user an admin

2. ADMIN ROUTES:
   - POST/PUT/DELETE for sessions, resources, vendors (currently read-only)
   - GET /api/admin/users — list all users with filters
   - PUT /api/admin/users/:id — update role, membership_tier, ban status
   - GET /api/admin/stats — total users, active users, total jobs, total sessions, etc.
   - GET /api/admin/contact-submissions — list contact form submissions

3. ADMIN DASHBOARD PAGE:
   - Create AdminLayout with separate sidebar
   - Stats overview (cards with key metrics)
   - Recent signups list
   - Recent job postings
   - Pending vendor approvals

4. ADMIN PAGES:
   - User Management (list, search, edit roles, ban)
   - Content Management (sessions CRUD, resources CRUD)
   - Vendor Management (approve, edit, remove)
   - Job Moderation (review, remove inappropriate listings)
   - Contact Submissions (view, mark handled)

5. ROUTING:
   - Add /admin/* routes in App.jsx
   - Protect with admin role check
   - Add admin link in dashboard if user.role === 'admin'

Run and test the admin panel with the admin user.
```

---

### Phase 7: Polish & Production Prep

**Prompt for Claude Code:**

```
Read the project at mavuus-app/. Final polish:

1. RESPONSIVE DESIGN:
   - Audit all dashboard pages on mobile (375px) and tablet (768px)
   - Fix any layout breaks
   - Make sidebar collapsible on mobile
   - Ensure all cards stack properly

2. LOADING & TRANSITIONS:
   - Add loading skeletons to any pages missing them
   - Add page transition animations
   - Add optimistic UI updates for connection requests and saves

3. SEO & META:
   - npm install react-helmet-async
   - Add meta tags to all public pages (title, description, Open Graph)
   - Add sitemap.xml generation
   - Add robots.txt

4. PERFORMANCE:
   - Add lazy loading for dashboard pages (React.lazy + Suspense)
   - Optimize images (add loading="lazy" to all img tags)
   - Add caching headers on API responses for static content

5. DEPLOYMENT CONFIG:
   - Create Dockerfile for server
   - Create vercel.json for client deployment
   - Update CORS config for production domains
   - Create deployment README with step-by-step instructions

6. TESTS (minimum viable):
   - Add auth flow tests (register, login, protected routes)
   - Add jobs CRUD tests
   - Add connection flow tests
   - Run all tests and fix failures

Run and verify everything works end to end.
```

---

## Summary: Build Order

| Phase | Focus | Est. Effort |
|-------|-------|-------------|
| **Phase 1** | Technical foundation (pagination, search, env vars, validation) | 1 session |
| **Phase 2** | Complete incomplete pages (session/resource/vendor detail, contact backend) | 1-2 sessions |
| **Phase 3** | Core features (recommendations, comments, password reset, invites, speakers) | 2 sessions |
| **Phase 4** | File uploads & media (avatars, resumes, thumbnails, video player) | 1 session |
| **Phase 5** | Auth enhancements (Google OAuth, email verification, security) | 1 session |
| **Phase 6** | Admin panel (full CRUD, moderation, analytics) | 2 sessions |
| **Phase 7** | Polish & production (responsive, SEO, performance, deploy, tests) | 1-2 sessions |
| **TOTAL** | | **9-11 Claude Code sessions** |

Each phase is self-contained and builds on the previous one. You can pause after any phase and have a working, improved platform.
