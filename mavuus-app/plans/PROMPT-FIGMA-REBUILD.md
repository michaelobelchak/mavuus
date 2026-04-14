# Claude Code Prompt: Rebuild Pages to Match Figma

> Copy this entire file and paste it into Claude Code as your prompt.

---

You are working on the Mavuus app - a B2B marketing community platform built with React 19 + Vite + Tailwind CSS v4 (frontend) and Express.js + SQLite/better-sqlite3 (backend).

Your job: Rebuild and restyle pages so they match the Figma designs exactly. This is for a client presentation - every page must look like the approved Figma mockups.

Read the full plan at `plans/FIGMA-REBUILD.md` before starting.

## Figma access

Use the Figma MCP tool to read designs. File key: `8nwNyWhncy5Muhd7oukMJw`

For each page, call `get_design_context` with the node ID listed below to get exact layout, colors, spacing, and components. Call `get_screenshot` to visually compare your work.

## Design tokens

Apply these globally before starting any page work:

- **Brand Pink:** #F26D92 (buttons, CTAs, accents)
- **Brand Blue:** #1F648D (navigation, headings, secondary)
- **Font:** Manrope (import from Google Fonts, set as default)
- **Border Radius:** 8-16px on cards and buttons
- **Shadows:** Soft drop shadows on cards (e.g., `shadow-md` or custom)
- **Max Width:** 1440px desktop

Set these up in the Tailwind config or global CSS first.

## Pages to rebuild (in order)

### Step 1: Login/Register (first impression)

**Login - Figma node: 2996:15624**

Current login is a centered form. Figma shows a split-screen layout:
- **Left panel (dark):** Testimonial carousel (Cameron Micules quote), navigation arrows, company logos bar (Microsoft, Ceridian, PointClickCare, Scotiabank, Amazon, Terminus)
- **Right panel (white):** Mavuus logo, "Let's Login to Your Account" headline, "Experience The Power Of Your Marketing Network" subheading, email input, password input with show/hide toggle, "Remember me" checkbox, "Forgot Password?" link, pink Sign In button, "Sign In With Google" button, "Register Now!" link

Rebuild `client/src/pages/auth/LoginPage.jsx` to match this exactly.

**Register** - Same split-screen layout. Left panel identical. Right panel has: name, email, password, confirm password fields, "Sign Up With Google" button, "Already have an account? Sign In" link.

Rebuild `client/src/pages/auth/RegisterPage.jsx` to match.

### Step 2: Homepage

**Figma node: 1911:4011 (Desktop), 2013:4522 (Mobile)**

Read the Figma design context for this node. Rebuild `client/src/pages/public/HomePage.jsx` to match:
1. Header nav with exact items: For Business, For Marketers, Community, Pricing + Sign In, Create Account
2. Hero section with exact headline from Figma
3. Featured team members carousel
4. Value proposition sections (alternating image/text)
5. Testimonial section
6. Content blocks
7. CTA section
8. Footer with exact column layout

Also update `client/src/components/layout/PublicLayout.jsx` header and footer if they don't match Figma.

### Step 3: Dashboard Home

**Figma node: 3061:794 (Expanded)**

Sub-nodes for detail:
- Top Menu: 3061:795
- Content Area: 3061:804
- Left Sidebar: 3061:805

Rebuild `client/src/pages/dashboard/AcademyPage.jsx` and update `client/src/components/layout/DashboardLayout.jsx` + `Sidebar.jsx`:

**Sidebar must have:**
- User profile card (avatar, name, role)
- Nav items: Home, Live Sessions, Videos, Resources, Members, Vendors, Jobs, Messages
- Referral section at bottom

**Top bar must have:**
- Logo left, search bar center, notification bell + message icon + settings gear right

**Main content sections (in order):**
1. Upcoming Live Sessions - horizontal card row
2. On-Demand Sessions - horizontal card row
3. Community Resources - horizontal card row
4. Past Speakers - speaker profile cards

If "Past Speakers" section doesn't exist, build it. Fetch speakers from `/api/sessions` (extract unique speaker names) or create a dedicated endpoint.

### Step 4: Pricing Page

**Figma node: 2144:957 (Desktop), 2158:15647 (Mobile)**

Rebuild `client/src/pages/public/PricingPage.jsx`:
- Single "Pro Access" tier (not multiple tiers)
- Monthly/Yearly toggle
- $15/month or $9.25/month billed yearly
- 8 feature checklist items from Figma
- Submit button in brand pink

### Step 5: Article Detail + Category Pages

**Article Detail - Figma node: 2197:9034**
Update `client/src/pages/public/BlogDetailPage.jsx`:
- Add breadcrumbs
- Author byline with avatar
- Social sharing icons
- Working prev/next navigation
- "Upcoming Live Events" section with 3 cards
- "Other Articles" sidebar

**Category/Articles - Figma node: 2246:3246**
Update `client/src/pages/public/ArticlesPage.jsx`:
- Add breadcrumbs
- Match card grid layout from Figma
- Match metadata display (author, date, category tags)

### Step 6: Event Registration + Confirmation

**Event Registration - Figma node: 2194:1235**
Rebuild `client/src/pages/dashboard/SessionDetailPage.jsx`:
- Countdown timer component
- Inline registration form
- Speaker profiles with time slots
- Event organizers section

**Event Confirmation - Figma node: 2194:3999** (NEW PAGE)
Create `client/src/pages/public/EventConfirmationPage.jsx`:
- Add route `/events/:id/confirmation` in App.jsx
- Confirmation message, event summary, next steps
- Redirect here after successful registration

### Step 7: Share Modal (NEW)

**Figma node: 2305:4680 (Desktop), 2305:6725 (Mobile)**
Create `client/src/components/ui/ShareModal.jsx`:
- Social buttons: Twitter/X, LinkedIn, Facebook, copy link
- Add share triggers to article, event, and resource detail pages

### Step 8: Style alignment pass

Go through every page NOT in Figma and make sure they use:
- Manrope font
- Brand pink (#F26D92) for CTAs
- Brand blue (#1F648D) for headings/nav
- Consistent card border radius and shadows
- Consistent button styles

Pages to align: AboutPage, ContactPage, ResourcesHubPage, all dashboard pages (LiveSessions, OnDemand, Resources, Members, Vendors, Jobs, MyJobs, Profile, Messages, detail pages).

### Step 9: Mobile responsive pass

For every page that has a mobile Figma frame, verify the responsive version matches:
- Homepage mobile: 2013:4522
- Pricing mobile: 2158:15647
- Event registration mobile: 2305:5182
- Event confirmation mobile: 2305:7207
- Category pages mobile: 2453:5052

## Rules

- Use the Figma MCP tool (`get_design_context` and `get_screenshot`) to verify your work against the designs
- Don't break existing functionality - this is a visual rebuild, not a feature rewrite
- Keep all existing API integrations working
- Use Tailwind CSS classes, not inline styles
- Make sure every page is responsive (works at 390px mobile and 1440px desktop)
- Test each page after rebuilding before moving to the next
