# Phase 4: File Uploads & Media

## What Changed
- ✅ Resume upload already built (multer, PDF, 5MB max, POST /api/profile/me/resume, DELETE /api/profile/me/resume)
- ✅ Resume fields exist in user_profiles (resume_filename, resume_url) and job_applications (resume_filename, resume_url)

## What Still Needs To Be Done

```
Read the project at this directory. This is a React + Vite + Tailwind frontend with an Express + SQLite backend.

IMPORTANT: Resume upload is ALREADY BUILT via POST /api/profile/me/resume (multer, PDF, 5MB). Do NOT rebuild it. Check existing upload code in server/routes/profile.js before building anything.

Add the remaining file upload features:

1. IMAGE UPLOAD INFRASTRUCTURE:
   - Check if server/middleware/upload.js already exists for image uploads
   - If not, create image upload middleware:
     - Configure multer for images: max 5MB, accept jpeg/png/gif/webp
     - Save to server/uploads/ with unique filenames (uuid + original extension)
     - Add /uploads to .gitignore
   - Ensure server/index.js serves static files: app.use('/uploads', express.static(path.join(__dirname, 'uploads')))
   - Create POST /api/upload/image endpoint — returns { url: '/uploads/filename.jpg' }

2. PROFILE AVATAR UPLOAD:
   - Update ProfilePage:
     - Add clickable avatar with camera/edit overlay icon
     - On click, open file picker (accept="image/*")
     - Upload to POST /api/upload/image
     - On success, update avatar_url via PUT /api/profile/me
     - Show loading spinner during upload
   - Update AuthContext to refresh user data after avatar change so sidebar avatar updates

3. JOB APPLICATION RESUME:
   - Resume upload already exists on profile (POST /api/profile/me/resume)
   - Update JobDetailPage apply modal:
     - If user has a resume on profile, show "Use profile resume" checkbox/option
     - Also allow uploading a different resume for this specific application
     - Store resume_url in job_applications table (fields already exist)
   - Update applicant view in MyJobsPage:
     - Show "Download Resume" link for each applicant that has one

4. SESSION/RESOURCE ADMIN ENDPOINTS (prep for Phase 6):
   - Check if create/update/delete endpoints already exist for sessions and resources
   - If NOT, add to server/routes/sessions.js (require auth for now, Phase 6 will restrict to admin):
     - POST / — create session (support thumbnail_url field)
     - PUT /:id — update session
     - DELETE /:id — delete session
   - Same for server/routes/resources.js:
     - POST / — create resource
     - PUT /:id — update resource
     - DELETE /:id — delete resource

5. VIDEO PLAYER:
   - Create src/components/ui/VideoPlayer.jsx:
     - Accept videoUrl prop
     - If URL contains 'youtube.com' or 'youtu.be': render YouTube iframe embed (extract video ID)
     - If URL contains 'vimeo.com': render Vimeo iframe embed
     - If URL ends in .mp4/.webm: render HTML5 <video> with controls
     - If no URL: render placeholder card with play icon and "Video coming soon"
     - Responsive: 16:9 aspect ratio container
   - Add VideoPlayer to SessionDetailPage:
     - Show for on-demand sessions (where video_url exists)
     - For live sessions: show "Live session — join at scheduled time" banner
   - Track views:
     - Check if PUT /api/sessions/:id/view exists
     - If not, add endpoint that increments views column
     - Call it when video page loads (debounce: only once per user per page load)

6. VERIFY:
   - Upload a profile avatar, verify it shows in sidebar and profile
   - Apply to a job with resume (both "use profile resume" and "upload new")
   - Verify employer can download applicant resume
   - Test video player with a YouTube URL on a session
   - Test video placeholder when no video_url
   - No console errors
```

## Acceptance Criteria
- [ ] Image upload infrastructure works
- [ ] Avatar upload: select, upload, see updated everywhere
- [ ] Job application resume: use profile resume or upload new
- [ ] Session/Resource CRUD endpoints exist
- [ ] Video player renders YouTube, Vimeo, HTML5, and placeholder
- [ ] View tracking works
