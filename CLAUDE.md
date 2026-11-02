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
| Client dev (port 5173) | `cd mavuus-app/client && npm run dev` |
| Client build | `cd mavuus-app/client && npx vite build` |
| Server tests | `cd mavuus-app/server && npm test` |
| Client lint | `cd mavuus-app/client && npx eslint . --max-warnings 0` |
| Reset the DB | `cd mavuus-app/server && rm -f db/mavuus.db && node db/seed.js` |
| Top up demo data only | `cd mavuus-app/server && node db/seed-demo.js` |

Both dev servers are also in `.claude/launch.json` for the preview browser: `mavuus-server` on 3001 and `mavuus-client` pinned to 5180, because other local projects use 5173.

Demo login: `demo@mavuus.com` / `demo123` (seeded, admin role, pro plan).

Env: copy `mavuus-app/server/.env.example` to `.env`. Never commit `.env` or real keys. Hooks block edits to `.env*` (except `.env.example`) and `*.db` files.

## Repo layout

```
CLAUDE.md, CHANGELOG.md     - this file, and the project changelog
.claude/                    - skills, commands, agents, hooks, settings (settings.local.json is personal and ignored)
docs/                       - older project plans (historical)
mavuus-app/
  plans/                    - phase plans and paste-ready prompts (README.md is the index)
  client/src/
    pages/{public,auth,dashboard,admin}/
    components/{ui,layout,sections}/   - shared UI, exported through components/index.js
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
5. Add a dated entry to `CHANGELOG.md` (newest at the bottom, under the matching phase heading) and mark the plan's status.
6. Ship with `/ship`. It asks before each step, opens a PR to `main`, and never merges.

## Skill routing

The process skills live in `.claude/skills/`.

| Task | Skill |
|---|---|
| New feature or behavior change | `brainstorming`, then `writing-plans` |
| Running a written plan | `executing-plans` or `subagent-driven-development` |
| Bug or broken behavior | `systematic-debugging` |
| Writing tests first | `test-driven-development` |
| Independent parallel work | `dispatching-parallel-agents`, `using-git-worktrees` |
| Before claiming done | `verification-before-completion` |
| Review | `requesting-code-review`, `receiving-code-review`, agents `code-reviewer`, `architecture-reviewer`, `test-planner` |
| Wrapping up a branch | `finishing-a-development-branch` |

## Definition of done

- [ ] `npx vite build` passes in client and `npm test` passes in server
- [ ] `npx eslint . --max-warnings 0` passes in client (CI runs lint, build, and server tests on every PR)
- [ ] UI changes checked in the browser, including mobile width
- [ ] Schema changes reflected in `seed.js` and `seed-demo.js`, and the DB reset still works
- [ ] `CHANGELOG.md` entry added, plan status updated

## Conventions

- Brand: pink `#F26D92`, blue `#1F648D`, dark blue `#1C2232`, font Manrope. Use the `@theme` tokens in `client/src/index.css` (`bg-brand-pink`, `text-dark-blue`, ...), not raw hex values.
- Buttons: 16px radius for CTAs, `rounded-full` for filter pills.
- Reuse components in `components/ui` before building new ones.
- Server: validate input with `middleware/validate.js`, use parameterized SQL only, and guard member routes with `middleware/auth.js` and admin routes with `middleware/admin.js`.
- Writing: American English, no em or en dashes (use a hyphen), plain and direct copy.
- Git: feature branches only (`feat/`, `fix/`, `chore/`, `docs/`), conventional commits (`<type>(<scope>): <summary>`), one logical change per commit. Never force push, reset --hard, or push to `main`.
