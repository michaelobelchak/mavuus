# Phase 7: Polish & Production Prep

## Goal
Make the app production-ready: responsive design, SEO, performance, deployment config, and minimum viable tests.

## Claude Code Prompt

```
Read the project at this directory. This is a React + Vite + Tailwind frontend with an Express + SQLite backend. Final polish and production prep:

1. RESPONSIVE DESIGN AUDIT:
   - Check every page at 3 breakpoints: mobile (375px), tablet (768px), desktop (1440px)
   - Fix these known issues:
     - Dashboard sidebar: make it collapsible on mobile (hamburger menu icon to toggle)
     - Dashboard content: should take full width when sidebar is hidden on mobile
     - All card grids: 1 column on mobile, 2 on tablet, 3-4 on desktop
     - Tables in admin panel: horizontal scroll on mobile
     - Messages page: show conversation list OR thread on mobile (not side-by-side), with back button
     - Profile page tabs: horizontal scroll if too many tabs on mobile
     - Public header: mobile menu already exists, verify it works correctly
   - Test each fix visually

2. LOADING STATES & TRANSITIONS:
   - Add skeleton loading to any pages that don't have them yet (check all dashboard pages)
   - Add page transition: wrap route content in a fade-in animation (CSS transition, 200ms)
   - Add optimistic UI updates:
     - Connection requests: immediately show "Pending" state before API responds
     - Save/unsave jobs: immediately toggle heart/bookmark icon before API responds
     - RSVP: immediately toggle before API responds
   - Revert optimistic updates if API call fails (show toast error)
   - Add loading spinner to all form submit buttons (disable button + show spinner during API call)

3. SEO & META TAGS:
   - cd client && npm install react-helmet-async
   - Wrap App in HelmetProvider
   - Add meta tags to each public page:
     - HomePage: title="Mavuus — The Marketing Community & Marketplace", description, og:image, og:title, og:description
     - AboutPage: title="About Mavuus — Founded by Dilya & Elmira Abushayeva"
     - PricingPage: title="Mavuus Pricing — Pro Access $9.25/month"
     - ContactPage: title="Contact Mavuus"
     - ArticlesPage: title="Mavuus Articles & Insights"
     - EventsPage: title="Mavuus Events"
   - Add canonical URLs
   - Create public/robots.txt:
     User-agent: *
     Allow: /
     Disallow: /dashboard
     Disallow: /admin
     Sitemap: https://mavuus.com/sitemap.xml
   - Create a basic sitemap generation script (scripts/generate-sitemap.js) that outputs public/sitemap.xml with all public page URLs

4. PERFORMANCE OPTIMIZATION:
   - Add React.lazy() + Suspense for all dashboard pages (code splitting):
     - const AcademyPage = React.lazy(() => import('./pages/dashboard/AcademyPage'))
     - Wrap lazy routes in <Suspense fallback={<PageSkeleton />}>
   - Same for admin pages
   - Add loading="lazy" to all <img> tags across the app
   - Add image optimization: create a responsive Image component that uses srcSet if multiple sizes available
   - Review and optimize any large imports (check bundle size with: cd client && npm run build && npx vite-bundle-visualizer)

5. DEPLOYMENT CONFIGURATION:

   SERVER (Railway/Render):
   - Create server/Dockerfile:
     FROM node:18-alpine
     WORKDIR /app
     COPY package*.json ./
     RUN npm ci --production
     COPY . .
     RUN mkdir -p db uploads
     EXPOSE 3001
     CMD ["node", "index.js"]
   - Create server/.dockerignore: node_modules, .env, *.db
   - Update server/index.js:
     - Serve client/dist as static files in production: if (NODE_ENV === 'production') app.use(express.static(path.join(__dirname, '../client/dist')))
     - Add catch-all route for client-side routing: app.get('*', (req, res) => res.sendFile(path.join(__dirname, '../client/dist/index.html')))
   - Update CORS to accept production domain from env var

   CLIENT (Vercel or served from Express):
   - Create client/vercel.json (if deploying separately):
     { "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }
   - Update client/vite.config.js: set base URL from env var
   - Create client/.env.production: VITE_API_URL=https://your-api-domain.com

   COMBINED:
   - Create root package.json with scripts:
     - "build": "cd client && npm run build"
     - "start": "cd server && node index.js"
     - "dev": "concurrently \"cd client && npm run dev\" \"cd server && npm run dev\""
   - Create root .env.example with all env vars documented

6. MINIMUM VIABLE TESTS:
   - cd server && npm install --save-dev jest supertest
   - Create server/tests/auth.test.js:
     - Test POST /api/auth/register with valid data (expect 201, JWT returned)
     - Test POST /api/auth/register with duplicate email (expect 400)
     - Test POST /api/auth/register with invalid email (expect 400)
     - Test POST /api/auth/login with valid credentials (expect 200, JWT returned)
     - Test POST /api/auth/login with wrong password (expect 401)
     - Test GET /api/profile/me without token (expect 401)
     - Test GET /api/profile/me with valid token (expect 200, user data)
   - Create server/tests/jobs.test.js:
     - Test GET /api/jobs (expect 200, array of jobs)
     - Test POST /api/jobs with auth (expect 201)
     - Test POST /api/jobs without auth (expect 401)
     - Test GET /api/jobs/:id (expect 200)
     - Test DELETE /api/jobs/:id as owner (expect 200)
     - Test DELETE /api/jobs/:id as non-owner (expect 403)
   - Create server/tests/connections.test.js:
     - Test POST /api/connections/request (expect 201)
     - Test duplicate connection request (expect 400)
     - Test PUT /api/connections/:id/accept (expect 200)
   - Add to server/package.json: "test": "jest --runInBand --forceExit"
   - Create server/tests/setup.js: use a separate test database, seed before tests, cleanup after
   - Run all tests and fix any failures

7. DEPLOYMENT README:
   - Create DEPLOYMENT.md in project root with step-by-step instructions for:
     - Local development setup
     - Environment variables reference (every .env var with description)
     - Database setup and seeding
     - Running tests
     - Deploying to Railway (server)
     - Deploying to Vercel (client) or combined deployment
     - Google OAuth setup instructions
     - Production checklist (env vars, CORS, JWT secret, etc.)

8. VERIFY:
   - Resize browser to mobile/tablet/desktop and check 5+ pages
   - Verify sidebar collapses on mobile
   - Verify lazy loading works (check network tab for chunk loading)
   - Verify meta tags on public pages (View Source or browser SEO tools)
   - Run: cd client && npm run build (should succeed with no errors)
   - Run: cd server && npm test (all tests should pass)
   - Check robots.txt loads at /robots.txt
   - No console errors anywhere
```

## Acceptance Criteria
- [ ] All pages responsive at mobile/tablet/desktop
- [ ] Sidebar collapses on mobile with hamburger toggle
- [ ] All pages have loading skeletons
- [ ] Optimistic UI on connection requests, saves, RSVPs
- [ ] Meta tags on all public pages
- [ ] robots.txt and sitemap.xml exist
- [ ] Dashboard pages are lazy-loaded (code split)
- [ ] Dockerfile works: docker build, docker run
- [ ] Client builds with no errors
- [ ] 15+ server tests pass
- [ ] DEPLOYMENT.md has clear instructions
