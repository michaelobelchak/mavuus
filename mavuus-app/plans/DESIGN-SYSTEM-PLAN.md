# Mavuus Design System Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans (or subagent-driven-development) to implement this plan task-by-task.

**Goal:** One agent-ready design system (three-tier tokens, primitives, patterns, organisms, Storybook, guards, docs) used by the public site, member dashboard and admin, with the after-login app shell from the owner's layout reference.

**Architecture:** Tokens live in one DTCG JSON file and are generated into CSS variables, a Tailwind v4 `@theme` block and a JS module. Components are ours, built shadcn-style (copied into the repo, `cva` variants, `cn()` class merge) on Base UI headless parts, styled only with role tokens. Pages compose components; a lint script, a drift test and a Playwright smoke run keep it that way.

**Tech Stack:** React 19, Vite 7, Tailwind CSS v4, react-router 7, lucide-react, `@base-ui/react` 1.9, `recharts` 3, `sonner` 2, `class-variance-authority`, `tailwind-merge`, `clsx`; dev: `storybook` 10 + `@storybook/react-vite`, `vitest` 5 + `jsdom` + `@testing-library/react`, `@playwright/test`.

**Design:** [2026-11-06-design-system-design.md](2026-11-06-design-system-design.md). **Reference:** FitnessApp `DESIGN.md` sections 3 (token tiers), 19b (atomic taxonomy), 21 (agent prompt guide) - read-only, never edit the FitnessApp.

**Conventions for every task:** branch `feat/design-system`; American English, no em or en dashes in code comments or copy; one commit per task with a conventional message ending in the Co-Authored-By line; run `cd mavuus-app/client && npx eslint . --max-warnings 0` before each commit. Phase-end gate = Task "Verify" in each phase.

---

## Phase 0: Setup

### Task 0.1: Dependencies and path alias

**Files:** Modify `mavuus-app/client/package.json`, `mavuus-app/client/vite.config.js`; Create `mavuus-app/client/jsconfig.json`.

1. Install:
   ```bash
   cd mavuus-app/client
   npm install @base-ui/react@^1.9.0 recharts@^3.10.1 sonner@^2.0.8 class-variance-authority@^0.7.1 tailwind-merge@^3.7.0 clsx@^2.1.1
   npm install -D vitest@^5.1.0 jsdom@^31.0.0 @testing-library/react@^16.3.3 storybook@^10.6.6 @storybook/react-vite@^10.6.6 @playwright/test@^1.65.0
   ```
2. Add alias `@` -> `src` in `vite.config.js` (`resolve: { alias: { '@': path.resolve(import.meta.dirname, 'src') } }`) and `jsconfig.json` with `{ "compilerOptions": { "baseUrl": ".", "paths": { "@/*": ["src/*"] } } }`.
3. Add scripts: `"test": "vitest run"`, `"tokens": "node scripts/build-tokens.mjs"`, `"lint:ds": "node scripts/lint-design-system.mjs"`, `"storybook": "storybook dev -p 6006"`, `"build-storybook": "storybook build"`, `"e2e": "playwright test"`.
4. Run `npx vite build` - expect pass. Commit `chore(client): add design-system dependencies, @ alias and scripts`.

### Task 0.2: Vitest config

**Files:** Create `mavuus-app/client/vitest.config.js` (`environment: 'jsdom'`, `include: ['src/**/*.test.{js,jsx}', 'scripts/**/*.test.mjs']`, same `@` alias).
Run `npx vitest run` - expect "No test files found" exit 0 (use `passWithNoTests: true`). Commit.

---

## Phase 1: Tokens

### Task 1.1: Token source

**Files:** Create `src/design-system/tokens/tokens.json` (DTCG: `$value`, `$type`).

