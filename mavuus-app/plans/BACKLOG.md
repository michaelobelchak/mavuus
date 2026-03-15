# Backlog: Future Features

These features are deferred for now. Prioritize after Phases 1-7 are complete.

---

## High Priority Backlog

### Mobile App (React Native)
- iOS/Android app sharing the same Express API
- Priority screens: Login, Academy, Members, Messages, Profile
- Push notifications for messages and connection requests
- Estimated effort: 4-6 weeks

### Payment / Billing (Stripe)
- Stripe integration for Pro membership ($9.25/mo yearly, higher monthly)
- Subscription management: upgrade, downgrade, cancel
- Invoice history
- Free trial period (30 days)
- Webhook handling for payment events
- Estimated effort: 2-3 sessions

### Email Service Integration
- Choose provider: Resend, SendGrid, or AWS SES
- Transactional emails: verification, password reset, welcome
- Notification emails: new message, connection request, job application
- Email templates with Mavuus branding
- Unsubscribe handling
- Replace all console.log verification links with actual emails
- Estimated effort: 1-2 sessions

### AI-Powered Matching & Recommendations
- Smart vendor recommendations based on user profile and activity
- "People you may know" member suggestions
- Job recommendations based on skills and experience
- Content recommendations based on viewing history
- Could use OpenAI API or build simple collaborative filtering
- Estimated effort: 2-3 sessions

---

## Medium Priority Backlog

### Gamification System
- Points for activity: posting, commenting, connecting, attending sessions
- Levels: Newcomer, Active, Contributor, Expert, Leader
- Badges: "First Connection", "10 Sessions Attended", "Top Reviewer"
- Leaderboard page
- Show level badge on member profiles
- Estimated effort: 2 sessions

### Skill Endorsements
- Members can endorse each other's skills (like LinkedIn)
- Endorsement count shown on skills in profile
- "Top endorsed for: [skill]" badge
- Estimated effort: 1 session

### Event RSVP + Calendar Integration
- Calendar view of upcoming live sessions
- Add to Google Calendar / iCal button
- Email reminders before sessions (15 min, 1 day)
- Attendance tracking post-event
- Estimated effort: 1 session

### Content Creation Tools
- Members can publish articles (rich text editor)
- Draft/publish workflow
- Article moderation by admin
- Author analytics (views, bookmarks)
- Estimated effort: 2 sessions

### Advanced Analytics Dashboard (Members)
- Profile view count
- Connection growth over time
- Content engagement metrics
- Job post performance
- Estimated effort: 1-2 sessions

### Real-time Features
- WebSocket support for messages (replace polling)
- Typing indicators
- Online status (green dot)
- Read receipts
- Estimated effort: 1-2 sessions

---

## Low Priority Backlog

### White-Label / Branding
- Allow organizations to create branded sub-communities
- Custom colors, logos, domain
- Estimated effort: Very large

### Integrations Marketplace
- HubSpot integration
- Salesforce integration
- Slack notifications
- Zapier / Make.com webhooks
- Estimated effort: 2-4 sessions per integration

### In-Person Event Management
- Event creation with location
- Ticket management
- Check-in system
- Event photos/recap page
- Estimated effort: 2-3 sessions

### Course / Cohort System
- Multi-lesson courses
- Cohort-based learning with deadlines
- Progress tracking
- Certificate generation
- Estimated effort: 3-4 sessions

### Advanced Search
- Elasticsearch or Meilisearch for full-text search
- Faceted filters
- Search analytics
- Autocomplete suggestions
- Estimated effort: 2 sessions

### Multi-language Support (i18n)
- React i18n setup
- English + additional languages
- RTL support
- Estimated effort: 2-3 sessions

---

## Technical Backlog

| Item | Priority | Effort |
|------|----------|--------|
| Migrate SQLite to PostgreSQL | High (before production) | 1 session |
| Add Redis for session caching | Medium | 1 session |
| Set up CI/CD (GitHub Actions) | Medium | 1 session |
| Add E2E tests (Playwright) | Medium | 2 sessions |
| Add Storybook for component docs | Low | 1 session |
| Database migration system (knex or prisma) | Medium | 1 session |
| Audit trail / activity logging | Low | 1 session |
| CDN for static assets | Low | 0.5 session |
| SSR with Next.js (for SEO on public pages) | Low | Large migration |
