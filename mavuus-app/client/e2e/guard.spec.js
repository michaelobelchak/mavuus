// Checks the third-party request guard in helpers.js itself: a public page that asks for an
// outside asset must be reported, even from a host that member pages may still use. Runs in the
// offline project too ("public pages" in the title), where the request is also aborted.
import { expect } from '@playwright/test'
import { PENDING_HOSTS, test, watchPage } from './helpers.js'

const outside = (host) => `https://${host}/guard-check.png`

async function requestImage(page, src) {
  // The test never needs the real file: answer outside requests here (the offline project has
  // already aborted them by then).
  await page.route((url) => url.hostname !== 'localhost', (route) => route.abort('blockedbyclient').catch(() => {}))
  await page.evaluate((url) => {
    const img = document.createElement('img')
    img.src = url
    document.body.append(img)
  }, src)
  await page.waitForTimeout(300)
}

test.describe('public pages: third-party guard', () => {
  test('reports any outside request on a public page', async ({ page }) => {
    const problems = watchPage(page)
    await page.goto('/faq')
    await requestImage(page, outside('example.com'))
    expect(problems).toEqual([`third-party request: GET ${outside('example.com')}`])
  })

  test('reports a host that only member pages may use', async ({ page }) => {
    const problems = watchPage(page)
    await page.goto('/faq')
    await requestImage(page, outside(PENDING_HOSTS[0]))
    expect(problems).toEqual([`third-party request: GET ${outside(PENDING_HOSTS[0])}`])
  })

  test('lets a page that opts in use a pending host', async ({ page }) => {
    const problems = watchPage(page, { allowHosts: PENDING_HOSTS })
    await page.goto('/faq')
    await requestImage(page, outside(PENDING_HOSTS[0]))
    expect(problems).toEqual([])
  })
})
