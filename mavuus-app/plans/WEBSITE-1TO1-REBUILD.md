# Public Website 1:1 Rebuild (match live mavuus.com)

**Status:** IN PROGRESS (branch `feat/live-site-rebuild`)
**Audited:** 2026-10-31 against https://www.mavuus.com (Webflow, last published 2026-10-28)
**Scope:** public marketing pages only. The members dashboard and admin panel stay as they are.

## Why

The public pages in `client/src/pages/public/` were built from the March 2026 Figma and site. The live site has moved on since then: new positioning (B2B marketing strategy and services, not just a CMO community), a new Marketing Services page, a renamed Pricing page, a new font, and a different nav. The demo needs to look like the site the founders run today.

## What the live site has now

### Global

- Font: **Fixel Text** (`Fixeltext` in Webflow), not Manrope. Fixel is a free OFL font from MacPaw. Self-host the woff2 files in `client/public/fonts/` once the license is confirmed.
- Colors (Webflow variables, the same palette we already have):
  - pink `#f26d92` (CTA background)
  - blue `#1f648d` (Webflow calls it "green")
  - black `#1c2232`
  - grey `#5e697c` (body text)
  - blue-light `#eeeff4`
  - page background `#fcfbfa`
- Type (measured at a narrow viewport, so re-measure at 1440px):
  - H1 weight 500, black
  - H2 weight 500, `rgb(75,85,99)`
  - body 18px, grey
  - CTA buttons 16px, weight 600, 16px radius, pink with white text
- Nav: Home, Membership, Marketing Services, Resources, About, Contact. "Log in" goes to `https://app.mavuus.com/` and "Sign Up" goes to `https://app.mavuus.com/user/register.html`. In our build both point to our own `/login` and `/register`.
- Footer (`footer3_component`): links to FAQ, Terms & Conditions, and Privacy Policy.
- Shared CTA band on most pages: "Ready to experience the real power of your Marketing Network?" with a "Get Started" button.

### Pages and sections (top to bottom)

| Live URL | Our route today | Sections |
|---|---|---|
| `/` | `/` and `/home` | Hero ("Smarter Marketing. Stronger Marketing Leaders. Bigger Business Impact.") with "Explore Marketing Services" and "Join the CMO Community". Then: For business ("Marketing Strategy, Execution & Leadership"); stats ("Senior Marketing Experience. A Broader Perspective."); Mavuus Insights video grid (about 50 videos, "Explore Mavuus Insights"); "Connected to Experienced Marketing Leaders"; company logo bar ("Our marketers have worked at some of the biggest companies"); leaders; banner; For marketers ("Connect. Learn. Lead."); fractional work ("Ready to Turn Your Marketing into Revenue?", "Let's Talk About Your Marketing"); day-to-day ("Need help with day-to-day marketing execution? We got you.", "Find a Marketing Contractor Now"); testimonials; footer |
| `/membership` | `/pricing` | Hero ("Collaborate with peers. Learn from the experts. Exchange contractors."), pricing ("Become a member", free 30-day trial, "Join Mavuus Community"), footer |
| `/marketing-services` | none, **new page** | Hero ("Marketing Strategy That Gives Your Team a Clearer Path to Growth", "Let's Talk About Your Marketing", "See How We Help"); "That's where Mavuus comes in."; "From Strategy to Execution"; "Flexible Support. Built Around Your Business."; stats; CTA ("Need a Clearer Marketing Strategy or Ongoing Marketing Support?"); footer |
| `/resources` | `/resources` | "Helpful Resources" with a featured item; Live Events (links out to `event.mavuus.com/...`, "RSVP Now"); Articles (9 per page, "Load More"); On Demand Videos (paged); footer |
| `/post/<slug>` | `/articles/:id`, `/blog/:id` | Article with H2 sections (rich text). Slugs replace numeric ids |
| `/demands-videos/<slug>` | `/dashboard/on-demand/:id` | **Broken on the live site**: the template renders "No items found". Our build should link these to a working video detail page (public teaser plus a sign-up gate) |
| `/about` | `/about` | Hero ("Empowering Marketing Leaders to Network, Learn, and Advance Their Careers"); who we are (founder story of the two sisters); "What Does the Name Mean?"; CTA band; footer |
| `/contact` | `/contact` | Hero ("Get in Touch"); form with First Name, Last Name, Email, Phone, Message; CTA band; footer |
| `/faq` | none (FAQ sits inside Contact) | **New page**: hero ("How We Can Help You?"), FAQ accordion, CTA band, footer |
| `/terms-conditions/<section>` | none | **New**: hero, category sidebar, rich text, CTA band, footer |
| `/privacy-policy/<section>` | none | **New**: same template as Terms |

