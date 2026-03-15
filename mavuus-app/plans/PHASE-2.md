# Phase 2: Complete Incomplete Pages

## Goal
Finish all dashboard detail pages that are currently shells. After this phase, every page in the app is fully functional with proper UI and backend support.

## Claude Code Prompt

```
Read the project at this directory. This is a React + Vite + Tailwind frontend with an Express + SQLite backend. Complete these partially-built pages. Match the existing design system: brand-pink (#F26D92) for CTAs, brand-blue (#1F648D) for headings, rounded corners, card-based layouts, Manrope font.

1. SESSION DETAIL PAGE (src/pages/dashboard/SessionDetailPage.jsx):
   - Redesign with a hero section: large thumbnail, title, speaker avatar + name + title, date/time, duration badge, category badge
   - Add RSVP button for live sessions:
     - Add to schema.sql: CREATE TABLE IF NOT EXISTS rsvps (id INTEGER PRIMARY KEY, session_id INTEGER, user_id INTEGER, created_at TEXT DEFAULT CURRENT_TIMESTAMP, UNIQUE(session_id, user_id))
     - Add to server/routes/sessions.js: POST /:id/rsvp (toggle RSVP), GET /:id/rsvps (count + check if current user RSVP'd)
     - Button shows "RSVP'd" state if already registered, with attendee count
   - Add speaker bio section below the main content
   - Add "Related Sessions" section: 3 cards of sessions in the same category (exclude current)
   - For on-demand sessions, show a video embed area (placeholder with play button if no video_url, or an iframe if video_url is a YouTube/Vimeo link)
   - Breadcrumbs: Dashboard > Live Sessions > [Session Title]

2. RESOURCE DETAIL PAGE (src/pages/dashboard/ResourceDetailPage.jsx):
   - Full content rendering with proper typography (headings, paragraphs, lists)
   - Author info section: avatar, name, title
   - Add bookmark functionality:
     - Add to schema.sql: CREATE TABLE IF NOT EXISTS bookmarks (id INTEGER PRIMARY KEY, user_id INTEGER, resource_id INTEGER, created_at TEXT DEFAULT CURRENT_TIMESTAMP, UNIQUE(user_id, resource_id))
     - Add to server/routes/resources.js: POST /:id/bookmark (toggle), GET /bookmarked (list user's bookmarks)
     - Bookmark icon button that toggles state
   - "Related Resources" section: 3 cards in same category
   - Breadcrumbs: Dashboard > Community Resources > [Resource Title]

3. VENDOR DETAIL PAGE (src/pages/dashboard/VendorDetailPage.jsx):
   - Full vendor profile: company logo/avatar, company name, description, categories as badges, location, website link, rating stars display
   - Reviews section:
     - Add to schema.sql: CREATE TABLE IF NOT EXISTS reviews (id INTEGER PRIMARY KEY, vendor_id INTEGER, user_id INTEGER, rating INTEGER CHECK(rating >= 1 AND rating <= 5), comment TEXT, created_at TEXT DEFAULT CURRENT_TIMESTAMP, UNIQUE(vendor_id, user_id))
     - Add to server/routes/vendors.js: GET /:id/reviews, POST /:id/reviews
     - Display existing reviews (avatar, name, star rating, comment, date)
     - "Write a Review" form: star rating selector (1-5 clickable stars) + comment textarea + submit button
     - Only show write form if user hasn't already reviewed
   - "Request Introduction" button:
     - Uses the existing recommendations table
     - Opens a modal with a message textarea
     - POST /api/recommendations creates the record
   - Breadcrumbs: Dashboard > Search for Vendors > [Vendor Name]

4. BLOG DETAIL PAGE (src/pages/public/BlogDetailPage.jsx):
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
   - Show proper loading state during submission
   - Show error message if submission fails

6. VERIFY:
   - Navigate to each detail page and verify all sections render
   - Test RSVP toggle on a live session
   - Test bookmark toggle on a resource
   - Test writing a vendor review (star selection + comment)
   - Test contact form submission
   - Check breadcrumbs work on all detail pages
   - No console errors
```

## Acceptance Criteria
- [ ] Session detail page has hero, RSVP, speaker bio, related sessions, video area
- [ ] Resource detail page has full content, bookmark, author info, related resources
- [ ] Vendor detail page has reviews (read + write), request introduction, full profile
- [ ] Blog detail page renders full article with author info
- [ ] Contact form submits to backend and stores in database
- [ ] All new database tables created and seeded
- [ ] All breadcrumbs functional
