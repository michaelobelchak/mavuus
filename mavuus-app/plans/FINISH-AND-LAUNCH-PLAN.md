# Finish and launch plan

**Date:** 2026-11-14
**Status:** Stage 1 in progress
**Goal:** a complete Mavuus the founders can click through at a real URL: every page on the design system, no dependency on the Webflow site, and production settings ready for the host the owner provides.

PR #5 (design system foundation) is merged. What's left falls into five stages. Each stage is its own branch and PR to `main`, runs the full gate, and ends with an owner check before the next one starts.

**Full gate** (every PR): in `mavuus-app/client` run `npx vitest run`, `npx eslint . --max-warnings 0`, `npm run guard`, `npx vite build`, `npm run build-storybook` and `npm run e2e`; in `mavuus-app/server` run `npm test`. Then screenshots at 1440, 1024, 768 and 390, plus CHANGELOG.md and MEMORY.md entries.

**How it runs:** subagent-driven development. Each batch gets an implementer, then a spec review, then a code-quality review, fixes until both approve, and an independent verification run before anything is called done.

---

## Stage 1: Local fonts and images

**Branch:** `feat/local-assets`. **Why first:** Phase 8 rewrites the same files, and every later screenshot should come from local files.

Today the site loads 143 files from `cdn.prod.website-files.com` (the live Webflow site): 5 Fixel Text font files and the images and video thumbnails. 56 avatar URLs come from `i.pravatar.cc` in the seed data, mock data and auth pages. If the Webflow site goes away, the font and every public image go blank.