Structure (fill every value; colors from current `index.css` and the design doc):
```json
{
  "primitive": {
    "color": {
      "pink":   { "50": {"$value": "#fdf0f4"}, "100": {}, "200": {"$value": "#f6b9cd"}, "300": {}, "400": {}, "500": {"$value": "#F26D92"}, "600": {"$value": "#E05A7F"}, "700": {"$value": "#D94D75"}, "800": {}, "900": {} },
      "blue":   { "500": {"$value": "#1F648D"}, "600": {"$value": "#184F70"}, "700": {"$value": "#164A6A"}, "50": {"$value": "#eeeff4"} },
      "navy":   { "900": {"$value": "#1C2232"}, "800": {"$value": "#14213d"} },
      "neutral":{ "0": {"$value": "#ffffff"}, "25": {"$value": "#fcfbfa"}, "50": {"$value": "#fafbfc"}, "100": {"$value": "#e5e7eb"}, "200": {"$value": "#dbe0e7"}, "400": {"$value": "#9ca3af"}, "500": {"$value": "#6b7280"}, "600": {"$value": "#5e697c"}, "700": {"$value": "#4b5563"}, "900": {"$value": "#111827"} },
      "success": {}, "warning": {}, "error": {}, "info": {}
    },
    "size": { "0": {"$value": "0px"}, "1": {"$value": "1px"}, "2": {}, "4": {}, "8": {}, "12": {}, "16": {}, "20": {}, "24": {}, "32": {}, "40": {}, "48": {}, "56": {}, "64": {}, "72": {}, "96": {} },
    "font": { "family": { "sans": {"$value": "Fixeltext, ui-sans-serif, system-ui, sans-serif"} } }
  },
  "alias": {
    "space":  { "none": "{primitive.size.0}", "xxs": "{primitive.size.4}", "xs": "{primitive.size.8}", "sm": "{primitive.size.12}", "md": "{primitive.size.16}", "lg": "{primitive.size.24}", "xl": "{primitive.size.32}", "xxl": "{primitive.size.48}", "section": "{primitive.size.96}" },
    "radius": { "xs": "4px", "sm": "8px", "md": "12px", "lg": "16px", "xl": "24px", "pill": "9999px" },
    "font-size": { "caption": "13px", "body-sm": "14px", "body": "16px", "lead": "20px", "h4": "18px", "h3": "22px", "h2": "36px", "h1": "40px", "display": "48px" },
    "shadow": { "card": "0 12px 32px rgba(17,24,39,.06)", "card-hover": "0 22px 46px rgba(242,109,146,.16)", "float": "0 18px 40px rgba(17,24,39,.14)", "overlay": "0 24px 64px rgba(17,24,39,.18)" },
    "duration": { "instant": "100ms", "quick": "150ms", "standard": "200ms", "emphasized": "300ms", "slow": "500ms", "reveal": "700ms" },
    "easing": { "out": "cubic-bezier(0.16,1,0.3,1)", "in": "cubic-bezier(0.4,0,1,1)", "in-out": "cubic-bezier(0.65,0,0.35,1)" },
    "z": { "base": 0, "raised": 10, "sticky": 100, "dropdown": 200, "overlay": 300, "modal": 400, "popover": 500, "tooltip": 600, "toast": 700 }
  },
  "role": {
    "light": {
      "surface": { "page": "{primitive.color.neutral.25}", "raised": "{primitive.color.neutral.0}", "sunken": "{primitive.color.blue.50}", "overlay": "{primitive.color.neutral.0}", "brand": "{primitive.color.pink.500}", "brand-strong": "{primitive.color.blue.500}", "hover": "rgba(17,24,39,.04)", "selected": "{primitive.color.pink.50}" },
      "text": { "primary": "{primitive.color.navy.900}", "secondary": "{primitive.color.neutral.600}", "muted": "{primitive.color.neutral.500}", "faint": "{primitive.color.neutral.400}", "on-brand": "{primitive.color.neutral.0}", "link": "{primitive.color.blue.500}", "brand": "{primitive.color.pink.500}", "disabled": "{primitive.color.neutral.400}" },
      "border": { "default": "{primitive.color.neutral.200}", "subtle": "rgba(0,0,0,.06)", "strong": "{primitive.color.navy.900}", "focus": "{primitive.color.navy.900}", "brand": "{primitive.color.pink.500}" },
      "status": { "success": "", "success-subtle": "", "warning": "", "warning-subtle": "", "error": "", "error-subtle": "", "info": "", "info-subtle": "" },
      "chart": { "1": "{primitive.color.blue.500}", "2": "{primitive.color.pink.500}", "3": "", "4": "", "5": "", "6": "", "grid": "{primitive.color.neutral.100}", "axis": "{primitive.color.neutral.500}", "tooltip-bg": "{primitive.color.navy.900}", "tooltip-text": "{primitive.color.neutral.0}" }
    }
  }
}
```
Pick status and chart values that pass 3:1 against white (chart) and 4.5:1 for status text; document each choice in a `$description`.

