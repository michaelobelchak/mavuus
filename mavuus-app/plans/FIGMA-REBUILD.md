# FIGMA-REBUILD: Match Every Page to the Figma Design

> Goal: Compare every page in the Figma file against what's currently built in code. Rebuild or restyle pages so the app matches the Figma designs 1:1. This is a client presentation - it needs to look exactly like the approved designs.

**Figma File:** https://www.figma.com/design/8nwNyWhncy5Muhd7oukMJw/MAVUUS
**Design Page:** "High Fidelity" contains all finalized screens

---

## DESIGN TOKENS (from Figma)

Use these consistently across all pages:

- **Brand Pink:** #F26D92 (primary CTA color, buttons, accents)
- **Brand Blue:** #1F648D (secondary, navigation, headings)
- **Font Family:** Manrope (all text)
- **Border Radius:** Rounded corners on cards and buttons (8px to 16px)
- **Shadows:** Soft drop shadows on cards
- **Max Width:** 1440px for desktop layouts

---

## PAGE-BY-PAGE COMPARISON

### PAGE 1: HOMEPAGE
- **Figma Node:** 1911:4011 (Desktop), 2013:4522 (Mobile)
- **Current Code:** `client/src/pages/public/HomePage.jsx`
- **Figma Link:** https://www.figma.com/design/8nwNyWhncy5Muhd7oukMJw/MAVUUS?node-id=1911-4011

**Figma layout (top to bottom):**
1. Header nav - logo left, nav links center (For Business, For Marketers, Community, Pricing), Sign In + Create Account buttons right
2. Hero section - headline "Do you want CMOs (Chief Marketing Officers) to elevate their influence at the executive table?" with email input + CTA button
3. Featured team members carousel - horizontal scroll of profile cards
4. Value proposition sections - alternating image/text blocks showing platform benefits
5. Testimonial/quote section - user quote with avatar
6. Multiple content blocks with images and marketing copy
7. Final CTA section
8. Footer - links columns + newsletter signup

**What needs to change:**
- [ ] Compare header nav structure - Figma has specific nav items (For Business, For Marketers, Community, Pricing). Current code may have different nav items. Match exactly.
- [ ] Hero section headline and layout - verify exact copy matches Figma
- [ ] Featured members carousel - does it exist in current code? If not, build it
- [ ] Value proposition sections - compare layout (image left/right alternating) and content
- [ ] Testimonial section - verify design matches
- [ ] Footer structure - match column layout and links from Figma
- [ ] Mobile responsive version must match Figma node 2013:4522

---

### PAGE 2: PRICING PAGE
- **Figma Node:** 2144:957 (Desktop), 2158:15647 (Mobile)
- **Current Code:** `client/src/pages/public/PricingPage.jsx`
- **Figma Link:** https://www.figma.com/design/8nwNyWhncy5Muhd7oukMJw/MAVUUS?node-id=2144-957

**Figma layout:**
1. Header nav (same as homepage)
2. Headline: "Collaborate with peers. Learn from the experts. Exchange contractors. Land clients."
3. Single "Pro Access" pricing card with:
   - Monthly/Yearly toggle
   - Price: $15/month or $9.25/month billed yearly
   - 8-item feature checklist (virtual coffee chats, roundtables, educational videos, contractor networking, mentor access, client leads, gig opportunities, and more)
   - Submit button
4. Footer

**What needs to change:**
- [ ] Verify headline text matches Figma exactly
- [ ] Current code may show multiple pricing tiers - Figma shows only ONE tier ("Pro Access"). Remove extra tiers if they exist.
- [ ] Match exact feature list items from Figma (8 items)
- [ ] Match pricing values ($15 monthly, $9.25/month yearly)
- [ ] Style the card to match Figma (border, shadow, spacing)
- [ ] Mobile layout: match Figma node 2158:15647

---

### PAGE 3: EVENT REGISTRATION PAGE
- **Figma Node:** 2194:1235 (Desktop), 2305:5182 (Mobile)
- **Current Code:** `client/src/pages/dashboard/SessionDetailPage.jsx`
- **Figma Link:** https://www.figma.com/design/8nwNyWhncy5Muhd7oukMJw/MAVUUS?node-id=2194-1235

