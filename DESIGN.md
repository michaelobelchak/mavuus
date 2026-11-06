# DESIGN.md - Mavuus

The design system for the whole Mavuus product: the public site, the member dashboard and the admin panel. Code lives in `mavuus-app/client/src/design-system/`. This file is the map; the code, its JSDoc and its stories are the ground truth. When they disagree, the code wins and this file gets fixed.

Related files:

- `mavuus-app/client/src/design-system/README.md` - the full component conventions (read before adding or changing a component)
- `mavuus-app/client/src/design-system/AGENTS.md` - the short rules for agents
- `mavuus-app/plans/2026-11-06-design-system-design.md` - the approved design
- `mavuus-app/plans/DESIGN-SYSTEM-PLAN.md` - the implementation plan and the Phase 8 migration
- Storybook: `cd mavuus-app/client && npm run storybook` (port 6006). Foundations pages render straight from `tokens/tokens.js`.

---

## 1. Overview and visual theme

Mavuus is a B2B community for marketing leaders. The look is calm and editorial: white cards on a warm off-white page, navy text, the pink `#F26D92` as the brand accent and a blue `#1F648D` for strong actions and links. One typeface, Fixel Text, for everything.

What makes it Mavuus:

- **Pink as the accent, not the text color.** Pink fills primary buttons, the eyebrow labels and the 4px left rule on feature cards. Small essential text is never pink on its own (see section 14).
- **Navy for structure.** Text, the focus ring, strong borders and the active sidebar pill (a blue to navy gradient).
- **Soft depth.** Cards use a hairline border and a low, wide shadow. Hover lifts a card with a pink-tinted shadow.
- **Tinted panels.** The signed-in app renders pages into a light blue `bg-surface-sunken` panel with a large top-left radius; white cards sit on it.
- **Quiet motion.** Content rises into view once, numbers count up, decorative art floats slowly. Everything respects reduced motion.

Theme: light only today. The token tiers are set up so a dark theme is one extra block of role tokens (section 18).

## 2. Color roles

Components use role colors only. These are the light-theme values from `tokens/tokens.json` (`role.light`).

### Surfaces (`bg-surface-*`)

| Role | Value | Use |
|---|---|---|
| `surface-page` | neutral-25 `#fcfbfa` | Page background |
| `surface-raised` | white | Cards, sidebar, popups |
| `surface-sunken` | blue-50 `#eeeff4` | Tinted panels, the app main panel, skeletons, neutral badges |
| `surface-overlay` | white | Dialogs and sheets |
| `surface-inverse` | navy-900 `#1C2232` | Tooltips, the inverse count badge. Pair with `text-on-brand` (15.86:1) |
| `surface-brand` / `-hover` | pink-500 / pink-600 | Primary buttons |
| `surface-brand-strong` / `-hover` | blue-500 / blue-600 | Secondary buttons, progress bars |
| `surface-hover` | `rgba(17, 24, 39, 0.04)` | Hover on ghost controls and rows |
| `surface-selected` | pink-50 `#fdf0f4` | Selected chips, selected thread, brand badges, `panel-pink` cards |
| `surface-control-off` | neutral-500 | Off Switch track (4.83:1 on white) |
| `surface-header` | neutral-50 | Site-only: the public sticky header |

### Text (`text-text-*`)

| Role | Value | Contrast on white | Use |
|---|---|---|---|
| `text-primary` | navy-900 | 15.86:1 | Body and headings |
| `text-secondary` | neutral-600 `#5e697c` | 5.54:1 | Supporting text |
| `text-muted` | neutral-500 `#6b7280` | 4.83:1 | Captions, meta |
| `text-faint` | neutral-400 | 2.54:1 | Decorative or placeholder only |
| `text-on-brand` | white | | Text on brand and inverse surfaces |
| `text-link` | blue-500 | 6.43:1 | Links |
| `text-brand` | pink-500 | 2.85:1 | Large or decorative text only (Eyebrow `accent`) |
| `text-brand-strong` | pink-800 `#b23a5d` | 5.74:1 | Small brand text: badges, selected chips, the `brand` tone |
| `text-disabled` | neutral-400 | | Disabled controls |
| `text-ink` | navy-800 | | Site-only: public header links. Use `text-primary` in the app |

### Borders (`border-border-*`)

`border-default` (neutral-200), `border-subtle` (`rgba(0, 0, 0, 0.06)`, the card hairline), `border-strong` (navy-900, outline buttons), `border-focus` (navy-900), `border-brand` (pink-500, the card rule), `border-brand-subtle` (pink-200), `border-divider` (navy-300).

### Status (`bg-status-*`, `text-status-*`)

Each status has a strong color (the 700 step) and a `-subtle` background (the 50 step): `status-success`, `status-warning`, `status-error`, `status-info`. `status-rating` (warning-700) fills rating stars.

### Charts (`*-chart-*`)

`chart-1` blue-500, `chart-2` pink-500, `chart-3` teal, `chart-4` warning-600, `chart-5` violet, `chart-6` lime, plus `chart-grid`, `chart-axis`, `chart-tooltip-bg` and `chart-tooltip-text`. Charts read these from `tokens/tokens.js` (`chartColors`), never as hex.

### Gradient

`--gradient-active` is `linear-gradient(90deg, blue-500, navy-900)`, the active sidebar pill. Use it as `bg-(image:--gradient-active)`.

## 3. Token architecture

### Three tiers

| Tier | CSS name | Holds | Used by |
|---|---|---|---|
| 1 Primitive | `--mv-<path>` (`--mv-color-pink-500`, `--mv-size-16`) | Color ramps (pink, blue, navy, neutral, success, warning, error, info, 50 to 900; data hues), sizes, the font family | Only `tokens/` |
| 2 Alias | `--ds-<path>` (`--ds-space-md`, `--ds-radius-lg`, `--ds-z-modal`) | Space, radius, font size, line height, shadow, duration, easing, z-index, breakpoints | Roles, `styles/` CSS, Tailwind theme |
| 3 Role | `--<group>-<name>` (`--surface-raised`, `--text-primary`) | Surfaces, text, borders, status, chart, gradient | Components |

