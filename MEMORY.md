# Mavuus decision log

The "why" behind how this project is set up and built. Newest entries at the bottom. `CHANGELOG.md` says what shipped; this file says why, what we rejected, and what to watch for. Add a dated entry for every meaningful decision, setup change, or non-obvious learning (see CLAUDE.md "Definition of done").

---

## 2026-10-31 - Claude Code setup synced from FitnessApp (PR #1)

**Decision:** Mavuus uses the same Claude Code workflow as the FitnessApp project: config in `.claude/` (skills, agents, commands, hooks, settings), a root `CLAUDE.md`, plans in `mavuus-app/plans/`, a changelog, and this decision log.

**Why:** Skills, agents and commands sat at the repo root and `.gitignore` excluded all of `.claude/`, so Claude Code loaded none of them. The goal was one process across both projects.

**Ported:** generic pieces only (protection hooks, deny rules, `/context`, `/verify`, `/ship`, architecture-reviewer and test-planner agents, PR template). **Left out:** everything FitnessApp-specific (Expo, Supabase, Sanity, Linear, Maestro, the `agent-system/` sync, `.mcp.json`), husky/commitlint (no root package.json; `/ship` enforces commit style instead), AGENTS.md (no second AI tool in use).

**Learned:** the bash protection hook must ignore heredoc bodies and quoted text, and match per command segment; otherwise it blocks commit messages and PR bodies that merely mention `rm -rf` or `.env`, and a `>` in an email address looks like a redirect. 23 tests in `.claude/hooks/tests/protect-bash.test.sh`.

## 2026-10-31 - Lint to zero, CI, admin 403 (PR #2)

**Decision:** client lint is a hard gate (`npx eslint . --max-warnings 0`) in `/verify`, CI and the PR template, now that it's clean (139 problems fixed).

**Why:** lint debt hid real bugs. Empty `catch {}` blocks meant failed saves failed silently; they now toast for user actions and log for background loads.

**Bug found:** `generateToken` never put `role` in the JWT, so `isAdmin` rejected everyone and every `/api/admin/*` call returned 403, including the demo admin. Tests in `server/tests/auth.test.js` cover admin and member access.

**Learned:** eslint-plugin-react-hooks v7 flags setState in effects even when it happens after an `await` inside a `useCallback`; fetches live inside the effect (or a `.then` chain) instead.

## 2026-10-31 - Public site rebuilt 1:1 from live mavuus.com (PR #3)

**Decision:** rebuild every public page from the live Webflow site's own markup, copy, image URLs and computed styles, verified against live screenshots at 1440 and 390px.

**Why:** the owner judged the earlier Figma-based pages "not even close" to the live site the founders run.

