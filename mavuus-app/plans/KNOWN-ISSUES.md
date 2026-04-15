# Known Issues — Deferred for Phase 2

Anything here is known, intentional, and out of scope for the demo. Every item is >15 minutes of work or requires external services / credentials.

## Auth & Security
- **Google OAuth** — buttons removed from Login/Register for the demo. Passport strategy exists server-side but requires `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`. Re-enable by restoring the buttons and adding env vars.
- **Forgot Password** — `/forgot-password` page submits successfully and returns a toast, but the server only logs the reset token to the console. No SMTP configured. Phase 2: add transactional email (Resend / Postmark).
- **Email verification** — not wired. All registered users are auto-verified. Phase 2.

## Payments
- **Stripe / billing** — Profile billing tab shows a static "Pro $15/month" summary card. No checkout, no subscription management, no webhooks. Phase 2.

## Content & Data
- **Pravatar rate limits** — some seed avatars come from `pravatar.cc`; they may fall back to initials under rate limiting. Replace with static uploads in Phase 2.
- **Seeded social share URLs** — Footer social links read from `platform_settings` which is empty; they fall back to `#`. Populate via admin panel before launch.
- **FAQ data** — `/api/faq?page=contact` returns empty; Contact page falls back to the static `contactFaqItems` array. Seed FAQs via admin panel before launch.

## Messaging
- **No real-time** — messages use polling (refresh on nav). Phase 2: add WebSocket or SSE.
- **No typing indicators / read receipts** beyond basic `last_read_at`. Phase 2.

## Admin Panel
- **Audit log writes** are scattered — not every admin mutation is logged yet. Phase 2: unified middleware.
- **Bulk actions** (bulk delete/publish) not implemented. Phase 2.

## Performance / Ops
- **No production deployment** — local dev only. Phase 2: Railway / Fly.io / Vercel hosting + SQLite → Postgres migration path.
- **No error monitoring** — errors log to console. Phase 2: Sentry.
- **No analytics** — no PostHog / Plausible integration. Phase 2.
- **No CDN / image optimization** — LazyImage component handles deferred loads, but all assets are served from origin. Phase 2.

## Testing
- **No test suite yet** — feature correctness verified by manual click-through. Phase 2: Vitest + Playwright smoke tests on the critical flows.

## SEO
- **`react-helmet-async` wired** for per-page titles/meta, but no sitemap, no robots.txt, no structured data. Phase 2.