Alias names carry the `--ds-` prefix so none of them land in Tailwind's own theme namespaces (`--radius-*`, `--shadow-*`, `--text-*`). Without it, `--spacing-md` would turn `max-w-md` into 16px. The drift test also checks that no generated key overrides a Tailwind default.

### Tailwind classes

The generator writes an `@theme inline` block that maps tokens to classes:

| Kind | Classes |
|---|---|
| Color | `bg-surface-*`, `text-text-*`, `border-border-*`, `bg-status-*`, `text-status-*`, `*-chart-*` |
| Spacing | `p-ds-*`, `m-ds-*`, `gap-ds-*`: `none` 0, `xxs` 4, `xs` 8, `sm` 12, `md` 16, `lg` 24, `xl` 32, `xxl` 48, `xxxl` 64, `section` 96; site only: `gutter-sm` 20, `gutter` 40, `section-xs` 40, `section-sm` 56, `section-md` 72, `band` 72 |
| Radius | `rounded-tag` 4, `-input` 8, `-control` 12, `-card` 16, `-sheet` 24, `-panel` 32, `-chip` pill |
| Type | `text-caption`, `-body-sm`, `-body`, `-lead`, `-h4`, `-h3`, `-h2`, `-h1`, `-display`; site only: `-lead-sm`, `-h2-md`, `-h2-sm` |
| Shadow | `shadow-card`, `-card-hover`, `-float`, `-overlay`, `-button-brand`, `-button-secondary` |
| Easing | `ease-enter`, `ease-exit`, `ease-move` |
| Breakpoints | `site-sm:` 480, `site-md:` 992, `site-lg:` 1200 (and `max-site-*:`) |
| Z-index | `z-(--ds-z-*)` |

Role variables like `--text-primary` live in `:root`; Tailwind reads them through `--color-text-primary`. So `text-body` is a font size and `text-text-primary` is a color.

### Adding or changing a token

1. Edit `mavuus-app/client/src/design-system/tokens/tokens.json` (DTCG format: `$value`, `$type`, optional `$description`). Reference other tokens with `{primitive.color.pink.500}`. Add a raw value to `primitive`, a scale step to `alias`, a themed meaning to `role.light`.
2. Run `cd mavuus-app/client && npm run tokens`. It writes three generated files: `tokens/tokens.css` (CSS variables plus the `@theme inline` block), `tokens/tokens.js` (resolved light values for charts and JS) and `lib/twMergeConfig.js` (the theme scales `cn()` needs so `cn('p-ds-md', 'p-ds-lg')` keeps `p-ds-lg`).
3. Never edit the generated files by hand. `tokens/tokens.drift.test.js` (run by `npx vitest run`) fails when any of them is stale, and `tokens/zOrder.test.js` guards the layer order.

## 4. Typography

**Fixel Text everywhere** (`font-sans`, from `--mv-font-family-sans: Fixeltext, ui-sans-serif, system-ui, sans-serif`). Five weights (light to bold) load through `@font-face` in `src/index.css`. Manrope is retired.

Each `text-*` class sets the size and its line height together:

| Class | Size / line height | Primitive |
|---|---|---|
| `text-display` | 48px / 1.1 | `Heading size="display"` (bold) |
| `text-h1` | 40px / 1.15 | `Heading level={1}` (bold) |
| `text-h2` | 36px / 1.2 | `Heading level={2}` (bold, the default level) |
| `text-h3` | 22px / 1.3 | `Heading level={3}` (semibold) |
| `text-h4` | 18px / 1.4 | `Heading level={4}` (semibold) |
| `text-lead` | 20px / 1.6 | `Text size="lead"` |
| `text-body` | 16px / 1.6 | `Text` (default) |
| `text-body-sm` | 14px / 22px | `Text size="body-sm"` |
| `text-caption` | 13px / 20px | `Caption`, `Text size="caption"` |

Use the primitives instead of raw classes: `Heading` (`level` 1 to 4, levels 5 and 6 render an h4; `size` overrides the look), `Text` (`as`, `size`), `Eyebrow` (the small label above a heading, `accent` pink by default and decorative only) and `Caption` (muted by default). They all take the same `tone`: primary, secondary, muted, brand (`text-brand-strong`), link, on-brand, success, warning, error, info. Eyebrow adds `accent`. Unknown tones, sizes and levels warn in dev and fall back.

Headings get `text-balance`. Base `h1` to `h6` rules sit in `@layer base` so utilities beat them.

## 5. Iconography

- **Library:** `lucide-react` only.
- **Standalone icons** use the `Icon` primitive: `<Icon icon={Users} size="md" />`. Sizes (`lib/iconSizes.js`): sm 16px, md 20px (default), lg 24px. Decorative by default (`aria-hidden`); pass `label` when the icon carries meaning alone (`role="img"`). It inherits the text color.
- **Icons in controls** go in as components, not elements: `leadingIcon={Plus}` and `trailingIcon` on Button, Badge, Chip and Input; `icon` on IconButton and on Tab. The control renders them `aria-hidden` at the matching size (`controlIconSizes`: 16px for xs and sm, 20px for md and lg).
- Patterns render lucide icons through `Icon`, never directly.
- An icon-only control always needs a name: `<IconButton icon={X} aria-label="Close" />`.

## 6. Voice and tone

- American English ("color", "canceled", "center").
- No em dashes or en dashes, anywhere: copy, comments, docs. Use a hyphen, or "to" for ranges ("1 to 5"). `npm run lint:ds` fails on them in code and in the design-system docs.
- Plain and direct, like a sharp coworker. Short sentences. No filler or marketing words ("leverage", "seamless", "utilize").
- Buttons say what they do: "Delete review", not "OK". Confirm dialogs name the thing: "Delete Priya Nair?" with "This can't be undone."
- Empty states say what goes here and what to do next.
- Errors say what happened and what to try: "Something went wrong. Try again."
- Screen-reader text is real sentences: "Users 430, up 32.54 percent, last 30 days".

