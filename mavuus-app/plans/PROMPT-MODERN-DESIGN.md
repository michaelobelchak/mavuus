# Claude Code Prompt: Modern Design System Upgrade

> Copy this entire file and paste it into Claude Code as your prompt.
> Run this AFTER FIX-EVERYTHING and FIGMA-REBUILD are done.

---

You're working on the Mavuus app - a B2B marketing community platform built with React 19 + Vite + Tailwind CSS v4. The app is functional and matches Figma layouts. Now you're upgrading the visual layer to feel premium, modern, and world-class for a client presentation.

Read `plans/MODERN-DESIGN-SYSTEM.md` for the full design reference, then apply everything below.

## What you're building

A modern design system layer on top of the existing app. Think: Linear, Raycast, Vercel, Stripe - clean, spacious, alive. Not flashy for the sake of flashy. Every effect should feel intentional and make the UI easier to use.

## Step 1: Install Motion library

```bash
cd client
npm install motion
```

Motion (formerly Framer Motion) handles all animations. Import as needed:
```jsx
import { motion, AnimatePresence } from "motion/react"
```

## Step 2: Global design tokens

Update the Tailwind config and global CSS to add these tokens. Don't remove existing ones - layer on top.

```css
/* Add to index.css or a new design-system.css imported in main.jsx */

@import url('https://fonts.googleapis.com/css2?family=Manrope:wght@300;400;500;600;700;800&display=swap');

:root {
  /* Brand colors (keep existing) */
  --brand-pink: #F26D92;
  --brand-pink-light: #F9A8BF;
  --brand-pink-dark: #D94D75;
  --brand-blue: #1F648D;
  --brand-blue-light: #2A85B8;
  --brand-blue-dark: #164A6A;

  /* Neutral palette - warm grays, not cold */
  --gray-50: #FAFAF9;
  --gray-100: #F5F5F4;
  --gray-200: #E7E5E4;
  --gray-300: #D6D3D1;
  --gray-400: #A8A29E;
  --gray-500: #78716C;
  --gray-600: #57534E;
  --gray-700: #44403C;
  --gray-800: #292524;
  --gray-900: #1C1917;

  /* Glass effect tokens */
  --glass-bg: rgba(255, 255, 255, 0.6);
  --glass-bg-heavy: rgba(255, 255, 255, 0.8);
  --glass-border: rgba(255, 255, 255, 0.3);
  --glass-shadow: 0 8px 32px rgba(0, 0, 0, 0.06);
  --glass-blur: 16px;

  /* Spacing scale - generous white space */
  --section-gap: 5rem;     /* between major page sections */
  --card-gap: 1.5rem;      /* between cards in grids */
  --content-padding: 2rem; /* inside cards and containers */

  /* Border radius - consistently rounded */
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 24px;
  --radius-full: 9999px;

  /* Shadows - layered for depth */
  --shadow-xs: 0 1px 2px rgba(0, 0, 0, 0.04);
  --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.06);
  --shadow-md: 0 4px 16px rgba(0, 0, 0, 0.08);
  --shadow-lg: 0 8px 32px rgba(0, 0, 0, 0.1);
  --shadow-xl: 0 16px 48px rgba(0, 0, 0, 0.12);
  --shadow-glow-pink: 0 0 24px rgba(242, 109, 146, 0.25);
  --shadow-glow-blue: 0 0 24px rgba(31, 100, 141, 0.2);

  /* Transitions */
  --transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-base: 250ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-slow: 400ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-spring: 500ms cubic-bezier(0.34, 1.56, 0.64, 1);
}
```

## Step 3: Build new utility components

Create these in `client/src/components/ui/`. Each one is a building block used across the app.

### 3.1 GlassCard.jsx
A card with frosted glass effect. Use for pricing cards, feature cards, stat cards, modal overlays.

```jsx
// Semi-transparent background + backdrop blur + subtle border
// Props: children, className, hover (boolean - adds lift on hover)
// On hover: translateY(-2px), shadow increases, border brightens
// Use backdrop-blur-md or backdrop-blur-lg
// Background: bg-white/60 (light) with border border-white/30
// Rounded: rounded-xl (16px)
```