**Figma layout:**
1. Header nav
2. Event title: "Marketing to Women in B2B: How to Appeal to a Female Demographic in 2024"
3. Live session badge with countdown timer (days, hours, minutes, seconds)
4. Registration form with email input + CTA
5. "During these 60-minutes you will:" section with bullet points
6. Speaker profiles section:
   - Sherry Grote (9:00 am - 9:10 am)
   - Jess Forrester (9:10 am - 9:20 am)
   - Kristina Clearly
7. Event Organizers section (Dilya Abushayeva, Elmira Abushayeva)
8. Footer

**What needs to change:**
- [ ] Current SessionDetailPage likely has a simpler layout. Needs full redesign to match Figma.
- [ ] Add countdown timer component (days/hours/minutes/seconds)
- [ ] Add speaker profiles section with time slots
- [ ] Add event organizers section
- [ ] Registration form inline on the page (not just a button)
- [ ] Match the overall visual structure from Figma

---

### PAGE 4: ARTICLE DETAIL PAGE
- **Figma Node:** 2197:9034
- **Current Code:** `client/src/pages/public/BlogDetailPage.jsx`
- **Figma Link:** https://www.figma.com/design/8nwNyWhncy5Muhd7oukMJw/MAVUUS?node-id=2197-9034

**Figma layout:**
1. Header nav
2. Breadcrumb navigation (Home > Articles > Article Title)
3. Article title
4. Author byline with avatar (e.g., Fiona Nadpughese)
5. Metadata (read time, date "Jan 19, 2024")
6. Featured image
7. Article body with subheadings:
   - Predictive Analytics and Market Forecasting
   - Customization and Personalization
   - The Ethical Consideration of Data Usage
   - The Future of Data-Driven Marketing
8. Social sharing icons
9. Previous/Next article navigation
10. "View Our Upcoming Live Events" section with 3 event cards
11. "Other Articles" sidebar with related links
12. Footer

**What needs to change:**
- [ ] Add breadcrumb navigation at top
- [ ] Author byline with avatar - verify it matches Figma style
- [ ] Social sharing icons section - may be missing
- [ ] Previous/Next article links need to actually work (currently both go to /articles)
- [ ] "Upcoming Live Events" section at bottom - verify it exists and matches
- [ ] "Other Articles" sidebar - verify layout matches Figma
- [ ] Overall typography and spacing must match

---

### PAGE 5: EVENT CONFIRMATION PAGE
- **Figma Node:** 2194:3999 (Desktop), 2305:7207 / 2453:3934 (Mobile)
- **Current Code:** DOES NOT EXIST - needs to be created
- **Figma Link:** https://www.figma.com/design/8nwNyWhncy5Muhd7oukMJw/MAVUUS?node-id=2194-3999

**What needs to be built:**
- [ ] Create new page: `client/src/pages/public/EventConfirmationPage.jsx`
- [ ] Add route in App.jsx (e.g., `/events/:id/confirmation`)
- [ ] Build layout to match Figma: confirmation message, event details summary, next steps
- [ ] After session registration succeeds, redirect to this confirmation page
- [ ] Mobile version must match Figma node 2305:7207

---

### PAGE 6: CATEGORY / COLLECTION PAGES
- **Figma Nodes:** 2246:3246, 2462:5304, 2462:4264 (Desktop variations), 2453:5052, 2462:5336, 2462:4296, 2462:4047 (Mobile)
- **Current Code:** `client/src/pages/public/ArticlesPage.jsx`, `client/src/pages/public/EventsPage.jsx`
- **Figma Link:** https://www.figma.com/design/8nwNyWhncy5Muhd7oukMJw/MAVUUS?node-id=2246-3246

**Figma layout:**
1. Header nav
2. Breadcrumb navigation
3. Page title / category heading
4. Article cards in grid layout:
   - Thumbnail image
   - Article title
   - Author info
   - Publication date
   - Category tags
5. Footer

**What needs to change:**
- [ ] Add breadcrumbs to ArticlesPage and EventsPage
- [ ] Verify card layout matches Figma grid (image on left or top?)
- [ ] Verify metadata display (author, date, tags) matches Figma
- [ ] Check spacing, card borders/shadows against Figma
- [ ] Multiple Figma variations suggest different category views - check if we need separate layouts per category

---