## 7. Layout

### App shell (signed in)

`AppShell` is the layout for the member dashboard and the admin panel:

| Width | Sidebar |
|---|---|
| 1280px and up | Full 280px sidebar (`w-70`), no toggle |
| 1024 to 1279px | 80px icon rail (`w-20`) with tooltips; a toggle expands it, saved in localStorage under `mv.sidebar.collapsed` (only applies in this band) |
| Below 1024px | Hidden; the top bar's menu button opens it in a left `Sheet` with focus on the active link. Escape or navigation closes it |

The top bar (`AppTopBar`) holds the page title (an h1) or breadcrumbs on the left and search, actions, notifications and the account menu on the right. From 768px the search sits in the bar; below that a Search button opens it in a popover. `/` focuses search.

Pages render into `<main id="main-content">`: `bg-surface-sunken`, `p-ds-md` (`lg:p-ds-xl`), `lg:rounded-tl-panel`. A "Skip to main content" link comes first.

### Public site

Public sections use the site tokens:

- Gutter: `px-ds-gutter` (40px), `max-md:px-ds-gutter-sm` (20px).
- Section rhythm: `py-ds-section` (96px), `max-site-md:py-ds-section-md` (72px), `max-md:py-ds-section-sm` (56px).
- Content column: `mx-auto w-full max-w-7xl`.
- `SiteHeader` collapses to the menu below 1200px (`max-site-lg:`).

### Breakpoints

| Name | Value | Source |
|---|---|---|
| `max-site-sm:` / `site-sm:` | 480px | tokens (`--ds-breakpoint-site-sm`) |
| `md:` | 768px | Tailwind default |
| `max-site-md:` / `site-md:` | 992px | tokens |
| `lg:` | 1024px | Tailwind default (rail starts) |
| `max-site-lg:` / `site-lg:` | 1200px | tokens (site header menu) |
| `xl:` | 1280px | Tailwind default (full sidebar) |

The e2e smoke test checks every main page at 1440, 1024, 768 and 390px.

### Spacing scale

`none` 0, `xxs` 4, `xs` 8, `sm` 12, `md` 16, `lg` 24, `xl` 32, `xxl` 48, `xxxl` 64, `section` 96. Use them as `p-ds-*`, `m-ds-*`, `gap-ds-*`. Tailwind numeric sizes (`h-12`, `size-4`, `w-70`) are fine for fixed control heights, icon sizes and layout widths; arbitrary values (`p-[13px]`) are not.

## 8. Shapes

| Class | Radius | Role |
|---|---|---|
| `rounded-tag` | 4px | Tiny tags |
| `rounded-input` | 8px | Text fields |
| `rounded-control` | 12px | Buttons, IconButtons, Selects |
| `rounded-card` | 16px | Cards, skeleton rects |
| `rounded-sheet` | 24px | Sheet inner edge |
| `rounded-panel` | 32px | `panel` cards, the app main panel corner |
| `rounded-chip` | pill | Chips, badges, avatars, the sidebar pill |

Buttons use `rounded-control`. Filter chips and the sidebar items are pills.

## 9. Depth

### Shadows

| Class | Use |
|---|---|
| `shadow-card` | Feature and media cards, the active sidebar pill |
| `shadow-card-hover` | Interactive card hover (pink tint) |
| `shadow-float` | Floating elements |
| `shadow-overlay` | Dialogs, sheets, menus |
| `shadow-button-brand` | Primary button glow (pink) |
| `shadow-button-secondary` | Secondary button glow (blue) |

### Z-index order

Use the aliases through `z-(--ds-z-*)`, never literal numbers. Lowest to highest:

| Token | Value | Holds |
|---|---|---|
| `--ds-z-base` | 0 | Page content |
| `--ds-z-raised` | 10 | Raised content |
| `--ds-z-sticky` | 100 | Sticky headers |
| `--ds-z-overlay` | 300 | Backdrops |
| `--ds-z-modal` | 400 | Dialogs, sheets |
| `--ds-z-dropdown` | 500 | Menus and selects (above dialogs, so they open inside one) |
| `--ds-z-popover` | 550 | Popovers |
| `--ds-z-tooltip` | 600 | Tooltips |
| `--ds-z-toast` | 700 | Toasts |

`tokens/zOrder.test.js` fails when the order changes.

## 10. Component catalog

Import from the tier barrels. There is no single top-level barrel:

```jsx
import { Button, Heading, Text } from '@/design-system/primitives'
import { Card, PageHeader } from '@/design-system/patterns'
import { AppShell, StatusBadge } from '@/design-system/organisms'
import { useMediaQuery } from '@/design-system/hooks'
import { formatDate, toDateTime } from '@/design-system/lib/formatDate'
```

Every component takes `className` (merged last with `cn()`), spreads other props on its root and takes `ref` as a normal prop. Every component has a story in Storybook.

### Shared size scale

Controls share one height scale (`lib/controlSizes.js`): xs 32px, sm 40px, md 48px (default, meets the 44px target), lg 56px. sm is for dense desktop toolbars only. Unsupported sizes resolve to the nearest allowed step with a dev warning.

### Primitives (`primitives/`)

