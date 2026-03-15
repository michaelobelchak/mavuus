# Mavuus - Custom React Rebuild: Project Plan

## Goal
Rebuild Mavuus.com as a custom React application to demonstrate to the founders (Dilya & Elmira Abushayeva) why they should migrate from Webflow to a custom-built platform, especially to support their dashboard/member portal.

---

## What We're Building

### Public Website (4 pages)
1. **Homepage** - Hero section, trusted brands logos, testimonials carousel, marketing leaders grid, stats cards, CTA banner, footer
2. **About Page** - Founder story, team grid, mission section, stats, testimonials
3. **Pricing Page** - Pro Access plan ($9.25/mo yearly), feature checklist, monthly/yearly toggle
4. **Contact Page** - Contact form (textarea + inputs), FAQ accordion section

### Authentication
5. **Login/Sign-up** - Split screen layout: left side testimonial + company logos, right side login form with email/password + Google Sign-in option

### Dashboard/Platform (8 sidebar pages)
6. **Home (Academy)** - Filter tabs, upcoming live sessions, on-demand videos, community resources, past speakers (all in card grids)
7. **Live Sessions** - Dedicated live sessions listing
8. **On-Demand Videos** - Video library with categories
9. **Community Resources** - Articles/guides grid
10. **Meet The Members** - Member directory with profiles
11. **Search for Vendors** - Vendor marketplace with search/filter
12. **Search for Jobs** - Job listings
13. **My Jobs** - User's applied/saved jobs

---

## Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| **Frontend** | React + Vite | Fast dev, modern tooling |
| **Styling** | Tailwind CSS | Matches Figma output, rapid styling |
| **Routing** | React Router v6 | Client-side navigation |
| **Database** | SQLite + better-sqlite3 | Real SQL database, single file, easy to upgrade later |
| **Backend** | Express.js | Lightweight API server |
| **Auth** | JWT tokens | Simple auth for demo |
| **State** | React Context + hooks | Keep it simple |

---

## Design System (extracted from Figma)

### Colors
- **Brand Pink:** `#F26D92` (primary CTA, highlights)
- **Brand Blue:** `#1F648D` (headings, secondary)
- **Dark Blue:** `#1C2232` (text, nav)
- **Neutral 600:** `#353B45` (body text)
- **Neutral 500:** `#595F6C` (secondary text)
- **Neutral 300:** `#A9AEBA` (borders, placeholders)
- **Background:** `#F5F8FE` (light sections)
- **White:** `#FFFFFF`

### Typography
- **Headings:** Manrope (SemiBold, 18-42px)
- **Body:** Manrope (Light/Medium, 14-20px)
- **UI Elements:** Fixel Display (Regular/Medium, 14-16px)

### Components
- Rounded buttons (16px radius for CTA, 32px for pill buttons)
- Card layouts with subtle borders
- Circular avatar images
- Pink CTA buttons with subtle shadow
- Dark outlined secondary buttons

---

## Project Structure

```
mavuus-app/
├── client/                    # React frontend
│   ├── public/
│   │   └── assets/           # Images, logos, icons
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/       # Header, Footer, Sidebar, DashboardLayout
│   │   │   ├── ui/           # Button, Card, Input, Avatar, Accordion
│   │   │   └── sections/     # Hero, Testimonials, LogoBar, CTABanner, Stats
│   │   ├── pages/
│   │   │   ├── public/       # Home, About, Pricing, Contact
│   │   │   ├── auth/         # Login, Register
│   │   │   └── dashboard/    # Academy, LiveSessions, OnDemand, Resources,
│   │   │                     # Members, Vendors, Jobs, MyJobs
│   │   ├── context/          # AuthContext, UserContext
│   │   ├── hooks/            # useAuth, useFetch
│   │   ├── data/             # Mock data (seed data for SQLite)
│   │   ├── styles/           # Global styles, Tailwind config
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
├── server/                    # Express backend
│   ├── db/
│   │   ├── schema.sql        # SQLite schema
│   │   └── seed.sql          # Sample data
│   ├── routes/
│   │   ├── auth.js           # Login, register, JWT
│   │   ├── sessions.js       # Live & on-demand sessions
│   │   ├── resources.js      # Community resources
│   │   ├── members.js        # Member directory
│   │   ├── vendors.js        # Vendor marketplace
│   │   └── jobs.js           # Job listings
│   ├── middleware/
│   │   └── auth.js           # JWT verification
│   ├── index.js
│   └── package.json
└── README.md
```