### Task 1.2: Token build script (TDD)

**Files:** Create `scripts/build-tokens.mjs`, `scripts/build-tokens.test.mjs`; generates `src/design-system/tokens/tokens.css` and `tokens.js`.

**Step 1 (failing test):**
```js
import { describe, it, expect } from 'vitest'
import { buildTokens } from './build-tokens.mjs'

const src = {
  primitive: { color: { pink: { 500: { $value: '#F26D92' } } }, size: { 16: { $value: '16px' } } },
  alias: { space: { md: '{primitive.size.16}' } },
  role: { light: { surface: { brand: '{primitive.color.pink.500}' } } },
}

describe('buildTokens', () => {
  it('should emit primitives, aliases and roles as CSS variables with references', () => {
    const { css } = buildTokens(src)
    expect(css).toContain('--mv-color-pink-500: #F26D92;')
    expect(css).toContain('--space-md: var(--mv-size-16);')
    expect(css).toContain('--surface-brand: var(--mv-color-pink-500);')
  })
  it('should map role tokens into a Tailwind @theme block', () => {
    const { css } = buildTokens(src)
    expect(css).toMatch(/@theme inline \{[^}]*--color-surface-brand: var\(--surface-brand\);/s)
  })
  it('should export resolved values for JavaScript', () => {
    const { js } = buildTokens(src)
    expect(js).toContain('"surface-brand": "#F26D92"')
  })
  it('should throw on a reference that does not exist', () => {
    expect(() => buildTokens({ ...src, alias: { space: { lg: '{primitive.size.99}' } } })).toThrow(/primitive.size.99/)
  })
})
```
**Step 2:** `npx vitest run scripts/build-tokens.test.mjs` -> FAIL (module not found).
**Step 3:** Implement `buildTokens(json)` returning `{ css, js }` and a CLI that reads `tokens.json` and writes both files with a "generated, do not edit" header. Prefixes: primitives `--mv-<group>-<name>`, aliases `--<group>-<name>`, roles `--<group>-<name>` under `:root` (light) and later `[data-theme="dark"]`. `@theme inline` maps: colors -> `--color-surface-*`, `--color-text-*` (utility `text-text-primary` is ugly, so also emit `--color-primary`, `--color-secondary`, `--color-muted` text aliases), `--color-border-*`, `--color-status-*`, `--color-chart-*`; `--radius-*`, `--spacing-*` from aliases, `--shadow-*`, `--ease-*`, `--font-sans`. Also emit shadcn component tokens (`--background`, `--foreground`, `--card`, `--card-foreground`, `--primary`, `--primary-foreground`, `--muted`, `--muted-foreground`, `--border`, `--input`, `--ring`, `--sidebar`, `--sidebar-foreground`, `--sidebar-primary`, `--sidebar-primary-foreground`, `--sidebar-accent`) pointing at role tokens.
**Step 4:** tests pass. **Step 5:** `npm run tokens`; commit `feat(ds): token source and generator`.

### Task 1.3: Drift test

**Files:** Create `src/design-system/tokens/tokens.drift.test.js`: imports `buildTokens`, rebuilds from `tokens.json`, and asserts the result equals the committed `tokens.css` and `tokens.js` byte for byte, with the failure message "Run npm run tokens". Run, pass, commit.

### Task 1.4: Wire tokens into the app

**Files:** Modify `src/index.css`, `index.html`.
- `@import "./design-system/tokens/tokens.css";` right after `@import "tailwindcss";`.
- Make the existing `@theme` brand and `--color-live-*` tokens reference role tokens (temporary bridge until Phase 8 deletes them), so nothing changes visually yet.
- Set `body { font-family: var(--font-sans) }` globally (Fixel everywhere) and delete the Manrope `<link>` tags from `index.html`.
- Verify: `npx vite build`; open `/`, `/dashboard`, `/admin` in the preview and screenshot; the only visible change is the dashboard and admin font. Commit `feat(ds): load tokens globally, Fixel Text everywhere`.

