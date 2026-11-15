# Changelog

All notable changes to the Mavuus project are documented here, organized by phase.

---

## Phase 1: Foundation — 2026-03-06
**Status:** Complete

- Initialized React 19 + Vite + Tailwind CSS v4 project
- Set up Express.js server with SQLite (better-sqlite3)
- Created database schema (7 tables: users, sessions, resources, vendors, jobs, speakers, recommendations)
- Seeded database with realistic mock data
- Built reusable UI components: Button, Card, Input, Textarea, Avatar, Accordion, Badge
- Built layout components: PublicHeader, Footer, PublicLayout, DashboardSidebar, DashboardLayout
- Set up React Router v6 with all routes (4 public, 2 auth, 8 dashboard)

## Phase 2: Public Website — 2026-03-06
**Status:** Complete

- Homepage with hero, logo bar, testimonials, stats, CTA sections
- About page with founder story, team grid, mission
- Pricing page with monthly/yearly toggle
- Contact page with form + FAQ accordion
- Resources hub, Articles, Events, Blog detail pages
- Shared section components: LogoBar, TestimonialRow, CTABanner, StatsSection

## Phase 3: Auth + Interactive Dashboard — 2026-03-07
**Status:** Complete

- Login and Register pages with real JWT authentication
- Protected routes with auth guard
- 10 new database tables (17 total): profiles, skills, experience, connections, conversations, messages, job applications, saved jobs, notifications
- ~40 new API endpoints across 10 route files
- ProfilePage with 4 tabs (About, Experience, Account, Billing) + full CRUD
- MemberProfilePage — view other members, connect/message buttons
- MessagesPage — split-panel chat with polling (5s messages, 10s conversations)
- JobDetailPage — full detail view with apply modal, save/bookmark
- MyJobsPage — tabbed: Applications, Saved Jobs, My Postings
- Connection system: send/accept/decline/remove requests
- Notification system with unread counts
- New UI components: Modal, Tabs, Toast, Select, Toggle, TagInput, EmptyState, ConfirmDialog, Breadcrumbs, Skeleton, AnimatedSection

## Phase 4: Fixes & Polish — 2026-03-15
**Status:** Complete

- Fixed demo login — replaced fake base64 token with real API call (`demo@mavuus.com` / `demo123`)
- Added `avatar_url` and `membership_tier` to JWT payload
- Fixed On-Demand Videos page crash (missing `views` column + mismatched category filters)
- Seed data overhaul: avatar URLs, thumbnail URLs, rich job descriptions, sample conversations/connections
- Real images on all dashboard cards (replaced gradient placeholders)
- Built SessionDetailPage with register button
- Built ResourceDetailPage with blog-style article layout
- Built VendorDetailPage with job cross-links
- Fixed member connections flow (connect/message buttons)
- Redesigned JobsPage layout + enhanced JobDetailPage
- Added sidebar profile card (avatar + name + plan badge)
- Phase 5 visual polish: micro-interactions, card spacing, 404 page
- Phase 7 prep: lazy loading, rate limiting, input sanitization
- Hybrid responsive layout: detail pages `max-w-6xl`, listing pages `2xl:grid-cols-4`
- AcademyPage rewritten to fetch from API + render real thumbnails + clickable cards
- Skills, agents, commands, tests folders added to repo

## Phase 5: Connections, Ratings, Recommendations & Privacy — 2026-03-15
**Status:** Complete

### Database & Schema
- Added `status` (`open`/`in-progress`/`completed`/`closed`) + `hired_user_id` to `jobs` table
- Created `reviews` table (reviewer_id, reviewee_id, vendor_id, job_id, rating 1-5, text, unique constraint)
- Seed: 2 completed jobs with hired users, 6 reviews (4 job + 2 vendor), 4 recommendations, vendor ratings recalculated

### New Backend Routes
- `server/routes/reviews.js` — `POST /`, `GET /user/:userId`, `GET /vendor/:vendorId`, `DELETE /:id` (auto-recalculates vendor rating)
- `server/routes/recommendations.js` — `POST /`, `GET /user/:userId`, `GET /vendor/:vendorId` (creates notifications)

