# How Recent Changes Affect the Build Plans

Last updated: 2026-03-15

## Summary

The project has gone through 5 build phases already (Foundation, Public Website, Auth + Interactive Dashboard, Fixes & Polish, Connections/Ratings/Recommendations). Several features our plans originally called for are now already built. All phase plans have been updated accordingly.

---

## Already Built (removed from plans)

| Feature | Built In | Original Plan Phase |
|---------|----------|-------------------|
| Session Detail Page | Phase 4 | Was Phase 2 |
| Resource Detail Page | Phase 4 | Was Phase 2 |
| Vendor Detail Page (with job cross-links) | Phase 4 | Was Phase 2 |
| Reviews system (job + vendor reviews) | Phase 5 | Was Phase 2/3 |
| Recommendations system (routes + UI) | Phase 5 | Was Phase 3 |
| Resume upload (multer, PDF, 5MB) | Phase 5 | Was Phase 4 |
| StarRating, ReviewCard, RecommendationCard | Phase 5 | Was Phase 2 |
| Member privacy (public/connections/private) | Phase 5 | Not planned |
| Job hire flow (status lifecycle + hired_user_id) | Phase 5 | Not planned |
| Rate limiting on auth | Phase 4 (partial) | Was Phase 1 |
| Input sanitization middleware | Phase 4 (partial) | Was Phase 1 |
| Lazy loading | Phase 4 (partial) | Was Phase 7 |

---

## Key Schema Differences From Original Plan

### Jobs table
- **Actual**: `status` = open / in-progress / completed / closed (job lifecycle managed by poster)
- **Actual**: `hired_user_id` = who was hired for the job
- **Plan update**: Admin uses `moderation_status` (approved/hidden/removed) for moderation — separate from lifecycle status

### Reviews table
- **Actual**: `reviewer_id, reviewee_id, vendor_id (optional), job_id (optional), rating, text`
- Supports BOTH job reviews (after hire) AND vendor reviews
- **Plan update**: Admin reviews page handles both types with type filter

### User profiles
- **Actual**: Already has `resume_filename, resume_url` fields
- **Actual**: Already has `profile_visibility` (public/connections/private)

---

## Phase-by-Phase Changes

### Phase 1 (Technical Foundation)
- Added note to check existing rate limiting and sanitization before rebuilding
- Everything else still needed (pagination, server-side search, global search, env config, error boundaries)

### Phase 2 (Complete Pages) — SIGNIFICANTLY REDUCED
- Removed: Session, Resource, Vendor detail pages (already built)
- Removed: Reviews on vendors (already built)
- Changed to: Enhancement-only (bookmarks, related items, breadcrumbs, comments)
- Still needed: Blog detail page, contact form backend, comments system

### Phase 3 (Core Features) — REDUCED
- Removed: Reviews system, recommendations system
- Still needed: Comments, password reset, invite/referral, speakers directory

### Phase 4 (File Uploads) — REDUCED
- Removed: Resume upload (already built)
- Still needed: Image upload infra, avatar upload, video player, session/resource CRUD endpoints

### Phase 5 (Auth Enhancements) — UNCHANGED
- Google OAuth, email verification, security improvements all still needed

### Phase 6 (Admin Panel) — UPDATED FOR SCHEMA
- Jobs: uses `moderation_status` instead of overriding `status`
- Reviews: handles dual-purpose (job + vendor) review structure
- Vendors: uses `moderation_status` instead of `status`
- Everything else unchanged

### Phase 7 (Polish) — PARTIALLY DONE
- Some lazy loading already done — need to verify and complete
- Rate limiting partially done — need to extend to all endpoints
- Everything else still needed (responsive, SEO, tests, deployment)

---

## Remaining Items From Phase 4 Plan (PHASE_4_PLAN.md)

These items from the existing Phase 4 plan are still marked as remaining:
- Messages: verify conversations load (may need re-login)
- Profile: verify data loads after auth fix
- MyJobsPage: verify all 3 tabs work end-to-end
- Visual QA against Figma designs
- Responsive design (mobile/tablet)
- Deployment to Vercel + Railway

These should be addressed before starting our Phase 1, or folded into our Phase 1/7 as applicable.
