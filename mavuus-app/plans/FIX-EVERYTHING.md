# FIX-EVERYTHING: Make Mavuus Demo-Ready

> Goal: Fix every broken interaction, placeholder, and incomplete feature so the app runs smoothly for a client presentation. Every click should work. Every form should submit. Every page should look polished.

---

## PRIORITY 1 - BLOCKING (Must fix before any demo)

### 1.1 Contact Form Does Nothing
- **File:** `client/src/pages/public/ContactPage.jsx` (lines 13-16)
- **Problem:** Form sets `setSubmitted(true)` locally but never sends data anywhere. User fills out name, email, message - clicks submit - sees "success" but nothing happens.
- **Fix:** Create `POST /api/contact` endpoint on backend (store in a `contact_submissions` table or just log to console for demo). Wire up the frontend form to POST the data. Show a real success/error toast.

### 1.2 Session Registration Is Fake
- **File:** `client/src/pages/dashboard/SessionDetailPage.jsx` (lines 44-51)
- **Problem:** "Register" button for live sessions uses `setTimeout` to simulate success. Comment in code says "Simulated backend call - replace with actual API call."
- **Fix:** Create `POST /api/sessions/:id/register` endpoint. Add a `session_registrations` table (session_id, user_id, registered_at). Wire up the button. Show the user as "Registered" after clicking.

### 1.3 "Contact Vendor" Button Does Nothing
- **File:** `client/src/pages/dashboard/VendorDetailPage.jsx` (line 250)
- **Problem:** Button renders but has no `onClick` handler. Clicking it does nothing.
- **Fix:** On click, create a new conversation with the vendor's user_id via `POST /api/messages/conversations` and navigate to `/dashboard/messages?conversation={id}`.

### 1.4 Profile "Coming Soon" Placeholders
- **File:** `client/src/pages/dashboard/ProfilePage.jsx` (lines 393-398, line 681)
- **Problem:** Photo upload and password change sections show "coming soon" text. Looks unfinished in a demo.
- **Fix option A (quick):** Hide these sections entirely behind a feature flag or just remove them from the rendered output.
- **Fix option B (proper):** Implement avatar upload using Multer (like resume upload already works). Implement password change via `PUT /api/auth/change-password` with old password verification.

### 1.5 Blog Detail Page Is Fully Hardcoded
- **File:** `client/src/pages/public/BlogDetailPage.jsx` (lines 7-80)
- **Problem:** Entire page content - article, sidebar, related events - is a static JavaScript object. Does not fetch from any API.
- **Fix:** Use the existing `/api/resources/:id` endpoint to fetch the article. Pass the slug or ID from route params. Replace hardcoded sidebar with a fetch to `/api/resources?limit=5` for related articles.

---

## PRIORITY 2 - VISIBLE ISSUES (Will look bad in demo)

### 2.1 Homepage Email Input Not Functional
- **File:** `client/src/pages/public/HomePage.jsx` (lines 63-74)
- **Problem:** Hero section has an email input and "Join the Waitlist" button. The button just links to `/register` and ignores whatever the user typed in the input field.
- **Fix:** Capture the email value. Either pass it to the register page as a query param (`/register?email=user@test.com`) and pre-fill the form, or create a simple `POST /api/waitlist` endpoint that stores the email.

### 2.2 Typo: "On Demands Videos"
- **File:** `client/src/pages/public/ResourcesHubPage.jsx` (line 160)
- **Problem:** Section heading says "On Demands Videos" instead of "On-Demand Videos."
- **Fix:** Change the string to "On-Demand Videos."

### 2.3 Blog Navigation Links Are Broken
- **File:** `client/src/pages/public/BlogDetailPage.jsx` (lines 184-207)
- **Problem:** "Previous Article" and "Next Article" buttons both link to `/articles` instead of actual previous/next articles.
- **Fix:** After fetching the current article, also fetch a list of articles and determine prev/next by index or date. Link to `/blog/{prev-slug}` and `/blog/{next-slug}`.

### 2.4 ResourcesHub "View All" Links to Wrong Page
- **File:** `client/src/pages/public/ResourcesHubPage.jsx` (line 163)
- **Problem:** "View All On Demand Videos" link goes to `/dashboard` (generic) instead of `/dashboard/on-demand`.
- **Fix:** Change link to `/dashboard/on-demand`.

### 2.5 Vendor Detail - Jobs Matching by Company Name
- **File:** `client/src/pages/dashboard/VendorDetailPage.jsx` (line 54)
- **Problem:** Cross-links jobs to vendors by matching `.company.toLowerCase()`. If company names have different casing or slight differences in the database, jobs won't show up.
- **Fix:** Match by `vendor.user_id` against `jobs.posted_by` instead of string matching on company name. Or normalize company names in the seed data.

### 2.6 Date Formatting Can Fail Silently
- **File:** `client/src/pages/public/ArticlesPage.jsx` (line 20)
- **Problem:** `formatDate` splits by `-` and destructures `[, m, d]`. If date format doesn't match YYYY-MM-DD, produces undefined values with no error.
- **Fix:** Add a null check. If `dateStr` is falsy or doesn't match expected format, return a fallback like "Recently published."

---