### Modified Backend Routes
- `jobs.js` — `?posted_by=` + `?status=` filters, `GET /completed-by/:userId`, hire flow (`'hired'` status auto-sets job to `in-progress`), status/hired_user_id in PUT + GET
- `members.js` — Optional auth middleware, `isConnected()` helper, privacy enforcement on profiles (`public`/`connections`/`private`), `limited` flag in response
- `profile.js` — `POST /me/resume` (multer PDF upload, 5MB max), `DELETE /me/resume`
- `index.js` — Registered reviews + recommendations routes

### New Frontend Components
- `StarRating.jsx` — Interactive (clickable) + readonly star display
- `ReviewCard.jsx` — Avatar + name + stars + text + date + optional vendor badge
- `RecommendationCard.jsx` — Avatar + name + message + optional vendor badge

### Modified Frontend Pages
- `MembersPage` — "My Connections" filter tab, "Message" button for connections, pending requests with Accept/Decline
- `MemberProfilePage` — Jobs Posted, Completed Jobs, Ratings & Reviews, Recommendations sections; resume download; "Limited Profile" notice for restricted visibility
- `JobDetailPage` — Status badge, status dropdown for poster, hire from applicant list, "Leave a Review" modal, "Recommend a Vendor" modal
- `VendorDetailPage` — Reviews list from API, "Write a Review" modal, recommendations section
- `ProfilePage` — Reviews + recommendations in About tab, real resume upload/delete in Experience tab

### Files Changed (16 total)
- Modified: `schema.sql`, `seed.js`, `index.js`, `jobs.js`, `members.js`, `profile.js`
- Modified: `MembersPage`, `MemberProfilePage`, `JobDetailPage`, `VendorDetailPage`, `ProfilePage`
- New: `reviews.js`, `recommendations.js`, `StarRating.jsx`, `ReviewCard.jsx`, `RecommendationCard.jsx`

## Build Phase 1: Technical Foundation — 2026-03-15
**Status:** Complete

- Environment variables with `.env` files (client + server)
- Server-side pagination on all list endpoints
- Server-side search/filter on jobs, members, resources, sessions, vendors
- Global search API endpoint (`/api/search?q=`)
- Error boundaries with fallback UI
- Input validation middleware (express-validator)

## Build Phase 2: Complete Page Enhancements — 2026-03-15
**Status:** Complete

- Blog detail page with related articles
- Contact form backend endpoint
- Resource/session/vendor detail page enhancements (bookmarks, breadcrumbs)

## Build Phase 3: Core Features — 2026-03-15
**Status:** Complete

- Password reset flow (request + reset endpoints + UI)
- Invite/referral system
- Speakers directory page

## Build Phase 4: File Uploads & Media — 2026-03-15
**Status:** Complete

- Image upload infrastructure (multer, `/uploads/` static serving)
- Profile avatar upload with live preview
- Job application resume handling (use profile resume or upload new)
- Session/Resource CRUD endpoints
- VideoPlayer component (YouTube, Vimeo, HTML5, placeholder)
- View tracking for sessions

## Build Phase 5: Auth Enhancements — 2026-03-15
**Status:** Complete

- Google OAuth integration (passport-google-oauth20)
- Email verification flow
- Security hardening (helmet, CORS, rate limiting)

## Build Phase 6: Admin Panel — 2026-03-15
**Status:** Complete

- 22 admin management pages (users, jobs, vendors, resources, sessions, reviews, reports, settings, etc.)
- Admin role-based access control
- Content moderation workflows (approve/hide/remove)
- Analytics dashboard with stats overview

## Build Phase 7: Polish & Production Prep — 2026-03-16
**Status:** Complete

- Responsive design audit: admin tables have `overflow-x-auto`, messages page mobile layout with back button, profile tabs scrollable
- `loading="lazy"` added to all content images (7 files updated)
- SEO meta tags on all public pages (react-helmet-async)
- `robots.txt` and sitemap generation
- React.lazy() + Suspense code splitting for dashboard and admin pages
- Dockerfile + `.dockerignore` for server
- `vercel.json` for client deployment
- `.env.example` with all environment variables documented
- `DEPLOYMENT.md` with setup and deployment instructions
- Server tests (auth, jobs) with Jest + Supertest