---

## Phase 2: Primitives

### Task 2.1: `cn()` helper and component conventions

**Files:** Create `src/design-system/lib/cn.js` (`export function cn(...inputs) { return twMerge(clsx(inputs)) }`), `src/design-system/lib/cn.test.js` (merges conflicting padding, keeps conditional classes). TDD as in 1.2. Commit.

Conventions every component follows (write them at the top of `src/design-system/README.md` now):
- File per component: `primitives/Button/Button.jsx`, `Button.stories.jsx`, `Button.test.jsx`, `index.js`; tier barrel `primitives/index.js`.
- Variants with `cva`; class strings use only role tokens and alias scales (`bg-surface-brand`, `text-on-brand`, `rounded-lg`, `px-lg`), never hex or arbitrary px.
- `ref` is a normal prop (React 19). Accept `className` and merge with `cn`. Spread remaining props onto the root.
- Interactive parts with focus, keyboard or layering logic use Base UI (`@base-ui/react`) under the hood.
- Every component has: a story per variant and state (default, hover via `parameters.pseudo` or docs, disabled, loading, error where relevant), and a test for behavior that matters (keyboard, aria, callbacks).

### Task 2.2: Button (reference implementation, full code)

**Files:** Create `src/design-system/primitives/Button/{Button.jsx,Button.test.jsx,Button.stories.jsx,index.js}`.

Test first:
```jsx
import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { Button } from './Button'

describe('Button', () => {
  it('should call onClick when pressed', () => {
    const onClick = vi.fn()
    render(<Button onClick={onClick}>Save</Button>)
    screen.getByRole('button', { name: 'Save' }).click()
    expect(onClick).toHaveBeenCalledOnce()
  })
  it('should not fire and should be disabled when loading', () => {
    const onClick = vi.fn()
    render(<Button loading onClick={onClick}>Save</Button>)
    const btn = screen.getByRole('button', { name: /save/i })
    btn.click()
    expect(onClick).not.toHaveBeenCalled()
    expect(btn).toHaveAttribute('aria-busy', 'true')
  })
  it('should render a link when given href', () => {
    render(<Button href="/join">Join</Button>)
    expect(screen.getByRole('link', { name: 'Join' })).toHaveAttribute('href', '/join')
  })
})
```
Implementation:
```jsx
import { cva } from 'class-variance-authority'
import { Link } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { cn } from '../../lib/cn'

export const buttonVariants = cva(
  'inline-flex items-center justify-center gap-xs rounded-lg font-semibold whitespace-nowrap transition-[background-color,color,border-color,transform] duration-standard ease-out active:translate-y-px disabled:pointer-events-none disabled:opacity-60',
  {
    variants: {
      variant: {
        primary: 'bg-surface-brand text-on-brand hover:bg-surface-brand-hover shadow-button-brand',
        secondary: 'bg-surface-brand-strong text-on-brand hover:bg-surface-brand-strong-hover',
        outline: 'border border-strong bg-transparent text-primary hover:border-brand hover:text-brand',
        ghost: 'bg-transparent text-primary hover:bg-surface-hover',
        danger: 'bg-status-error text-on-brand hover:opacity-90',
      },
      size: { sm: 'h-9 px-md text-body-sm', md: 'h-12 px-xl text-body', lg: 'h-14 px-xl text-body' },
      block: { true: 'w-full' },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  },
)

export function Button({ variant, size, block, loading = false, href, to, className, children, ref, ...props }) {
  const classes = cn(buttonVariants({ variant, size, block }), className)
  const content = (
    <>
      {loading && <Loader2 aria-hidden="true" className="size-4 animate-spin motion-reduce:animate-none" />}
      {children}
    </>
  )
  if (to) return <Link ref={ref} to={to} className={classes} {...props}>{content}</Link>
  if (href) return <a ref={ref} href={href} className={classes} {...props}>{content}</a>
  return (
    <button ref={ref} type="button" className={classes} disabled={props.disabled || loading} aria-busy={loading || undefined} {...props}>
      {content}
    </button>
  )
}
```
(Add any missing role tokens the classes use, e.g. `surface-brand-hover`, `shadow-button-brand`, to `tokens.json`, regenerate.) Stories: Primary, Secondary, Outline, Ghost, Danger, Sizes, Loading, Disabled, AsLink. Run tests, commit `feat(ds): Button`.