1. **Inventory script** `scripts/localize-assets.mjs` (with tests): find every remote asset URL in `src/`, `index.html` and the server seed files, including `srcset` variants, and write `scripts/assets-manifest.json` (URL, local path, size, where it's used).
2. **Fonts:** download the 5 Fixel Text weights to `public/fonts/fixel/`. Point `@font-face` at them with `font-display: swap`, preload the two weights the first screen uses, and ship the font's license file next to it. Fixel is published by MacPaw under the SIL Open Font License; confirm that from the license file before committing.
3. **Images:** download to `public/images/` in folders by page (`home/`, `about/`, `services/`, `resources/`, `posts/`, `videos/`, `logos/`) with readable file names. Keep originals, and add a WebP copy where it saves more than 30%.
4. **Avatars:** replace the pravatar URLs with local demo avatars in `public/images/avatars/`, used by both the client mock data and the server seeds.
5. **Rewrite references** through the manifest, so nothing points at a remote host.
6. **Guards:**
   - A `no-remote-assets` rule in `lint:ds` that bans the Webflow CDN and pravatar hosts everywhere.
   - The e2e smoke test fails on any third-party request instead of ignoring it.
   - One e2e run with the network blocked to prove the site works offline.
7. **Check:** pixel diff of public pages before and after at 4 widths, which must be identical apart from font loading timing. Also a size report: total image weight and the largest files.

**Done when:** zero remote asset URLs in the repo, e2e passes with outside requests blocked, and the screenshots match.

## Stage 2: Your section updates

**Input needed from the owner:** which sections to update or consolidate, and how. Stage 3 doesn't wait for this. Each change is folded into the page as it moves onto the design system, so nothing gets restyled twice.

- Collect the list (page, section, what changes) in this file under "Owner changes" below.
- Content claims (numbers, offers, quotes) need a source or the founders' OK before they ship.

### Owner changes

_To be filled in._

## Stage 3: Move every page onto the design system (Phase 8)

**Source:** `DESIGN-SYSTEM-PLAN.md` Phase 8. **Branches:** one PR per batch, each cut from `main` after the previous one merges.

Rules for every page:
- Capture before and after at 4 widths.
- Use only design-system components and token classes.
- No API or behavior changes.
- `lint:ds` shows zero findings for the file, and the baseline count goes down.
- e2e passes, and the page gets added to the smoke test if it isn't there yet.

| Batch | Pages | Notes |
|---|---|---|
| 3A App shell | `DashboardLayout`, `AdminLayout` move to `AppShell` | AppShell owns the skip link, so remove the one in `App.jsx`. The closed notifications drawer must be inert or unmounted. Notifications and search behavior are ported over. **Owner check:** the new shell with the dashboard home. |
| 3B Dashboard 1 | Academy (home), Live Sessions, Session detail, On-Demand, Resources, Resource detail | Uses SessionCard, ResourceCard, PageHeader and StatCard. |
| 3C Dashboard 2 | Speakers, Members, Member profile, Vendors, Vendor detail | Uses MemberCard, VendorCard, ReviewCard, RecommendationCard and StarRating. |
| 3D Dashboard 3 | Jobs, Job detail, My Jobs, Messages, Profile, Invite | Uses JobCard, MessageThreadItem and ConnectionRequest. **Owner check:** the whole member area. |
| 3E Admin 1 | Overview, Users, User detail, Jobs, Vendors, Reviews, Comments, Recommendations | The overview gets StatCard rows and ChartCard, which fixes the empty signups bars. Lists use AdminDataTable and StatusBadge. |
| 3F Admin 2 | Sessions, Speakers, Resources, Categories, Brand logos, Testimonials, FAQ, Site content, Notifications, Connections, Referrals, Contact, Exports, Audit log, Settings | Same pattern. **Owner check:** admin. |
| 3G Auth | Login, Register, Forgot and Reset password, Verify email, OAuth callback | Auth pages move to the shared form fields and buttons. |
| 3H Public site | Home, Services, Membership, Resources, Articles, Events, Posts, Videos, About, Contact, FAQ, Legal | `components/live` swaps to design-system equivalents. Before and after diffs must be intentional only. **Owner check:** public site. |
| 3I Retire | Delete `components/ui`, `components/live` and old layout files | `lint:ds --strict` passes, the baseline is near zero, and leftovers are listed. |

## Stage 4: Launch readiness (everything except the host)

**Branch:** `feat/launch-readiness`.

1. **Config, no hard-coded localhost:**
   - Add `CLIENT_URL` to the server and use it for the email links and OAuth redirects. Today `routes/auth.js` hard-codes `http://localhost:5173`.
   - `CORS_ORIGIN` takes a list.
   - In production the server refuses to start without `JWT_SECRET` and `CLIENT_URL`.
2. **Client API base:** `/api` calls work through a Vercel rewrite, or through `VITE_API_URL` when the API is on another domain. One documented choice, made in Stage 5.
3. **Email:**
   - A small mail module. Development prints links to the log, as now. Production sends through a provider (Resend or Postmark, picked in Stage 5).
   - Verify email, reset password and contact form go through it.
   - Tests use a fake sender.
4. **Uploads:** avatars and resumes write to `UPLOADS_DIR`, so they can live on a persistent disk.
5. **Database:** `DB_PATH` already exists. Add:
   - a documented backup command (SQLite `.backup`)
   - a one-time `npm run setup:prod` (schema, seed, demo account)
6. **Health check:** `GET /api/health` for the host's monitor.
7. **SEO and sharing:** title and description per public page, Open Graph image, `sitemap.xml`, and a `robots.txt` that blocks staging.
8. **Final quality pass:** an accessibility, responsive and performance audit with the impeccable audit, with results filed in `plans/audits/`. Fix anything critical.
9. **Founders' checklist** (DEMO-SCRIPT.md update): a demo path and the content to confirm:
   - member counts
   - the 30-day trial line
   - status colors
   - the Pro member tag
   - the pink contrast decision
10. **E2E against any URL:** a `BASE_URL` option, so the same smoke test runs against staging.

## Stage 5: Hosting (owner provides it, last)

**Inputs from the owner:** the host or hosts (front end and API), the domain or staging URL, and the email provider account. The OAuth keys are only needed if Google login should work.

1. Front end: build settings, the SPA rewrite (already in `client/vercel.json` for Vercel), and the API rewrite or `VITE_API_URL`.
2. API:
   - Node 22.
   - A persistent volume for `db/` and `uploads/`.
   - Environment variables: `NODE_ENV=production`, `JWT_SECRET`, `CLIENT_URL`, `CORS_ORIGIN`, `DB_PATH`, `UPLOADS_DIR`, mail keys, and optionally Google OAuth.
   - Health check on `/api/health`.
3. Run the production setup, create the demo account, and turn on daily database backups.
4. Domain and HTTPS. Staging stays hidden from search engines.
5. Run the e2e smoke test against the staging URL, check by hand at 4 widths, then share the link.

---

## Owner checkpoints

| When | What you look at |
|---|---|
| End of Stage 1 | Public site served fully from local files |
| Batch 3A | The new app shell on the dashboard home |
| Batch 3D | The full member area |
| Batch 3F | Admin |
| Batch 3H | Public site on the shared system, including your section changes |
| End of Stage 4 | Founders' checklist and the audit |
| Stage 5 | Staging link |
