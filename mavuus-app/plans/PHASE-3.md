# Phase 3: Core Missing Features

## Goal
Add the features that users expect but don't exist yet: recommendation engine, comments, password reset, invite system, and speakers directory.

## Claude Code Prompt

```
Read the project at this directory. This is a React + Vite + Tailwind frontend with an Express + SQLite backend. Add these missing core features:

1. RECOMMENDATION ENGINE:
   - The recommendations table already exists in schema.sql (from_user_id, to_user_id, vendor_id, message)
   - Add API endpoints in server/routes/vendors.js or create server/routes/recommendations.js:
     - POST /api/recommendations — create recommendation (from_user_id from JWT, to_user_id optional, vendor_id required, message required)
     - GET /api/vendors/:id/recommendations — list recommendations for a vendor (include recommender name, title, avatar)
     - GET /api/profile/me/recommendations — list recommendations the current user has given
     - DELETE /api/recommendations/:id — delete own recommendation
   - Update VendorDetailPage:
     - Show "Recommendations" section with list of recommendations (avatar, name, message, date)
     - Show recommendation count on the vendor card
     - "Recommend this Vendor" button opens modal with message textarea
     - Don't allow self-recommendation or duplicate recommendations
   - Update VendorsPage:
     - Show recommendation count on each vendor card
   - Add seed data: at least 5 recommendations across different vendors

2. COMMENTS SYSTEM:
   - Create table: comments (id, entity_type TEXT, entity_id INTEGER, user_id INTEGER, content TEXT, parent_id INTEGER NULL, created_at TEXT DEFAULT CURRENT_TIMESTAMP)
     - entity_type can be: 'session', 'resource', 'vendor', 'job'
     - parent_id allows threaded replies (one level deep only)
   - Create server/routes/comments.js:
     - GET /api/comments?entity_type=session&entity_id=1 — list comments with user info (name, avatar), ordered by created_at DESC. Include replies nested under parent.
     - POST /api/comments — create comment (requires auth). Fields: entity_type, entity_id, content, parent_id (optional)
     - DELETE /api/comments/:id — delete own comment
   - Register route in server/index.js
   - Create reusable src/components/ui/CommentSection.jsx:
     - Props: entityType, entityId
     - Shows comment list with avatar, name, content, timestamp
     - "Reply" button on each comment shows inline reply form
     - New comment form at top: textarea + submit button
     - Loading state, empty state ("No comments yet. Be the first!")
   - Add CommentSection to:
     - SessionDetailPage
     - ResourceDetailPage
     - VendorDetailPage (below reviews)
   - Add seed data: at least 10 comments across different entities

3. PASSWORD RESET FLOW:
   - Add table: password_reset_tokens (id, user_id INTEGER, token TEXT UNIQUE, expires_at TEXT, used INTEGER DEFAULT 0, created_at TEXT DEFAULT CURRENT_TIMESTAMP)
   - Add to server/routes/auth.js:
     - POST /api/auth/forgot-password — accepts { email }. If user exists, generate a random token (crypto.randomUUID()), store it with 1-hour expiry. Log the reset link to console: http://localhost:5173/reset-password?token=xxx (no email service yet). Always return success (don't reveal if email exists).
     - POST /api/auth/reset-password — accepts { token, newPassword }. Validate token exists, not expired, not used. Hash new password. Update user. Mark token as used.
   - Create src/pages/auth/ForgotPasswordPage.jsx:
     - Simple form: email input + submit button
     - Success state: "If an account exists with this email, we've sent reset instructions."
     - Link back to login
   - Create src/pages/auth/ResetPasswordPage.jsx:
     - Reads ?token from URL
     - Form: new password + confirm password
     - Validation: passwords match, min 8 chars
     - Success state: "Password reset successfully" + link to login
     - Error state: "Invalid or expired token"
   - Add routes to App.jsx: /forgot-password, /reset-password
   - Add "Forgot password?" link below the login form on LoginPage

4. INVITE / REFERRAL SYSTEM:
   - Add tables:
     - referral_codes (id, user_id INTEGER UNIQUE, code TEXT UNIQUE, created_at TEXT DEFAULT CURRENT_TIMESTAMP)
     - referral_tracking (id, referrer_id INTEGER, referred_user_id INTEGER UNIQUE, created_at TEXT DEFAULT CURRENT_TIMESTAMP)
   - Add server/routes/referrals.js:
     - GET /api/referrals/my-code — get or generate referral code for current user (auto-generate on first call using first 4 chars of name + random 4 digits)
     - GET /api/referrals/stats — get referral count for current user
     - POST /api/auth/register should accept optional ?ref=CODE param and track it in referral_tracking
   - Create src/pages/dashboard/InvitePage.jsx:
     - Show the user's unique referral link: https://mavuus.com/register?ref=CODE
     - Copy-to-clipboard button
     - Show stats: "You've invited X people"
     - List of people who joined via your referral (name, date joined)
   - Add route to App.jsx: /dashboard/invite
   - Wire the "Invite a Friend" CTA card in DashboardSidebar to link to /dashboard/invite
   - Update RegisterPage to read ?ref param from URL and pass it during registration

5. SPEAKERS DIRECTORY:
   - The speakers table already exists in schema.sql
   - Add to server/routes/sessions.js or create server/routes/speakers.js:
     - GET /api/speakers — list all speakers (name, title, company, avatar, bio, linkedin)
     - GET /api/speakers/:id — single speaker with their sessions
   - Create src/pages/dashboard/SpeakersPage.jsx:
     - Grid of speaker cards: circular avatar, name, title, company, LinkedIn icon link
     - Search by name
     - Click a speaker card to see their bio and list of sessions they've spoken at
   - Add to sidebar navigation in DashboardSidebar (between "Community Resources" and "Meet The Members")
   - Add route to App.jsx: /dashboard/speakers
   - Ensure seed.js has at least 8 speakers with bios

6. VERIFY:
   - Test vendor recommendation: give a recommendation, see it appear on vendor page
   - Test comments: add comment on a session, reply to it, delete it
   - Test password reset: trigger forgot password, copy token from console, reset password, login with new password
   - Test referral: get referral code, copy link, register new user with ref param, check referral stats
   - Test speakers page: search, click through to speaker detail
   - No console errors
```

## Acceptance Criteria
- [ ] Vendor recommendations: create, view on vendor page, count on vendor cards
- [ ] Comments: add, reply, delete on sessions/resources/vendors
- [ ] Password reset: full flow from forgot to reset to login
- [ ] Referral system: generate code, share link, track referrals
- [ ] Speakers page: grid, search, speaker detail with sessions
- [ ] All new tables created and seeded with demo data