### Tasks 2.3 to 2.22: remaining primitives

Same five steps each (failing test, fail, implement, pass, commit; plus stories). Specs:

| Task | Component | Built on | Variants / API | Tests must cover |
|---|---|---|---|---|
| 2.3 | IconButton | Button styles | `variant`, `size` sm/md, required `aria-label` | warns (console.error) without aria-label |
| 2.4 | Link | react-router Link | `variant` inline/standalone; external opens new tab with sr-only "(opens in a new tab)" | external rel and sr text |
| 2.5 | Badge | span | `tone` neutral/brand/success/warning/error/info, `size` | renders tone class |
| 2.6 | TrendBadge | Badge | `value` (number), `direction` up/down/flat, `goodWhen` up/down | correct tone for direction x goodWhen; sr text "up 32.54 percent" |
| 2.7 | Chip | button | selectable, `selected` with aria-pressed | toggles aria-pressed |
| 2.8 | Avatar, AvatarStack | img + initials fallback | `size` sm/md/lg; stack `max` with "+N" | fallback initials on img error |
| 2.9 | Input | input | `size`, `invalid` (aria-invalid), leading/trailing icon slots | aria-invalid |
| 2.10 | Textarea | textarea | auto-grow optional | - |
| 2.11 | Select | Base UI Select | items, placeholder, invalid | keyboard open and choose |
| 2.12 | Checkbox | Base UI Checkbox | label prop | toggles checked |
| 2.13 | Radio, RadioGroup | Base UI Radio | - | arrow keys move selection |
| 2.14 | Switch | Base UI Switch | label | toggles |
| 2.15 | Label | label | required asterisk with sr-only "(required)" | sr text |
| 2.16 | Spinner | svg | sizes; reduced motion stops spin | role status + label |
| 2.17 | Skeleton | div | shapes text/circle/rect | aria-hidden |
| 2.18 | Divider | hr | orientation | - |
| 2.19 | Tooltip | Base UI Tooltip | content, side | shows on focus |
| 2.20 | ProgressBar | div role progressbar | value, max, tone | aria-valuenow |
| 2.21 | Typography | - | `Heading` (level 1 to 4 + `size` display/h1/h2/h3/h4 decoupled from level), `Text` (lead/body/sm/caption, tone), `Eyebrow`, `Caption` | level renders correct tag |
| 2.22 | Icon | lucide wrapper | `size` 16/20/24, `label` or decorative | decorative gets aria-hidden |

### Task 2.23: Primitives barrel and Verify

Create `src/design-system/primitives/index.js` exporting all. Gate: `npx vitest run`, `npx eslint . --max-warnings 0`, `npx vite build`. Commit.

---

## Phase 3: Patterns and charts

Same TDD steps per pattern. Specs:

