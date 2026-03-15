# Mavuus Build Plans

## How to Use

Open any phase file and paste the prompt to Claude Code in the `mavuus-app/` directory.

Execute phases in order. Each phase builds on the previous one.

## Phases

| File | Focus | Est. Sessions |
|------|-------|---------------|
| `PHASE-1.md` | Technical foundation (pagination, search, env, validation) | 1 |
| `PHASE-2.md` | Complete incomplete pages (detail pages, contact backend) | 1-2 |
| `PHASE-3.md` | Core features (recommendations, comments, password reset, invites) | 2 |
| `PHASE-4.md` | File uploads & media (avatars, resumes, video player) | 1 |
| `PHASE-5.md` | Auth enhancements (Google OAuth, email verification, security) | 1 |
| `PHASE-6.md` | **Full custom admin panel** — split into Part A (backend + DB) and Part B (all frontend pages). Covers: users, content, marketplace, moderation, CMS-lite, notifications, categories, referrals, exports, settings, audit log | 3-4 |
| `PHASE-7.md` | Polish & production (responsive, SEO, performance, deploy, tests) | 1-2 |
| `BACKLOG.md` | Future features (mobile app, payments, AI matching, gamification, etc.) | TBD |

**Total estimated: 10-13 Claude Code sessions**

## Quick Start

```bash
cd mavuus-app
cat plans/PHASE-1.md  # Read the phase
# Then paste the prompt section to Claude Code
```

## After Each Phase

```bash
git add -A
git commit -m "Phase X: [description]"
```

## Phase 6 Note

Phase 6 is the largest phase. It has two prompts (Part A and Part B) — run them sequentially in the same or separate Claude Code sessions. Part A sets up the backend and database. Part B builds all 21 admin pages.
