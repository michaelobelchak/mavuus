# Claude Code Prompt: Final Polish Before Client Demo

> Copy this entire file and paste it into Claude Code as your prompt.
> Run this AFTER PROMPT-FIX-EVERYTHING, PROMPT-FIGMA-REBUILD, and PROMPT-MODERN-DESIGN are done.

---

You're working on the Mavuus app at `mavuus-app/`. It's a B2B marketing community platform - React 19 + Vite + Tailwind CSS v4 frontend, Express.js + SQLite backend. The app is substantially complete after three rounds of work. This is the final polish pass before a client presentation to the founders (Dilya and Elmira Abushayeva).

Your job: lock in the demo. Fix the build, verify every flow works, catch anything embarrassing.

## Step 1: Fix the broken build

Run this first so `npm run build` and production preview work:

```bash
cd mavuus-app/client
rm -rf node_modules package-lock.json
npm install
npm run build
```

If the build fails with anything other than the rollup `@rollup/rollup-linux-arm64-gnu` issue, stop and fix it. That rollup error is a known npm bug solved by the clean install above. Any OTHER error (missing imports, syntax errors, type errors) is a real problem.

After build succeeds, run `npm run preview` to sanity-check the production bundle loads.

## Step 2: Verify seed data is rich enough for a demo

Empty states in a demo feel unfinished. Check the database has enough content.

```bash
cd mavuus-app/server
node db/seed.js
```

Then verify with a quick SQL check (use better-sqlite3 in a Node REPL or write a small script):

Required minimums:
- Sessions: at least 6 live + 6 on-demand
- Resources: at least 10 articles/guides/templates
- Members: at least 15 with avatars and bios
- Vendors: at least 8 with ratings
- Jobs: at least 8 in various states (open, in-progress, completed)
- Speakers: at least 6
- Testimonials: at least 3 on public pages
- Demo user (demo@mavuus.com) has: 5+ connections, 3+ conversations with messages, 2+ saved jobs, 1+ job application, filled profile with skills and experience, uploaded resume

If anything is short, add more seed entries in `server/db/seed.js` and reseed.

## Step 3: Add double-submit protection to forms

All forms should disable the submit button while the request is in flight. Go through these files and make sure the submit button is disabled based on a `loading` or `submitting` state:

- `client/src/pages/public/ContactPage.jsx` (contact form)
- `client/src/pages/auth/LoginPage.jsx` (login form)
- `client/src/pages/auth/RegisterPage.jsx` (register form)
- `client/src/pages/dashboard/SessionDetailPage.jsx` (session registration)
- `client/src/pages/dashboard/JobDetailPage.jsx` (apply to job modal)
- `client/src/pages/dashboard/MessagesPage.jsx` (send message)
- `client/src/pages/dashboard/ProfilePage.jsx` (save profile, add skill, add experience)
- `client/src/pages/dashboard/VendorDetailPage.jsx` (write review, recommend)
- Any modal with a form (review modal, recommend modal, confirmation dialogs)

Pattern:
```jsx
const [submitting, setSubmitting] = useState(false);

async function handleSubmit(e) {
  e.preventDefault();
  if (submitting) return;
  setSubmitting(true);
  try {
    // fetch call
  } finally {
    setSubmitting(false);
  }
}

<Button type="submit" disabled={submitting}>
  {submitting ? 'Sending...' : 'Send'}
</Button>
```

## Step 4: Hide or remove non-functional UI

Scan every page for buttons or links that don't actually do something useful. In a founder demo, a "coming soon" toast or a button that goes nowhere reads as unfinished.

Specifically:
- **Google OAuth buttons** on LoginPage.jsx and RegisterPage.jsx - currently show "coming soon" toasts. Either:
  - Option A: Remove the buttons entirely (cleanest for demo)
  - Option B: Actually wire them up using the passport-google-oauth20 setup from Phase 5
  - Default to Option A unless Google OAuth credentials are already in the env

- Any "Forgot Password?" link - verify the password reset flow from Build Phase 3 actually works end-to-end. If not, either fix it or remove the link.

- Any social share buttons on ShareModal - verify each one opens the correct share URL. Remove any that don't work.

- Check ProfilePage "Billing" tab - if it's a placeholder, either hide the tab or fill it with a clean "Pro Plan - $15/month" summary pulled from the user's membership_tier.

## Step 5: Full demo walkthrough (click every flow)

Run both servers:
```bash
cd mavuus-app/server && node index.js  # or npm start
cd mavuus-app/client && npm run dev
```

Open `http://localhost:5173` and walk through every flow. Report any issue found and fix it before moving on.