**Choices:** Fixel Text font and images load from the live Webflow CDN for now (must move into the repo before launch, pending the founders' OK); Login and Sign Up go to this app's `/login` and `/register`, not `app.mavuus.com`; `/demands-videos/:slug` is a working page here because it's broken on live; base `h1`-`h6` styles moved into `@layer base` so utility classes work (they were unlayered and silently beat every utility).

**Learned:** live has 35 articles, not 9, and `/faq` is a category grid with 8 sub-pages, not a question list.

## 2026-10-31 - Audit, then one design system instead of a strict copy (PR #4)

**Audit:** [mavuus-app/plans/audits/2026-10-31-public-site-audit.md](mavuus-app/plans/audits/2026-10-31-public-site-audit.md). Design 20/32, technical 10/20. Main problems: 11 card styles, 3 outline buttons, no entrance motion, unreadable logo row, washed-out Services cards, tablet wrapping at 1024, focusable hidden content.

**Decision (owner, 2026-10-31):** improve on live instead of copying it. Keep content, brand colors, font and page structure, and apply one system of cards, buttons, labels, headings, spacing and motion everywhere. Plan: [mavuus-app/plans/PUBLIC-DESIGN-SYSTEM.md](mavuus-app/plans/PUBLIC-DESIGN-SYSTEM.md).

**Rejected:** staying pixel-close to live (it reproduces live's inconsistency); a full redesign (loses the brand the founders built).

**Pink stays #F26D92 (owner's call),** even though white-on-pink buttons (2.85:1) and pink text (2.75:1) fall below WCAG AA 4.5:1. Mitigation: the keyboard focus ring uses navy, not pink, so focus stays visible. Revisit if accessibility becomes a requirement for launch.

**Content best guesses (for Dilya and Elmira to confirm):**
- Member counts: kept the hero's two metrics (1700+ members, 1100+ marketing leaders); the avatar badge now says "+1.7K" instead of "+1000"; Membership says "1,100+ other marketing leaders" instead of "hundreds".
- Membership: added "Start with a free 30-day trial", which the page title already promised.
- Resources: articles and videos share titles because each article is the written recap of a session. Cards now say which is which (article with read time, video with a play badge), and each section has a one-line intro.

**Outcome (same day):** design re-score 20 to 24/32, technical 10 to 16/20, detector clean, no standalone undersized tap targets, /resources images 7.1 MB to 0.8 MB. Details at the end of the audit file.

**Other decisions made while building it:**
- Header collapses to the menu below 1200px (not 1024), because the five links plus Login and Sign Up wrapped on small laptops.
- Logo row keeps 6 wordmarks (Scotiabank, Ceridian, Microsoft, PointClickCare, Salesforce, Terminus). Dropped the Arizona Cardinals bird, the Constellation lockup and a roundel labeled "Pizza Pizza" that is actually the Pizza Hut logo; all three were unreadable as small grey marks. The source PNGs carry baked-in 50% transparency, so an SVG filter restores full opacity before the grey treatment.
- Services "From Strategy to Execution" cards lost the "↗" icon instead of becoming five links to the same Contact page.
- Kept the pink eyebrow labels and the pink left-rule card even though the Impeccable craft rules discourage both: they are the live brand's signatures and the owner chose to keep the brand. They now exist once each (`Eyebrow`, `Card rule`).
- Resources sign-up links now show totals (2 events, 50 videos) instead of the number on screen.
- Privacy page subtitle said "Terms of Service" (copy error on live); now "The Mavuus Privacy Policy covers the following topics:".
- Below 992px the Resources card grids become a swipeable row so no card is left alone on a row.

## 2026-11-06 - Design system foundation (feat/design-system, PR A)

**Decision:** one design system for the public site, dashboard and admin, in `mavuus-app/client/src/design-system/`, with Fixel Text everywhere (Manrope retired). Design: [mavuus-app/plans/2026-11-06-design-system-design.md](mavuus-app/plans/2026-11-06-design-system-design.md); map for humans and agents: root `DESIGN.md`.

**Why one system:** three styles (public `components/live/`, dashboard `components/ui/`, ad-hoc admin pages) meant agents and people restyled the same card three ways. One set of tokens, components and lint rules gives one answer.

**Approach B:** our own components, shadcn-style (in the repo, `cva` variants, `cn()` merge), on Base UI for focus, keyboard and layering, Recharts for charts, Sonner for toasts. **Rejected:** writing interactions in-house (menus, dialogs and focus traps are where accessibility bugs live) and adopting a themed library wholesale (agents learn someone else's rules and the brand fights its defaults). **Deviation from the design:** no shadcn component tokens (`--card`, `--primary`); one role scheme (`bg-surface-*`, `text-text-*`, `border-border-*`) is easier to lint and to learn.

**Changed from the approved design during the build:** cards use the 16px `rounded-card` radius, not 24px (24px is `rounded-sheet`; the main panel corner is 32px). Admin got `AdminDataTable` with row and bulk actions and confirm dialogs instead of separate moderation panels. PR A also carries small page fixes (the `/admin` crash and two 390px overflows) and the Fixel switch for the dashboard and admin (Manrope removed from `index.html` and `--font-body`), so those pages change font in this PR even though their layouts wait for Phase 8.

**Tokens:** three tiers in DTCG JSON, light now, dark-ready (dark is one `role.dark` block). Alias variables carry a `--ds-` prefix because Tailwind v4 reads `--spacing-*`, `--radius-*` and `--text-*` as theme keys: `--spacing-md` would have turned `max-w-md` into 16px. The drift test also rejects any key that overrides a Tailwind default.

**Layers:** menus and selects (500) sit above dialogs (400) so a Select can open inside a Dialog; popovers 550, tooltips 600, toasts 700. `zOrder.test.js` guards it.

**Accessibility:** pink `#F26D92` stays (owner decision, 2026-10-31) with the navy focus ring; small brand text gets a new `text-brand-strong` role (pink-800, 5.74:1) instead of pink.

**Legacy lint baseline instead of fixing pages now:** `lint:ds` found 651 errors in 97 legacy files. They're counted in `scripts/lint-design-system.baseline.json` so new code can't add any while Phase 8 rewrites the pages anyway; fixing them in place first would be thrown away.

**E2E isolation:** Playwright starts its own API on 3101 with a fresh `server/db/e2e.db` (through `DB_PATH`) and Vite on 5181, never reusing a running server, so `db/mavuus.db` and the dev servers on 3001 and 5180 are never touched. Rate-limit overrides for e2e are ignored when `NODE_ENV` is production. Playwright is pinned to 1.56.1 because that version's Chromium build is already in the local cache; CI installs the matching build.

**Component calls:**
- StatusBadge is the one status-to-color map (`in-progress` is info, `completed` success); unknown statuses render neutral and warn once.
- Cards take preformatted dates (`dateLabel`, `postedLabel`, `time`) plus `dateTime`; pages build them with the shared `lib/formatDate.js`, so no card formats dates its own way.
- SessionCard drops the old "View Details" button: the title is the card's one stretched link.
- MemberCard drops the Pro gradient avatar ring of the old Avatar: Pro shows a brand "Pro member" badge, other paid tiers a neutral one, free none.
- StarRating lives in `organisms/dashboard`, not primitives, because only reviews and vendors use it.

**Bugs found by the smoke test:** `/admin` crashed (the weekly signups chart called `week.slice` on a number); the same chart and the `/resources` sign-up link overflowed a 390px screen, hidden by `overflow-x-clip` (the smoke test now catches clipped overflow too). Two more legacy bugs are logged in the plan for Phase 8.

**Learned:**
- A hidden browser preview pane pauses `requestAnimationFrame`, so count-ups, reveals and chart animations look stuck there. Verify motion in headless Chromium (Playwright) instead.
- Unlayered base heading rules beat Tailwind utilities; base `h1` to `h6` styles must stay in `@layer base`.
- SQLite `CURRENT_TIMESTAMP` is UTC with no zone marker (`2026-10-28 23:30:00`), so `new Date()` reads it as local time. `parseDate` treats that shape as UTC and date-only strings as local calendar dates; Vitest runs in UTC so date tests are stable.

## Local fonts and images - 2026-11-14

**Decision:** the owner asked for local copies of the fonts and images, so the site no longer depends on the live Webflow site. If that site went away, the font and every public image would go blank. Fonts and images now live in `client/public/`, recorded in `scripts/assets-manifest.json`.

**WebP and size:** a first pass kept the Webflow files byte for byte (140.5 MB with the CDN's srcset variants), too much for git without LFS. The committed set is WebP: lossy quality 82 with alpha kept for photos and thumbnails, lossless for logos and PNGs under 10 KB, Webflow WebP files kept as they are when no resizing is needed, and the AVIF hero decoded with `sips` first. Originals are capped at 1600px (nothing renders wider than about 1300 CSS pixels), and the width tables in `posts.js` and `home.js` are capped to match. The 222 srcset variants are resized from the local original (`--variants`), with heights rounded the way the CDN rounds them and taken from the source proportions for capped originals, so every page keeps its exact height. Result: 16.4 MB. The heavy first pass is kept on the local branch `feat/local-assets-heavy`.

**Folder scheme:** `fonts/fixel/`, `images/<page>/` by where a file is used (`home`, `about`, `services`, `resources` for live events, `posts`, `videos`, `faq`, `logos`, `contact`), `images/shared/` for a file used on more than one page, and `images/avatars/avatar-NN.webp`. Names drop the Webflow hash and are slugified. Size variants keep their `-p-<width>` suffix next to their original, because `srcSetFor` (posts) and the Insights slider build srcsets from the original's name. Avatars are numbered in URL order the first time they are seen and never renumbered.

**License:** Fixel is by MacPaw under the SIL Open Font License 1.1 (GitHub reports `OFL-1.1` for github.com/macpaw/fixel; no Reserved Font Name). `public/fonts/fixel/OFL.txt` is the repo's own license file. The fonts are unmodified.

**Rejected:**
- Committing the Webflow originals and variants: 140.5 MB of thumbnails in history.
- Dropping srcset variants: pages would download the full-size images at every width.
- Reusing `public/assets/`: none of the downloads matched an existing file byte for byte.

**Non-obvious:**
- Stored avatar URLs are relative (`/images/avatars/...`) and served by the client, like uploads at `/uploads/...`. Production serves both from one Express origin; dev needed a `/uploads` proxy.
- `db/mavuus.db` keeps the old remote avatar URLs until it is reset (`cd mavuus-app/server && rm -f db/mavuus.db && node db/seed.js`).
- The Unsplash cover photos in the seeds, mock data and auth pages are still remote; the e2e guard names that one host until the owner OKs downloading them.
- `about/img-how-we-got.webp` (and the capped originals behind `posts/career-compass-jacob-warwick-p-1600.webp` and `posts/the-2026-cmo-role-p-1600.webp`) is byte-identical to its `-p-1600` copy, about 67 KB each. It stays: the page only names the variants, but `--variants` builds them from the original, and deleting it would make the next `--download` fetch it from the CDN again. Removing the copy instead would mean pointing those srcsets at the original; not worth it for 200 KB.
- The Unsplash photos are allowed per page in the e2e guard (`PENDING_HOSTS`): member and admin pages, `/login` and `/register`. Any other page fails on them, offline too.
- Full-page screenshots in headless Chromium can leave a lazy, async-decoded image in a horizontal carousel unpainted. The parity captures set `decoding = 'sync'` and wait for `img.decode()` on every image.

## App shell live - 2026-11-14 (feat/app-shell-live, Batch 3A)

**Decision:** the member and admin areas share one `ShellLayout` in `src/layouts/` around the design-system `AppShell`. The shell glue lives outside `design-system/` because it reads `AuthContext` and fetches, which organisms may not do. Titles come from the nav (`findActiveItem`) plus a short list of detail-page titles, so a new list route only needs its nav item.

**Decision (coordinator):** the document scrolls, not `<main>`. The sidebar is `sticky top-0 h-dvh` with its own scrolling nav, the top bar is sticky in the content column and `<main>` is in normal flow. `ScrollToTop` (window) resets the scroll on navigation.

**Rejected:**
- `<main>` as the scroller (the first version of this batch): the phone address bar never collapses (50 to 100px lost), tapping the iOS status bar stops scrolling to the top, Space and Page Down do nothing after clicking a sidebar link, BackToTop, ScrollProgress and the legacy Modal scroll lock break, and the e2e overflow and full-page checks go blind.
- Breadcrumbs on detail pages: on a phone the crumb wrapped and repeated the title, and every detail page already has its own "Back to ..." link.
- Keeping the sidebar profile-completion ring and referral card: the rail has no room for them, the Invite page already copies the referral link, and the completion nudge belongs on the home or profile page (Batch 3B or 3D).
- Keeping `MobileFAB`: it repeated three nav links and covered page content at 390px; the mobile nav sheet has them.
- Keeping the Messages icon in the top bar: the Messages nav item now carries the unread count.
- Keeping the admin sidebar user card and "Mavuus Admin" title: the account menu shows the user and the nav is labeled Admin.
- Keeping the staggered fade-in of notification rows: an inline animation style per row for little value.

**Non-obvious:**
- `SiteSkipLink` (above the routes in App.jsx) can't read a context from the shell below it, so `shellPresence.js` is a tiny store: `ShellLayout` registers in a layout effect and the site link hides while a shell is mounted. A 404 under `/dashboard` keeps its skip link.
- The rail nav needs `position: relative`: its visually hidden section labels and tooltip text are absolutely positioned, and without a positioned nav they hung below the sticky sidebar and made short admin pages scroll 175px.
- The top bar title is an h1 and most legacy pages still render their own h1 (two per page) until their batch moves them to `PageHeader`.
- Pulse rule kept from the old bell: the first load never pulses, only a rise from a count above zero.
- `Cmd/Ctrl+K` (`CommandPalette`), `?` (`ShortcutsHelp`), `BackToTop` and `ConnectionStatus` stay mounted in `App.jsx` and work under the shell. `ScrollProgress` (only on ResourceDetailPage) now uses `z-(--ds-z-overlay)` so it shows above the sticky top bar.
- Legacy `sticky top-6` on SpeakersPage now slides under the 80px top bar; fix it when the page migrates (3C).
- Focus after navigation goes to the top bar h1 (`tabIndex -1`). The mobile nav and notifications sheets return focus on close, so their `finalFocus` picks the title when a link in them was followed; otherwise their focus trap and return would pull focus back to the menu button or the bell. Titles still live in the nav config and RouteTitles only sets `document.title`; focusing the h1 is what announces the new page.
- `html` has `scroll-behavior: smooth`, so focus scrolling animates; `e2e/shell.spec.js` waits for scrollY to settle before measuring.
- Notification polls: a local change (mark read) bumps a version, and a poll that started before it is ignored. The list shows the newest 50 notifications (server LIMIT), so the chips count the loaded list while the sheet description keeps the overall unread total.
- `/api/search` is public (no auth) and returns member names; logged for Stage 4.

## Dashboard pages 1 - 2026-11-14 (feat/member-pages-1, Batch 3B)

**Decision:** legacy feature components the pages needed (ShareModal, VideoPlayer, ScrollProgress, CommentSection) got design-system versions instead of staying as imports from `components/ui`. CommentThread is presentational (organisms never fetch); `src/hooks/useComments.js` owns the requests and maps API rows to its props. The legacy files stay for the pages not migrated yet (JobDetail, VendorDetail, MemberProfile, BlogDetail).

**Decision:** `<Toaster />` is mounted in `main.jsx` beside the legacy `ToastProvider`, so migrated pages use the design-system `useToast` while legacy pages keep theirs until 3I removes the old provider.

**Decision:** detail pages keep the shell's generic title ("Live session", "Resource") as the h1 and render the item title as the page's h2. A per-page title override would need the page to push its title up into the shell (context or a store) after its fetch; not worth it for this batch, and the generic h1 plus the h2 reads fine.

**Decision:** the back link on detail pages goes to the list (`/dashboard/live-sessions` etc.) instead of `navigate(-1)`, so it works from a shared link or a new tab.

**Rejected:**
- A StatCard row on the member home: the page has no real member metrics to show and the plan says not to invent them.
- Keeping the "LIVE" pill over every live session cover on the home page: all those sessions are scheduled, not live, so the pill was wrong; the section title already says what they are.
- Keeping the "View Details" button inside each live session card: it was a second link to the same place inside a card that is already one link.
- Allowing `picsum.photos` on the two list routes only (the first version of this batch): the same covers show on detail pages, related grids and the member home, so the guard would depend on which seeded ids the test happens to visit. It sits in `PENDING_HOSTS` next to Unsplash instead; public pages still allow nothing external.

**Non-obvious:**
- SectionHeader's h2 defaults to the 36px h2 size, larger than the 22px top bar title, so app pages pass `size="h3"`.
- Every seeded live session date is in the past, so the countdown and registration form never show with seed data; the unit test covers them with a future date.
- The demo profile is complete, so the home nudge doesn't show for demo@mavuus.com; the unit test covers it.
- Session and resource detail pages send `PUT /api/sessions/:id/view`, so the read-only smoke run bumps view counts in `db/e2e.db`; harmless, nothing asserts on them.
- Detail pages put the side cards before the comments in the DOM and use a two-column grid from lg (`grid-cols-[minmax(0,1fr)_auto]`, aside `row-span-2`), instead of `order-*` utilities, so reading and tab order match what phones show.
- The top bar title wrapped on phones although it had `truncate`: the Heading's `text-balance` set `text-wrap` after `white-space: nowrap`. `text-nowrap` replaces it through tailwind-merge.
- Detail pages are reused by react-router when only `:id` changes (a related card), so every per-item state is stored with the id it belongs to (`{ id, value }`) and derived as empty for any other id, instead of resetting state in effects. `useDetailResource` does the same with a request key.
- The session registration form isn't sent: `POST /api/sessions/:id/register` takes no body. The fields are prefilled from `/api/profile/me` and the server side is logged in Stage 4.
- CatalogList keeps `q`, the filter and `page` in the URL; typing uses `replace` so the history isn't one entry per keystroke, while chips and pages push entries for back and forward.


## Dashboard pages 2 - 2026-11-14 (feat/member-pages-2, Batch 3C)

**Decision:** CatalogList grew props instead of being forked: options as `{ value, label }`, `filterItems` for filters the API doesn't take (Members' tier and My Connections stay client side, so no new API params), `paged={false}` for `/api/speakers` (no page or limit sent), filter-aware empty copy, a `children` slot for the pending requests and `gridClassName`. It and `DetailChrome` moved to `pages/dashboard/shared/` with `DetailSection`, `JobLinkList`, `reviewProps.js` and `paths.js`.

**Decision:** the picked speaker is a URL param (`?speaker=1`) and each MemberCard links to it, instead of a button card: MemberCard is a link card, there is no SpeakerCard, and the URL makes the panel shareable and back-button friendly.

**Decision:** Members chips write one `filter` param (`connections`, `pro`, `free`). Before, the tier lived in component state and `?filter=connections` in the URL, so a tier picked before My Connections kept filtering with no chip showing it.

**Rejected:**
- Accept on the member cards for incoming requests: the pending panel above already has Accept and Decline, and the old card only showed a disabled Pending.
- ConnectionRequest's own status announcement: the rows leave the list after accept or decline (as before) and the toasts stay, so `announce={false}`.
- A per-page share on the member profile: it never had one.
- The LinkedIn icon on each speaker card: a second link inside a link card; the panel has it.

**Non-obvious:**
- No seeded vendor has a `user_id`, so Contact Vendor is always disabled (now with a line saying why) and a vendor review posts the reviewer as `reviewee_id`, which the server refuses ("Cannot review yourself"). Behavior kept, logged as a follow-up.
- `useToast()` from the design system calls `toast.success(message, undefined)`, so tests spying on sonner assert `toHaveBeenCalledWith(message, undefined)`.
- `Card` only renders div, article, section or li (`as="header"` falls back with a console error the capture caught).
- Only MemberProfilePage and VendorDetailPage were in the lint baseline (em dashes); the list pages had only retired-import warnings.
