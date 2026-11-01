# Public site design system and polish

**Status:** DONE 2026-10-31 (branch `feat/public-design-system`, PR #4). Results at the end of the audit file.
**Source:** [audits/2026-10-31-public-site-audit.md](audits/2026-10-31-public-site-audit.md)
**Owner decisions (2026-10-31):** improve on live rather than copy it; keep brand pink #F26D92 exactly as is; do the whole plan in one round; fix content conflicts with best guesses and log them in MEMORY.md.

## Goal

One visual system across every public page, so a card, button, label, heading, section and animation look and behave the same wherever they appear. Keep the content, brand colors, Fixel Text font and page structure from live.

## The system

### Cards (16px radius)
| Variant | Look | Used for |
|---|---|---|
| `feature` | White, 1px black/6 hairline, optional 4px pink left rule, shadow `0 12px 32px rgba(17,24,39,.06)`; hover lifts 4px with a pink-tinted shadow, 300ms | Stats, Network, Services offering cards, CTA strip, proof box |
| `surface` | White, 1px `#dbe0e7`, shadow on hover only | FAQ category cards, video sign-up box, sidebars, Contact form |
| `media` | Image 16px radius, 3:2, zoom 1.04 on hover (500ms), one shared sign-up overlay (fade) | Articles, videos, events, Insights |
| `panel` | 24px radius, tinted blue-light or pink-50, 56/32 padding | Membership, CTA band |

### Buttons
`primary` pink, `blue` (header Sign Up and forms), `outline` (dark border, pink on hover). Sizes `md` (16x32) and `sm` (10x20). One component: `LiveButton`.

### Type
- Eyebrow: one component, pink, uppercase, 12px gap to the heading.
- Label: one small grey caption style.
- Headings: display h1 48/40/32, page h1 (Read pages) 40/32/28, section h2 36/30/28, card h3 22, h4 18. The `.live-site h2` default matches the section h2.

### Space and shape
- Section padding 96 / 72 / 56 (desktop / tablet / mobile), never nested.
- Images 16px radius; hero images 24px; 0 only when full-bleed.
- One check icon for every list; icons from lucide-react.

### Motion
- Reveal on scroll: fade + 16px rise, 600ms `cubic-bezier(.2,.8,.2,1)`, once, 70ms stagger for grid children.
- Hover lift 4px / 300ms; media zoom 1.04 / 500ms.
- Count-up for stat numbers, once.
- Leaders marquee pauses on hover/focus.
- Floats at most 6px.
- `prefers-reduced-motion: reduce`: reveals show instantly, floats/marquee/autoplay stop, count-ups show the final value, page transition is instant.
- Auto-advancing tabs pause on hover and focus and have a visible pause control.

## Work list

1. **System** (`components/live/`, `index.css`): tokens, Card, LiveButton variants, Eyebrow, Label, heading classes, Section, Reveal, CountUp, CheckList, NumberedTabs (replaces ServiceTabs + WaysToWork logic), MediaCard; navy focus ring without the radius override; reduced-motion for PageTransition and smooth scroll; header collapses to the menu below 1200px; mobile menu closes on Escape and outside click.
2. **Home**: logo row rebuilt (normalized boxes, single grey, color on hover, centered grid), stats count up, every section reveals, tablet layout fixes, member counts unified.
3. **Services**: HowWeHelp cards solid at rest, no dead arrow, no orphan at 768; WaysToWork on NumberedTabs.
4. **Membership, About, Contact**: Membership uses the panel and adds the free-trial line and member count; About and Contact images get the system radius; Contact form on the surface card with required markers.
5. **Resources, Post, Video, FAQ, Legal**: media cards, distinct article vs video cards, heading scale on Read pages, featured post stacks below 992px, focusable-hidden fixes in sidebars and accordions, larger tap targets.
6. **Performance**: smaller image variants and lazy leader photos, slider renders only nearby slides, article bodies split per post, Manrope not loaded on the public site.
7. **QA**: every page at 1440/1024/768/390, detector re-run, critique re-run, MEMORY.md and CHANGELOG updated.
