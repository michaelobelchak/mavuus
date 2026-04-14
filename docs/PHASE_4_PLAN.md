# Mavuus — Remaining Work Plan

> **Last updated:** 2026-03-15
> **Status:** Phases 1–3 complete, Phase 4 in progress
> **What's running:** Frontend on :5173, Backend on :3001, SQLite DB seeded

---

## Completed Plans

| Phase | Document | Status |
|-------|----------|--------|
| Phase 1: Foundation | [`docs/MAVUUS_PROJECT_PLAN.md`](MAVUUS_PROJECT_PLAN.md) | Done (2026-03-06) |
| Phase 2: Public Website | [`docs/MAVUUS_PROJECT_PLAN.md`](MAVUUS_PROJECT_PLAN.md) | Done (2026-03-06) |
| Phase 3: Interactive Platform | [`docs/PHASE_3_PLAN.md`](PHASE_3_PLAN.md) | Done (2026-03-07) |
| Phase 4: Fixes & Polish | This document | In Progress |

Full change history: [`CHANGELOG.md`](../CHANGELOG.md)

---

## Phase 4: Critical Fixes & Core Functionality

### 4.0 — CRITICAL: Fix Demo Login (Blocker)
**Problem:** `demoLogin()` in `AuthContext.jsx` creates a fake base64 token. Server's `jwt.verify()` rejects it, so ALL authenticated features return 403.

**Fix:**
- [ ] Change `demoLogin()` to call real `POST /api/auth/login` with `demo@mavuus.com` / `demo123`
- [ ] Add `avatar_url` and `membership_tier` to JWT payload in `server/routes/auth.js`
- [ ] Verify: profile loads, messages load, connections work, notifications work

**Files:** `client/src/context/AuthContext.jsx`, `server/routes/auth.js`

**Unblocks:** Profile page, Messages, Connections, all dashboard features requiring auth

---

### 4.1 — Fix On-Demand Videos Page (Currently Crashes)
**Problem:** Page renders blank because `video.views.toLocaleString()` crashes — the API has no `views` field in the sessions table. Also filter categories don't match actual data.

**Fix:**
- [ ] Add `views` column to `sessions` table in `schema.sql` (INTEGER DEFAULT 0)
- [ ] Seed views data for on-demand sessions in `seed.js`
- [ ] Update category filters to match actual data categories: "All", "Paid Media", "Branding", "Analytics" (+ add more sessions with more categories)
- [ ] Add null-safe fallback: `(video.views || 0).toLocaleString()` in `OnDemandPage.jsx`
- [ ] Verify page renders with API data

**Files:** `server/db/schema.sql`, `server/db/seed.js`, `client/src/pages/dashboard/OnDemandPage.jsx`

---

### 4.2 — Fix Live Sessions Page (Register Button Does Nothing)
**Problem:** Session cards show but "Register" button is non-functional. No detail page exists.

**Fix:**
- [ ] **NEW** `SessionDetailPage.jsx` — hero image, full description, speaker bio, date/time, register CTA
- [ ] Add route `/dashboard/live-sessions/:id` in `App.jsx`
- [ ] Make session cards clickable with `<Link>` to detail page
- [ ] Register button should show confirmation (toast or modal: "You're registered!")
- [ ] Add `registrations` table to DB or track in-memory for demo
- [ ] Show "Registered" state on button after click

**Files:** New `SessionDetailPage.jsx`, `App.jsx`, `LiveSessionsPage.jsx`, `schema.sql`

---

### 4.3 — Fix Community Resources (Should Open Like Blog)
**Problem:** Resource cards are not clickable. Should open a full article/blog-style page.

**Fix:**
- [ ] **NEW** `ResourceDetailPage.jsx` — full-width content layout like `BlogDetailPage.jsx`:
  - Hero thumbnail image
  - Title, author, date, read time, category badge
  - Full article body content
  - Related resources sidebar or bottom section
  - Download CTA for guides/templates
- [ ] Add route `/dashboard/resources/:id` in `App.jsx`
- [ ] Make resource cards clickable with `<Link>`
- [ ] Expand resource content in `seed.js` — each resource needs a full `content` field (multiple paragraphs, like a real article)
- [ ] Add `content` column to `resources` table in `schema.sql` if not present

