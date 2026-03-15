# Mavuus Phase 3: Interactive Platform Features
## Comprehensive Implementation Plan

> **Date:** March 7, 2026
> **Status:** Planning — Pending Approval
> **Scope:** User Profiles, Member Discovery & Connection, Messaging, Jobs System

---

## Table of Contents
1. [Executive Summary](#1-executive-summary)
2. [Current State Assessment](#2-current-state-assessment)
3. [Feature Breakdown](#3-feature-breakdown)
4. [New Database Tables Required](#4-new-database-tables-required)
5. [New API Endpoints Required](#5-new-api-endpoints-required)
6. [New UI Components Required](#6-new-ui-components-required)
7. [New Pages Required](#7-new-pages-required)
8. [Implementation Phases](#8-implementation-phases)
9. [Technical Decisions](#9-technical-decisions)

---

## 1. Executive Summary

Phase 3 transforms Mavuus from a static demo into a functional interactive platform. Four major feature areas will be implemented:

| Feature Area | Description |
|---|---|
| **User Profiles** | Full profile pages with bio, skills, experience, resume, billing info, account settings |
| **Member Discovery** | Click on any member to view their profile, see their skills/experience, connect with them |
| **Messaging** | Real-time chat between connected members |
| **Jobs System** | View job details, apply for jobs, post new jobs, track applications |

---

## 2. Current State Assessment

### What Already Works
- Authentication (JWT login/register/logout with AuthContext)
- 8 dashboard pages with search + filter UI
- Members listing page (6 mock members, search/filter working)
- Jobs listing page (3 mock jobs, search/filter + bookmark working)
- 7 database tables (users, sessions, resources, vendors, jobs, speakers, recommendations)
- 12 API endpoints (all GET, no auth middleware applied)
- Full public site (Homepage, About, Pricing, Contact, Resources, Articles, Events, Blog Detail)

### What's Completely Missing
- **No profile page** — no way to view or edit your own profile
- **No member detail page** — clicking on a member goes nowhere
- **No messaging system** — no chat UI, no conversations, no messages table
- **No job detail page** — clicking on a job goes nowhere
- **No job application flow** — "Apply" button is non-functional
- **No job posting** — users cannot create jobs
- **No connection system** — "Connect" button is non-functional
- **No notification system** — bell icon shows hardcoded "3"
- **No settings page** — no account management, no preferences
- **Auth middleware not applied** — all API endpoints are public

### Components That Don't Exist Yet (Needed)
- Modal / Dialog
- Tabs (generic)
- Toast / Notification system
- File Upload (avatar, resume)
- Select / Dropdown
- Toggle / Switch
- Pagination
- Empty State (reusable)
- Rich Text area (for job descriptions)
- Tag / Chip Input (for skills)

---

## 3. Feature Breakdown

### 3A. User Profile System

#### My Profile Page (`/dashboard/profile`)
Users can view and edit their own profile with these sections:

**Profile Header**
- Avatar (uploadable image or initials fallback)
- Name, title, company
- Location, timezone
- Member since date, membership tier badge
- Edit profile button

**About Tab**
- Bio / summary (editable text area, 500 char limit)
- Industry (dropdown select)
- Years of experience
- LinkedIn URL
- Website URL
- Skills / expertise tags (add/remove chips: e.g. "Brand Strategy", "SEO", "Content Marketing")
- Interests / topics tags

**Experience Tab**
- Job history entries (company, title, date range, description)
- Add / edit / delete entries
- Resume / CV upload (PDF, stored as file reference)
- Education (optional)

**Account Tab**
- Email (display, with change option)
- Password change form
- Notification preferences (toggle switches)
- Profile visibility (public to all members / connections only / private)
- Delete account (with confirmation)

**Billing Tab**
- Current plan display (Pro / Free)
- Plan details and renewal date
- Upgrade/downgrade button (links to pricing page for now)
- Payment method placeholder (display only — actual payment processing out of scope)
- Billing history placeholder

#### Public Member Profile Page (`/dashboard/members/:id`)
When viewing another member's profile:
- Same header layout but with "Connect" / "Message" buttons instead of "Edit"
- About section (bio, skills, industry, experience)
- Experience section (job history, but NOT resume — that's private)
- Connection status: "Connect" / "Pending" / "Connected"
- If connected: "Message" button opens chat
- No access to their Account or Billing tabs

---

### 3B. Member Discovery & Connections

#### Enhanced Members Page (`/dashboard/members`)
- Current search + tier filter (keep as-is)
- **Add**: Click on any member card → navigates to `/dashboard/members/:id`
- **Add**: Connection status shown on card (Connected / Pending / Connect)
- **Add**: "Message" icon next to connected members

#### Connection System
- Send connection request (from member profile or member card)
- Accept / decline incoming requests
- View pending requests (incoming + outgoing)
- Remove connection
- Connection count displayed on profiles

#### New Sidebar Items
- Add "My Profile" link in sidebar (or accessible from top-bar avatar dropdown)
- Add "Messages" link in sidebar
- Add "Settings" link in sidebar (or merge into Profile page's Account tab)

---

### 3C. Messaging System

#### Messages Page (`/dashboard/messages`)
Split-panel layout:

**Left Panel — Conversation List**
- List of all conversations sorted by most recent message
- Each row shows: avatar, name, last message preview (truncated), timestamp, unread badge
- Search conversations by member name
- "New Message" button to start a conversation with a connection

**Right Panel — Chat Window**
- Message thread with sender/receiver bubble styling
- Messages show: text content, timestamp, read status
- Input area at bottom with text field + send button
- Auto-scroll to newest message
- Empty state when no conversation selected

**Technical approach:**
- Polling-based (fetch new messages every 5 seconds) — simpler than WebSockets for a demo
- Messages stored in database with conversation grouping
- Unread count shown on sidebar "Messages" nav item

---

### 3D. Jobs System

#### Job Detail Page (`/dashboard/jobs/:id`)
Clicking on any job in the jobs listing opens a full detail page:

**Job Header**
- Job title, company name, company logo placeholder
- Location, job type, salary range
- Posted date, posted by (member link)
- "Apply" button (or "Applied" status if already applied)
- "Save" bookmark toggle

**Job Body**
- Full description (rich text)
- Requirements list
- Responsibilities list
- Benefits list
- Skills / tags

**Sidebar**
- Company info card
- "Other Jobs from [Company]" (if any)
- "Similar Jobs" (same category)

#### Apply for Job Flow
- Click "Apply" on job detail page → opens modal
- Application form: cover letter text area, resume upload (or use profile resume), optional LinkedIn URL
- Submit → creates application record
- Status tracking: Applied → Reviewing → Interview → Offer / Rejected
- View all my applications in "My Jobs" page

#### Post a Job (`/dashboard/my-jobs`)
Transform "My Jobs" page from empty placeholder to functional page with tabs:

**Tab 1: My Applications**
- List of jobs I've applied to
- Each row: job title, company, applied date, status badge
- Click to view job detail
- Withdraw application option

**Tab 2: My Saved Jobs**
- List of bookmarked jobs (connected to JobsPage bookmark feature)
- Remove from saved
- Click to view job detail

**Tab 3: My Postings** (for users who post jobs)
- List of jobs I've posted
- Each row: job title, applicant count, status (active/closed), posted date
- "Post New Job" button → opens job creation form
- Click to view applicants

**Post New Job Form** (modal or full page)
- Job title
- Company (pre-filled from profile)
- Location
- Job type (dropdown: Full-time, Part-time, Contract, Remote, Freelance)
- Category (dropdown)
- Salary range
- Description (text area)
- Requirements (text area or bullet list)
- Skills tags
- Preview before posting
- Submit → creates job in database

---

## 4. New Database Tables Required

### `user_profiles` (extends users table)
```sql
CREATE TABLE user_profiles (
  user_id INTEGER PRIMARY KEY REFERENCES users(id),
  bio TEXT,
  industry TEXT,
  years_experience INTEGER,
  linkedin_url TEXT,
  website_url TEXT,
  location TEXT,
  timezone TEXT,
  resume_filename TEXT,
  resume_url TEXT,
  profile_visibility TEXT DEFAULT 'public' CHECK(profile_visibility IN ('public', 'connections', 'private')),
  notification_email BOOLEAN DEFAULT 1,
  notification_messages BOOLEAN DEFAULT 1,
  notification_connections BOOLEAN DEFAULT 1,
  notification_jobs BOOLEAN DEFAULT 1,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### `user_skills`
```sql
CREATE TABLE user_skills (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  skill TEXT NOT NULL,
  UNIQUE(user_id, skill)
);
```

### `user_experience`
```sql
CREATE TABLE user_experience (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  company TEXT NOT NULL,
  title TEXT NOT NULL,
  start_date TEXT,
  end_date TEXT,
  is_current BOOLEAN DEFAULT 0,
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### `connections`
```sql
CREATE TABLE connections (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  requester_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  receiver_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'accepted', 'declined')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(requester_id, receiver_id)
);
```

### `conversations`
```sql
CREATE TABLE conversations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### `conversation_participants`
```sql
CREATE TABLE conversation_participants (
  conversation_id INTEGER REFERENCES conversations(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  last_read_at DATETIME,
  PRIMARY KEY (conversation_id, user_id)
);
```

### `messages`
```sql
CREATE TABLE messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  conversation_id INTEGER REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id INTEGER REFERENCES users(id),
  content TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### `job_applications`
```sql
CREATE TABLE job_applications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  job_id INTEGER REFERENCES jobs(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  cover_letter TEXT,
  resume_filename TEXT,
  resume_url TEXT,
  status TEXT DEFAULT 'applied' CHECK(status IN ('applied', 'reviewing', 'interview', 'offer', 'rejected', 'withdrawn')),
  applied_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(job_id, user_id)
);
```

### `saved_jobs`
```sql
CREATE TABLE saved_jobs (
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  job_id INTEGER REFERENCES jobs(id) ON DELETE CASCADE,
  saved_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, job_id)
);
```

### `notifications`
```sql
CREATE TABLE notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT,
  link TEXT,
  is_read BOOLEAN DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**Total: 10 new tables** (in addition to existing 7 = 17 total)

---

## 5. New API Endpoints Required

### Auth (update existing)
| Method | Endpoint | Description |
|--------|----------|-------------|
| — | All protected routes | Apply `authenticateToken` middleware |

### Profile Endpoints (NEW)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/profile/me` | Yes | Get current user's full profile |
| PUT | `/api/profile/me` | Yes | Update profile fields (bio, industry, etc.) |
| POST | `/api/profile/avatar` | Yes | Upload avatar image |
| POST | `/api/profile/resume` | Yes | Upload resume PDF |
| GET | `/api/profile/me/skills` | Yes | Get my skills list |
| POST | `/api/profile/me/skills` | Yes | Add a skill |
| DELETE | `/api/profile/me/skills/:skill` | Yes | Remove a skill |
| GET | `/api/profile/me/experience` | Yes | Get my experience entries |
| POST | `/api/profile/me/experience` | Yes | Add experience entry |
| PUT | `/api/profile/me/experience/:id` | Yes | Update experience entry |
| DELETE | `/api/profile/me/experience/:id` | Yes | Delete experience entry |

### Members Endpoints (NEW)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/members/:id/profile` | Yes | Get full public profile of a member |

### Connection Endpoints (NEW)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/connections/request` | Yes | Send connection request |
| PUT | `/api/connections/:id/accept` | Yes | Accept connection request |
| PUT | `/api/connections/:id/decline` | Yes | Decline connection request |
| DELETE | `/api/connections/:id` | Yes | Remove connection |
| GET | `/api/connections` | Yes | List my connections |
| GET | `/api/connections/pending` | Yes | List pending requests (incoming + outgoing) |
| GET | `/api/connections/status/:userId` | Yes | Check connection status with specific user |

### Messaging Endpoints (NEW)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/conversations` | Yes | List my conversations |
| POST | `/api/conversations` | Yes | Start a new conversation |
| GET | `/api/conversations/:id/messages` | Yes | Get messages in a conversation |
| POST | `/api/conversations/:id/messages` | Yes | Send a message |
| PUT | `/api/conversations/:id/read` | Yes | Mark conversation as read |
| GET | `/api/messages/unread-count` | Yes | Get total unread message count |

### Job Endpoints (NEW + update existing)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/jobs` | Yes | Create/post a new job |
| PUT | `/api/jobs/:id` | Yes | Update a job I posted |
| DELETE | `/api/jobs/:id` | Yes | Delete a job I posted |
| POST | `/api/jobs/:id/apply` | Yes | Apply to a job |
| GET | `/api/jobs/:id/applicants` | Yes | Get applicants for my job posting |
| GET | `/api/jobs/my-applications` | Yes | Get all my job applications |
| GET | `/api/jobs/my-postings` | Yes | Get all jobs I've posted |
| POST | `/api/jobs/:id/save` | Yes | Save/bookmark a job |
| DELETE | `/api/jobs/:id/save` | Yes | Unsave a job |
| GET | `/api/jobs/saved` | Yes | Get my saved jobs |
| PUT | `/api/applications/:id/status` | Yes | Update application status (for job poster) |

### Notification Endpoints (NEW)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/notifications` | Yes | Get my notifications |
| PUT | `/api/notifications/:id/read` | Yes | Mark single notification as read |
| PUT | `/api/notifications/read-all` | Yes | Mark all as read |
| GET | `/api/notifications/unread-count` | Yes | Get unread notification count |

**Total: ~40 new API endpoints**

---

## 6. New UI Components Required

### Priority 1 — Needed for multiple features
| Component | Used By | Description |
|-----------|---------|-------------|
| **Modal** | Jobs, Profile, Connections | Dialog overlay with close button, backdrop, animations |
| **Tabs** | Profile, My Jobs | Horizontal tab bar with active state, renders tab content |
| **Toast** | All features | Floating notification (success/error/info) with auto-dismiss |
| **EmptyState** | All features | Reusable illustration + heading + message + optional CTA |
| **Pagination** | Members, Jobs | Page numbers or load-more button for lists |

### Priority 2 — Needed for specific features
| Component | Used By | Description |
|-----------|---------|-------------|
| **FileUpload** | Profile, Jobs | Drag-and-drop or click-to-upload with preview, progress |
| **Select** | Profile, Job Posting | Styled dropdown select with search |
| **Toggle** | Profile Settings | On/off switch for preferences |
| **TagInput** | Profile (skills), Jobs | Add/remove tag chips with autocomplete |
| **StatusBadge** | Jobs, Connections | Extended Badge with job/connection status colors |
| **ConfirmDialog** | Connections, Jobs | "Are you sure?" modal variant |

### Priority 3 — Messaging-specific
| Component | Used By | Description |
|-----------|---------|-------------|
| **ChatBubble** | Messages | Sender/receiver styled message bubble with timestamp |
| **ConversationItem** | Messages | Row in conversation list (avatar, name, preview, time) |
| **ChatInput** | Messages | Text input with send button at bottom of chat |
| **UnreadBadge** | Sidebar, Messages | Numeric badge for unread count |

---

## 7. New Pages Required

| Page | Route | Description |
|------|-------|-------------|
| **ProfilePage** | `/dashboard/profile` | My profile (view + edit, tabbed) |
| **MemberProfilePage** | `/dashboard/members/:id` | View another member's profile |
| **MessagesPage** | `/dashboard/messages` | Split-panel chat interface |
| **ConversationPage** | `/dashboard/messages/:id` | Active conversation (or part of MessagesPage) |
| **JobDetailPage** | `/dashboard/jobs/:id` | Full job posting detail view |
| **MyJobsPage** (rebuild) | `/dashboard/my-jobs` | Tabbed: My Applications / Saved Jobs / My Postings |
| **PostJobPage** | `/dashboard/my-jobs/post` | Job creation form (or modal within MyJobsPage) |

**Existing pages that need updates:**
| Page | Changes |
|------|---------|
| **MembersPage** | Member cards become clickable, show connection status |
| **JobsPage** | Job cards become clickable (link to detail), save state persisted to API |
| **DashboardSidebar** | Add Messages, My Profile navigation items |
| **DashboardLayout** | Avatar dropdown menu (Profile, Settings, Logout), live notification count, functional search |

---

## 8. Implementation Phases

### Phase 3A: Foundation (Estimated: 1 session)
**Goal:** Build the shared infrastructure everything else depends on.

1. **Database migration** — Create all 10 new tables, update seed data
2. **Apply auth middleware** — Protect all dashboard API endpoints
3. **Build shared components** — Modal, Tabs, Toast, EmptyState, Pagination, Toggle, Select, TagInput, FileUpload, ConfirmDialog
4. **Update DashboardSidebar** — Add Messages + My Profile nav items
5. **Update DashboardLayout** — Avatar dropdown menu, functional notification count

### Phase 3B: User Profiles (Estimated: 1 session)
**Goal:** Users can view and edit their full profile.

1. **Profile API endpoints** — CRUD for profile, skills, experience, avatar/resume upload
2. **ProfilePage** — Tabbed page (About, Experience, Account, Billing)
3. **Profile editing** — Inline edit forms, skills tag management, experience CRUD
4. **Avatar upload** — Image upload with preview
5. **Resume upload** — PDF upload with filename display
6. **Account settings** — Password change, notification toggles, visibility

### Phase 3C: Member Discovery & Connections (Estimated: 1 session)
**Goal:** Users can view other members' profiles, connect, and manage connections.

1. **Connection API endpoints** — Request, accept, decline, remove, list
2. **MemberProfilePage** — Public profile view with Connect/Message buttons
3. **Update MembersPage** — Clickable cards, connection status badges
4. **Connection management** — Pending requests UI (in profile or separate section)
5. **Notification generation** — Create notifications on connection events

### Phase 3D: Messaging (Estimated: 1 session)
**Goal:** Connected members can chat in real time.

1. **Messaging API endpoints** — Conversations CRUD, messages, read status
2. **MessagesPage** — Split-panel layout with conversation list + chat window
3. **Chat components** — ChatBubble, ConversationItem, ChatInput
4. **Polling for new messages** — 5-second interval fetch
5. **Unread badges** — Sidebar badge, conversation list badges
6. **New message from profile** — "Message" button on member profiles starts a conversation

### Phase 3E: Jobs System (Estimated: 1 session)
**Goal:** Users can view job details, apply, post jobs, and track everything.

1. **Job detail API** — Extended job info, applicant management
2. **JobDetailPage** — Full detail view with Apply button
3. **Application flow** — Apply modal with cover letter + resume
4. **Saved jobs** — Persist bookmarks to database
5. **MyJobsPage rebuild** — 3-tab layout (Applications, Saved, My Postings)
6. **Post a Job** — Job creation form with preview
7. **Application management** — Job posters can review applicants and update status

---

## 9. Technical Decisions

### File Upload Strategy
- Store files in `/server/uploads/` directory (avatars, resumes)
- Use `multer` middleware for Express
- Serve files statically via Express
- Limit: avatars 2MB (jpg/png), resumes 5MB (pdf)

### Real-time Messaging
- **Polling** (not WebSockets) — simpler for a demo, no additional infrastructure
- Fetch new messages every 5 seconds when chat is open
- Fetch unread count every 30 seconds when on any dashboard page

### State Management
- Continue using React Context for auth
- Add a `NotificationContext` for unread counts (notifications + messages)
- Individual pages manage their own state with `useState` + `useApiData`
- No global state library needed (Redux/Zustand overkill for this scope)

### Navigation Updates
The dashboard sidebar will have these items after Phase 3:
```
Home (Academy)
Live Sessions
On-Demand Videos
Community Resources
───────────────
Meet The Members
Search for Vendors
───────────────
Search for Jobs
My Jobs
───────────────
Messages (with unread badge)
My Profile
```

### Seed Data Additions
- Add 5-10 more mock members with varied profiles, skills, and experience
- Add 3-5 mock conversations with message history
- Add 5-8 more jobs with full descriptions
- Add sample connection relationships between seed users
- Add sample job applications

---

## Summary

| Category | Count |
|----------|-------|
| New database tables | 10 |
| New API endpoints | ~40 |
| New UI components | ~16 |
| New pages | 7 |
| Updated pages | 4 |
| Implementation phases | 5 (3A through 3E) |

This plan transforms Mavuus from a marketing site with a static dashboard into a functional community platform where members can build profiles, discover and connect with peers, communicate via chat, and participate in the job marketplace.
