# Mavuus

Custom React rebuild of mavuus.com, a B2B community platform for marketing leaders. It replaces the founders' Webflow site and adds a members dashboard, messaging, jobs, vendors, reviews, and an admin panel at `/admin`.

## Stack

- Client: React 19 + Vite 7 + Tailwind CSS v4 + react-router-dom, icons from `lucide-react`, animation from `motion` (`mavuus-app/client`)
- Server: Express + better-sqlite3, JWT auth with bcryptjs, vitest + supertest (`mavuus-app/server`)
- Vite proxies `/api` to `http://localhost:3001` (override with `VITE_API_TARGET`)

## Run, build, test

| Task | Command |
|---|---|
| Server dev (port 3001) | `cd mavuus-app/server && npm run dev` |
| Client dev (port 5173; 5180 in launch.json) | `cd mavuus-app/client && npm run dev` |
| Client build | `cd mavuus-app/client && npx vite build` |
| Server tests | `cd mavuus-app/server && npm test` |
| Client lint | `cd mavuus-app/client && npx eslint . --max-warnings 0` |
| Client unit tests | `cd mavuus-app/client && npx vitest run` |
| Design-system guards | `cd mavuus-app/client && npm run guard` (`lint:ds` + `check:stories`) |
| Regenerate tokens | `cd mavuus-app/client && npm run tokens` (after editing `tokens.json`) |
| Storybook (port 6006) | `cd mavuus-app/client && npm run storybook` |
| E2E smoke | `cd mavuus-app/client && npm run e2e` (own API on 3101, Vite on 5181, fresh `db/e2e.db`) |
| Reset the DB | `cd mavuus-app/server && rm -f db/mavuus.db && node db/seed.js` |
| Top up demo data only | `cd mavuus-app/server && node db/seed-demo.js` |

Both dev servers are also in `.claude/launch.json` for the preview browser: `mavuus-server` on 3001 and `mavuus-client` pinned to 5180, because other local projects use 5173. `storybook` runs on 6006.

Demo login: `demo@mavuus.com` / `demo123` (seeded, admin role, pro plan).

Env: copy `mavuus-app/server/.env.example` to `.env`. Never commit `.env` or real keys. Hooks block edits to `.env*` (except `.env.example`) and `*.db` files.

## Repo layout

```
CLAUDE.md, CHANGELOG.md     - this file, and the project changelog
DESIGN.md                   - the design system map (tokens, components, rules, agent prompts)
.claude/                    - skills, commands, agents, hooks, settings (settings.local.json is personal and ignored)
docs/                       - older project plans (historical)
mavuus-app/
  plans/                    - phase plans and paste-ready prompts (README.md is the index)
  client/src/
    pages/{public,auth,dashboard,admin}/
    design-system/          - tokens, primitives, patterns, organisms (AGENTS.md has the rules)
    components/{ui,layout,sections}/   - legacy shared UI, retired page by page in Phase 8
    context/AuthContext.jsx
    hooks/                  - useApiData, useDocumentTitle, ...
    data/mockData.js
  server/
    index.js
    routes/                 - one Express router per domain
    middleware/             - auth, admin, validate, sanitize, upload
    db/                     - schema.sql, seed.js, seed-demo.js (mavuus.db is generated, never committed)
    tests/                  - vitest + supertest
```

## Workflow

1. Pick up work with `/context`.
2. Non-trivial work starts with a plan. Use `/brainstorm` for open design questions, then `/write-plan`. Plans live in `mavuus-app/plans/` and get listed in `plans/README.md`.
3. Run a plan with `/execute-plan`.
4. Before claiming done, run `/verify` and show the output.
5. Add a dated entry to `CHANGELOG.md` (what shipped) and to `MEMORY.md` (why: the decision, rejected alternatives, anything non-obvious), newest at the bottom, and mark the plan's status. Audits go in `mavuus-app/plans/audits/`.
6. Ship with `/ship`. It asks before each step, opens a PR to `main`, and never merges.

## Skill routing

The process skills live in `.claude/skills/`.

| Task | Skill |
|---|---|
| New feature or behavior change | `brainstorming`, then `writing-plans` |
| Any UI work (pages, components, styles, UI copy) | `mavuus-design-system` |
| Running a written plan | `executing-plans` or `subagent-driven-development` |
| Bug or broken behavior | `systematic-debugging` |
| Writing tests first | `test-driven-development` |
| Independent parallel work | `dispatching-parallel-agents`, `using-git-worktrees` |
| Before claiming done | `verification-before-completion` |
| Review | `requesting-code-review`, `receiving-code-review`, agents `code-reviewer`, `architecture-reviewer`, `test-planner` |
| Wrapping up a branch | `finishing-a-development-branch` |

## Definition of done

- [ ] `npx vite build` passes in client and `npm test` passes in server
- [ ] `npx eslint . --max-warnings 0`, `npx vitest run` and `npm run guard` pass in client (CI runs these, the build, server tests and e2e on every PR)
- [ ] New design-system components have a story, a test and a barrel export; `npm run build-storybook` passes
- [ ] Page changes pass `npm run e2e`
- [ ] UI changes checked in the browser, including mobile width
- [ ] Schema changes reflected in `seed.js` and `seed-demo.js`, and the DB reset still works
- [ ] `CHANGELOG.md` and `MEMORY.md` entries added, plan status updated

## Conventions

- One design system for the site, dashboard and admin, with Fixel Text everywhere: `client/src/design-system/` (map in `DESIGN.md`, rules in its `AGENTS.md`). New UI uses it: components from `@/design-system/<tier>` and role token classes (`bg-surface-raised`, `text-text-secondary`, `p-ds-lg`, `rounded-card`), never raw hex or arbitrary px.
- Until Phase 8 migrates them, legacy pages keep their current styling: the public site (`pages/public/`) uses `components/live/` and `.live-site` typography, the dashboard and admin use `components/ui/` and the `@theme` aliases in `index.css`. Don't restyle a legacy page piecemeal; move it onto the system. Static content lives in `data/live/`; images still load from the live Webflow CDN.
- Brand: pink `#F26D92`, blue `#1F648D`, dark blue `#1C2232`, all as tokens in `design-system/tokens/tokens.json`.
- Brand pink `#F26D92` stays as is (owner decision, see MEMORY.md), so never put essential small text in pink on its own; focus rings are navy.
- Buttons and filter pills come from the design system (`Button`, `Chip`). Check `DESIGN.md` section 10 before building anything new.
- Server: validate input with `middleware/validate.js`, use parameterized SQL only, and guard member routes with `middleware/auth.js` and admin routes with `middleware/admin.js`.
- Writing: American English, no em or en dashes (use a hyphen), plain and direct copy.
- Git: feature branches only (`feat/`, `fix/`, `chore/`, `docs/`), conventional commits (`<type>(<scope>): <summary>`), one logical change per commit. Never force push, reset --hard, or push to `main`.