**Public site flow:**
1. Homepage loads, hero email captures correctly, CTA goes to register
2. Nav links all work (Home, About, Pricing, Resources, Contact)
3. Pricing toggle works (monthly/yearly)
4. Contact form submits and shows success toast
5. Articles page loads, click article, read full content, prev/next works
6. Events page loads, click event, see registration page

**Auth flow:**
7. Register a brand-new test account - form validates, redirects to dashboard
8. Logout, login with demo@mavuus.com / demo123
9. Demo login button on LoginPage - visibly fills the form

**Dashboard flow:**
10. Dashboard home loads with all 4 sections populated (Upcoming Live, On-Demand, Resources, Past Speakers)
11. Click a live session, click Register, see confetti + "Registered" state
12. Click an on-demand video, video player loads (or placeholder is clean)
13. Resources page: filters work, click a resource, read full content
14. Members page: browse, switch to "My Connections" tab, click a member
15. On a member's profile: send connection request, send message
16. Vendors page: click a vendor, click "Contact Vendor" - opens message thread
17. Jobs page: filters work, click a job, apply with cover letter
18. My Jobs page: see your application in "Applications" tab
19. Messages page: send a message, see it appear, conversation list updates
20. Profile page: edit bio, add skill, add experience, upload avatar, upload resume
21. Notifications: bell shows unread count, click to see notifications, mark read
22. Command palette (press /): search works, results are clickable

**Responsive check:**
23. Open Chrome DevTools, toggle device toolbar, test at 390px (iPhone SE)
24. Verify mobile FAB appears, sidebar collapses, all pages readable
25. Test at 1440px desktop

**Edge cases:**
26. Visit `/dashboard/nonexistent` - friendly 404
27. Try registering with an email that already exists - see specific error
28. Try logging in with wrong password - see specific error
29. Open DevTools Console - should see zero errors and minimal warnings

For each issue found, fix it on the spot before continuing. Don't skip.

## Step 6: Check DevTools for console errors

Open Chrome DevTools Console on every major page and look for:
- Red errors (fix immediately)
- Yellow warnings about React keys, deprecated APIs, or hydration (fix if quick)
- 404s in Network tab for images or API calls (seed data issue or broken link)

Every page should load with zero console errors. Warnings about React DevTools or Tailwind JIT are fine to ignore.

## Step 7: Performance pass

Open Chrome DevTools > Lighthouse. Run a performance audit on:
- Homepage
- Dashboard home (logged in)
- A detail page (e.g., session detail)

Target scores: Performance 80+, Accessibility 90+, Best Practices 90+, SEO 90+.

If Performance is under 80, check:
- Are images lazy-loaded? (Should be via LazyImage component)
- Is code splitting working? (Check Network tab - dashboard pages should be separate chunks)
- Are fonts preloaded? (Manrope should load from Google Fonts)

Don't obsess over 100 scores. 80+ is plenty for a demo.

## Step 8: Visual pass (slow scroll on every page)

Scroll slowly through every public and dashboard page at 1440px width. Look for:
- Jank or layout shift as images load
- Broken image placeholders (means seed data has bad URLs)
- Inconsistent spacing (too tight or too loose)
- Text that's cut off or overflowing containers
- Cards with uneven heights in a row
- Buttons without hover states
- Any element that looks "off" compared to the rest

Fix visual issues immediately. Consistency is what makes an app feel premium.

## Step 9: Write a demo script

Create `mavuus-app/plans/DEMO-SCRIPT.md` with a 5-minute walkthrough the founders should see. Include:

1. Opening: "Here's the live site" - show homepage, mention current Webflow vs this
2. Public site tour: pricing, articles, contact form submit (show success)
3. Sign up flow: register a new account live, see dashboard
4. Dashboard tour: sidebar, 4 content sections, search
5. Community: members directory, send a connection, send a message
6. Marketplace: vendors directory, jobs board, apply to a job
7. Admin preview: log in as admin, show the 22-page admin panel
8. Close: "This is fully custom. You own the code. Here's what Phase 2 adds."

Each step should have 2-3 bullet points of what to say. Keep it tight.

## Step 10: Commit and push

Once everything works and the walkthrough is clean:

```bash
cd /sessions/jolly-epic-fermi/mnt/Mavuus
git add -A
git commit -m "Final polish: build fix, seed data, form protection, demo walkthrough"
git push origin main
```

## Rules

- Don't add new features. This is a polish pass, not a build pass.
- Every fix should be small and targeted
- If you find a bug that takes more than 15 minutes to fix, document it in `plans/KNOWN-ISSUES.md` and move on
- The demo is the priority. Anything not visible in the demo walkthrough can wait for later.
- Test every change by actually clicking through the flow - don't just trust the code reads correctly
