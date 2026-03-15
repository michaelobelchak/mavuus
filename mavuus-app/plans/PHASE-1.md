# Phase 1: Technical Foundation

## What Changed
Per the changelog, some items may already be partially done:
- Rate limiting on auth endpoints — partially done (Phase 7 prep)
- Input sanitization — partially done (sanitize.js middleware exists)
- Lazy loading — partially done

Check what exists before rebuilding anything.

## Goal
Fix critical technical issues that will block all future development. After this phase, the app has proper env config, pagination, server-side search, and input validation.

## Claude Code Prompt

```
Read the project at this directory. This is a React + Vite + Tailwind frontend with an Express + SQLite backend.

IMPORTANT: Check what already exists before building. Rate limiting, input sanitization, and lazy loading may be partially implemented. Build on top of what's there.

Fix the following technical issues:

1. ENVIRONMENT VARIABLES:
   - Create a .env file in server/ with: JWT_SECRET, PORT (default 3001), CORS_ORIGIN (default http://localhost:5173), NODE_ENV
   - Create a .env.example with placeholder values
   - Update server/index.js to use these env vars (replace all hardcoded values)
   - Add .env to .gitignore if not already there

2. API PAGINATION (all GET list endpoints):
   - Update these route files to support ?page=1&limit=20 query params:
     - server/routes/sessions.js (GET /)
     - server/routes/resources.js (GET /)
     - server/routes/members.js (GET /)
     - server/routes/vendors.js (GET /)
     - server/routes/jobs.js (GET /)
   - Each should return: { data: [...], total, page, totalPages, limit }
   - Default: page=1, limit=20
   - Update ALL corresponding frontend pages to handle paginated responses:
     - Add "Load More" button or page numbers at bottom of each list page

3. SERVER-SIDE SEARCH:
   - Add ?search=keyword support to all list endpoints above
   - Sessions: search title, description, speaker_name
   - Resources: search title, description, author
   - Members: search name, title, company
   - Vendors: search company_name, description
   - Jobs: search title, company, description
   - Use SQLite LIKE with wildcards: WHERE title LIKE '%keyword%'
   - Update frontend search inputs on each page to debounce (300ms) and call API with search param instead of client-side filtering

4. GLOBAL SEARCH:
   - The search bar in the dashboard top nav (DashboardLayout or DashboardSidebar) is currently non-functional
   - Create GET /api/search?q=keyword endpoint that searches across ALL entity types and returns grouped results: { sessions: [...], resources: [...], members: [...], vendors: [...], jobs: [...] }
   - Limit to 5 results per type
   - Create a SearchResultsDropdown component that shows grouped results below the search bar
   - Clicking a result navigates to the detail page

5. ERROR BOUNDARIES:
   - Create src/components/ErrorBoundary.jsx (class component with componentDidCatch)
   - Show a friendly error message with "Go back" button
   - Wrap the main App routes with it
   - Add individual error boundaries around each dashboard page

6. INPUT VALIDATION (server-side):
   - Auth routes: validate email format (regex), password min 8 chars
   - Profile routes: validate LinkedIn URL format, website URL format
   - Jobs routes: validate required fields have content, salary_range format
   - Add max length checks on all text fields (title: 200, description: 5000, bio: 2000, message: 10000)
   - Return clear 400 error messages for validation failures

7. VERIFY:
   - Run both client (npm run dev) and server (npm run dev)
   - Seed the database: cd server && npm run seed
   - Test login with demo@mavuus.com / demo123
   - Test pagination on at least one list page
   - Test search on at least one list page
   - Test global search bar
   - Verify no console errors
```

## Acceptance Criteria
- [ ] .env file exists and all env vars are used
- [ ] All list endpoints support ?page and ?limit
- [ ] All list endpoints support ?search
- [ ] Global search bar shows grouped results
- [ ] Error boundaries catch and display errors gracefully
- [ ] Invalid inputs return clear 400 errors
- [ ] App runs without console errors
