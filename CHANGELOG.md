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

## Phase 4: Fixes & Polish — 2026-03-15 (in progress)
**Status:** In Progress

### Completed
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

### Remaining
- See `docs/PHASE_4_PLAN.md` for full remaining task list
- Messages: verify conversations load (requires re-login to clear old fake token)
- Profile: verify data loads after auth fix
- MyJobsPage: verify all 3 tabs work end-to-end
- Visual QA against Figma designs
- Responsive design (mobile/tablet)
- Deployment to Vercel + Railway