## Plan

Do it in this order, one commit per step. Run `/verify` after each one.

1. **Capture references.** Save full-page screenshots of every live page at 1440px and 390px wide into `mavuus-app/plans/reference/live-2026-10/`. Record exact copy, spacing, font sizes, and image assets per section (the browser preview tool works for this). Don't commit downloaded images until the founders confirm we can reuse them.
2. **Global foundation.**
   - Swap Manrope for Fixel Text in `index.css` (`--font-heading`, `--font-body`) and add the `#fcfbfa` page background and the `#eeeff4` and `#5e697c` tokens to `@theme`.
   - Update `PublicHeader` nav and `Footer` links to match the live site.
   - Build one shared `CTABand` section for the repeated "Ready to experience..." block.
3. **Routes.**
   - Add `/membership`, `/marketing-services`, `/faq`, `/post/:slug`, `/terms-conditions/:section`, `/privacy-policy/:section`, and `/demands-videos/:slug`.
   - Redirect `/pricing` to `/membership`, and `/articles/:id` and `/blog/:id` to `/post/:slug`.
   - Add `slug` columns to the resources and sessions tables in `schema.sql`, fill them in `seed.js` and `seed-demo.js`, and add a lookup-by-slug endpoint.
4. **Homepage.** Rebuild the 13 sections in live order with live copy. Seed the Insights grid with the live video titles and slugs.
5. **Marketing Services.** New page, 6 sections.
6. **Membership.** Restyle Pricing to the live layout and copy (free 30-day trial).
7. **Resources and articles.**
   - Featured item, Live Events (external RSVP link), Articles with Load More, and On Demand Videos with paging.
   - Article detail at `/post/:slug`. Seed the 9 current article titles and slugs.
8. **About, Contact, FAQ, legal pages.** About gets the name-meaning section. Contact uses the live five-field form, wired to `routes/contact.js`. FAQ becomes its own page. Terms and Privacy share one template with a category sidebar.
9. **Video detail.** `/demands-videos/:slug` shows the title, description, and thumbnail, with the player for logged-in members and a sign-up CTA for everyone else. This fixes what's broken on the live site.
10. **SEO.** Match the live `<title>` and meta description for each page (in the audit table data above). Add titles for the pages the live site leaves as "mavuus".
11. **Side-by-side QA.** Compare each page against the reference screenshots at 1440px and 390px. Fix any copy, order, or spacing mismatches. Log the result in `CHANGELOG.md`.

## Open questions for the founders

- Can we reuse the live photos, logos, and testimonial headshots, or should we use placeholders?
- Should "Log in" and "Sign Up" keep pointing at the separate `app.mavuus.com`, or move to this build's `/login` and `/register`? This plan assumes our own.
- Do events stay on `event.mavuus.com`, or move into our events pages?

## Prompt (paste into Claude Code from the repo root)

```
Read mavuus-app/plans/WEBSITE-1TO1-REBUILD.md and CLAUDE.md. Rebuild the public website to match https://www.mavuus.com 1:1, following the plan's steps in order with one commit per step on a feat/ branch. Start with step 1 (reference capture) and step 2 (global foundation), run /verify, and show me before/after screenshots before moving on to the page steps.
```