| Component | When to use | Key props | Do / don't |
|---|---|---|---|
| `Button` | Any action or call to action | `variant` primary (default), secondary, outline, ghost, danger; `size` sm, md, lg; `block`; `loading`; `disabled`; `leadingIcon`, `trailingIcon`; `to` or `href` render a link | Do use `loading` (stays focusable, announces "Loading"). Don't nest links in buttons |
| `IconButton` | Icon-only action | `icon`, `variant` (ghost default), `size` sm, md, lg, `aria-label` | Always pass `aria-label` |
| `Link` | Text links | `variant` inline (default, underlined) or standalone; `to` or `href` | External http(s) links open in a new tab and say so |
| `Badge` | Read-only status label | `tone` neutral, brand, success, warning, error, info, inverse; `size` sm, md; icons | Not interactive; use Chip for options |
| `TrendBadge` | Percent change | `value`, `direction`, `goodWhen` (up default) | Green when the change goes the good way |
| `Chip` | Filter or tag pill | `selected` (sets aria-pressed), `size` xs, sm (default) | Controlled: toggle `selected` in `onClick` |
| `Avatar`, `AvatarStack` | People | `src`, `name` (initials fallback), `size` sm, md, lg; stack `people`, `max` | Pass `name` so the fallback is named |
| `Input` | Single-line text | `size`, `invalid`, `leadingIcon`, `trailingIcon`, `trailing` slot, `wrapperClassName` | Wrap in FormField for label, hint and error |
| `Textarea` | Multi-line text | `size`, `invalid`, `autoGrow`, `maxRows`, `rows` | |
| `Select` | One value from a list (Base UI) | `items` [{ value, label, disabled }], `value`, `onValueChange`, `placeholder`, `size`, `invalid` | Name it with `aria-label` or a Label |
| `Checkbox` | Boolean or multi-pick | `label`, `checked`, `onCheckedChange`, `indeterminate`, `invalid` | Without `label`, pass `aria-label` |
| `Radio`, `RadioGroup` | One of a few visible options | Group: `label`, `options`, `value`, `onValueChange`, `orientation`, `required`, `invalid` | Arrow keys move within the group |
| `Switch` | Settings that apply right away | `label`, `checked`, `onCheckedChange`, `invalid` | Use Checkbox when the change waits for Save |
| `Label` | A field label | `htmlFor`, `required` | FormField renders it for you |
| `Spinner` | Indeterminate wait | `size` sm, md, lg, `label`, `announce` | Inside a control, `announce={false}` |
| `Skeleton` | Loading placeholder | `shape` text (with `lines`), circle, rect | Hidden from assistive tech; pair with aria-busy |
| `Divider` | Separator | `orientation`, `label` ("or") | |
| `Tooltip` | Short hint on hover and focus | `content`, `side` (top default), `delay` | Never the only copy of important info; the trigger needs its own name |
| `ProgressBar` | Determinate progress | `value`, `max`, `label`, `hideLabel`, `showValue`, `tone`, `size` | Always give it a `label` |
| `Heading`, `Text`, `Eyebrow`, `Caption` | All text | `level`, `size`, `tone`, `as` | See section 4 |
| `Icon` | Standalone icon | `icon`, `size`, `label` | See section 5 |

### Patterns (`patterns/`)

| Component | When to use | Key props | Do / don't |
|---|---|---|---|
| `Card`, `CardLink`, `CardAction` | Any container card | `variant` feature (default), surface, panel, panel-pink, media; `padding` none, sm, md, lg; `rule` (pink left rule); `interactive` (hover lift); `media`; `as` | Clickable cards put one `CardLink` in the title; wrap other buttons in `CardAction`. Card takes no `to` |
| `StatCard` | A KPI | `icon`, `label`, `value`, `period`, `trend` { value, direction, goodWhen }, `loading`, `to` | One spoken summary; numeric values count up |
| `Tabs`, `TabList`, `Tab`, `TabPanel` | Switching views in place | `items` [{ value, label, content, icon }], `variant` underline or pill, `size` sm, md, `activateOnFocus` | Name the list with `aria-label` |
| `NumberedTabs` | Public "how it works" steps | `label`, `items` [{ num, title, tag }], `renderPanel`, `scaleStart`, `scaleEnd` | Autoplay pauses and never runs under reduced motion |
| `Accordion` | FAQs, collapsible groups | `items` [{ value, title, content }], `multiple`, `value`, `onValueChange` (always an array), `headingLevel` | |
| `Breadcrumbs` | Location in a hierarchy | `items` [{ label, to }] | The last item is the current page |
| `Pagination` | Paged lists | `page` (1-based), `pageCount`, `onPageChange`, `siblings` | Renders nothing for one page |
| `Table` and parts | Simple semantic tables | `density` comfortable or compact; `TableCaption` | Use DataTable for admin lists |
| `DataTable` | Admin and member lists | `columns`, `rows`, `caption` (required), `pagination`, `sort`, `loading`, `selectable`, `rowActions`, `rowHref` or `onRowClick`, `toolbar`, `mobileLayout` | Keep `columns` stable; stacks as cards below md |
| `FormField` | Label, control, hint and error together | `label`, `required`, `hint`, `error`, `layout` stacked or inline, `group` | One control child, or a render function |
| `SearchInput` | Search boxes | `onSearch` (debounced), `debounce` (300ms), `label` or `aria-label`, `size` | Escape clears it |
| `FilterBar` | Controls above a table or grid | `search`, `filters` (select, chips, custom; each with a `key`), `actions`, `onClear`, `active`, `size` md or sm | Apply `onClear(empty)` in one setState |
| `EmptyState` | Nothing to show | `icon`, `title`, `description`, `actions`, `headingLevel`, `size` sm or md | |
| `Alert`, `Banner` | Inline messages | `tone` info, success, warning, error; `title`, `description`, `actions`, `onDismiss` | Warning and error use `role="alert"`; Banner is always a status |
| `PageHeader` | Top of a page | `title` (always h1), `description`, `eyebrow`, `breadcrumbs`, `actions` | One per page |
| `SectionHeader` | Top of a section | `title`, `headingLevel`, `description`, `eyebrow`, `actions` | |
| `Dialog`, `DialogClose` | Modal tasks and confirms | `trigger` or `open`/`onOpenChange`, `title` (required), `description`, `footer`, `size` sm, md, lg, `dismissible` | Close from the footer with `DialogClose` around a Button |
| `Sheet`, `SheetClose` | Side drawers | Same as Dialog, plus `side` right or left, `size` sm 320, md 400, lg 560 | |
| `DropdownMenu` | A menu of actions | `trigger`, `items` [{ label, icon, onSelect, to, href, tone: 'danger', disabled }, { type: 'separator' }, { type: 'label' }], `side`, `align` | The trigger needs a name |
| `Popover` | Small non-modal panel | `trigger`, `title`, `side`, `align`, `popupClassName` (set the width) | |
| `Toaster`, `toast`, `useToast` | Short confirmations | Mount `<Toaster />` once; `toast.success/error/info/warning/promise` | Don't put the only copy of an action in a toast |
| `ChartCard`, `BarChart`, `LineChart` | One chart with a "View as table" toggle | Card: `title`, `data`, `xKey`, `series` [{ key, label, color 1 to 6 }], `valueFormatter`, `height` sm, md, lg, `tableView`; bare chart inside | Put the config on the card, not the chart |
| `MediaFrame` | Images in cards and heroes | `src`, `alt`, `ratio` 3/2 (default), 16/9, 4/3, 1/1, 4/5, `eager` | |
| `CheckList` | Benefit lists | `items`, `size` sm or md, `reveal` | |
| `Reveal` | Scroll-in motion | `variant` rise, fade, clip; `index` (stagger); `as` | See section 13 |
| `CountUp` | Animated numbers | `value` | Non-numeric values render as is |

