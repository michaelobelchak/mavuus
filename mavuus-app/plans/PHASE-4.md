# Phase 4: File Uploads & Media

## Goal
Add file upload support for avatars, resumes, and thumbnails. Add video playback for on-demand sessions.

## Claude Code Prompt

```
Read the project at this directory. This is a React + Vite + Tailwind frontend with an Express + SQLite backend. Add file upload support:

1. UPLOAD INFRASTRUCTURE:
   - cd server && npm install multer
   - Create server/uploads/ directory (add to .gitignore)
   - Create server/middleware/upload.js:
     - Configure multer with disk storage
     - Save to server/uploads/ with unique filenames (uuid + original extension)
     - Separate configs: imageUpload (max 5MB, jpeg/png/gif/webp) and documentUpload (max 10MB, pdf/doc/docx)
   - Add to server/index.js: serve static files from /uploads
     - app.use('/uploads', express.static(path.join(__dirname, 'uploads')))
   - Create generic upload endpoint in server/routes/profile.js:
     - POST /api/upload/avatar — imageUpload middleware, returns { url: '/uploads/filename.jpg' }
     - POST /api/upload/resume — documentUpload middleware, returns { url: '/uploads/filename.pdf' }

2. PROFILE AVATAR UPLOAD:
   - Update ProfilePage About tab:
     - Add clickable avatar with camera/edit overlay icon
     - On click, open file picker (accept="image/*")
     - Upload to POST /api/upload/avatar
     - On success, update user avatar_url via PUT /api/profile/me
     - Show upload progress or loading spinner
     - Preview image before confirming
   - Update AuthContext to refresh user data after avatar change

3. RESUME UPLOAD:
   - Update ProfilePage:
     - Add "Upload Resume" button in About tab (below skills section)
     - Upload to POST /api/upload/resume
     - Store URL in user_profiles.resume field via PUT /api/profile/me
     - Show current resume filename with download link if exists
     - Allow replacing existing resume
   - Update JobDetailPage apply modal:
     - If user has a resume on profile, show "Use profile resume" option
     - Also allow uploading a new resume for this application
     - Store resume URL in job_applications table (update schema if needed: add resume_url column)
   - Update job applicant view (MyJobsPage):
     - Show "Download Resume" link for each applicant that has one

4. SESSION/RESOURCE ADMIN ENDPOINTS (prep for Phase 6 admin panel):
   - Add to server/routes/sessions.js (require auth):
     - POST / — create session (with thumbnail upload via imageUpload middleware)
     - PUT /:id — update session (with optional thumbnail upload)
     - DELETE /:id — delete session
   - Add to server/routes/resources.js (require auth):
     - POST / — create resource (with thumbnail upload)
     - PUT /:id — update resource
     - DELETE /:id — delete resource
   - For now, any authenticated user can use these (Phase 6 will restrict to admin)

5. VIDEO PLAYER:
   - Create src/components/ui/VideoPlayer.jsx:
     - Accept videoUrl prop
     - If URL contains 'youtube.com' or 'youtu.be': render YouTube iframe embed
     - If URL contains 'vimeo.com': render Vimeo iframe embed
     - If URL ends in .mp4/.webm: render HTML5 <video> element with controls
     - If no URL: render a placeholder card with play icon and "Video coming soon" text
     - Responsive: 16:9 aspect ratio container
   - Add VideoPlayer to SessionDetailPage:
     - Show above the session details for on-demand sessions
     - For live sessions, show a "Live session — join at scheduled time" banner instead
   - Track views:
     - Add PUT /api/sessions/:id/view endpoint (increments views column, debounce: only count once per user per session)
     - Call it when video starts playing or when on-demand page loads

6. VERIFY:
   - Upload a profile avatar, verify it shows in sidebar and profile page
   - Upload a resume, verify it's downloadable from profile
   - Apply to a job with resume, verify employer can see it in applicant list
   - Create a session via API (use curl or frontend if available)
   - Test video player with a YouTube URL
   - Test video player with no URL (placeholder)
   - No console errors
```

## Acceptance Criteria
- [ ] Avatar upload works: select image, preview, upload, see it everywhere
- [ ] Resume upload works: upload from profile, use in job applications, downloadable
- [ ] Session/resource CRUD endpoints exist and work
- [ ] Video player renders YouTube, Vimeo, HTML5, and placeholder states
- [ ] View tracking increments on session page load
- [ ] Upload files are served correctly from /uploads
