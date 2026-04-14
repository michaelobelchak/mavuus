# Claude Code Prompt: Fix Everything

> Copy this entire file and paste it into Claude Code as your prompt.

---

You are working on the Mavuus app - a B2B marketing community platform built with React 19 + Vite + Tailwind CSS v4 (frontend) and Express.js + SQLite/better-sqlite3 (backend).

Your job: Fix every broken interaction, placeholder, and incomplete feature so the app is demo-ready for a client presentation. Every click must work. Every form must submit. Every page must look polished.

Read the full plan at `plans/FIX-EVERYTHING.md` before starting.

## Project structure

- Frontend: `client/src/` (React pages in `pages/`, components in `components/`, auth in `context/AuthContext.jsx`)
- Backend: `server/` (routes in `routes/`, schema in `db/schema.sql`, seed in `db/seed.js`)
- Database: SQLite at `server/db/mavuus.db`

## What to fix (in order)

### Step 1: Backend - Create missing tables and endpoints

1. Add these tables to `server/db/schema.sql` and create them in `server/index.js` or a migration:
   - `contact_submissions` (id, name, email, message, created_at)
   - `session_registrations` (session_id, user_id, registered_at, UNIQUE)
   - `waitlist` (id, email UNIQUE, created_at)

2. Create new route file `server/routes/contact.js`:
   - `POST /api/contact` - validates name, email, message, inserts into contact_submissions, returns success

3. Add to `server/routes/sessions.js`:
   - `POST /api/sessions/:id/register` - auth required, inserts into session_registrations, returns success
   - `GET /api/sessions/:id/registration-status` - auth required, checks if user registered

4. Create `server/routes/waitlist.js`:
   - `POST /api/waitlist` - validates email, inserts into waitlist table

5. Register new routes in `server/index.js`

6. Update `server/db/seed.js` to create the new tables and add 3-5 real blog/article entries with full content

### Step 2: Fix Priority 1 issues (blocking)

1. **ContactPage.jsx** - Wire form to `POST /api/contact`. Show real success/error toast.

2. **SessionDetailPage.jsx** - Replace setTimeout mock with real `POST /api/sessions/:id/register` call. Show "Registered" state after success.

3. **VendorDetailPage.jsx** - Add onClick to "Contact Vendor" button: create conversation via `POST /api/messages/conversations` with vendor's user_id, then `navigate('/dashboard/messages?conversation=${id}')`.

4. **ProfilePage.jsx** - Either:
   - Remove "coming soon" sections entirely (quick fix), OR
   - Implement avatar upload using Multer (like resume upload) and password change via new endpoint

5. **BlogDetailPage.jsx** - Replace hardcoded content with fetch from `/api/resources/:id` using route params. Fetch related articles from `/api/resources?limit=5`.

### Step 3: Fix Priority 2 issues (visible)

1. **HomePage.jsx** - Capture email input value. Either pass to register page as query param or POST to `/api/waitlist`.

2. **ResourcesHubPage.jsx** line 160 - Fix typo "On Demands Videos" to "On-Demand Videos"

3. **BlogDetailPage.jsx** - Make prev/next article links point to actual articles, not just `/articles`

4. **ResourcesHubPage.jsx** line 163 - Change "View All" link from `/dashboard` to `/dashboard/on-demand`

5. **VendorDetailPage.jsx** line 54 - Match jobs by `vendor.user_id === jobs.posted_by` instead of company name string matching

6. **ArticlesPage.jsx** line 20 - Add null check in formatDate function

### Step 4: Fix Priority 3 issues (polish)

1. **LoginPage.jsx + RegisterPage.jsx** - Return specific error messages from backend (wrong password, user not found, email taken)

2. **MemberProfilePage.jsx** - Fix type comparison: use `String(id) === String(user.id)`

3. **MessagesPage.jsx** - Verify useEffect cleanup clears polling intervals. Add visibility API check to pause polling when tab is hidden.

4. **VendorsPage.jsx** - Replace `??` fallback with first 2 letters of company_name

5. **ResourcesHubPage.jsx** - Replace mock data sidebar with API fetch

6. **ProfilePage.jsx** - Verify notification preference toggles save to backend via PUT /api/profile/me

### Step 5: Verify everything works

Run both servers (`cd server && node index.js` and `cd client && npm run dev`).

Walk through the entire verification checklist in FIX-EVERYTHING.md:
- Visit every public page and test all interactions
- Register a new account
- Login with demo@mavuus.com / demo123
- Test every dashboard feature
- Verify no console errors in browser

Fix anything that breaks during testing.

## Rules

- Don't break existing working features
- Use the existing patterns in the codebase (fetch with Bearer token, toast notifications, etc.)
- Keep the same file structure and naming conventions
- Test each fix before moving to the next one
- If a fix requires changes to both frontend and backend, do the backend first
