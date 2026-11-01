# Public site audit - 2026-10-31

Audit of the public website right after the 1:1 rebuild of live mavuus.com (PR #3). Two independent reviews: a design critique (Impeccable, design-director view) and a technical audit (Impeccable detector, browser overlay, Playwright checks at 1440, 1024, 768 and 390px). This file is the record; the work it drives is in [../PUBLIC-DESIGN-SYSTEM.md](../PUBLIC-DESIGN-SYSTEM.md).

## Scores

Design (Nielsen, 7 and 10 not applicable to a marketing site): **20/32, Acceptable**

| # | Heuristic | Score | Key issue |
|---|---|---|---|
| 1 | Visibility of system status | 3 | Tabs auto-advance with no visible timer or pause |
| 2 | Match system / real world | 3 | "↗" on Services cards implies a link that doesn't exist |
| 3 | User control and freedom | 2 | WaysToWork switches tab on mouse pass-over and kills autoplay |
| 4 | Consistency and standards | 1 | 11 card treatments, 3 outline buttons, 8 image radii, 3 pinks |
| 5 | Error prevention | 3 | Contact form has no required markers |
| 6 | Recognition rather than recall | 3 | Breadcrumbs and category sidebars work |
| 7 | Flexibility and efficiency | n/a | No expert workflows |
| 8 | Aesthetic and minimalist design | 2 | Doubled section padding (320px gaps); washed-out Services cards |
| 9 | Error recovery | 3 | Not-found states exist |
| 10 | Help and documentation | n/a | FAQ is content |

Technical: **10/20, Acceptable**

| Dimension | Score | Key finding |
|---|---|---|
| Accessibility | 2 | Brand pink fails as text (2.75:1) and as white-text button fill (2.85:1); auto tabs ignore reduced motion; hidden content focusable |
| Performance | 2 | 5.6 MB of images on home, 6.9 MB on resources; all 50 Insights slides rendered with 50 backdrop blurs |
| Theming | 1 | 101 hard-coded hex values and 731 arbitrary values; second pink #f06f9a; three grey systems |
| Responsive | 3 | No horizontal overflow at any width; header and hero CTAs wrap at 1024; small tap targets |
| Implementation integrity | 2 | Near-duplicate tabs, buttons, eyebrows, sliders, video cards |

## Verdict

The rebuild matches live, including live's weaknesses. It reads as two sites stitched together: Home and Services are a modern layer (lifted cards, shadows, pink accent rule), while About, Membership, FAQ, Contact and Resources are flat older pages (square photos, centered blocks, huge empty bands). Most sections have no entrance motion.

Strengths: the home stat card (white, 16px radius, pink left rule, soft lift) is the right seed for a card system; typography (Fixel Text, 400-500 headings, bold-blue highlight words) is consistent; Services has a real persuasion arc ending on the ~$2.1M proof.

## Priority issues

- **[P0] Logo row** (`components/live/home/CompanyLogos.jsx`, `data/live/home.js`). Every logo forced to 32px tall, so widths run 33-180px. Salesforce, Constellation Software, the Arizona Cardinals bird and Pizza Pizza become unreadable grey blobs. `grayscale opacity-80` over differently colored sources gives mismatched greys. Sources are 53-65px PNGs (soft on retina). Squashed horizontally at 768 (flex shrink with fixed height). Orphan logo and left-aligned cells at 390.
- **[P0] Services "From Strategy to Execution" cards** (`services/HowWeHelp.jsx`) rest at opacity 0.62 and dim further when a sibling is hovered: body text 2.1-3.0:1, the core offering looks disabled. The "↗" goes nowhere.
- **[P1] Brand pink contrast.** White on #F26D92 is 2.85:1 and #F26D92 text is 2.75:1. Decision: keep the pink as is (owner's call, 2026-10-31). The focus ring moves off pink to navy so focus stays visible (WCAG 1.4.11).
- **[P1] No system.** Eleven card treatments, three outline buttons, four eyebrow copies, heading sizes from 21.6 to 49.6px with no scale (article h1 28px under a 43px h2), nested section padding of 160-176px.
- **[P1] Motion.** No entrance reveals anywhere; floats, auto-advancing tabs and the page transition ignore `prefers-reduced-motion`; tabs have no pause (WCAG 2.2.2).
- **[P1] Tablet.** At 1024 the nav "Contact Us" and "Sign Up" and the hero buttons wrap to two lines. At 768 a Services card is orphaned, the featured article is cramped, the single event card sits half width, the founders photo drops ~900px down.

## Technical findings

- Images: blog thumbnails up to 1.5 MB PNG shown at 405px; 10 leader PNGs 240-401 KB loaded eagerly; 90 of 92 home images without width/height (CLS measured 0 thanks to aspect classes).
- Insights slider renders all 50 videos; 94 of 100 links are off-screen but focusable, and tabbing into them breaks the slider.
- Mobile menu: no Escape, no outside click, no `aria-controls`.
- Collapsed FAQ answers and the collapsed mobile category list stay focusable.
- Tabs: no arrow keys, every tab in the tab order, no `aria-controls`.
- Focus ring is pink (2.75:1) and an unlayered rule forces `border-radius: 6px` on focused buttons.
- Manrope is @imported from Google Fonts on every page but unused on the public site (render-blocking).
- Heading levels skip (h2 to h6 in ForMarketers, h1 to h3 on legal and FAQ pages, h4 footer headings).
- Tap targets 19-37px (footer, post share icons and author links, sidebar links). Text 9.6-12px on mobile ("+1000", Network labels, contact labels).
- `postBodies` chunk (530 KB) loads all 35 article bodies to show one.
- Detector CLI: one finding (`side-tab` on the PostPage blockquote rule), a false positive.

## Content conflicts (fixed with best guesses, see MEMORY.md)

- Member counts: hero "1700+ Members, 1100+ Marketing Leaders", avatar badge "+1000", Network "1,100+", Membership "hundreds of other marketing leaders".
- Membership page title promises a free 30-day trial; the page never says so.
- Resources shows the same 9 titles as both Articles and On Demand Videos with nothing to tell them apart.

## After the design-system pass (PR #4), same day

Re-scored by the lead after fixes; confirm with a fresh `/impeccable critique` run.

| | Before | After | Evidence |
|---|---|---|---|
| Design (Nielsen, /32) | 20 | 24 | One card, button, type, spacing and motion system on every page; tabs pause and no longer switch on hover; Services cards readable |
| Technical (/20) | 10 | 16 | a11y 3 (brand pink kept by owner, so pink contrast is the one known gap), performance 3, theming 3, responsive 4, integrity 3 |
| Detector findings | 1 (+ overlay warnings) | 0 | Brand card rule and article blockquote recorded as intentional exceptions |
| Horizontal overflow at 1440/1024/768/390 | none | none | capture of all 11 public routes |
| Standalone tap targets under 32px | ~60 | 0 | 7 remaining are links inside running text (exempt under WCAG 2.5.8) |
| /resources image bytes at 1440 | 7.1 MB | 0.8 MB | Webflow size variants via srcset |
| Article bodies chunk | 530 KB, all posts | per post | `import.meta.glob` |
| Reveal blocks that stay hidden | n/a | 0 of 161 | checked with and without reduced motion |
| Tabs under reduced motion | kept rotating | stay put | Playwright with `reducedMotion: reduce` |
| Mobile menu | no Escape, no outside click | both, focus managed | Playwright |

Still open: brand pink contrast (owner decision), images and fonts served from the live Webflow CDN, the Contact photos are cropped from one live PNG, and the "Where we come in" photo has a non-interactive arrow baked into the image.