| Task | Pattern | Built on | Notes / tests |
|---|---|---|---|
| 3.1 | Card | div | variants feature (+`rule`, +`interactive`), surface, panel, panel-pink, media; port from `components/live/ui/cardStyles.js` |
| 3.2 | StatCard | Card + Icon + TrendBadge + CountUp | props icon, label, value, trend, period ("Last 30 days"); test renders sr summary |
| 3.3 | Tabs | Base UI Tabs | underline and pill styles; arrow keys |
| 3.4 | NumberedTabs | Tabs | port `components/live/ui/NumberedTabs.jsx` onto Base UI Tabs; keep pause/reduced-motion tests |
| 3.5 | Dialog | Base UI Dialog | title required, focus trap, Escape closes, returns focus |
| 3.6 | Sheet | Base UI Dialog | side left/right, used by mobile sidebar |
| 3.7 | DropdownMenu | Base UI Menu | items, separators, keyboard |
| 3.8 | Popover | Base UI Popover | - |
| 3.9 | Toast | sonner | `<Toaster />` themed with tokens + `toast()` re-export; replace `components/ui/Toast` API (`toast.success/error/info`) with an adapter so callers don't change |
| 3.10 | Accordion | Base UI Accordion | closed panels hidden from focus |
| 3.11 | Breadcrumbs, Pagination | nav | aria-current, 44px targets |
| 3.12 | Table, DataTable | table | DataTable: columns config, sort (aria-sort), pagination, empty state slot, loading skeleton rows |
| 3.13 | FormField | Label + control + hint + error | wires aria-describedby and aria-invalid |
| 3.14 | SearchInput, FilterBar | Input, Select, Chip | debounced onChange (test with fake timers) |
| 3.15 | EmptyState, Alert, Banner | - | tones, actions |
| 3.16 | PageHeader, SectionHeader | Typography | title, description, actions slot |
| 3.17 | ChartCard, BarChart, LineChart | recharts | colors from `tokens.js` chart series; tooltip styled with tooltip tokens; reduced motion disables `isAnimationActive`; accessible summary table toggle |
| 3.18 | MediaFrame, CheckList, Reveal, CountUp, useInView | - | port from `components/live/ui` with existing behavior |

### Task 3.19: Patterns barrel and Verify (gate as 2.23).

---

## Phase 4: Organisms

### Task 4.1: App shell

**Files:** `src/design-system/organisms/app-shell/{AppShell.jsx,AppSidebar.jsx,SidebarNavItem.jsx,AppTopBar.jsx,nav.js,*.stories.jsx,*.test.jsx}`.
- `nav.js` exports `MEMBER_NAV` and `ADMIN_NAV`: `{ label, icon, to, children? }` (member: Home, Live Sessions, On-Demand, Resources, Speakers, Members, Vendors, Jobs [My Jobs], Messages, Connections, Profile, Invite; admin groups: Overview, People, Content, Community, Settings - map every existing `/admin/*` route).
- Sidebar 280px white, logo top, items 48px tall with icon 20, label, chevron for groups (expand in place, `aria-expanded`), active item = pill with `bg-gradient-to-r from-surface-brand-strong to-navy` (add a `gradient-active` token), white text; hover `bg-surface-hover`.
- Top bar: page title (from route meta), search, notifications button, avatar `DropdownMenu`.
- Main: `bg-surface-sunken rounded-tl-[--radius-xxl]` panel, padding `p-xl`, max width none.
- Responsive: >=1280 full; 1024-1279 icon rail (labels in Tooltip); <1024 hamburger opens `Sheet`.
- Tests: active item has `aria-current="page"`; group toggles `aria-expanded`; rail mode shows tooltips; Sheet opens and closes with Escape.

### Task 4.2: Site organisms

Move `PublicHeader`, `Footer`, `CTABand` into `organisms/site/` built on primitives/patterns (behavior unchanged; keep the 1200px menu breakpoint, Escape and outside click).

### Task 4.3: Dashboard and admin organisms

Extract repeated page pieces into `organisms/dashboard/` (JobCard, MemberCard, SessionCard, VendorCard, ResourceCard, MessageThreadItem, ConnectionRequest) and `organisms/admin/` (AdminDataTable wrapper with moderation actions, StatusBadge mapping). Read each current page first; one organism per repeated UI, with a story and a smoke test.

### Task 4.4: Verify gate.

---

## Phase 5: Storybook

### Task 5.1: Configure

**Files:** `mavuus-app/client/.storybook/{main.js,preview.jsx}`. `main.js`: framework `@storybook/react-vite`, stories `../src/design-system/**/*.stories.@(js|jsx)` and `../src/design-system/docs/*.mdx`. `preview.jsx`: import `../src/index.css`, wrap stories in `MemoryRouter`, set backgrounds from tokens, add a theme toolbar (light only for now, dark placeholder).
Add to `.claude/launch.json`: `{ "name": "storybook", "runtimeExecutable": "npm", "runtimeArgs": ["run","storybook","--","--no-open"], "port": 6006, "cwd": "mavuus-app/client" }`.

### Task 5.2: Foundations docs

