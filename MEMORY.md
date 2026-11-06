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