## PRIORITY 3 - POLISH (Makes the demo feel professional)

### 3.1 Login Page - Add Better Error Messages
- **Files:** `client/src/pages/auth/LoginPage.jsx`, `RegisterPage.jsx`
- **Problem:** Generic error handling. Doesn't distinguish between "wrong password," "user not found," or "server error."
- **Fix:** Return specific error codes from backend. Display "Invalid email or password" for auth failures, "Email already registered" for duplicate signups, "Server error - please try again" for 500s.

### 3.2 Member Profile Type Comparison
- **File:** `client/src/pages/dashboard/MemberProfilePage.jsx` (lines 46-50)
- **Problem:** Compares `parseInt(id)` with `user.id` - type mismatch if one is string and other is number.
- **Fix:** Use `String(id) === String(user.id)` or ensure both are same type.

### 3.3 Message Polling Cleanup
- **File:** `client/src/pages/dashboard/MessagesPage.jsx` (lines 96, 103)
- **Problem:** Polls every 5-10 seconds even when user isn't on the messages page. Wastes resources.
- **Fix:** Clear intervals on component unmount (should already happen with useEffect cleanup, but verify). Consider pausing polls when browser tab is hidden using `document.hidden`.

### 3.4 Vendor Initials Fallback
- **File:** `client/src/pages/dashboard/VendorsPage.jsx` (line 78)
- **Problem:** Shows `??` for vendors without a name.
- **Fix:** Use first two letters of company_name as fallback, or show a generic icon.

### 3.5 ResourcesHub Uses Mock Data for Sidebar
- **File:** `client/src/pages/public/ResourcesHubPage.jsx` (lines 3-8)
- **Problem:** Main content fetches from API, but sidebar still uses imported mock data.
- **Fix:** Fetch sidebar content from the same API with different params (e.g., `?type=guide&limit=5`).

### 3.6 Notification Preferences May Not Persist
- **File:** `client/src/pages/dashboard/ProfilePage.jsx`
- **Problem:** Toggle switches for notification preferences (email, messages, connections, jobs) - unclear if changes are saved to the backend.
- **Fix:** Verify the PUT /api/profile/me call includes notification preference fields. Add an explicit save button or auto-save with debounce.

---

## PRIORITY 4 - BACKEND CLEANUP

### 4.1 Add Missing API Endpoints
Create these endpoints that the frontend needs but don't exist yet:

| Endpoint | Purpose |
|----------|---------|
| `POST /api/contact` | Store contact form submissions |
| `POST /api/sessions/:id/register` | Register user for live session |
| `POST /api/waitlist` | Capture waitlist email from homepage |
| `PUT /api/auth/change-password` | Change password (if implementing) |

### 4.2 Add Missing Database Tables

```sql
-- Contact form submissions
CREATE TABLE IF NOT EXISTS contact_submissions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Session registrations
CREATE TABLE IF NOT EXISTS session_registrations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id INTEGER NOT NULL REFERENCES sessions(id),
  user_id INTEGER NOT NULL REFERENCES users(id),
  registered_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(session_id, user_id)
);

-- Waitlist signups
CREATE TABLE IF NOT EXISTS waitlist (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### 4.3 Seed Data Review
- Verify all seed data uses consistent company name casing
- Verify all avatar URLs resolve (pravatar.cc links)
- Verify all thumbnail URLs resolve
- Add at least 3-5 blog/article entries so BlogDetailPage has real content to fetch

---

## EXECUTION ORDER

Run fixes in this order to minimize conflicts:

1. Backend first: Create missing tables and endpoints (4.1, 4.2, 4.3)
2. Priority 1 fixes: Wire up all broken interactions (1.1 through 1.5)
3. Priority 2 fixes: Visual and navigation issues (2.1 through 2.6)
4. Priority 3 fixes: Polish items (3.1 through 3.6)
5. Full walkthrough: Click every button, submit every form, visit every page

---

## VERIFICATION CHECKLIST

After all fixes, walk through this demo script:

- [ ] Visit homepage - email input captures value, CTA works
- [ ] Visit pricing - toggle works, CTA links to register
- [ ] Visit contact - fill form, submit, see real confirmation
- [ ] Visit articles - cards load, click through to detail, prev/next work
- [ ] Visit blog detail - content loads from API, sidebar populated
- [ ] Register a new account - form validates, redirects to dashboard
- [ ] Login with demo account (demo@mavuus.com / demo123)
- [ ] Dashboard home - all sections load with real data
- [ ] Live sessions - click a session, click Register, see confirmation
- [ ] On-demand videos - category filters work, click through to detail
- [ ] Resources - filters work, click through to detail page
- [ ] Members - browse directory, click a profile, see full detail
- [ ] Send a connection request - see it in pending, accept from other side
- [ ] Vendors - browse, click detail, click "Contact Vendor" - opens messaging
- [ ] Jobs - browse with filters, click detail, apply with cover letter
- [ ] My Jobs - see application in "Applications" tab
- [ ] Messages - send a message, see it appear, conversation list updates
- [ ] Profile - edit bio, add skill, add experience, upload resume
- [ ] Notifications - see them appear, mark as read
- [ ] 404 page - visit `/dashboard/nonexistent` - see friendly 404