### Organisms (`organisms/<domain>/`)

Organisms take data as props and never fetch.

| Component | Domain | When to use | Key props |
|---|---|---|---|
| `AppShell` | app-shell | The signed-in layout | `nav` (`MEMBER_NAV` or `ADMIN_NAV`), `navLabel`, `badges`, `title`, `breadcrumbs`, `actions`, `search`, `notifications`, `user`, `userMenuItems`, `onLogout` |
| `AppSidebar` | app-shell | The sidebar (AppShell renders it) | `nav`, `collapsed`, `badges`, `footer`, `onCollapsedChange` |
| `AppTopBar` | app-shell | The top bar (AppShell renders it) | `title`, `breadcrumbs`, `search`, `actions`, `notifications`, `user`, `onOpenNav` |
| `SidebarNavItem` | app-shell | One nav row | `item`, `activeTo`, `collapsed`, `badges` |
| `nav.js` | app-shell | Nav config | `MEMBER_NAV`, `ADMIN_NAV`, `findActiveItem`, `flattenNav`, `buildUserMenuItems` |
| `SiteHeader` | site | Public header | `links` (default `SITE_NAV_LINKS`) |
| `SiteFooter` | site | Public footer | `columns` (default `SITE_FOOTER_COLUMNS`) |
| `CTABand` | site | Closing call to action on public pages | `title`, `text`, `buttonLabel`, `buttonTo`, `wide` |
| `JobCard` | dashboard | A job in a list | `title`, `company`, `logoSrc`, `location`, `type`, `salary`, `status`, `postedLabel`, `to`, `saved`, `onSavedChange`, `onRemove` |
| `MemberCard` | dashboard | Member directory | `name`, `title`, `company`, `avatarSrc`, `tier`, `connection`, `onConnect`, `onAccept`, `messageTo`, `to` |
| `SessionCard` | dashboard | Live session or recording | `title`, `category`, `thumbnailSrc`, `kind` live or recording, `dateLabel`, `duration`, `views`, `speaker`, `to` |
| `VendorCard` | dashboard | Vendor directory | `name`, `logoSrc`, `description`, `rating`, `reviewCount`, `categories`, `location`, `to` |
| `ResourceCard` | dashboard | Guides and templates | `title`, `category`, `type`, `thumbnailSrc`, `author`, `readTime`, `to`, `saved` |
| `MessageThreadItem` | dashboard | Thread list row | `name`, `avatarSrc`, `preview`, `fromSelf`, `time`, `unreadCount`, `selected`, `onSelect` or `to` |
| `ConnectionRequest` | dashboard | Incoming request | `name`, `status` pending, accepted, declined, `onAccept`, `onDecline`, `accepting`, `declining`, `announce` |
| `ReviewCard` | dashboard | A review | `reviewerName`, `rating`, `text`, `subject`, `dateLabel`, `dateTime`, `clamp` |
| `RecommendationCard` | dashboard | A recommendation | `fromName`, `fromTitle`, `message`, `subject`, `dateLabel`, `dateTime` |
| `MetaList` | dashboard | Icon facts row | `items` [{ key, icon, label }] |
| `CompanyLogo` | dashboard | Company or vendor logo | `name`, `src`, `size` md or lg |
| `StarRating` | dashboard | Read-only or input rating | `value`, `onChange` (makes it an input), `label`, `size` |
| `StatusBadge` | admin | Any status string | `status`, `label`; `STATUS_BADGES`, `resolveStatus` |
| `AdminDataTable` | admin | Admin lists with search, filters, bulk and row actions | `search`, `filters`, `onClearFilters`, `toolbarActions`, `selectable`, `bulkActions`, `rowActions`, `error`, `onRetry`, `onActionError`, plus DataTable props |

Every dashboard card except `MetaList`, `CompanyLogo` and `StarRating` ships a `...Skeleton` (for example `JobCardSkeleton`). Cards are articles named by their title, take `headingLevel` (default 3) and fill their grid cell.

Dates: cards take preformatted text (`dateLabel`, `postedLabel` on JobCard, `time` on MessageThreadItem) plus an optional `dateTime` for the `<time>` element. Build them with `formatDate` and `toDateTime` from `lib/formatDate.js`.

## 11. Signature components

