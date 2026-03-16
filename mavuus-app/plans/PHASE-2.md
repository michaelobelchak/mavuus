# Phase 2: Complete Remaining Incomplete Pages

## What Changed
Phase 4 and 5 of the existing build already completed most of what was originally planned here:
- ✅ SessionDetailPage — built with register button
- ✅ ResourceDetailPage — built with blog-style layout
- ✅ VendorDetailPage — built with job cross-links, reviews, recommendations
- ✅ Reviews system — built (reviewer→reviewee with vendor_id and job_id support)
- ✅ Recommendations — built with routes and notifications

## What Still Needs To Be Done

```
Read the project at this directory. This is a React + Vite + Tailwind frontend with an Express + SQLite backend. Several detail pages were already built in previous phases. Complete the remaining gaps:

1. SESSION DETAIL PAGE — ENHANCEMENTS:
   The page exists but check if these are missing:
   - Related Sessions section (3 cards of sessions in same category, excluding current)
   - Speaker bio section (separate from the session description)
   - For on-demand sessions: video embed area (YouTube/Vimeo iframe or HTML5 video if video_url exists)
   - Breadcrumbs: Dashboard > Live Sessions > [Session Title]
   If any of these already exist, skip them. Only add what's missing.

2. RESOURCE DETAIL PAGE — ENHANCEMENTS:
   The page exists but check if these are missing:
   - Bookmark functionality:
     - Add to schema.sql: CREATE TABLE IF NOT EXISTS bookmarks (id INTEGER PRIMARY KEY, user_id INTEGER, resource_id INTEGER, created_at TEXT DEFAULT CURRENT_TIMESTAMP, UNIQUE(user_id, resource_id))
     - Add to server/routes/resources.js: POST /:id/bookmark (toggle), GET /bookmarked (list user's bookmarks)
     - Bookmark icon button on the page
   - Related Resources section (3 cards in same category)
   - Breadcrumbs
   Only add what's missing.

3. VENDOR DETAIL PAGE — ENHANCEMENTS:
   The page exists with reviews and recommendations already. Check if these are missing:
   - Breadcrumbs: Dashboard > Search for Vendors > [Vendor Name]
   - Portfolio / case studies section (placeholder for future content)
   Only add what's missing.

4. BLOG DETAIL PAGE (src/pages/public/BlogDetailPage.jsx):
   This page is still minimal. Build it properly:
   - Fetch article data by slug from mockData
   - Hero: large thumbnail, title, author name + avatar, date, read time
   - Full article body with rich typography
   - Author bio card at bottom
   - Related articles: 3 cards of other articles
   - Breadcrumbs: Home > Resources > [Article Title]
   - Use PublicLayout (not dashboard layout)

5. CONTACT FORM BACKEND:
   - Add to schema.sql: CREATE TABLE IF NOT EXISTS contact_submissions (id INTEGER PRIMARY KEY, name TEXT, email TEXT, phone TEXT, message TEXT, status TEXT DEFAULT 'new', created_at TEXT DEFAULT CURRENT_TIMESTAMP)
   - Create server/routes/contact.js: POST /api/contact (validate fields, insert, return success)
   - Register route in server/index.js
   - Update src/pages/public/ContactPage.jsx to POST to /api/contact instead of just showing client-side success
   - Show proper loading state during submission and error handling

6. COMMENTS SYSTEM (if not already built — check first):
   - Check if a comments table and routes already exist. If NOT:
   - Create table: comments (id, entity_type TEXT, entity_id INTEGER, user_id INTEGER, content TEXT, parent_id INTEGER NULL for replies, created_at TEXT)
   - Create server/routes/comments.js: GET /api/comments?entity_type=session&entity_id=1, POST /api/comments, DELETE /api/comments/:id
   - Create reusable CommentSection.jsx component
   - Add to SessionDetailPage, ResourceDetailPage, VendorDetailPage

7. VERIFY:
   - Navigate to each detail page, verify all sections render
   - Test bookmark toggle on a resource (if newly added)
   - Test contact form submission
   - Test comments on a session page (if newly added)
   - No console errors
```

## Acceptance Criteria
- [x] Session detail has related sessions, video area for on-demand, breadcrumbs
- [x] Resource detail has bookmark functionality, related resources, breadcrumbs
- [x] Blog detail page renders full article with author info and related articles
- [x] Contact form submits to backend and stores in database
- [x] Comments system works (if it didn't already exist)