### 3.2 GradientText.jsx
Gradient text for headlines. Use brand-pink to brand-blue gradient.

```jsx
// Props: children, className, from (default: brand-pink), to (default: brand-blue)
// Uses bg-gradient-to-r + bg-clip-text + text-transparent
// Renders as <span> so it can go inside headings
```

### 3.3 AnimatedCounter.jsx
Numbers that count up when they scroll into view. Use for stats sections.

```jsx
// Props: end (target number), duration (ms), prefix (like "$"), suffix (like "+")
// Uses Intersection Observer to trigger
// Animates from 0 to end value using requestAnimationFrame
// Formats numbers with commas (1,000+)
```

### 3.4 ScrollReveal.jsx
Wrapper that fades/slides children in when they enter the viewport.

```jsx
// Props: children, direction ('up' | 'down' | 'left' | 'right'), delay (ms), className
// Uses motion from "motion/react"
// Initial: opacity 0, translate 20-30px in the given direction
// Animate: opacity 1, translate 0
// Transition: duration 0.6s, ease out
// Only triggers once (use whileInView with once: true)
```

### 3.5 HoverCard.jsx
Card that lifts and glows on hover. Use for grid items (sessions, resources, members, jobs).

```jsx
// Wraps existing Card component
// On hover: translateY(-4px), shadow-lg, optional brand-color glow
// Transition: spring physics (use transition-spring)
// Optional: subtle border color change on hover
```

### 3.6 Shimmer.jsx
A better loading skeleton with a shimmer/sweep animation.

```jsx
// Replaces or extends existing Skeleton.jsx
// Animated gradient that sweeps left to right
// Uses @keyframes shimmer with background-position animation
// Rounded corners matching the element it replaces
```

### 3.7 Tooltip.jsx
Clean hover tooltip. Use for icon buttons, truncated text, action buttons.

```jsx
// Props: content (string), children, position ('top' | 'bottom' | 'left' | 'right')
// Appears on hover with slight delay (200ms)
// Animates in: scale from 0.95 + opacity from 0
// Dark background (gray-800), white text, rounded-lg, small arrow
// Max width 200px, text wraps
```

### 3.8 ProgressRing.jsx
Circular progress indicator. Use for profile completion, stats.

```jsx
// Props: progress (0-100), size, strokeWidth, color
// SVG circle with stroke-dasharray animation
// Animated count-up of percentage in center
// Brand-pink stroke color by default
```

### 3.9 Divider.jsx
Subtle section divider with optional label.

```jsx
// Props: label (optional string), className
// Thin gray line (gray-200) with generous vertical margin
// If label provided: line - text - line pattern (centered)
// Text in gray-400, small font, uppercase tracking-wide
```

### 3.10 StatusDot.jsx
Animated status indicator. Use for online status, live sessions, job status.

```jsx
// Props: status ('live' | 'online' | 'active' | 'inactive'), size
// Live/online: green dot with pulsing ring animation
// Active: brand-pink dot, no pulse
// Inactive: gray dot, no pulse
// Uses @keyframes ping for the pulse
```

## Step 4: Apply glassmorphism to key surfaces

Update these existing components:

### Dashboard Sidebar
- Background: gradient from brand-blue-dark to brand-blue
- Nav items: transparent by default, `bg-white/10` on hover, `bg-white/15` when active
- User profile card at top: glass card with `bg-white/10 backdrop-blur-sm`
- Subtle separator lines between nav groups
- Icons get a slight glow when active

### Dashboard Top Bar
- `bg-white/80 backdrop-blur-lg` - glass effect so content scrolls behind it
- `border-b border-gray-200/50` - subtle bottom border
- Sticky position (should already be, but verify)
- Search input: rounded-full with gray-100 bg, focus ring in brand-pink