- **StatCard.** The KPI tile: a 40px tinted icon tile, the label, a big value that counts up, the period and a `TrendBadge`. Screen readers hear one summary. Use it in rows of three or four on dashboards.
- **NumberedTabs.** Vertical numbered steps with a progress scale and big outlined numerals (`text-outline-brand`). Autoplays every 6 seconds while visible, pauses on hover and focus, has a visible pause control and stops once someone picks a tab.
- **CTABand.** The tinted, patterned closing band on public pages: title, one line of text and one button, revealed on scroll. `wide` is the 880px services version (600px otherwise).
- **App sidebar with the gradient pill.** 48px rows, a 20px icon and the label; the active row is a pill filled with `--gradient-active` (blue to navy), white text and `shadow-card`, with `aria-current="page"`. Groups expand in place with a chevron. Pink stays the accent; the pill is navy so white text reads.
- **Feature card with the pink rule.** `<Card rule>` adds the 4px pink left rule, the brand signature from the live site.

## 12. Loading, empty and error states

**Loading**

- Lists and grids: set `aria-busy` on the list and render skeletons with `announce={false}`, so six placeholders aren't read six times. A single skeleton announces its `label`.
- `DataTable loading`: skeleton rows with no rows yet, dimmed old rows during a page change, and a "Loading {caption}" status.
- `StatCard loading`: skeleton layout with aria-busy.
- Buttons: `loading`, not a separate spinner.

**Empty**

- `EmptyState` with an icon, a title that says what's missing, a one or two sentence description and an action. `size="sm"` inside cards.
- DataTable shows "No results" by default; pass `emptyState` to say more.

**Error**

- Inline: `<Alert tone="error" title=... description=... actions=...>`.
- `AdminDataTable error` (true or a message) replaces the table with an error Alert when there are no rows, or shows it above the old rows; `onRetry` adds Try again.
- Confirm dialogs stay open with an error Alert if the action rejects.
- Form fields: `FormField error`, announced through a polite live region.
- Background failures: a toast (`toast.error`), never silent.

## 13. Motion

Durations (`--ds-duration-*`): instant 100ms, quick 150ms, standard 200ms, emphasized 300ms, slow 500ms, reveal 700ms. They aren't generated as Tailwind theme keys, so in class strings use the Tailwind step with the same value:

| Token | Value | Class |
|---|---|---|
| `--ds-duration-instant` | 100ms | `duration-100` |
| `--ds-duration-quick` | 150ms | `duration-150` |
| `--ds-duration-standard` | 200ms | `duration-200` |
| `--ds-duration-emphasized` | 300ms | `duration-300` |
| `--ds-duration-slow` | 500ms | `duration-500` |
| `--ds-duration-reveal` | 700ms | `duration-700` |

CSS in `styles/` uses the variables (`var(--ds-duration-reveal)`).

Easings: `ease-enter` (`cubic-bezier(0.16, 1, 0.3, 1)`, things arriving), `ease-exit` (`cubic-bezier(0.4, 0, 1, 1)`, things leaving), `ease-move` (`cubic-bezier(0.65, 0, 0.35, 1)`, things moving on screen).

What moves:

- **Reveal.** `<Reveal variant="rise" index={i}>`: content hidden from the first render until it scrolls into view, then rises 18px (700ms). `fade` is subtle; `clip` opens an image frame. `index` staggers 70ms per step, capped at 6 steps (420ms). The rules live in `styles/motion.css` under `[data-reveal]`.
- **`.ds-float`.** A 6-second, 6px float for decorative hero art (`.live-float` is an alias until the public site migrates).
- **`.ds-animate-fade-in`** for NumberedTabs panels, **`.ds-animate-pulse`** for the notifications bell when the count goes up.
- **Card lift** on `interactive` cards, button press (`active:translate-y-px`), overlays fading and scaling in.

Reduced motion:

- Every animation or transition that moves something gets `motion-reduce:` handling. `npm run lint:ds` warns on animation in a file without it.
- Under `prefers-reduced-motion`, Reveal becomes a short opacity fade (no transform, clip or filter), the float, fade-in and pulse stop, Dialog and Sheet only fade, charts don't animate and NumberedTabs never autoplays.
- JS that depends on the preference reads `useReducedMotion()` from `hooks/`.

## 14. Accessibility

- **Pink contrast (owner decision, 2026-10-31).** Brand pink stays `#F26D92` even though white on pink is 2.85:1, below WCAG AA 4.5:1 for small text. So: never put essential small text in pink alone. Small brand text uses `text-brand-strong` (5.74:1). Pink `text-brand` is for large or decorative text only. Revisit if accessibility becomes a launch requirement.
- **Navy focus ring.** A global 2px navy `:focus-visible` outline in `src/index.css` (3px offset on buttons and links, 2px on fields) stays visible on light and pink surfaces. Don't add `outline-none`. Cards draw the ring when their CardLink has focus.
- **44px targets.** md controls are 48px. Checkbox, Radio and Switch rows grow to 44px through their label. Chips are 40px with an `after:` hit area. Star inputs are 44px each. Pagination targets are 48px.
- **Reduced motion.** See section 13.
- **Tooltips through aria-describedby.** Tooltip content is always mounted in a hidden element the trigger points at with `aria-describedby`; the visual popup is `aria-hidden`, so the hint is read once. The trigger still needs its own name (dev warning without one).
- **Stretched links.** A clickable card has exactly one link, the `CardLink` in its title, named by the title. Its overlay covers the card. Other buttons sit in `CardAction` above it. Tradeoff: text in a clickable card can't be selected with the mouse.
- **Status roles.** Alert uses `status` for info and success and `alert` for warning and error, with an icon per tone so color is never the only cue.
- **Overlays.** Dialog and Sheet trap focus, lock scroll, make the page inert and return focus on close. Toasts during a modal can't be reached by keyboard, so never put the only copy of an action in one.
- **Names.** IconButton, Select, SearchInput and DropdownMenu triggers need a name. Required fields say "(required)" to screen readers.

## 15. Responsive