### PAGE 7: LOGIN SCREEN
- **Figma Node:** 2996:15624
- **Current Code:** `client/src/pages/auth/LoginPage.jsx`
- **Figma Link:** https://www.figma.com/design/8nwNyWhncy5Muhd7oukMJw/MAVUUS?node-id=2996-15624

**Figma layout (split screen, 1440x1024):**

**Left side (dark/image panel):**
- User testimonial from Cameron Micules (Fractional CMO at Niuz)
- Quote about the value of Mavuus network
- Navigation arrows (testimonial carousel)
- "Our Talent Has Worked At Some Of The Biggest Companies" with company logos (Microsoft, Ceridian, PointClickCare, Scotiabank, Amazon, Terminus)

**Right side (form panel):**
- Mavuus logo at top
- Headline: "Let's Login to Your Account"
- Subheading: "Experience The Power Of Your Marketing Network"
- Email input field
- Password input field with show/hide toggle
- "Remember me" checkbox
- "Forgot Password?" link
- Pink "Sign In" button
- "Sign In With Google" button
- "Don't have an account yet? Register Now!" link

**What needs to change:**
- [ ] MAJOR REDESIGN: Current login is likely a centered form. Figma shows a split-screen layout.
- [ ] Build left panel with testimonial carousel + company logos
- [ ] Build right panel with the exact form layout from Figma
- [ ] Add "Remember me" checkbox
- [ ] Add "Forgot Password?" link (even if it goes to a placeholder page)
- [ ] Add "Sign In With Google" button (can be non-functional with a toast "Coming soon")
- [ ] Add "Register Now" link at bottom
- [ ] Password field needs show/hide toggle icon
- [ ] Match exact colors - pink Sign In button (#F26D92)

---

### PAGE 8: REGISTER SCREEN
- **Figma:** Not a separate frame, but implied by Login screen ("Register Now!" link)
- **Current Code:** `client/src/pages/auth/RegisterPage.jsx`

**What needs to change:**
- [ ] Match the same split-screen layout as Login
- [ ] Left panel: same testimonial + logos
- [ ] Right panel: registration form with name, email, password, confirm password
- [ ] "Sign Up With Google" button
- [ ] "Already have an account? Sign In" link
- [ ] Same styling and spacing as login

---

### PAGE 9: DASHBOARD HOME
- **Figma Nodes:** 3061:794 (Expanded, 1440x2680), 2997:9227 (Standard, 1440x1024)
- **Current Code:** `client/src/pages/dashboard/AcademyPage.jsx`
- **Figma Link:** https://www.figma.com/design/8nwNyWhncy5Muhd7oukMJw/MAVUUS?node-id=3061-794

**Figma layout:**

**Top Menu Bar:**
- Mavuus logo left
- Search bar center
- Notification bell, message icon, settings gear right

**Left Sidebar:**
- User profile card (avatar, name, role)
- Navigation menu:
  - Home
  - Live Sessions
  - Videos (On-Demand)
  - Resources
  - Members
  - Vendors
  - Jobs
  - Messages
- Referral section at bottom

**Main Content Area (scrollable):**
1. "Upcoming Live Sessions" section - horizontal card row
2. "On-Demand Sessions" section - horizontal card row
3. "Community Resources" section - horizontal card row
4. "Past Speakers" section - speaker profile cards

**What needs to change:**
- [ ] Compare current sidebar navigation items with Figma - match exactly
- [ ] Top bar: verify search bar exists and is centered
- [ ] Top bar: verify icon buttons (bell, message, settings) match Figma placement
- [ ] Main content: verify sections exist in this exact order (Upcoming Live, On-Demand, Resources, Past Speakers)
- [ ] Each section should show horizontal scrolling cards
- [ ] "Past Speakers" section - may not exist in current code. Build it if missing.
- [ ] Referral section in sidebar - may not exist. Build it if missing.
- [ ] Card designs within each section must match Figma

---

### PAGE 10: SHARE MODAL
- **Figma Node:** 2305:4680 (Desktop), 2305:6725 (Mobile)
- **Current Code:** DOES NOT EXIST - needs to be created

**What needs to be built:**
- [ ] Create a reusable `ShareModal` component
- [ ] Social sharing buttons (Twitter/X, LinkedIn, Facebook, copy link)
- [ ] Add share trigger buttons to article detail pages, event pages, and resource pages
- [ ] Mobile version must match Figma node 2305:6725

---

## PAGES IN CODE BUT NOT IN FIGMA

These pages exist in code but don't have Figma designs. Keep them as-is but make sure they follow the same design tokens (colors, fonts, spacing, border radius) as the Figma pages:

- **AboutPage** (`/about`) - Keep current design, align styling
- **ContactPage** (`/contact`) - Keep current design, align styling
- **ResourcesHubPage** (`/resources`) - Keep, align styling
- **LiveSessionsPage** (`/dashboard/live-sessions`) - Keep, align styling
- **OnDemandPage** (`/dashboard/on-demand`) - Keep, align styling
- **ResourcesPage** (`/dashboard/resources`) - Keep, align styling
- **ResourceDetailPage** (`/dashboard/resources/:id`) - Keep, align styling
- **MembersPage** (`/dashboard/members`) - Keep, align styling
- **MemberProfilePage** (`/dashboard/members/:id`) - Keep, align styling
- **VendorsPage** (`/dashboard/vendors`) - Keep, align styling
- **VendorDetailPage** (`/dashboard/vendors/:id`) - Keep, align styling
- **JobsPage** (`/dashboard/jobs`) - Keep, align styling
- **JobDetailPage** (`/dashboard/jobs/:id`) - Keep, align styling
- **MyJobsPage** (`/dashboard/my-jobs`) - Keep, align styling
- **ProfilePage** (`/dashboard/profile`) - Keep, align styling
- **MessagesPage** (`/dashboard/messages`) - Keep, align styling

---

## EXECUTION ORDER

1. **Design tokens first:** Set up global CSS variables / Tailwind config for brand-pink, brand-blue, Manrope font, standard border radius, shadows
2. **Login/Register redesign:** These are the first screens users see - highest visual impact
3. **Homepage redesign:** The public-facing first impression
4. **Dashboard home:** The main screen after login
5. **Pricing page:** Simple page, quick win
6. **Article detail + category pages:** Content pages
7. **Event registration + confirmation:** New page creation
8. **Share modal:** Reusable component
9. **Style alignment pass:** Go through all non-Figma pages and align design tokens
10. **Mobile responsive pass:** Verify all pages match mobile Figma frames

---

## FIGMA ACCESS FOR IMPLEMENTATION

When building each page, use the Figma MCP tool to get the exact design context:

```
File key: 8nwNyWhncy5Muhd7oukMJw

Key node IDs:
- Homepage Desktop:        1911:4011
- Homepage Mobile:         2013:4522
- Pricing Desktop:         2144:957
- Pricing Mobile:          2158:15647
- Event Registration:      2194:1235
- Event Registration Mob:  2305:5182
- Article Detail:          2197:9034
- Event Confirmation:      2194:3999
- Event Confirm Mobile:    2305:7207
- Category Page:           2246:3246
- Category Mobile:         2453:5052
- Share Modal Desktop:     2305:4680
- Share Modal Mobile:      2305:6725
- Login Screen:            2996:15624
- Dashboard Expanded:      3061:794
- Dashboard Standard:      2997:9227
- Component Library:       1901:7315
```

For each page, run `get_design_context` with the node ID to get the exact layout, colors, spacing, and component structure. Use `get_screenshot` to visually verify your implementation matches.

---

## VERIFICATION CHECKLIST

After rebuilding, compare each page side-by-side with Figma:

- [ ] Homepage desktop matches Figma node 1911:4011
- [ ] Homepage mobile matches Figma node 2013:4522
- [ ] Pricing desktop matches Figma node 2144:957
- [ ] Pricing mobile matches Figma node 2158:15647
- [ ] Login matches Figma node 2996:15624 (split screen layout)
- [ ] Register matches Login layout pattern
- [ ] Dashboard home matches Figma node 3061:794
- [ ] Event registration matches Figma node 2194:1235
- [ ] Event confirmation page exists and matches Figma node 2194:3999
- [ ] Article detail matches Figma node 2197:9034
- [ ] Category/articles page matches Figma node 2246:3246
- [ ] Share modal exists and matches Figma node 2305:4680
- [ ] All non-Figma pages use consistent design tokens
- [ ] All mobile versions tested and match Figma mobile frames
