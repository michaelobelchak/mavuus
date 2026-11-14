---
name: mavuus-design-system
description: Use before any UI work in Mavuus - building or changing a page, screen, component, layout, style or UI copy in the client. Points to the design system in mavuus-app/client/src/design-system, the token and import rules, and the commands that prove the change.
---

# Mavuus design system

All new UI uses `mavuus-app/client/src/design-system/`. Legacy pages keep their current styling until they migrate in Phase 8 (`mavuus-app/plans/DESIGN-SYSTEM-PLAN.md`), but anything you add or rewrite goes through the system.

## Before you write code

1. Read `mavuus-app/client/src/design-system/AGENTS.md` (the short rules).
2. Find the component in `DESIGN.md` section 10 (component catalog) and read its row. For the full props, read the component's JSDoc and its story.
3. For a whole page, read `DESIGN.md` section 19 (agent prompt guide) and follow the closest ready prompt.

## Rules

- **Tokens only.** Role classes like `bg-surface-raised`, `text-text-secondary`, `border-border-default`, `p-ds-lg`, `gap-ds-md`, `rounded-card`, `text-body`, `shadow-card`, `z-(--ds-z-modal)`. No hex, no `rgb(`, no arbitrary px (`p-[13px]`), no inline styles beyond `backgroundImage`, `--custom` properties and `var()` values. A missing token goes in `tokens/tokens.json`, then `npm run tokens`.
- **Components from the design system.** Import from `@/design-system/primitives`, `@/design-system/patterns`, `@/design-system/organisms` and `@/design-system/hooks`. Don't import `components/ui/` or `components/live/` in new code, and don't rebuild a card, table, dialog or form field inline.
- **Pages compose organisms and patterns.** Use `PageHeader` at the top, organisms for repeated items (JobCard, MemberCard, AdminDataTable), patterns for structure (Card, DataTable, Dialog, FormField, EmptyState, Alert). Organisms take data as props; the page fetches.
- **Text through the primitives.** Heading, Text, Eyebrow, Caption. Small brand text uses the `brand` tone (`text-brand-strong`), never pink `text-brand`.
- **States.** Loading (skeletons, `loading` props, aria-busy), empty (`EmptyState`) and error (`Alert`, retry) for every data view. See `DESIGN.md` section 12.
- **Accessibility.** Keep the navy focus ring (no `outline-none`), 48px md controls, names on icon-only controls, one `CardLink` per clickable card, `motion-reduce:` on anything that moves.
- **Copy.** American English, plain and direct, no em or en dashes.

## New component

Folder, `Name.jsx`, `Name.test.jsx`, `Name.stories.jsx`, `index.js`, then the tier barrel. Details in `AGENTS.md`. Respect the layering: primitives never import patterns or organisms, patterns never import organisms.

## Prove it

Run in `mavuus-app/client` and show the output:

```bash
npm run guard                  # lint:ds (tokens, dashes, layering) + check:stories
npx vitest run                 # unit, barrel and token drift tests
npx eslint . --max-warnings 0
npm run build-storybook        # when you added or changed a component or story
npx vite build
npm run e2e                    # when a page changed
```

Check the UI in the browser at 1440, 1024, 768 and 390px. Storybook runs with `npm run storybook` on port 6006.
