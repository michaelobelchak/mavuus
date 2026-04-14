# Phase 5: Authentication Enhancements

## Goal
Add Google OAuth, email verification, and security hardening.

## Claude Code Prompt

```
Read the project at this directory. This is a React + Vite + Tailwind frontend with an Express + SQLite backend. Enhance authentication and security:

1. GOOGLE OAUTH:
   - cd server && npm install passport passport-google-oauth20 express-session
   - Add to .env: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_CALLBACK_URL=http://localhost:3001/api/auth/google/callback
   - Add to .env.example with placeholders
   - Configure passport in server/index.js:
     - Initialize passport with Google OAuth 2.0 strategy
     - On successful auth: check if user with that email exists
       - If exists: log them in (generate JWT, return it)
       - If not: create new user with Google profile data (name, email, avatar from Google), then generate JWT
   - Add routes to server/routes/auth.js:
     - GET /api/auth/google — passport.authenticate('google', { scope: ['profile', 'email'] })
     - GET /api/auth/google/callback — handle callback, redirect to frontend with token
       - On success: redirect to http://localhost:5173/auth/callback?token=JWT_TOKEN
       - On failure: redirect to http://localhost:5173/login?error=oauth_failed
   - Create src/pages/auth/AuthCallbackPage.jsx:
     - Reads ?token from URL, stores in auth context, redirects to /dashboard
   - Add route to App.jsx: /auth/callback
   - Update LoginPage and RegisterPage:
     - Add "Sign in with Google" button (Google brand colors: white bg, gray border, Google 'G' icon)
     - Button opens /api/auth/google in same window
     - Add divider: "—— or ——" between Google button and email form

2. EMAIL VERIFICATION:
   - Update users table: add email_verified INTEGER DEFAULT 0, verification_token TEXT
   - Update schema.sql accordingly
   - Update POST /api/auth/register:
     - Generate verification_token (crypto.randomUUID())
     - Set email_verified = 0
     - Log verification link to console: http://localhost:5173/verify-email?token=xxx
     - (No actual email sending yet — console log is sufficient for development)
   - For Google OAuth users: auto-set email_verified = 1 (Google already verified)
   - Add to server/routes/auth.js:
     - GET /api/auth/verify-email?token=xxx — find user by token, set email_verified = 1, clear token
     - POST /api/auth/resend-verification — generate new token for current user, log to console
   - Create src/pages/auth/VerifyEmailPage.jsx:
     - Reads ?token from URL
     - Calls GET /api/auth/verify-email?token=xxx
     - Shows success: "Email verified! Redirecting to dashboard..." (auto-redirect after 3s)
     - Shows error: "Invalid or expired verification link" + "Resend verification email" button
   - Add route to App.jsx: /verify-email
   - Update DashboardLayout:
     - If user.email_verified === 0, show a yellow banner at top: "Please verify your email. Check your console/email for the verification link." + "Resend" button
     - Banner should be dismissible but reappear on next page load

3. SECURITY IMPROVEMENTS:
   - cd server && npm install helmet csurf cookie-parser (or just helmet and cookie-parser)
   - Add helmet middleware to server/index.js for security headers
   - Add cookie-parser middleware
   - Update JWT handling:
     - On login/register, set JWT as httpOnly cookie: res.cookie('token', jwt, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 7 * 24 * 60 * 60 * 1000 })
     - Also still return token in response body (for backward compatibility during transition)
     - Update auth middleware to check cookie first, then Authorization header as fallback
   - Update AuthContext:
     - On login/register, store token from response body in state (not localStorage)
     - On page load, make a GET /api/auth/me request to check if cookie is valid
     - Add GET /api/auth/me endpoint that returns current user from JWT cookie
     - Logout should clear the cookie: POST /api/auth/logout clears the httpOnly cookie
   - Password complexity:
     - Update register and reset-password to require: min 8 chars, at least 1 uppercase, at least 1 number
     - Add client-side validation with real-time password strength indicator (weak/medium/strong)
     - Show requirements checklist under password field
   - Rate limiting:
     - cd server && npm install express-rate-limit (if not installed)
     - Add general rate limit: 100 requests per minute per IP
     - Auth endpoints: 20 requests per 15 minutes (may already exist, verify)
     - Add rate limit headers to responses

4. VERIFY:
   - Test Google OAuth: click "Sign in with Google", complete flow, land on dashboard
   - Test with existing email: Google login should match existing account
   - Test with new email: Google login should create new account
   - Test email verification: register new user, check console for link, click it, verify banner disappears
   - Test resend verification
   - Test that httpOnly cookie is set on login (check browser dev tools > Application > Cookies)
   - Test password strength indicator on register page
   - Test rate limiting: make 25 rapid login attempts, verify you get 429
   - No console errors
```

## Notes
- Google OAuth requires a Google Cloud Console project with OAuth 2.0 credentials. For local dev, use http://localhost:3001 as authorized origin and http://localhost:3001/api/auth/google/callback as redirect URI.
- If you don't want to set up Google OAuth credentials yet, the "Sign in with Google" button can show a tooltip: "Google Sign-In will be available soon" and the backend route can return a 501.

## Acceptance Criteria
- [x] Google OAuth login works end-to-end (or is gracefully stubbed)
- [x] Email verification: register shows console link, clicking it verifies the account
- [x] Unverified users see yellow banner in dashboard
- [x] JWT is set as httpOnly cookie
- [x] Auth works with cookie (page refresh stays logged in)
- [x] Password strength indicator shows on register and reset pages
- [x] Rate limiting returns 429 on abuse
