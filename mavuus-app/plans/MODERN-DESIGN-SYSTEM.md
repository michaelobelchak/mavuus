# Modern Design System Reference

> This is the reference document for PROMPT-MODERN-DESIGN.md. It explains the design philosophy and approach.

---

## Design Philosophy

The goal is to make Mavuus feel like a premium product - not a template, not a bootstrap site, not a homework project. Think Linear, Raycast, Vercel, Notion. These products share common traits: generous white space, subtle depth through shadows and blur, fast micro-interactions, and restrained use of color.

Every visual choice should serve one of three purposes: make content easier to read, make interactions feel responsive, or build trust with the user.

---

## Key Design Trends Applied (2026)

### Glassmorphism
Frosted glass effect using `backdrop-filter: blur()` with semi-transparent backgrounds. Creates depth without heavy shadows. Works well for: sidebars, modals, floating toolbars, pricing cards, toast notifications. Keep it subtle - the glass should enhance, not distract.

### Bento Grid Layouts
Modular card layouts with asymmetric sizing - inspired by Japanese bento boxes. 67% of top SaaS sites now use this pattern for dashboards. Uniform gaps (16-24px), consistent corner radii, and subtle background tints differentiate card types. Good for the dashboard home page where we show sessions, resources, and members in a grid.

### Generous White Space
More space between elements, not less. Padding inside cards: 24-32px. Gap between cards: 24px. Section spacing: 80px. White space signals quality. Crowded layouts signal cheap.

### Micro-Interactions
Small animations that respond to user actions - hover, click, scroll, focus. In 2026 these aren't decorative, they're functional. A button that lifts on hover tells you it's clickable. A card that scales on click tells you it registered your tap. Keep them under 300ms.

### Scroll-Based Animation
Elements fade/slide in as users scroll down the page. Creates a storytelling flow. Use Intersection Observer or motion's `whileInView`. Trigger once (don't re-animate on scroll up). Stagger children so they animate in sequence, not all at once.

### Product-First Hero Sections
Modern SaaS landing pages show the product early. Instead of abstract illustrations, show a dashboard preview or embedded demo. For Mavuus, the hero could show a glimpse of the community dashboard with a glass overlay.

### Trust Signals
Enterprise buyers look for credibility before features. Company logos, member count, testimonial quotes, and badges (SOC2, GDPR) answer "can I trust this?" before it's asked. Mavuus should prominently display company logos and member stats.

---

## Color Strategy

**Primary action:** Brand Pink (#F26D92) - all CTAs, primary buttons, active states, links
**Secondary/Navigation:** Brand Blue (#1F648D) - sidebar, headings, informational elements
**Backgrounds:** Warm grays (stone palette) not cold grays - feels friendlier
**Glass surfaces:** White at 60-80% opacity with blur
**Text:** Gray-900 for headings, Gray-600 for body, Gray-400 for secondary
**Borders:** Gray-200 at 50% opacity for subtle dividers
**Success:** Emerald-500 | **Error:** Rose-500 | **Warning:** Amber-500 | **Info:** Brand-Blue

---

## Animation Principles

1. **Fast by default.** 150ms for hover states, 250ms for transitions, 400ms max for page elements.
2. **Ease-out for entering.** Elements decelerate as they arrive. Feels natural.
3. **Spring for playful moments.** Heart animations, success celebrations, toggle switches.
4. **Stagger for groups.** When multiple items animate, delay each by 50-100ms. Creates a wave effect.
5. **Once is enough.** Scroll animations trigger once. Don't replay on scroll up.
6. **No jank.** Only animate `transform` and `opacity`. Never animate `width`, `height`, or `top/left` - they cause layout thrashing.

---

## Typography Scale

All text uses Manrope font family.

| Element | Size | Weight | Color |
|---------|------|--------|-------|
| Page title (h1) | 3rem (48px) | 800 | gray-900 |
| Section heading (h2) | 2rem (32px) | 700 | gray-900 |
| Card heading (h3) | 1.25rem (20px) | 600 | gray-800 |
| Body text | 1rem (16px) | 400 | gray-600 |
| Small/meta text | 0.875rem (14px) | 400 | gray-400 |
| Button text | 0.875rem (14px) | 600 | white (on pink) |
| Nav links | 0.875rem (14px) | 500 | gray-600, brand-pink on hover |
| Badge text | 0.75rem (12px) | 600 | varies |

---

## Component Patterns

### Cards
- Background: white
- Border: 1px solid gray-200 (or border-transparent, shadow only)
- Border radius: 16px (rounded-xl)
- Padding: 24px
- Shadow: shadow-sm default, shadow-md on hover
- Transition: all 250ms ease-out
- Hover: translateY(-4px)

### Buttons
- Primary: bg-brand-pink, text-white, rounded-lg, px-6 py-2.5
- Secondary: bg-white, border border-gray-200, text-gray-700, rounded-lg
- Ghost: bg-transparent, text-gray-600, rounded-lg (hover: bg-gray-100)
- All: font-semibold text-sm, transition-all duration-150
- Hover: scale(1.02), shadow increase
- Active: scale(0.98)
- Disabled: opacity-50, cursor-not-allowed

### Inputs
- Border: 1px solid gray-300
- Border radius: 12px (rounded-xl)
- Padding: px-4 py-3
- Focus: ring-2 ring-brand-pink/30, border-brand-pink
- Placeholder: gray-400
- Background: white (or gray-50 for search inputs)

### Badges/Pills
- Rounded-full
- Small padding: px-3 py-1
- Font: text-xs font-semibold
- Variants: pink bg/text, blue bg/text, gray bg/text, green bg/text

### Modals
- Backdrop: bg-black/40 backdrop-blur-sm
- Card: white bg, rounded-2xl, shadow-xl, p-8
- Enter: scale 0.95 to 1.0 + opacity 0 to 1
- Exit: scale 1.0 to 0.95 + opacity 1 to 0
- Close button: top-right, gray-400, hover gray-600

---

## What "World-Class" Looks Like

A few reference points for the visual bar we're aiming for:

- **Linear** (linear.app) - Clean, dark sidebar, smooth animations, glass effects on modals
- **Raycast** (raycast.com) - Gorgeous glass cards, gradient text, buttery scroll animations
- **Vercel** (vercel.com) - Extreme white space, crisp typography, subtle hover states
- **Notion** (notion.so) - Warm grays, friendly feel, smooth page transitions
- **Stripe** (stripe.com) - Gradient mesh backgrounds, animated code blocks, polished interactions

Mavuus should land somewhere between Notion (warmth, community feel) and Linear (polish, professional, modern).