`src/design-system/docs/{Colors,Typography,Spacing,Radius,Shadow,Motion,Tokens}.mdx` rendering swatches and scales straight from `tokens.js` (so docs can't drift).

### Task 5.3: Story coverage check

`scripts/check-story-coverage.mjs`: every `index.js` component folder under `primitives|patterns|organisms` has a `*.stories.jsx`; exit 1 listing missing ones. Add to `lint:ds`. Verify `npm run build-storybook` passes. Commit.

---

## Phase 6: Guards

### Task 6.1: Design-system lint (TDD on fixtures)

**Files:** `scripts/lint-design-system.mjs`, `scripts/lint-design-system.test.mjs`, fixtures in `scripts/__fixtures__/`.
Rules (error unless noted), scanning `src/**/*.{js,jsx,css}` except `src/design-system/tokens/` and `src/index.css` token blocks:
- `no-raw-color`: hex, `rgb(`, `hsl(` in className strings or JSX style outside tokens.
- `no-arbitrary-size`: Tailwind arbitrary px for spacing, radius, font-size (`p-[13px]`, `rounded-[30px]`, `text-[21.6px]`) outside `src/design-system/` (warn inside it).
- `no-inline-style`: `style={{` except `backgroundImage`, CSS custom properties, or values containing a variable (warn).
- `no-em-dash`: U+2014 or U+2013 in string literals and JSX text.
- `motion-needs-reduced`: files with `animate-` or `@keyframes`/`transition` utilities on loops must include `motion-reduce:` or a `prefers-reduced-motion` block (warn).
- `no-retired-imports`: imports from `components/ui/` or `components/live/` (error after Phase 8; warn before).
- `pages-use-system` (warn): files in `src/pages/` that define more than 3 className strings longer than 120 characters.
Override comment: `// ds-allow <rule>: <reason>` on the line or the line above. Tests: one passing and one failing fixture per rule, override works. Wire into `/verify`, the PR template, and CI (`.github/workflows/ci.yml` step `npm run lint:ds`).

### Task 6.2: Playwright e2e smoke

**Files:** `mavuus-app/client/playwright.config.js` (`webServer` for server `npm --prefix ../server run dev` on 3001 and client `npm run dev -- --port 5180 --strictPort`, `reuseExistingServer: true`), `e2e/smoke.spec.js`.
Smoke spec:
1. `globalSetup`: `rm -f ../server/db/mavuus.db && node ../server/db/seed.js` (use Node `fs.rmSync` + `execSync`, not shell `rm -rf`).
2. Public: visit `/`, `/membership`, `/marketing-services`, `/resources`, one `/post/...`, `/about`, `/contact`, `/faq`, `/terms-conditions/introduction`; assert h1 visible, no console errors (allow 401 from `/api/auth/me`), no failed requests except that.
3. Log in as demo admin through the UI; visit `/dashboard`, `/dashboard/messages`, `/dashboard/jobs`, `/dashboard/vendors`, `/admin`, `/admin/users`, `/admin/jobs`; assert content rendered and no errors.
4. For each visited page, screenshot at 1440, 1024, 768, 390 into `e2e/screenshots/` (gitignored) and assert `scrollWidth <= innerWidth`.
Add `npm run e2e` to `/verify` as the last step and to CI as a separate job (install Playwright browsers with `npx playwright install --with-deps chromium`). Commit.

### Task 6.3: Phase Verify.

---

## Phase 7: Agent docs

### Task 7.1: DESIGN.md (repo root)

FitnessApp structure: 1 Overview and visual theme; 2 Color roles; 3 Token architecture (tiers, naming, how to add a token, generated files); 4 Typography; 5 Iconography (lucide, sizes); 6 Voice and tone (American English, no em dashes, plain copy); 7 Layout (app shell, public sections, spacing scale, breakpoints 1280/1199/991/767/479); 8 Shapes; 9 Depth; 10 Component catalog (each component: when to use, variants, do and don't); 11 Signature components (StatCard, NumberedTabs, CTABand, app sidebar); 12 Loading, empty, error states; 13 Motion; 14 Accessibility (pink contrast decision, focus ring, 44px targets, reduced motion); 15 Responsive; 16 Do's and don'ts; 17 Atomic taxonomy and import rules; 18 Known gaps (dark theme, CDN assets); 19 Agent prompt guide: quick token reference + ready prompts ("Generate an admin list page", "Generate a member detail page", "Add a KPI row", "Add a form in a dialog").

### Task 7.2: AGENTS.md, llms.txt, skill

- `mavuus-app/client/src/design-system/AGENTS.md`: the rules in 30 lines, imports, how to add a component (folder, story, test, barrel), which commands prove it.
- `mavuus-app/client/public/llms.txt`: links to DESIGN.md sections and the component list (served at `/llms.txt`).
- `.claude/skills/mavuus-design-system/SKILL.md`: "Read before any UI work": tokens only, components from `@/design-system`, check DESIGN.md section for the component, run `npm run lint:ds` and `npm test`, add stories.
- Update CLAUDE.md (conventions + skill routing + definition of done: `lint:ds`, story, e2e) and MEMORY.md (decision entry).

### Task 7.3: PR A

Full gate: `npx vitest run`, `npx eslint . --max-warnings 0`, `npm run lint:ds`, `npx vite build`, `npm run build-storybook`, server `npm test`, `npm run e2e`. CHANGELOG + MEMORY entries. Push and open PR "Design system foundation" against `main` (or stacked on #4 if not merged). Do not merge.

---

## Phase 8: Migration (PR B, new branch from PR A)

### Task 8.1: App shell live

Replace `components/layout/DashboardLayout.jsx` and `AdminLayout.jsx` with `AppShell` (member and admin nav). Keep all routes, auth guards, notifications and search behavior (port from DashboardLayout). e2e smoke must pass.

TODO: AppShell owns the "Skip to main content" link. Remove the skip link from `App.jsx` when the shell is wired in, so pages under the shell don't get two.

Known bug to fix here (found by the Phase 6 smoke test): the closed notifications drawer in `DashboardLayout.jsx` is only moved off screen with `translate-x-full`, so its controls are likely still focusable. The AppShell replacement must render it closed with `inert` or unmounted.

### Tasks 8.2 to 8.18: Dashboard pages (one task per page)

For each of `AcademyPage` (home), `LiveSessionsPage`, `SessionDetailPage`, `OnDemandPage`, `ResourcesPage`, `ResourceDetailPage`, `SpeakersPage`, `MembersPage`, `MemberProfilePage`, `VendorsPage`, `VendorDetailPage`, `JobsPage`, `JobDetailPage`, `MyJobsPage`, `MessagesPage`, `ProfilePage`, `InvitePage`:
1. Capture before at 1440 and 390.
2. Rewrite UI with `PageHeader`, patterns and organisms only; no behavior or API changes.
3. `npm run lint:ds` shows zero findings for the file; e2e smoke passes; capture after; commit `refactor(dashboard): <Page> on the design system`.

### Tasks 8.19 to 8.41: Admin pages

Same steps for all 23 `pages/admin/*.jsx`, using `DataTable` + `FilterBar` + `Dialog` + `StatusBadge`. The admin overview gets `StatCard` rows and `ChartCard` from `/api/admin/stats`, `/stats/growth`, `/stats/activity`.

Known bug to fix here: the weekly signups bars on `AdminDashboardPage` render empty at every width (percent heights inside a column with no definite height). The `ChartCard` bar chart replaces it.

### Task 8.42: Auth pages

Login, Register, Forgot/Reset password, Verify email, OAuth callback on the system.

### Task 8.43: Public site onto the shared system

Replace imports from `components/live/*` with `@/design-system` equivalents page by page (visual parity: capture before/after at 4 widths, diff must be intentional only).

### Task 8.44: Retire old components

Delete `components/ui/`, `components/live/ui/`, unused `components/sections/`; flip `no-retired-imports` to error; remove the temporary bridge tokens from `index.css`. Gate + e2e.

### Task 8.45: Final QA and PR B

Full gate; Impeccable detector over `src/`; screenshot sheet of every page at 4 widths; update the audit file with an "after" table; CHANGELOG and MEMORY entries; push; open PR "Migrate the app to the design system". Do not merge.