- Check every page at 1440, 1024, 768 and 390px. The e2e smoke test does this for the main pages and fails on horizontal overflow, including overflow the layout clips (mark an intentional overhang with `data-overflow-ok`).
- App shell: full sidebar at 1280px, rail from 1024 to 1279px, Sheet below 1024px (section 7).
- `DataTable` stacks rows as labelled cards below md (768px) with a "Sort by" select; columns with `hideBelow: 'md'` or `'lg'` drop out first. `mobileLayout="scroll"` keeps the table and scrolls it sideways.
- `FilterBar` wraps onto more lines; `PageHeader` actions wrap under the title.
- `AppTopBar` search moves into a popover below 768px.
- Public site: gutters and section rhythm step down at 992 and 768px; the header menu takes over below 1200px.
- In tests, `mockViewport(375)` from `test/browserMocks.js` renders the small layout.

## 16. Do's and don'ts

| Do | Don't |
|---|---|
| Use role token classes: `bg-surface-raised`, `text-text-secondary`, `p-ds-lg` | Write hex, `rgb(`, or arbitrary sizes like `p-[13px]` |
| Use the Heading, Text, Eyebrow and Caption primitives | Style text with raw size and color classes on a page |
| Compose pages from organisms and patterns | Rebuild a card, table or dialog inline |
| Pass lucide components to `leadingIcon` and `icon` | Pass `<Plus />` elements |
| Use `Button loading` for pending actions | Disable a button and add your own spinner |
| Give every clickable card one `CardLink` | Wrap a whole card in a link or a button |
| Use `text-brand-strong` for small brand text | Put essential small text in pink |
| Keep the navy focus ring | Add `outline-none` |
| Use `z-(--ds-z-*)` | Write `z-50` or `z-[999]` |
| Pass preformatted dates from `formatDate` | Format dates inside cards |
| Add `motion-reduce:` to anything that moves | Ship a loop that ignores reduced motion |
| Override a lint finding with `// ds-allow <rule>: <reason>` when you must | Use `style={{ }}` for anything but `backgroundImage`, `--custom` properties and `var()` values |
| Write plain American English with hyphens | Use em or en dashes |

## 17. Atomic taxonomy and import rules

```
src/design-system/
  tokens/       tokens.json (source), tokens.css, tokens.js (generated), drift and z-order tests
  primitives/   single controls and text           (barrel: primitives/index.js)
  patterns/     compositions of primitives          (barrel: patterns/index.js)
  organisms/    <domain>/<Component>/ for admin, app-shell, dashboard, site
                (one barrel per domain, plus organisms/index.js)
  hooks/        useReducedMotion, useInView, useMediaQuery, useControllableState
  lib/          cn, controlSizes, iconSizes, linkProps, formatDate, field, mergeRefs, ...
  styles/       motion.css (imported once from src/index.css)
  docs/         Storybook Foundations pages
```

Rules, checked by tools:

- **Layering** (`ds-layering` in `npm run lint:ds`, error): primitives never import patterns or organisms; patterns never import organisms. The barrel tests also check that patterns don't import organisms and that organisms never import app `components/`, `context/` or `pages/`.
- **Retired folders** (`no-retired-imports`): the design system never imports `components/ui/` or `components/live/` (error inside `src/design-system/`, a warning elsewhere until Phase 8).
- **Barrels:** each tier barrel has a test that fails when a component folder's exports are missing from it.
- **Stories:** `npm run check:stories` fails when a component folder (each folder in `primitives/` and `patterns/`, each component folder in `organisms/<domain>/`) has no `*.stories.jsx`, or when an organism component file sits loose in a domain folder.
- **Pages** compose organisms and patterns. `pages-use-system` warns on a page with more than 3 className strings over 120 characters.

Inside the design system, files import each other with relative paths (`../../primitives`). Pages import through `@/design-system/<tier>`.

## 18. Known gaps

- **Dark theme.** Not built. Adding `role.dark` to `tokens.json` emits a `[data-theme="dark"]` block; the Storybook theme toolbar's dark option is a placeholder that falls back to light until then.
- **Webflow CDN assets.** Fixel Text, the Mavuus wordmark and the public site images still load from the live Webflow CDN. They must move into the repo before launch, pending the founders' OK.
- **Pages not migrated.** Phase 8 moves the dashboard, admin, auth and public pages onto the system. Until then legacy pages keep their own styling and `components/ui/` and `components/live/` still exist. The app shell isn't wired in yet and `<Toaster />` isn't mounted in the app.
- **Legacy lint baseline.** `scripts/lint-design-system.baseline.json` holds 651 legacy errors in 97 files outside the design system (477 `no-arbitrary-size`, 75 `no-raw-color`, 72 `no-em-dash`, 27 `no-inline-style`). A run fails when a count goes up or a new file has errors; when counts drop, run `npm run lint:ds -- --update-baseline`. `src/design-system/` has no baseline.
- **Legacy bugs logged for Phase 8:** the closed notifications drawer in `DashboardLayout.jsx` is likely still focusable, and the weekly signups bars on `AdminDashboardPage` render empty.

## 19. Agent prompt guide

### Quick token reference

```
Surfaces  bg-surface-page | -raised | -sunken | -overlay | -inverse | -brand | -brand-strong | -hover | -selected
Text      text-text-primary | -secondary | -muted | -faint | -on-brand | -link | -brand (large only) | -brand-strong | -disabled
Borders   border-border-default | -subtle | -strong | -focus | -brand | -brand-subtle | -divider
Status    bg-status-{success,warning,error,info}[-subtle], text-status-*, status-rating
Space     p-ds-* m-ds-* gap-ds-*: none 0, xxs 4, xs 8, sm 12, md 16, lg 24, xl 32, xxl 48, xxxl 64, section 96
Radius    rounded-tag 4 | -input 8 | -control 12 | -card 16 | -sheet 24 | -panel 32 | -chip pill
Type      text-caption 13 | -body-sm 14 | -body 16 | -lead 20 | -h4 18 | -h3 22 | -h2 36 | -h1 40 | -display 48
Shadow    shadow-card | -card-hover | -float | -overlay | -button-brand | -button-secondary
Motion    duration-100 | -150 | -200 | -300 | -500 | -700 (match --ds-duration-*), ease-enter | ease-exit | ease-move, Reveal, .ds-float
Layers    z-(--ds-z-overlay 300 | -modal 400 | -dropdown 500 | -popover 550 | -tooltip 600 | -toast 700)
Breaks    md 768, lg 1024, xl 1280 (Tailwind); site-sm 480, site-md 992, site-lg 1200 (tokens)
```