**Files:** New `ResourceDetailPage.jsx`, `App.jsx`, `ResourcesPage.jsx`, `schema.sql`, `seed.js`

---

### 4.4 — Fix Meet The Members (Connect Button Broken)
**Problem:** "Connect" button on member cards and profile page doesn't work (403 from fake token). After auth fix, need to verify full flow.

**Fix:**
- [ ] After #4.0 auth fix, verify Connect button calls `POST /api/connections/request`
- [ ] Show connection state on member cards: "Connect" → "Pending" → "Connected"
- [ ] On MemberProfilePage: Connect/Message buttons should work
- [ ] When connected, "Message" button should open/create a conversation
- [ ] Seed sample connections between demo user and 2-3 other members
- [ ] Show connection count on member profile
- [ ] Add notification when someone connects

**Files:** `MembersPage.jsx`, `MemberProfilePage.jsx`, `seed.js`

---

### 4.5 — Fix Vendors Page (No Detail View, No Cross-Links)
**Problem:** Vendor cards show but clicking does nothing. No way to see full vendor info, their job posts, or group affiliations.

**Fix:**
- [ ] **NEW** `VendorDetailPage.jsx` — full vendor profile:
  - Company name, logo/avatar, description, rating, review count
  - Location, website link, categories/specialties
  - "Jobs by this vendor" section — query jobs table by company name match
  - "Groups/communities" section (which Mavuus groups they're part of)
  - Contact/connect CTA
  - Recommendations from other members
- [ ] Add route `/dashboard/vendors/:id` in `App.jsx`
- [ ] Make vendor cards clickable with `<Link>`
- [ ] Expand vendor seed data: more vendors (6+), richer descriptions, link some to job postings
- [ ] Add `GET /api/vendors/:id` endpoint (already exists, verify it returns full data)

**Files:** New `VendorDetailPage.jsx`, `App.jsx`, `VendorsPage.jsx`, `seed.js`

---

### 4.6 — Fix Search for Jobs (Layout + Content)
**Problem:** Job descriptions are thin. Layout needs redesign — main content should be wide (not cards grid).

**Fix:**
- [ ] Redesign `JobsPage.jsx` layout:
  - Left main area (wide, ~70%): job listing cards, each showing title, company, location, type, salary, short description, posted date
  - Right sidebar (~30%): filters (category, type, location, salary range)
  - Or: full-width list layout with each job as a horizontal row/card
- [ ] Redesign `JobDetailPage.jsx` layout:
  - Wide main content area (left, ~70%): full description, responsibilities, requirements, benefits, skills
  - Sidebar (right, ~30%): company info card, apply button, save button, similar jobs
- [ ] Expand ALL job descriptions in `seed.js`:
  - Multiple paragraphs of description
  - Bullet-point responsibilities (5-8 items)
  - Requirements section (5-8 items)
  - Benefits section (4-6 items)
  - Skills tags
  - Seniority level (Junior, Mid, Senior, Lead, VP)
- [ ] Add `seniority` column to jobs table
- [ ] Add 5+ more jobs with variety (different seniority, locations, types)

**Files:** `JobsPage.jsx`, `JobDetailPage.jsx`, `schema.sql`, `seed.js`

---

### 4.7 — Fix Messages Page (Empty, No Conversations)
**Problem:** Messages page is empty because: (a) fake token blocks API, (b) no conversations seeded.

**Fix:**
- [ ] After #4.0 auth fix, verify conversations load from API
- [ ] Seed 3-4 conversations with realistic message threads (10-20 messages each):
  - Conversation 1: Demo User ↔ member discussing a job opportunity
  - Conversation 2: Demo User ↔ member networking after an event
  - Conversation 3: Demo User ↔ vendor discussing services
- [ ] Verify send message works (POST endpoint exists)
- [ ] Verify unread count shows in sidebar
- [ ] Test "Message" button from MemberProfilePage creates/opens a conversation
- [ ] Show empty state with CTA when no conversations exist ("Start by connecting with members!")

**Files:** `seed.js`, `MessagesPage.jsx`

---

### 4.8 — Fix My Profile Page (Empty, No Data)
**Problem:** Profile page loads empty because: (a) fake token blocks API, (b) demo user profile data may be sparse.

**Fix:**
- [ ] After #4.0 auth fix, verify profile data loads from `GET /api/profile/me`
- [ ] Seed rich demo user profile in `seed.js`:
  - Full bio/about me (2-3 paragraphs)
  - Industry, years of experience, location, timezone
  - LinkedIn URL, website URL
  - 8-10 skills (e.g., "Brand Strategy", "SEO", "Content Marketing", "ABM", etc.)
  - 3-4 experience entries with full descriptions
  - Avatar image
- [ ] Profile should display:
  - **My Connections** section — list of connected members with avatars
  - **About Me** — bio, industry, years of experience
  - **Completed Projects** — show experience entries as project history
  - **Membership duration** — "Member since [date]", time with Mavuus
  - **Skills & Expertise** tags
- [ ] "View as others see me" — preview how your profile appears to other members (same as MemberProfilePage but for yourself)
- [ ] When someone views your profile (e.g., after you apply for a job), they should see:
  - Your completed projects/experience
  - How long you've been with Mavuus
  - Your skills, bio, connections count
- [ ] Edit Profile functionality:
  - Edit bio, industry, location inline
  - Add/remove skills
  - Add/edit/delete experience entries
  - Upload/change avatar
  - Change password
  - Notification preferences toggles
- [ ] Verify all 4 tabs work: About, Experience, Account, Billing

**Files:** `ProfilePage.jsx`, `seed.js`, potentially `MemberProfilePage.jsx`

---

### 4.9 — On-Demand Video Detail Page
**Problem:** No way to watch/view a video. Cards aren't clickable.

**Fix:**
- [ ] **NEW** `VideoDetailPage.jsx`:
  - Video thumbnail (16:9 aspect ratio) with play overlay
  - Title, speaker name + avatar, category badge
  - Views count, duration
  - Full description
  - "Related Videos" section below
- [ ] Add route `/dashboard/on-demand/:id` in `App.jsx`
- [ ] Make video cards clickable with `<Link>`

**Files:** New `VideoDetailPage.jsx`, `App.jsx`, `OnDemandPage.jsx`

---

### 4.10 — Seed Data Overhaul
- [ ] Add `avatar_url` to all users in `seed.js` (use randomuser.me portraits, gender-matched)
- [ ] Add `thumbnail_url` to all sessions and resources
- [ ] Add `content` field to resources (full article text)
- [ ] Add `seniority` to jobs
- [ ] Expand job descriptions with responsibilities, requirements, benefits
- [ ] Seed 3-4 conversations with 10-20 messages each
- [ ] Seed connections between demo user and 3 members
- [ ] Seed 2-3 job applications for demo user
- [ ] Add 5+ more members with varied profiles
- [ ] Add 3+ more vendors, 3+ more resources, 3+ more sessions (both live and on-demand)
- [ ] Update `mockData.js` fallback data to match new seed data
- [ ] Re-run `npm run seed`

**Files:** `server/db/seed.js`, `server/db/schema.sql`, `client/src/data/mockData.js`

---

### 4.11 — Card Images & Avatars (Replace Gradients)
- [ ] Update session/video card rendering: show `<img>` when `thumbnail_url` exists, gradient fallback
- [ ] Update resource card rendering: same pattern
- [ ] Pass `src` prop to Avatar components across all pages
- [ ] Vendor cards: show company logo/avatar

**Files:** All dashboard listing pages, `Avatar.jsx`

---

### 4.12 — Sidebar Profile Section
- [ ] Replace logout button with profile card at bottom: avatar + name + plan badge + logout icon
- [ ] Pull `avatar_url` and `membership_tier` from auth context

**Files:** `DashboardSidebar.jsx`

---

### 4.13 — MyJobsPage Completion
- [ ] Verify all 3 tabs: My Applications, Saved Jobs, My Postings
- [ ] "Post New Job" form working
- [ ] Application status tracking (Applied → Reviewing → Interview → Offer/Rejected)
- [ ] Saved jobs sync with JobsPage bookmark state

**Files:** `MyJobsPage.jsx`

---

## Phase 5: Visual Polish & Micro-Interactions

### 5.1 — Micro-Interactions & Animations
- [ ] Card hover: `hover-lift` (translateY -2px + shadow)
- [ ] Button press: `btn-press` (scale 0.97 on active)
- [ ] Grid entrances: stagger-children on card grids
- [ ] Filter tabs: press effect
- [ ] Page transitions between routes
- [ ] Add CSS utility classes to `index.css`

### 5.2 — Card Spacing & Sizing
- [ ] Card minimum width: `min-w-[124px]`
- [ ] Tighten grid gaps: `gap-6` → `gap-4` on dashboard grids

### 5.3 — Loading States & Error Handling
- [ ] Skeleton loaders on all data-fetching pages
- [ ] Loading spinners on form submissions
- [ ] Toast notifications for API errors and success actions
- [ ] Empty state components for pages with no data
- [ ] 404 page for invalid routes
- [ ] Form validation messages

### 5.4 — Visual QA Against Figma
- [ ] Compare each page against Figma designs
- [ ] Fix spacing, colors, typography discrepancies
- [ ] Verify Manrope font loads everywhere
- [ ] Verify brand colors are consistent

---

## Phase 6: Responsive Design

- [ ] Public pages: hamburger mobile nav, responsive hero, stacking sections
- [ ] Dashboard: collapsible sidebar on tablet/mobile
- [ ] Responsive card grids (1 col mobile, 2 col tablet, 3 col desktop)
- [ ] Mobile-friendly forms
- [ ] Test at: 375px, 768px, 1024px, 1440px

---

## Phase 7: Pre-Demo & Deployment

### 7.1 — Demo Flow Prep
- [ ] Scripted demo walkthrough: public site → login → profile → members → connect → message → jobs → apply
- [ ] Verify every click in the walkthrough works end-to-end
- [ ] Rich demo account data (bio, skills, experience, avatar, connections, messages)

### 7.2 — Performance
- [ ] Lazy load dashboard pages (React.lazy + Suspense)
- [ ] Optimize/compress images
- [ ] Review Vite bundle size

### 7.3 — Security
- [ ] Rate limiting on auth endpoints
- [ ] Input sanitization
- [ ] CORS for production
- [ ] JWT secret from env variable

### 7.4 — Deployment
- [ ] Frontend → Vercel or Netlify
- [ ] Backend → Railway or Render
- [ ] Environment variables setup
- [ ] Custom domain (if applicable)
- [ ] SSL/HTTPS

---

## Phase 8: Post-Demo / Future

### If founders approve:
- [ ] Google OAuth sign-in
- [ ] Real-time messaging (WebSockets)
- [ ] Email notifications (Resend/SendGrid)
- [ ] File storage (S3/R2)
- [ ] Admin panel
- [ ] Payment integration (Stripe)
- [ ] SSR with Next.js for public pages
- [ ] Vendor review/rating system
- [ ] Event RSVP + calendar
- [ ] CMS for resources/articles
- [ ] Member onboarding flow
- [ ] Analytics dashboard
- [ ] Export (CSV) for member directory, applicants
- [ ] Push notifications

---

## Priority Order for Next Session

**Round 1 — Unblock everything:**
1. **#4.0** — Fix demo login (unblocks all auth features)

**Round 2 — Fix all broken pages:**
2. **#4.1** — Fix On-Demand page crash (views field + categories)
3. **#4.10** — Seed data overhaul (avatars, thumbnails, rich content, conversations)
4. **#4.11** — Card images & avatars

**Round 3 — Build missing detail pages:**
5. **#4.2** — Live Session detail + register button
6. **#4.3** — Resource detail (blog-style layout)
7. **#4.9** — Video detail page
8. **#4.5** — Vendor detail + cross-links to jobs

**Round 4 — Fix interactive features:**
9. **#4.4** — Member connections (connect/message flow)
10. **#4.7** — Messages with seeded conversations
11. **#4.8** — Profile page with full data + edit
12. **#4.6** — Jobs page redesign (wide layout + rich descriptions)
13. **#4.13** — My Jobs page completion

**Round 5 — Polish:**
14. **#4.12** — Sidebar profile section
15. **Phase 5** — Animations, spacing, loading states, QA
16. **Phase 6** — Responsive
17. **Phase 7** — Deploy for demo