### Modal Overlays
- Backdrop: `bg-black/40 backdrop-blur-sm` (blurs the page behind)
- Modal card: white bg with `shadow-xl` and `rounded-2xl`
- Enter animation: scale from 0.95 + fade in (use AnimatePresence from motion)
- Exit animation: scale to 0.95 + fade out

### Toast Notifications
- Glass effect: `bg-white/90 backdrop-blur-md`
- Slide in from top-right with motion
- Auto-dismiss with shrinking progress bar at bottom
- Success: left border in green. Error: left border in red.

## Step 5: Micro-interactions everywhere

Add subtle animations to these interactions. Keep them fast (150-300ms). Nothing should feel slow or bouncy.

### Buttons
- All buttons: `transition-all duration-150`
- Hover: slight scale (1.02), shadow increases
- Active/click: scale down to 0.98
- Primary buttons (brand-pink): add `shadow-glow-pink` on hover
- Loading state: spinner icon replaces text, button stays same width

### Cards (sessions, resources, members, vendors, jobs)
- Hover: lift up 4px (`translateY(-4px)`), shadow increases to shadow-md
- Transition: 250ms ease-out
- Optional: image inside card zooms slightly (scale 1.05) on card hover with overflow-hidden

### Navigation links
- Underline slides in from left on hover (use `after` pseudo-element with scaleX transition)
- Active link: brand-pink underline, stays visible
- Dashboard sidebar items: bg slides in from left on hover

### Form inputs
- Focus: ring expands outward (use ring-2 ring-brand-pink/30 with transition)
- Label floats up when input is focused or has value (optional - only if it looks good)
- Validation: red ring + subtle shake animation on error (use motion with x: [-4, 4, -4, 4, 0])

### Tabs
- Active tab indicator slides horizontally between tabs (use motion layoutId)
- Content fades in when switching tabs (use AnimatePresence with mode="wait")

### Page transitions
- Pages fade in on route change: opacity 0 to 1, slight Y translate
- Keep it fast (200ms) so navigation feels snappy
- Wrap route outlet with AnimatePresence in App.jsx

### Like/Save/Bookmark buttons
- Heart or bookmark icon: scale up to 1.3, then back to 1.0 on click (spring animation)
- Color fills in with brand-pink
- Tiny particle burst effect (optional - only if you can do it cleanly)

### Notification bell
- Subtle shake animation when new notification arrives
- Unread count badge: scale-in with spring on appear

## Step 6: Upgrade page sections

### Homepage Hero
- Background: subtle gradient mesh (brand-pink-light at 5% opacity + brand-blue-light at 5% opacity, large soft blurred circles)
- Or: very subtle dot grid pattern in gray-200 behind the hero text
- Headline: use GradientText for the key phrase
- Stats counter: use AnimatedCounter (e.g., "500+ Members", "100+ Sessions")
- CTA button: brand-pink with glow shadow on hover