Verify commands (run in `mavuus-app/client`):

```bash
npm run guard                  # lint:ds + check:stories
npx vitest run                 # unit tests, including the token drift test
npx eslint . --max-warnings 0
npm run build-storybook
npx vite build
npm run e2e                    # Playwright smoke; required for page changes
```

### Prompt: Generate an admin list page

```
Build the admin list page for <entity> at /admin/<path>. Read DESIGN.md sections 10, 12 and 19
and mavuus-app/client/src/design-system/README.md first.

- Fetch in the page (useApiData or the existing fetch pattern); organisms never fetch.
- Layout: PageHeader (from @/design-system/patterns) with `title`, `description` and `actions`
  (a Button with `leadingIcon={Plus}` for "New <entity>" if creation exists).
- List: AdminDataTable (from @/design-system/organisms) with
  - `caption` naming the table, `columns` as a module constant (`key`, `header` text, `cell`,
    `sortable`, `align`, `hideBelow: 'md'` for secondary columns),
  - a `status` column rendering `<StatusBadge status={row.status} />`,
  - `search={{ label: 'Search <entities>', onSearch }}`,
  - `filters` (type 'select' or 'chips', each with a `key`) and
    `onClearFilters={(empty) => setFilters((f) => ({ ...f, ...empty }))}`,
  - `pagination={{ pageSize: 20, page, onPageChange, manual: true, rowCount }}` when the API pages,
  - `rowActions` with `destructive: true` (and a `confirm` object) for delete,
  - `bulkActions` if the API supports them, `onActionError` showing `toast.error`,
  - `loading`, `error` and `onRetry` wired to the fetch state.
- Dates: format with formatDate from @/design-system/lib/formatDate.
- Token classes only, no hex or arbitrary px, no em dashes.
Verify: npm run guard, npx vitest run, npx eslint . --max-warnings 0, npx vite build, npm run e2e
(add the page to e2e/smoke.spec.js if it isn't covered). Check 1440, 1024, 768 and 390px.
```

### Prompt: Generate a member detail page

```
Build the member detail page for <entity> at /dashboard/<path>/:id. Read DESIGN.md sections 7, 10
and 12 first.

- PageHeader with `breadcrumbs={[{ label: '<List>', to: '/dashboard/<path>' }, { label: name }]}`,
  `title`, `description` and `actions` (Button primary for the main action, outline for the rest).
- Body: a grid (`grid gap-ds-lg lg:grid-cols-3`). Main column: Card variant="surface" sections, each
  starting with SectionHeader (`headingLevel={2}`) and Text for prose; MetaList for icon facts.
  Side column: Card with Avatar or CompanyLogo, Badge or StatusBadge, and the contact actions.
- Related items: the matching dashboard organism in a grid (JobCard, SessionCard, VendorCard,
  ReviewCard, RecommendationCard) with `headingLevel={3}` and preformatted `dateLabel` from
  formatDate. Show `<Name>Skeleton announce={false}` items while loading, with aria-busy on the list.
- States: a Skeleton layout while loading, EmptyState for "not found" with a Button back to the
  list, Alert tone="error" with a Try again action on a failed fetch.
- Tabs (variant="underline") only if the page has more than one view.
Verify: npm run guard, npx vitest run, npx eslint . --max-warnings 0, npx vite build, npm run e2e.
Check 1440, 1024, 768 and 390px with no horizontal overflow.
```

### Prompt: Add a KPI row

```
Add a KPI row to <page>. Read DESIGN.md sections 10 and 11 (StatCard).

- Grid: `grid gap-ds-lg sm:grid-cols-2 xl:grid-cols-4`.
- One StatCard (from @/design-system/patterns) per metric: `icon` (a lucide component),
  `label`, `value` (a number or numeric string so it counts up), `period` ("Last 30 days") and
  `trend={{ value: <percent change>, goodWhen: 'up' }}` (use goodWhen 'down' for metrics where
  lower is better). Add `to` when a card should open the detailed view.
- While the data loads, render the same cards with `loading`.
- Don't style values by hand; StatCard owns the layout and the spoken summary.
Verify: npm run guard, npx vitest run, npx eslint . --max-warnings 0, npx vite build, npm run e2e.
```

### Prompt: Add a form in a dialog

```
Add a "<action>" form in a dialog to <page>. Read DESIGN.md sections 10, 12 and 14.

- Dialog (from @/design-system/patterns) with `trigger={<Button leadingIcon={Plus}>Label</Button>}`
  (or controlled `open` / `onOpenChange`), `title`, `description`, `size="md"`.
- Body: a <form id="<form-id>" onSubmit> with one FormField per control (`label`, `required`,
  `hint`, `error` from validation). Controls: Input, Textarea, Select (`items`), RadioGroup (in a
  FormField with `group`), Checkbox or Switch (FormField `layout="inline"`).
- `footer`: <DialogClose><Button variant="ghost">Cancel</Button></DialogClose> and
  <Button type="submit" form="<form-id>" loading={saving}>Save</Button>.
- On a server error, show <Alert tone="error"> at the top of the body and keep the dialog open.
  On success, close it and confirm with toast.success (Toaster must be mounted once).
- Copy: the submit label says what it does ("Save vendor"); no em dashes.
Verify: npm run guard, npx vitest run, npx eslint . --max-warnings 0, npx vite build, npm run e2e.
Check keyboard: Tab order, Escape closes, focus returns to the trigger.
```
