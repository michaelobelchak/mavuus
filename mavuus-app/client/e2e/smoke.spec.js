// Smoke test: every main public, member and admin page renders without errors and without
// horizontal overflow at 1440, 1024, 768 and 390px. Screenshots go to e2e/screenshots/.
// These tests only read: they run fully parallel against one seeded database. A spec that
// changes data (posting, applying, editing) must run serially (test.describe.configure({ mode:
// 'serial' })) or reseed, so it can't change what these pages show mid-run.
import { expect, test } from '@playwright/test'
import { DEMO_STATE, WIDTHS, checkPage } from './helpers.js'

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
]

const MEMBER_PAGES = [
  { name: 'dashboard', path: '/dashboard' },
  { name: 'dashboard-messages', path: '/dashboard/messages' },
  { name: 'dashboard-jobs', path: '/dashboard/jobs' },
  { name: 'dashboard-vendors', path: '/dashboard/vendors' },
  { name: 'admin', path: '/admin' },
  { name: 'admin-users', path: '/admin/users' },
  { name: 'admin-jobs', path: '/admin/jobs' },
]

function smoke(pages, ready) {
  for (const { name, path } of pages) {
    for (const width of WIDTHS) {
      test(`${name} at ${width}px (${path})`, async ({ page }) => {
        await checkPage(page, { name, path, width, ready })
        // No redirect to /login or elsewhere.
        expect(new URL(page.url()).pathname).toBe(path)
      })
    }
  }
}

test.describe('public pages', () => {
  smoke(PUBLIC_PAGES, h1Visible)
})

test.describe('member and admin pages', () => {
  test.use({ storageState: DEMO_STATE })
  smoke(MEMBER_PAGES, mainRenders)
})