### Logo Bar (company logos)
- Grayscale by default, color on hover
- Infinite horizontal scroll animation (already have InfiniteLeaderScroll - verify it's smooth)
- Subtle fade masks on left and right edges

### Testimonials
- Cards with subtle glass effect
- Star rating in brand-pink
- Auto-rotate with fade transition (not jarring slide)
- Pause on hover

### Pricing Card
- GlassCard with extra shadow
- "Most Popular" badge with brand-pink bg
- Feature list: checkmark icons in brand-pink
- Price: large font, use AnimatedCounter for the number
- CTA button with glow effect

### Dashboard Cards (sessions, resources, members)
- Use HoverCard wrapper
- Image thumbnails: rounded-lg with subtle shadow
- On hover: image zooms slightly (scale 1.03, overflow hidden)
- Status badges (Live, Free, New): pill-shaped with brand colors
- "View all" links: arrow icon slides right on hover

### Empty States
- Centered layout with illustration or icon
- Helpful message + CTA button
- Slight fade-in animation on mount

### Loading States
- Replace current Skeleton with Shimmer component
- Match the exact shape of what's loading (card skeleton, list skeleton, profile skeleton)
- Stagger the shimmer timing so cards don't all shimmer in sync

## Step 7: Missing elements to add

These elements don't exist yet. Build them.

### 7.1 Back-to-Top Button
- Appears after scrolling down 400px on any page
- Fixed bottom-right position
- Rounded-full, brand-pink bg, white arrow-up icon
- Fades in/out with opacity transition
- Smooth scroll to top on click

### 7.2 Breadcrumbs (upgrade existing)
- Already exists as component but verify it's used on all detail pages
- Add to: SessionDetailPage, ResourceDetailPage, VendorDetailPage, JobDetailPage, MemberProfilePage, BlogDetailPage
- Style: gray-400 text, "/" separators, current page in gray-700

### 7.3 Keyboard Shortcuts Hint
- Small "Press / to search" hint next to the dashboard search bar
- Styled as a subtle kbd tag (gray bg, rounded, small font)
- Actually wire up: pressing "/" focuses the search input

### 7.4 Scroll Progress Bar
- Thin progress bar at the very top of the page (above the nav)
- Shows how far the user has scrolled on long pages (articles, blog posts)
- Brand-pink color, 2-3px height
- Only show on pages with long content (BlogDetailPage, ResourceDetailPage)

### 7.5 Dark Mode Toggle (optional - only if time allows)
- Toggle in dashboard top bar or profile settings
- Use CSS variables approach: swap --gray-50 through --gray-900
- Glass effects look great in dark mode
- Store preference in localStorage

### 7.6 Confetti Effect
- Trigger on: successful job application, successful event registration, profile completion 100%
- Small, brief, tasteful (2 seconds max)
- Use canvas-confetti library: `npm install canvas-confetti`

### 7.7 Image Lazy Loading with Blur-Up
- All images: show a tiny blurred placeholder, then fade in the full image on load
- Use a small inline base64 placeholder or a CSS blur
- Transition from blur to sharp with opacity + filter animation

### 7.8 Floating Action Button (Mobile)
- Only visible on mobile (below md breakpoint)
- Fixed bottom-right, brand-pink, "+" icon
- Opens a quick-action menu: New Job Post, Send Message, Browse Members
- Expands upward with staggered animation

### 7.9 Notification Toast Stack
- Multiple toasts stack vertically (top-right)
- New toasts push older ones down
- Each has its own dismiss timer with visual progress bar
- Use AnimatePresence for enter/exit animations

### 7.10 Profile Completion Bar
- Shows on ProfilePage and optionally in sidebar
- Horizontal bar or ProgressRing showing % complete
- Calculates based on: avatar uploaded, bio filled, skills added, experience added, resume uploaded
- "Complete your profile" CTA with list of missing items

## Step 8: Final polish pass

Go through every page one more time and check:

- [ ] Consistent border-radius everywhere (no mix of rounded-md and rounded-xl)
- [ ] Consistent shadows (use the token scale, not random values)
- [ ] Consistent spacing (generous - err on the side of more white space)
- [ ] All images have rounded corners and subtle shadows
- [ ] All empty states are designed (not blank white space)
- [ ] All loading states use Shimmer (not spinner or blank)
- [ ] All buttons have hover + active states
- [ ] All links have hover states
- [ ] No layout shift when content loads (skeleton matches content size)
- [ ] Focus states on all interactive elements (accessibility)
- [ ] Smooth scroll behavior on anchor links
- [ ] Font weights are consistent (headings 600-700, body 400, labels 500)
- [ ] Color usage is consistent (brand-pink for primary actions, brand-blue for navigation/info)

## Rules

- Install `motion` (npm install motion) for all animations
- Install `canvas-confetti` (npm install canvas-confetti) for celebration effects
- Don't break any existing functionality - this is a visual upgrade only
- Keep animations fast and subtle. If something feels slow or distracting, make it faster or remove it.
- Test on both desktop (1440px) and mobile (390px)
- Glass effects need fallbacks - if backdrop-filter isn't supported, fall back to solid white bg
- Every new component goes in `client/src/components/ui/`
- Don't add dark mode unless everything else is done first