## Claude Setup, Lint, CI, and Live Site Rebuild - 2026-10-31
**Status:** Complete (PRs #1, #2, #3)

- Claude Code setup: skills, agents, and commands moved into `.claude/`; root `CLAUDE.md`; protection hooks with tests; `/context`, `/verify`, `/ship`
- Client lint cleared (139 problems to 0); failed user actions now show error toasts
- Fixed: login token lacked `role`, so every admin API call returned 403
- CI: client lint + build and server tests on every PR
- Public website rebuilt 1:1 with live mavuus.com: Fixel Text font, header, footer, homepage, Marketing Services, Membership, Resources, all 35 articles, video pages, About, Contact, FAQ (8 categories), Terms and Privacy. URLs match live; `/home` and `/pricing` redirect

## Public Site Design System - 2026-10-31
**Status:** Complete (PR #4)

- Audit filed in `mavuus-app/plans/audits/2026-10-31-public-site-audit.md`; decisions in `MEMORY.md`
- Shared system in `components/live/ui/`: 4 card types, one button, type scale, section spacing, scroll reveals, count-up stats, checklists, numbered tabs with pause, media frames
- Every public page moved onto it; logo row rebuilt; Services cards readable; tablet layouts fixed at 1024 and 768
- Accessibility: navy focus ring, reduced motion respected everywhere, mobile menu keyboard support, hidden content no longer focusable, heading order, 44px targets, Contact form errors
- Performance: /resources images 7.1 MB to 0.8 MB, article bodies split per post, Manrope no longer blocks first paint
- Content best guesses (for the founders to confirm): +1.7K avatar badge, 1,100+ on Membership, free 30-day trial line, article vs video labels on Resources, Privacy subtitle fix

## Design System Foundation - 2026-11-06
**Status:** Complete (branch `feat/design-system`, PR A; page migration is Phase 8)

- Tokens: three tiers (primitive `--mv-`, alias `--ds-`, role) in `design-system/tokens/tokens.json`, generated into `tokens.css`, `tokens.js` and `lib/twMergeConfig.js` by `npm run tokens`, with a drift test and a z-order test. Fixel Text everywhere
- Components in `client/src/design-system/`: 21 primitive folders (26 components), 26 pattern folders (DataTable, Dialog, Sheet, FormField, FilterBar, ChartCard on Recharts, StatCard, NumberedTabs and more) and 21 organisms (app shell, site header, footer and CTA band, 12 dashboard cards and parts, AdminDataTable, StatusBadge). Interactive parts on Base UI, toasts on Sonner
- Storybook 10 (`npm run storybook`, port 6006): Foundations pages rendered from `tokens.js`, a story for every component (71 story files), theme toolbar, router and auth decorators
- Guards: `npm run guard` runs `lint:ds` (raw colors, arbitrary sizes, inline styles, em dashes, reduced motion, retired imports, layering) with a legacy baseline, then `check:stories`. CI runs client unit tests, lint, build, guard, server tests and e2e
- E2E: Playwright smoke test (`npm run e2e`) over the main public, member and admin pages at 1440, 1024, 768 and 390px, failing on console errors, `/api` errors, failed requests and horizontal overflow. Own API on 3101 with a fresh `db/e2e.db`, Vite on 5181
- Docs: root `DESIGN.md`, `design-system/AGENTS.md`, `client/public/llms.txt` (served at `/llms.txt`), the `mavuus-design-system` skill, CLAUDE.md pointers
- Fixed: `/admin` crashed into the error boundary (weekly signups read `week.slice` on a number; labels now use the week start date); `/admin` weekly signups chart and the `/resources` sign-up link overflowed a 390px screen
- Server: `config.js` resolves `DB_PATH` and the test-only rate-limit overrides, which are ignored in production

## Local Fonts and Images - 2026-11-14
**Status:** Complete (branch `feat/local-assets`, Stage 1 of `FINISH-AND-LAUNCH-PLAN.md`)

- Fixel Text (5 weights) now ships from `client/public/fonts/fixel/` with its SIL Open Font License 1.1 (`OFL.txt` from github.com/macpaw/fixel). `index.html` preloads Medium and SemiBold, the two weights the hero uses
- Every public site image and the 24 demo avatars are local WebP files in `client/public/images/{home,about,services,resources,posts,videos,faq,logos,contact,shared,avatars}/`: 16.4 MB in 363 files plus the license (the Webflow originals and their srcset variants were 140.5 MB). Photos are lossy quality 82, logos and tiny PNG graphics lossless, nothing wider than 1600px, and the 222 srcset size variants are resized from the local original
- `scripts/localize-assets.mjs` (with tests) scans mavuus-app for remote assets, keeps `scripts/assets-manifest.json` (URL, local path, size, type, width, where it's used), downloads with retries and type checks, encodes WebP, builds the size variants and rewrites the source. Every mode is safe to run again
- Seeds and mock data store `/images/avatars/avatar-NN.webp`; `srcSetFor` in `data/live/posts.js` looks up widths by local path, and the srcset width tables are capped at 1600px
- Guards: `no-remote-assets` in `lint:ds` (error everywhere, never baselined) bans the Webflow CDN, other Webflow asset hosts and the old avatar service. The e2e smoke test fails on any request to another host (only `images.unsplash.com` is still allowed), and a new `offline` project reruns the public pages with every outside request aborted
- Fixed: the home leaders marquee picked the photo height from the remote file name; Vite now proxies `/uploads` so uploaded avatars show in dev; the em dash in the meta description
- Largest files: `videos/li-event-banners-1600-900-px-8-2.webp` 340 KB, `videos/li-event-banners-1600-900-px-11.webp` 327 KB, `posts/li-event-banners-1600-900-px-2.webp` 327 KB, `videos/li-event-banners-1600-900-px-13.webp` 215 KB, `posts/li-event-banners-1600-900-px-34.webp` 215 KB; nothing over 500 KB
- E2E: the smoke suite also covers `/articles`, `/events`, `/login` and `/register`; `guard.spec.js` checks the third-party guard. Fixed: the article and event lists overflowed at 1024px
- Pixel diff before and after at 1440, 1024, 768 and 390: every page keeps its exact height; visibly different pixels stay under 0.05% on every page except `/resources` (up to 0.86%, the lazy carousel images the CDN-era captures did not paint consistently)

## App Shell Live - 2026-11-14
**Status:** Complete (branch `feat/app-shell-live`, Batch 3A of `FINISH-AND-LAUNCH-PLAN.md`, Phase 8 Task 8.1)

- `/dashboard` and `/admin` now render in the design-system `AppShell` (`src/layouts/MemberLayout.jsx`, `AdminLayout.jsx`, sharing `ShellLayout.jsx`). Routes, `ProtectedRoute` and `AdminRoute` are unchanged
- The document scrolls: the sidebar is sticky at full height (its nav scrolls on its own), the top bar sticks to the top of the content column and `<main>` is in normal flow, so BackToTop, ScrollProgress and the legacy Modal scroll lock work as before
- Top bar: page title from the nav (detail pages get their own, like "Job details"), global search (`ShellSearch`, `/api/search`, a `/` key hint from 768px, `/` focuses it, a popover below 768px), the notifications bell with the unread count (polled every 30 seconds, pulses when it goes up) and the account menu (name and email, Profile, Settings, Admin panel for admins, Log out)
- Notifications open in a right `Sheet` with All and Unread filters, mark one or all read, loading, empty and error states. Closed, it is unmounted, which fixes the closed drawer that was still focusable (and it now closes on Escape)
- Sidebar: the Messages item shows the unread messages count; admins get an "Admin panel" link under the member nav and "Back to dashboard" under the admin nav (icons with tooltips in the rail); the email verification banner is a design-system `Banner` with Resend
- One "Skip to main content" per page: `AppShell` owns it under the shell, and `SiteSkipLink` shows the old one whenever no shell is mounted (public pages, auth pages and any 404, also under `/dashboard` or `/admin`)
- Organisms: `AppShell` scrolls the document; `AppSidebar` `footer` can be a function of `{ collapsed }` and its nav contains the rail's hidden labels (they stretched the page); `AppTopBar` puts the email under the name in the account menu, closes the mobile search popover on navigation and tightens its gaps below 640px
- Focus: keyboard focus and anchors land below the sticky top bar (`data-app-shell` and `styles/app-shell.css`, checked by `e2e/shell.spec.js`), and after a navigation focus moves to the page title (also from the mobile nav and notifications sheets)
- Robustness: notification polls skip hidden tabs and refetch on return, stop on a 401 (sign out, go to `/login`), never pulse on first load or re-render for an unchanged count, and can't undo a mark-read; list loads are aborted and sequence-guarded; Log out waits for the request before navigating
- Search: focus leaving the search or Escape on a result closes the list (Escape returns to the field), a failed request says search is unavailable, and result groups are labeled groups instead of headings
- E2E: the overflow check also compares `#main-content`'s scrollWidth with its clientWidth
- Also: MessagesPage computes its height from `--shell-topbar-h`, `--shell-main-pad` and `--shell-banner-h`, so it never scrolls the page at any width or with the banner; ScrollProgress sits above the sticky top bar; the notification chips count the loaded list; the page transition keeps its enter fade and drops the exit
- Removed: `DashboardLayout.jsx`, `DashboardSidebar.jsx`, the old `AdminLayout.jsx`, `MobileFAB.jsx` and `SearchResultsDropdown.jsx`; the lint baseline dropped by 19 findings
- Dropped on purpose: the sidebar profile-completion ring and referral card, MobileFAB, the top bar Messages icon, the admin sidebar user card and "Mavuus Admin" title (the account menu and the nav label cover them) and the staggered fade-in of notification rows

## Dashboard Pages 1 on the Design System - 2026-11-14
**Status:** Complete (branch `feat/member-pages-1`, Batch 3B of `FINISH-AND-LAUNCH-PLAN.md`, Phase 8 Tasks 8.2 to 8.7)

- AcademyPage (member home), LiveSessionsPage, SessionDetailPage, OnDemandPage, ResourcesPage and ResourceDetailPage now use only design-system components and token classes, with no imports from `components/ui`. Same endpoints, params, filters, search, paging, registration, bookmarks, comments, share and toasts
- No page h1 any more: the shell title is the h1. Sections are h2 (`SectionHeader size="h3"`), and on detail pages the item title is the h2 hero heading below the shell's "Live session", "On-demand video" or "Resource"
- The three lists share `pages/dashboard/academy/CatalogList.jsx`: SearchInput (300ms debounce), Chip category filters, SessionCard or ResourceCard grids with skeletons (`aria-busy`, `announce={false}`), EmptyState, Pagination and a new error Alert with Try again (the old lists failed silently)
- Member home: the profile completion nudge from the old sidebar is back as a card with a ProgressBar and a link to the profile, only while the profile is incomplete (photo, bio, three skills, experience, resume). No StatCard row: the page has no real numbers to show
- Detail pages: back link to the list, MediaFrame hero, MetaList facts, DescriptionList details, skeleton loading and an EmptyState for a missing item. The session countdown and registration form use FormField and Input; "Watch Now" now jumps to the player
- New in the design system (each with a story, tests and a barrel export): `ShareDialog`, `VideoEmbed`, `ScrollProgress`, `DescriptionList` (patterns), `CommentThread` (dashboard organism) and a `size` prop on `SectionHeader`. The app hook `useComments` loads and saves comments for CommentThread. `<Toaster />` is mounted in `main.jsx`
- Fixed on the way: reply avatars in comments rendered at full size (an unsupported legacy size); a resource heading's paragraph rendered inside the heading
- Tests: a smoke test per page (24 tests) with a shared `test/mockApi.js`; e2e smoke covers the six pages at four widths
- Lint baseline: 632 errors in 93 files down to 619 in 89
- Review fixes: the detail pages tell a failed load (error Alert with Try again) from a 404 (not found); below 1024px the Register or Watch Now and info cards come before the comments; past speakers keep a "Pro member" badge; ShareDialog links say they open a new tab; `useComments` has its own tests
- Top bar (all shell pages): the title stays on one line with an ellipsis and a hover title (it wrapped on phones because the heading's text-balance beat truncate), 18px below 640px, with tighter gaps there and a 256px search box until 1024px
- Code review fixes: detail pages load the new item when the id changes (`useDetailResource`, per-id registration, bookmark and related state, aborted stale requests, one view per session under StrictMode) and share a `DetailLayout`; ShareDialog copies without the Clipboard API and only claims success when it worked; `useComments` toasts refused requests with the server's text and resets per item; CommentThread names its Reply buttons, returns focus after a reply or delete and announces changes; CatalogList keeps search, filter and page in the URL; VideoEmbed uses youtube-nocookie and links out from non-video URLs; ScrollProgress updates once per frame with a transform; Download Template links to the file or is left out; the registration form prefills job title and company from the profile
- E2E guard: `picsum.photos` (12 placeholder covers in the seed) joins `images.unsplash.com` in `PENDING_HOSTS`, pending the owner's OK
- Dropped on purpose: the "LIVE" pill on home cards and the "View Details" button inside each live session card (the whole card is the link); see MEMORY.md


## Dashboard Pages 2 on the Design System - 2026-11-14
**Status:** Complete (branch `feat/member-pages-2`, Batch 3C of `FINISH-AND-LAUNCH-PLAN.md`, Phase 8 Tasks 8.8 to 8.12)

- SpeakersPage, MembersPage, MemberProfilePage, VendorsPage and VendorDetailPage now use only design-system components and token classes, with no imports from `components/ui`. Same endpoints, params, connection actions, review form, contact, share, comments, privacy handling and toasts
- No page h1 any more: the shell title is the h1. Card sections are h2, and on the detail pages the member or vendor name is the h2
- Lists run on the shared `CatalogList` (moved with `DetailChrome` from `pages/dashboard/academy/` to `pages/dashboard/shared/`), which gained labeled filter options, `filterQuery` (a filter value as API params), unpaged lists, filter-aware empty copy, a slot above the search and a grid override. Search, filter, page and the picked speaker live in the URL, and every list has an error with Try again
- Speakers: MemberCard grid; the picked speaker (`?speaker=`) opens a details panel with LinkedIn and session links that sticks below the shell top bar instead of sliding under it, or a Sheet below 1024px
- Members: MemberCard with Connect, Request sent, Pending, Connected and Message states; incoming requests are ConnectionRequest rows with busy Accept and Decline in a tinted panel; My Connections, Pro and Free chips (`?filter=connections|pro|free`, sent to the API as `connections=1` and `tier`)
- Member profile and vendor detail: `useDetailResource` and `DetailLayout` (skeleton, not found for a 404, error with Try again, per-id state), shared `DetailSection` and `JobLinkList`, ReviewCard, RecommendationCard, StarRating, DescriptionList details. Vendor: CompanyLogo header, ShareDialog, CommentThread with `useComments`, and the review form as a Dialog with a StarRating input and a FormField Textarea
- Fixed: jobs a member posted never showed on their profile (`/api/jobs?posted_by=` answers `{ data }`); em dashes in the experience dates and the vendor contact message
- Seed: `seed-demo.js` gives Rachel Foster (not connected to the demo user) a connections-only profile, so the limited profile has seeded data
- Tests: a smoke test per page (30 tests) plus CatalogList tests and server tests for vendor reviews and the members filters; e2e smoke adds Speakers, Members, member 1, the limited member 17 and vendor 1 at four widths
- Lint baseline: 619 errors down to 615
- Follow-up fixes: every seeded vendor gets an owner account (`server/db/vendorOwners.js`, run by `seed.js` and, for existing databases, `seed-demo.js`), so vendor reviews and Contact Vendor work; owner accounts stay out of `/api/members` and `/api/search`. `/api/members` takes `tier=pro|free` and `connections=1` (validated, parameterized, counted in `total`), and the Members chips use them instead of filtering the loaded page. A vendor's jobs load from `/api/jobs?posted_by=`. Below 1024px the speaker details open in a Sheet that returns focus to the card. Speaker LinkedIn links must be http(s)
- Review fixes: one review per member per vendor (unique index, 409 on a repeat, "You reviewed this vendor" on the page); `POST /api/reviews` takes the reviewee from the vendor's owner (404 unknown vendor, 400 no owner or your own vendor, numeric self-review check); one `recalcVendorRating` for POST, DELETE and the admin delete; 30 seeded vendor review rows replace the made-up ratings, and `seed-demo.js` removes repeat vendor reviews, repoints old ones to the owners and tops up older databases. Member profile Accept is guarded and busy, a limited profile unlocks after accepting, a failed connection status shows Try again instead of Connect. Members answer several requests at once. Detail routes remount per id (`KeyedById`). Speakers sheet closes through history and never flashes the panel on phones. CatalogList treats an unknown filter value as All. Vendor detail hides Review and Contact on your own vendor, disables Write a Review without an owner and counts open jobs only
- Hardening: the vendor review index is created once by `ensureVendorReviewIndex` (repeat reviews removed in the same transaction, the latest kept, and a server warning with the count); the speakers sheet goes back on close only when a speaker card opened it (MemberCard `linkState`)
- Server privacy: `/api/members` no longer sends emails and leaves out banned and deleted accounts (also in search); `/api/vendors` and `/api/vendors/:id` no longer send `admin_notes` or `moderation_status`; page and limit parse safely (`parsePaging`)
- Also changed on purpose: free members show no tier badge (only paid tiers do); a member card for someone who sent you a request shows only the Pending badge (accept from the pending panel); the member profile facts moved to a Details card beside the profile and the resume is a download button; back links go to the list (`/dashboard/members`, `/dashboard/vendors`) instead of the previous page; button copy is sentence case where MemberCard sets it ("Request sent", "Accept request") and labels like "Pending connection requests" lost their title case


## Dashboard Pages 3, first half, on the Design System - 2026-11-14
**Status:** Complete (branch `feat/member-pages-3`, first half of Batch 3D of `FINISH-AND-LAUNCH-PLAN.md`: Jobs, Job detail, My Jobs)

- JobsPage, JobDetailPage and MyJobsPage now use only design-system components and token classes, with no imports from `components/ui`. No page h1: the shell title is the h1, and the job title is the h2 on the detail page
- Jobs: `CatalogList` with JobCard (bookmark toggle with busy guard and an error toast), search plus job type, seniority and category selects with Clear filters, all in the URL (`?q=&type=&seniority=&category=&page=`), the API's job count, skeletons, empty state and an error with Try again
- Job detail: `useDetailResource`, `DetailLayout` and a `KeyedById` route (skeleton, not found for a 404, error with Try again), CompanyLogo header with MetaList and StatusBadge, ShareDialog, Dialogs for apply (cover letter, profile or uploaded resume), hire (now confirmed first), review (StarRating) and recommend a vendor (Select). The poster changes the status with a Select and sees applicants with resume links and Hire. Every action ignores clicks while its request runs. Below 1024px Apply and the job facts come before the description
- My Jobs: Tabs for Applications, Saved and Postings with the tab in the URL (`?tab=saved|postings`), JobCard rows with StatusBadge, remove on saved jobs, EmptyState actions and Post a Job as a Dialog. Loading skeletons and an error with Try again (it failed silently)
- `CatalogList` takes `filters` (several selects in a FilterBar) and `resultLabel(total)`; the single chip filter is unchanged. Shared job helpers in `pages/dashboard/shared/jobs.js` and `useSavedJobs.js`
- Fixed: hiring an applicant always failed with a 500 because `job_applications` didn't allow the `hired` status (and `seed.js` silently dropped its two hired applications). The schema allows it, `ensureJobApplicationStatuses` rebuilds the table on older databases, and `seed-demo.js` restores the hires and gives the demo account's open posting two applicants
- Fixed: Recommend a Vendor crashed the page (`/api/vendors` answers `{ data }`); a job's reviews now show both sides; Leave a Review turns into "You reviewed this job"; failed status changes, hires, resume uploads, removes and posts say so
- Server: member job routes leave out jobs an admin hid or removed (a hidden job's detail is a 404 except for its poster) and never send `admin_notes` or `moderation_status`; `PUT /api/jobs/:id` refuses an unknown status with a 400; `/api/jobs` takes `seniority`, so the seniority filter covers every page instead of the loaded one
- Design system: Dialog keeps its body at full height when the dialog is taller than the screen (a tall form slid under the footer at 390px)
- Tests: smoke tests per page (26 tests), CatalogList multi-filter tests, a Dialog test and server tests for hiring, the table rebuild, status validation and the job privacy rules; e2e smoke adds jobs 3, 8 and 1 and My Jobs at four widths
- Lint baseline: 615 errors down to 613
- Review fixes: hidden or removed jobs can't be applied to or saved (404) and leave the saved list; My Applications keeps them as history with "No longer available" and no link (`unavailable: true` from `/api/jobs/my-applications`); each My Jobs tab loads on its own with its own error and Try again; the `job_applications` rebuild keeps the AUTOINCREMENT counter so ids are never reused
- Code review fixes:
  - Applying with a newly uploaded resume sent no resume (the client read `resume_url`, the upload answers `url`); `/api/profile/me` didn't return `resume_url`, so "Use my profile resume" never showed. Both fixed; the file field checks for a PDF of 5 MB or less and the dialog says an upload also replaces the profile resume
  - Hiring: one transaction, only on an open job with no hire yet, and a hire can't be undone (409)
  - Resumes are private: stored as a random `.pdf` name, checked for `%PDF-`, served by `GET /api/files/resumes/:name` to the owner, admins, the poster of a job the owner applied to and members who may see the owner's full profile; `/uploads/resumes` is no longer static; old `/uploads/resumes/...` values still work; a file an application uses is never deleted; apply only takes your own resume. Links (job applicants, member profile, admin jobs) go through `resumeHref`
  - Job input: cover letters up to 5000 characters, `seniority` on new jobs (validated) with a Seniority field in Post a Job; hidden postings show "No longer available" in My Postings
  - Job detail: the applicants list has its own error with Try again; the poster's page skips the application lookup; the vendor list shows loading and is aborted on close; Post a Job can't post twice and starts each form from the profile company; a save made before the saved list loads is kept
  - Schema: `job_applications` points at its rebuild, a test compares the rebuilt table with a fresh schema, and `seed-demo.js` marks an existing application hired when its member is the hire
- Re-review fix: resumes moved to `server/private/resumes`, outside the static `/uploads` root (encoded paths like `/uploads/%72esumes/...` used to reach them past a raw-path blocklist). The server moves any leftover files at start and renames legacy `resume-*` files to random `.pdf` names (non-PDFs are deleted and their rows cleared). Resume responses are sandboxed with a CSP header. The demo profile gets a real sample PDF from `seed-demo.js`
- Undeclared in the first pass, kept on purpose: a job's reviews load in both directions (about the hire and about the poster); "You reviewed this job" replaces Leave a Review once you have; postings show a status badge and saved jobs show the seniority, category and salary; picking any Jobs filter (seniority included) goes back to page 1; Recommend a Vendor loads up to 100 vendors (`/api/vendors?limit=100`, it used the default 20); the Jobs count is the API's total, not the loaded page; the job detail page has one Save button in the side card instead of a header bookmark plus a side button
- Also changed on purpose: tab labels are "Applications", "Saved" and "Postings"; "View Applicants" on your own job is "My postings" (the applicants are on the page); the poster sees "No applicants yet" instead of no section; status toasts read "in progress" instead of "in-progress"
