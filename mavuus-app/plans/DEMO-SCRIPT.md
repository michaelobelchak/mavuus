# Mavuus Demo Script — 5 Minutes

Founder demo for Dilya & Elmira Abushayeva. Goal: show them what the custom React rebuild can do that Webflow can't, and agree on a production roadmap.

**Setup (before the call):**
- Backend running: `cd mavuus-app/server && npm run dev` (port 3001)
- Client running: `cd mavuus-app/client && npm run dev` (port 5173)
- Demo DB freshly seeded: `npm run seed && npm run seed:demo`
- Open in Chrome at 1440px width, DevTools closed, incognito

---

## 1. Opening (30s) — Webflow vs. React

- "Here's what you have on Webflow today — marketing pages, no dashboard, no community features."
- "Here's what we built: the full public site **plus** a complete member dashboard, community, marketplace, and admin panel."
- Pull up the homepage at `/` — hero, stat counters, speakers, testimonials.

## 2. Public site tour (45s)

- Hero → scroll through stats, featured speakers, testimonials, footer.
- Click **Pricing** → toggle monthly/annual → show plan cards.
- Click **About** → founder story section.
- Click **Contact** → show the form with FAQ.

## 3. Sign-up flow (30s)

- Click **Join Now** → `/register`.
- Fill name + fresh email + strong password → password strength indicator lights up green.
- Click **Create Account** → lands on `/dashboard`.
- "New users get the Pro experience out of the box."

## 4. Dashboard tour (1 min)

- Point out the **sidebar** (nav), **profile completion ring** (top-right), **notification bell**.
- Scroll through the 4 dashboard sections: Upcoming Live Sessions, On-Demand, Community Resources, Featured Jobs.
- Hit **⌘K** → command palette opens → type "jobs" → jump to Jobs page.
- Hit **/** → focuses the search bar in the header.

## 5. Community features (1 min)

- Click **Members** → grid of 15+ marketing leaders with Pro rings.
- Click **Sarah Chen** → profile page, scroll through skills/experience.
- Click **Connect** → toast confirmation.
- Click **Messages** → open existing conversation with Tom Bradley → show the thread.
- Send a message → appears instantly in the thread.

## 6. Marketplace (45s)

- Click **Vendors** → 8 vendor cards with ratings.
- Click **ContentPro Agency** → vendor detail + reviews → **Contact Vendor** button.
- Click **Jobs** → filter by "Remote" → click **Senior Content Strategist**.
- Click **Apply** → confetti fires → "Application submitted".
- Click **My Jobs** → application shows up in list.

## 7. Admin preview (30s)

- Switch to admin account or stay as demo (is_admin=1).
- Go to `/admin` → show Users / Content / Audit Log tabs.
- "Dilya and Elmira can manage members, sessions, resources, vendors, jobs, and testimonials from here — no dev required."

## 8. Close (30s)

- "Everything you just saw is custom-built for Mavuus on a modern React stack — it's yours, no vendor lock-in."
- "Phase 2 covers Stripe payments, email verification, Google OAuth, and SEO polish."
- "We can ship this to production in two weeks."
- Invite questions.

---

## Fallback talking points (if something breaks)

- If a page 404s: "That's an edge case we're tracking — the main flows all work."
- If an image is missing: "Placeholder seed data — production will use real assets."
- If the demo account glitches: reload and use the **Try the demo account** button on `/login`.

## Don't demo

- Forgot Password flow (email sending isn't wired)
- Stripe/billing (no live keys)
- Google OAuth (no credentials configured)
- Real-time messaging (messages are polled, not websocket)
