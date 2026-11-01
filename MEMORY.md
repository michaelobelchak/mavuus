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