---

## Database Schema (SQLite)

### Users
- id, email, password_hash, name, title, company, avatar_url, role (member/admin), membership_tier, created_at

### Sessions (Live + On-Demand)
- id, title, description, speaker_name, speaker_title, speaker_avatar, thumbnail_url, type (live/on-demand), category, scheduled_date, duration, video_url, created_at

### Resources
- id, title, description, author, thumbnail_url, category, type (article/guide/template), read_time, url, created_at

### Vendors
- id, user_id, company_name, description, categories, rating, reviews_count, location, website, created_at

### Jobs
- id, title, company, description, location, type (full-time/contract/freelance), category, salary_range, posted_by, created_at

### Speakers
- id, name, title, company, avatar_url, bio, linkedin_url

### Recommendations
- id, from_user_id, to_user_id, vendor_id, message, created_at

---

## Implementation Phases

### Phase 1: Foundation (Session 1)
- [ ] Initialize React + Vite project with Tailwind
- [ ] Set up Express server with SQLite
- [ ] Create database schema and seed data
- [ ] Build reusable UI components (Button, Card, Input, Avatar)
- [ ] Build layout components (PublicHeader, Footer, DashboardSidebar)
- [ ] Set up React Router with all routes

### Phase 2: Public Website (Session 2)
- [ ] Homepage with all sections
- [ ] About page
- [ ] Pricing page with toggle
- [ ] Contact page with form + FAQ accordion
- [ ] Shared components: LogoBar, Testimonials, CTABanner

### Phase 3: Auth + Dashboard Shell (Session 3)
- [ ] Login page (split screen design)
- [ ] Register page
- [ ] JWT auth flow (login, register, protected routes)
- [ ] Dashboard layout (top nav + sidebar + content area)
- [ ] Academy/Home page with all card sections

### Phase 4: Dashboard Pages (Session 4)
- [ ] Live Sessions page
- [ ] On-Demand Videos page
- [ ] Community Resources page
- [ ] Meet The Members page
- [ ] Search for Vendors page
- [ ] Search for Jobs + My Jobs pages

### Phase 5: Polish & Demo Prep (Session 5)
- [ ] Responsive adjustments
- [ ] Loading states and transitions
- [ ] Search functionality
- [ ] Filter functionality
- [ ] Final visual QA against Figma

---

## Key Selling Points for the Demo

When presenting to the Mavuus founders, emphasize:

1. **Dashboard is impossible in Webflow** - The member portal with sidebar navigation, dynamic content, user profiles, and data-driven cards can't be done properly in Webflow
2. **Real database** - Members, vendors, sessions, and jobs are stored in a real database, not Webflow CMS which has strict limits
3. **Custom auth** - Proper login/signup flow with JWT, Google OAuth ready
4. **Scalability** - SQLite can be swapped for PostgreSQL when they go production. Express can scale horizontally
5. **SEO + Performance** - Could add SSR with Next.js for the public pages
6. **Cost** - No Webflow subscription. Host frontend on Vercel (free), backend on Railway (free tier)
7. **Full control** - Custom recommendation engine, vendor matching, job board logic that Webflow can't handle

---

## Hosting Recommendation (for demo)

- **Frontend:** Vercel (free) - deploy React app
- **Backend:** Railway (free tier) - deploy Express + SQLite
- **Production upgrade path:** Vercel + Railway with PostgreSQL, or AWS/GCP

---

## Notes

- Figma assets expire in 7 days - we should download all images during build
- Fonts needed: Manrope (Google Fonts), Fixel Display (need to source or substitute)
- The design uses a 1440px desktop layout - we'll focus on desktop first since this is a demo
- Mock data should feel realistic (real-looking names, companies, session topics)
