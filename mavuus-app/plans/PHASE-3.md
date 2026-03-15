# Phase 3: Core Missing Features

## What Changed
Phase 5 of the existing build already completed:
- ✅ Reviews system — built with reviewer→reviewee pattern, supports job AND vendor reviews
- ✅ Recommendations — built with API routes, UI modals, notifications
- ✅ Resume upload — built via multer (PDF, 5MB max)
- ✅ StarRating, ReviewCard, RecommendationCard components

## What Still Needs To Be Done

```
Read the project at this directory. This is a React + Vite + Tailwind frontend with an Express + SQLite backend.

IMPORTANT: Reviews, recommendations, and resume upload are ALREADY BUILT. Do NOT rebuild them. Check existing code before building anything.

The reviews table uses: reviewer_id, reviewee_id, vendor_id, job_id, rating, text — it supports both job reviews and vendor reviews.
The jobs table has: status (open/in-progress/completed/closed) and hired_user_id for the hire flow.
Resume upload exists via POST /api/profile/me/resume.

Add these REMAINING missing features:

1. COMMENTS SYSTEM (verify not already built first):
   - Check if a comments table and server/routes/comments.js already exist
   - If NOT already built:
     - Create table: comments (id INTEGER PRIMARY KEY, entity_type TEXT, entity_id INTEGER, user_id INTEGER, content TEXT, parent_id INTEGER NULL, created_at TEXT DEFAULT CURRENT_TIMESTAMP)
     - entity_type: 'session', 'resource', 'vendor', 'job'
     - parent_id allows one-level-deep threaded replies
   - Create server/routes/comments.js:
     - GET /api/comments?entity_type=session&entity_id=1 — list comments with user info, ordered by created_at DESC, replies nested under parent
     - POST /api/comments — create comment (requires auth). Fields: entity_type, entity_id, content, parent_id (optional)
     - DELETE /api/comments/:id — delete own comment only
   - Register route in server/index.js
   - Create reusable src/components/ui/CommentSection.jsx:
     - Props: entityType, entityId
     - Shows comment list with avatar, name, content, timestamp
     - "Reply" button shows inline reply form
     - New comment form at top
     - Loading state, empty state
   - Add CommentSection to SessionDetailPage, ResourceDetailPage, VendorDetailPage
   - Seed at least 10 comments across different entities

2. PASSWORD RESET FLOW:
   - Add table: password_reset_tokens (id, user_id INTEGER, token TEXT UNIQUE, expires_at TEXT, used INTEGER DEFAULT 0, created_at TEXT DEFAULT CURRENT_TIMESTAMP)
   - Add to server/routes/auth.js:
     - POST /api/auth/forgot-password — generate token, log reset link to console, always return success
     - POST /api/auth/reset-password — validate token, update password, mark token used
   - Create src/pages/auth/ForgotPasswordPage.jsx: email form, success message
   - Create src/pages/auth/ResetPasswordPage.jsx: reads ?token, new password + confirm form
   - Add routes to App.jsx: /forgot-password, /reset-password
   - Add "Forgot password?" link on LoginPage

3. INVITE / REFERRAL SYSTEM:
   - Add tables:
     - referral_codes (id, user_id INTEGER UNIQUE, code TEXT UNIQUE, created_at TEXT)
     - referral_tracking (id, referrer_id INTEGER, referred_user_id INTEGER UNIQUE, created_at TEXT)
   - Add server/routes/referrals.js:
     - GET /api/referrals/my-code — get or auto-generate code
     - GET /api/referrals/stats — referral count + list
     - Update POST /api/auth/register to accept ?ref=CODE and track
   - Create src/pages/dashboard/InvitePage.jsx:
     - Show referral link with copy button
     - Stats: "You've invited X people"
     - List of referred users
   - Add route to App.jsx
   - Wire "Invite a Friend" sidebar CTA to this page

4. SPEAKERS DIRECTORY:
   - The speakers table exists and is seeded
   - Check if server/routes/speakers.js exists. If not:
     - GET /api/speakers — list all speakers
     - GET /api/speakers/:id — single speaker with their sessions
   - Create src/pages/dashboard/SpeakersPage.jsx:
     - Grid of speaker cards: avatar, name, title, company, LinkedIn link
     - Search by name
     - Click to see bio and past sessions
   - Add to sidebar navigation in DashboardSidebar
   - Add route to App.jsx: /dashboard/speakers

5. VERIFY:
   - Test comments: add comment on a session, reply to it, delete it
   - Test password reset: forgot password → console token → reset → login with new password
   - Test referral: get code, register new user with ?ref=CODE, check stats
   - Test speakers page: search, click through to detail
   - No console errors
```

## Acceptance Criteria
- [ ] Comments: add, reply, delete on sessions/resources/vendors
- [ ] Password reset: full flow from forgot to reset to login
- [ ] Referral system: generate code, share link, track referrals
- [ ] Speakers page: grid with search, speaker detail with past sessions
- [ ] All new tables created and seeded
