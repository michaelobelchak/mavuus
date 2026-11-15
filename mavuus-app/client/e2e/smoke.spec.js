// Smoke test: every main public, member and admin page renders without errors and without
// horizontal overflow at 1440, 1024, 768 and 390px, and without any request to another host.
// The offline project runs the public pages again with every outside request blocked.
// Screenshots go to e2e/screenshots/.
// These tests only read: they run fully parallel against one seeded database. A spec that
// changes data (posting, applying, editing) must run serially (test.describe.configure({ mode:
// 'serial' })) or reseed, so it can't change what these pages show mid-run.
import { expect } from '@playwright/test'
import { DEMO_STATE, PENDING_HOSTS, WIDTHS, checkPage, test } from './helpers.js'

// First entries of POSTS in src/data/live/posts.js and VIDEOS in src/data/live/videos.js.
const POST_SLUG = 'marketing-ideas-that-delivered-real-results-5-real-life-examples-from-cmos'
const VIDEO_SLUG = 'marketing-ideas-that-delivered-real-results-5-real-life-examples-from-cmos'

const h1Visible = async (page) => {
  await expect(page.locator('h1').first()).toBeVisible()
}

const mainRenders = async (page) => {
  const main = page.locator('main')
  await expect(main).toBeVisible()
  await expect(main.getByRole('heading').first()).toBeVisible()
}

const PUBLIC_PAGES = [
  { name: 'home', path: '/' },
  { name: 'membership', path: '/membership' },
  { name: 'marketing-services', path: '/marketing-services' },
  { name: 'resources', path: '/resources' },
  { name: 'post', path: `/post/${POST_SLUG}` },
  { name: 'video', path: `/demands-videos/${VIDEO_SLUG}` },
  { name: 'about', path: '/about' },
  { name: 'contact', path: '/contact' },
  { name: 'faq', path: '/faq' },
  { name: 'terms', path: '/terms-conditions/introduction' },
  { name: 'articles', path: '/articles' },
  { name: 'events', path: '/events' },
  // The testimonial faces on the auth pages still come from a pending host (see helpers.js).
  { name: 'login', path: '/login', allowHosts: PENDING_HOSTS },
  { name: 'register', path: '/register', allowHosts: PENDING_HOSTS },
]

const MEMBER_PAGES = [
  { name: 'dashboard', path: '/dashboard' },
  // Seeded ids: session 1 is live, session 7 is on demand, resource 2 is a guide with content.
  { name: 'dashboard-live-sessions', path: '/dashboard/live-sessions' },
  { name: 'dashboard-session', path: '/dashboard/live-sessions/1' },
  { name: 'dashboard-on-demand', path: '/dashboard/on-demand' },
  { name: 'dashboard-on-demand-video', path: '/dashboard/on-demand/7' },
  { name: 'dashboard-resources', path: '/dashboard/resources' },
  { name: 'dashboard-resource', path: '/dashboard/resources/2' },
  // Conversation 1 is the demo user's thread with Sarah Chen (seed.js).
  { name: 'dashboard-messages', path: '/dashboard/messages' },
  { name: 'dashboard-messages-thread', path: '/dashboard/messages?conversation=1' },
  { name: 'dashboard-jobs', path: '/dashboard/jobs' },
  // Job 3 is open and posted by someone else, job 8 is the demo user's posting (with seeded
  // applicants) and job 1 is completed, with a hire and reviews.
  { name: 'dashboard-job', path: '/dashboard/jobs/3' },
  { name: 'dashboard-job-mine', path: '/dashboard/jobs/8' },
  { name: 'dashboard-job-completed', path: '/dashboard/jobs/1' },
  { name: 'dashboard-my-jobs', path: '/dashboard/my-jobs' },
  // Member 1 has a full profile; member 17 (seed-demo.js) shows a limited, connections-only one.
  { name: 'dashboard-speakers', path: '/dashboard/speakers' },
  { name: 'dashboard-members', path: '/dashboard/members' },
  { name: 'dashboard-member', path: '/dashboard/members/1' },
  { name: 'dashboard-member-limited', path: '/dashboard/members/17' },
  { name: 'dashboard-vendors', path: '/dashboard/vendors' },
  { name: 'dashboard-vendor', path: '/dashboard/vendors/1' },
  { name: 'dashboard-profile', path: '/dashboard/profile' },
  // The account menu links here.
  { name: 'dashboard-profile-account', path: '/dashboard/profile?tab=account' },
  { name: 'dashboard-invite', path: '/dashboard/invite' },
  { name: 'admin', path: '/admin' },
  { name: 'admin-users', path: '/admin/users' },
  { name: 'admin-jobs', path: '/admin/jobs' },
]

function smoke(pages, ready, { allowHosts = [] } = {}) {
  for (const { name, path, allowHosts: pageHosts = allowHosts } of pages) {
    for (const width of WIDTHS) {
      test(`${name} at ${width}px (${path})`, async ({ page }) => {
        await checkPage(page, { name, path, width, ready, allowHosts: pageHosts })
        // No redirect to /login or elsewhere (a query string in `path` must stay too).
        const url = new URL(page.url())
        expect(url.pathname + url.search).toBe(path)
      })
    }
  }
}

test.describe('public pages', () => {
  smoke(PUBLIC_PAGES, h1Visible)
})

test.describe('member and admin pages', () => {
  test.use({ storageState: DEMO_STATE })
  // Member and admin pages show seed cover photos from a pending host (see helpers.js).
  smoke(MEMBER_PAGES, mainRenders, { allowHosts: PENDING_HOSTS })
})
