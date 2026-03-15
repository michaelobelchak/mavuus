# Phase 4: Polish, Interactivity & Missing Pages

## Critical Fix (Phase 0 — Must Be First)
**Problem**: `demoLogin()` creates a fake base64 token that fails `jwt.verify()`. This breaks ALL authenticated API calls (messages, profile, connections, notifications).

**Fix**: Replace `demoLogin()` to call the real login API (`POST /api/auth/login`) with `demo@mavuus.com` / `demo123`. Also add `avatar_url` and `membership_tier` to JWT payload so sidebar/header can display them.

**Files**: `AuthContext.jsx`, `server/routes/auth.js`

---

## 10 User Requests → Implementation

### 1. Card Minimum Width (124px)
- Add `min-w-[124px]` to `Card.jsx`

### 2. Sidebar Profile at Bottom (like attached image)
- Replace logout button with profile card: avatar + name + plan + logout icon
- Pull user avatar_url and membership_tier from JWT
- **Files**: `DashboardSidebar.jsx`, `auth.js` (JWT payload)

### 3. Micro-Interactions & Animations Everywhere
- Card hover: replace basic shadow with `hover-lift` (translateY + shadow)
- Button press: add `btn-press` (scale 0.97 on active)
- Grid entrances: add `stagger-children` to all card grids
- Filter tabs: add `filter-press` (scale 0.95 on active)
- Badges: add `badge-hover` (scale 1.05)
- Icons: group-hover scale effects
- New CSS utilities in `index.css`
- **Files**: `Card.jsx`, `Button.jsx`, `Badge.jsx`, `index.css`, all dashboard pages

### 4. Decreased Card Spacing
- Change `gap-6` → `gap-4` on all dashboard grid containers
- **Files**: AcademyPage, LiveSessionsPage, OnDemandPage, ResourcesPage, VendorsPage, MembersPage

### 5. Build Missing Detail Pages + Fix Broken Links
- **NEW**: `SessionDetailPage.jsx` — hero image, description, speaker, register CTA
- **NEW**: `VideoDetailPage.jsx` — video thumbnail (16:9), views, speaker, related
- **NEW**: `ResourceDetailPage.jsx` — thumbnail, description, download CTA
- Add routes in `App.jsx`
- Make all cards clickable with `<Link>` to detail pages
- Add `GET /api/sessions/:id` and `GET /api/resources/:id` server endpoints
- Add `views` column to sessions table schema

### 6. Richer Job Descriptions
- Expand all 8 job descriptions in seed.js with: responsibilities, requirements, benefits sections
- Full multi-paragraph content per job

### 7. Messages Pre-populated + Send Working
- **Root cause**: fake demo token → 403 on all auth endpoints
- After Phase 0 fix, existing 3 conversations with 15 messages will load
- Send functionality already built (POST endpoint exists)
- Just needs auth fix to work

### 8. Real Avatar Images
- Add `avatar_url` to all 12 users in seed.js using randomuser.me portraits
- Gender-matched to names
- Update mockData.js with matching URLs for fallback
- Pass `src` prop to all Avatar components across pages

### 9. Card Images (Replace Gradients)
- Add thumbnail URLs to sessions seed data (Unsplash marketing/business photos)
- Add thumbnail URLs to resources seed data
- Update card rendering: show `<img>` when thumbnail exists, fallback to gradient
- All different images, contextually relevant

### 10. Profile Page Empty → Fixed
- Same root cause as #7 (fake token)
- After auth fix, profile data loads (already seeded for demo user ID 7)

---

## Execution Strategy (5 Parallel Agents)

### Agent 1: Auth Fix + Seed Data Overhaul
- Fix `demoLogin()` in AuthContext.jsx
- Add avatar_url/membership_tier to JWT in auth.js
- Add `views` column to schema.sql
- Expand seed.js: avatar URLs, thumbnails, rich job descriptions, views
- Re-seed database

### Agent 2: Component Polish + CSS
- Card.jsx: min-width + hover-lift
- Button.jsx: btn-press
- Badge.jsx: badge-hover
- DashboardSidebar.jsx: profile section at bottom
- DashboardLayout.jsx: pass avatar_url to Avatar
- index.css: new micro-interaction utilities

### Agent 3: Dashboard Page Updates
- All 6+ dashboard pages: gap-4, stagger-children, image rendering, avatar src props
- Make session/video/resource cards clickable with Links
- Filter tab animations

### Agent 4: New Detail Pages
- SessionDetailPage.jsx
- VideoDetailPage.jsx
- ResourceDetailPage.jsx
- Add routes in App.jsx
- Add GET /:id endpoints in sessions.js and resources.js

### Agent 5: Mock Data Update
- Update mockData.js with avatar URLs, thumbnails for all fallback data
- Ensure consistency with seed data URLs
