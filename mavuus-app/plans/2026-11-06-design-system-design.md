# Mavuus design system - design

**Date:** 2026-11-06
**Status:** Approved by the owner (all four sections), implementation plan in [DESIGN-SYSTEM-PLAN.md](DESIGN-SYSTEM-PLAN.md)
**Inputs:** FitnessApp design system principles (read-only reference), [research/2026-11-02-design-system-candidates.md](research/2026-11-02-design-system-candidates.md), [audits/2026-10-31-public-site-audit.md](audits/2026-10-31-public-site-audit.md), the owner's layout reference (a "Panze" SaaS dashboard: left sidebar with icon + label + chevron items and a filled gradient active pill, page title on top, tinted rounded content panel with white cards).

## Decisions

| Question | Decision |
|---|---|
| Scope | One system for the whole product: public site, member dashboard and admin. Fixel Text everywhere (Manrope retired). |
| Docs and guards | Full FitnessApp-style setup: Storybook, design-system lint, token drift test, DESIGN.md, agent prompt guide. |
| Theme | Light now; three token tiers so dark is one extra block of role tokens later. |
| Reference screenshot | Layout reference only (sidebar + main content structure), not metrics or content. |
| Approach | Our own system on headless building blocks: shadcn/ui components on Base UI, copied into the repo and restyled with our tokens; Recharts for charts; our own rules layer. Rejected: fully in-house interactions (accessibility risk) and adopting a themed library wholesale (agents learn someone else's rules, brand fights defaults). |

## 1. Structure and tokens

Lives in `mavuus-app/client/src/design-system/`: `tokens/`, `primitives/`, `patterns/`, `organisms/<domain>/`, `hooks/`, `docs/`.

Three tiers. Components only use tier 3.

| Tier | Holds | Example |
|---|---|---|
| 1 Primitives | Raw values: color ramps (pink, blue, navy, neutral, success, warning, error, info; 50 to 900), sizes, font family | `--mv-pink-500: #F26D92` |
| 2 Aliases | Scales: space (xxs to section), radius, type scale (display, heading, body, label), shadow, motion durations and easings, z-index, opacity | `--space-lg: 24px` |
| 3 Roles (theme layer) | Surfaces (page, raised, sunken, overlay, brand, hover, selected), text (primary, secondary, muted, on-brand, link, disabled), borders (default, subtle, strong, focus), status + subtle backgrounds, chart (series 1 to 6, gridline, axis, tooltip), plus shadcn component tokens (`--card`, `--primary`, `--sidebar`, ...) that point at role tokens | `--surface-raised: var(--mv-white)` |

Source of truth: `tokens/tokens.json` in DTCG format. A build script generates `tokens.css` (CSS variables + Tailwind `@theme`, giving classes like `bg-surface-raised`, `text-secondary`, `rounded-card`) and `tokens.js` (for charts and JS). A drift test fails when generated files are stale.

Brand rules kept: pink `#F26D92` as is (owner decision; contrast note documented), navy focus ring, existing public-site tokens and `components/live/ui` folded into this system.

## 2. Components (atomic, one barrel per tier)

- **Primitives:** Button, IconButton, Link, Badge, TrendBadge, Chip/Tag, Avatar, AvatarStack, Input, Textarea, Select, Checkbox, Radio, Switch, Label, Spinner, Skeleton, Divider, Tooltip, ProgressBar, Heading, Text, Eyebrow, Caption.
- **Patterns:** Card (feature, surface, panel, media), StatCard, Tabs, NumberedTabs, Dialog, Sheet, DropdownMenu, Popover, Toast, Accordion, Breadcrumbs, Pagination, Table, DataTable (sort, paginate, filter), FormField, SearchInput, FilterBar, EmptyState, Alert/Banner, PageHeader, SectionHeader, ChartCard with BarChart and LineChart, MediaFrame, CheckList, Reveal, CountUp.
- **Organisms:** `app-shell` (sidebar, top bar, layout), `site` (header, footer, CTA band), `dashboard` (job, member, session, vendor, message), `admin` (tables, moderation panels). Changed during build, see MEMORY.md: admin got `AdminDataTable` with row and bulk actions and confirm dialogs instead of separate moderation panels.

Rules (lint-enforced): primitives and patterns never import organisms; pages compose components, never raw styling; every component has a Storybook story; consistent props (`variant`, `size`, ref as a prop, `cn()` class merge).

New dependencies: Base UI, Recharts, Sonner, `class-variance-authority`, `tailwind-merge`, `clsx`; dev: Storybook, Playwright, Vitest (client).

Migration: `components/ui` (45 dashboard components) and `components/live/ui` merge into the new system; old folders are deleted as pages move.

## 3. App shell (after login)

- Sidebar 280px, white: logo, nav items (icon, label, chevron for groups with sub-pages that expand in place). Active item: filled rounded pill with a brand blue to navy gradient and white text (readable; pink stays the accent).
- Member nav: Home, Live Sessions, On-Demand, Resources, Speakers, Members, Vendors, Jobs (+ My Jobs), Messages, Connections, Profile, Invite. Admin uses the same shell with grouped nav: Overview, People, Content, Community, Settings.
- Top bar: page title left; search, notifications, avatar menu right.
- Main: tinted rounded panel with white cards (16px radius; changed during build from 24px, see MEMORY.md).
- Responsive: full sidebar at 1280px and up, icon rail with tooltips at 1024 to 1279px, slide-in drawer below 1024px.

## 4. Docs, guards, testing, rollout

- Docs: root `DESIGN.md` (FitnessApp structure: tokens, type, layout, components, motion, states, accessibility, do/don't, agent prompt guide with ready prompts), `AGENTS.md` and `llms.txt` for the system, a `mavuus-design-system` skill agents read before UI work, CLAUDE.md pointers.
- Storybook: Foundations (color, type, spacing, radius, shadow, motion), Primitives, Patterns, Organisms; story coverage check.
- Guards in `/verify` and CI: design-system lint (no raw hex, no ad-hoc px spacing/radius, no inline styles, no em dashes in copy, reduced-motion fallback for animations, no imports of retired folders), token drift test, Playwright e2e smoke (reset DB, demo admin login, walk public pages, dashboard and admin, fail on console/network errors, screenshots at 1440/1024/768/390).
- Rollout: PR A "Foundation" (tokens, deps, primitives, patterns, charts, Storybook, docs, guards; no page changes). PR B "Migration" (app shell, all dashboard and admin pages, public site onto shared components, old folders deleted). Every phase ends with the full verification and the e2e smoke run.
