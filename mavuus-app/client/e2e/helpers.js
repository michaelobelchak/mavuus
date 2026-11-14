import { expect } from '@playwright/test'

export const DEMO_STATE = 'e2e/.auth/demo.json'
export const WIDTHS = [1440, 1024, 768, 390]

function isLocal(url) {
  try {
    const { hostname } = new URL(url)
    return hostname === 'localhost' || hostname === '127.0.0.1'
  } catch {
    return true
  }
}

const AUTH_ME = /^\/api\/auth\/me$/

/**
 * Collects the problems a page should never have: uncaught errors, console errors from the app,
 * /api responses of 400 or more, and failed requests to the app's own origin. The only allowed
 * /api error is the 401 from /api/auth/me when logged out.
 *
 * Intentional deviation: failed loads from third-party hosts (live Webflow CDN images and fonts,
 * pravatar avatars) are ignored, so the suite passes offline and isn't flaky on external CDNs.
 */
export function watchPage(page) {
  const problems = []
  page.on('pageerror', (error) => problems.push(`page error: ${error.message}`))
  page.on('console', (message) => {
    if (message.type() !== 'error') return
    const text = message.text()
    const source = message.location()?.url || ''
    // Resource failures are reported by the response and requestfailed listeners below, which
    // see the URL and status; the browser's console line for them adds nothing.
    if (text.startsWith('Failed to load resource')) return
    problems.push(`console error: ${text}${source ? ` (${source})` : ''}`)
  })
  page.on('response', (response) => {
    const url = response.url()
    if (!isLocal(url)) return
    const { pathname } = new URL(url)
    if (!pathname.startsWith('/api/') || response.status() < 400) return
    if (response.status() === 401 && AUTH_ME.test(pathname)) return
    problems.push(`api ${response.status()}: ${response.request().method()} ${url}`)
  })
  page.on('requestfailed', (request) => {
    const url = request.url()
    if (!isLocal(url)) return
    // Navigating away aborts in-flight requests; that isn't a failure of the page.
    if (request.failure()?.errorText === 'net::ERR_ABORTED') return
    problems.push(`request failed: ${request.method()} ${url} (${request.failure()?.errorText})`)
  })
  return problems
}

/**
 * Returns the outermost visible elements whose right edge is past the viewport. Overflow hidden
 * by the page layout (an ancestor that contains <main>, like PublicLayout's overflow-x-clip
 * wrapper) still counts. Skipped: elements inside a clipping or scrolling ancestor below the
 * layout (carousels, marquees, table scrollers), elements marked data-overflow-ok, hidden
 * elements, and fixed elements parked fully off screen (closed drawers).
 */
export function findOverflow(page) {
  return page.evaluate(() => {
    const limit = window.innerWidth + 1
    const main = document.querySelector('main')
    const offenders = []
    const intentionallyClipped = (el) => {
      for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) {
        if (main && p.contains(main)) return false
        if (getComputedStyle(p).overflowX !== 'visible') return true
      }
      return false
    }
    const isFixed = (el) => {
      for (let p = el; p && p !== document.body; p = p.parentElement) {
        if (getComputedStyle(p).position === 'fixed') return true
      }
      return false
    }
    for (const el of document.querySelectorAll('body *')) {
      const rect = el.getBoundingClientRect()
      if (rect.width === 0 || rect.height === 0 || rect.right <= limit) continue
      if (offenders.some((o) => o.el.contains(el))) continue
      if (el.closest('[data-overflow-ok]')) continue
      // Opacity is ignored on purpose: scroll reveals start transparent and become visible.
      if (!el.checkVisibility({ visibilityProperty: true })) continue
      // A closed off-canvas drawer parks a fixed element fully past the right edge; fixed
      // elements don't make the page scroll, so only count them when part of them is on screen.
      if (rect.left >= limit - 2 && isFixed(el)) continue
      if (intentionallyClipped(el)) continue
      offenders.push({ el, right: Math.round(rect.right) })
    }
    return offenders.slice(0, 5).map(({ el, right }) => {
      const id = el.id ? `#${el.id}` : ''
      const cls = typeof el.className === 'string' && el.className ? `.${el.className.trim().split(/\s+/).slice(0, 6).join('.')}` : ''
      const text = (el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 40)
      return `<${el.tagName.toLowerCase()}${id}${cls}> right=${right}px "${text}"`
    })
  })
}

/**
 * Visits `path` at one width: checks the page's main content renders, takes a full-page
 * screenshot to e2e/screenshots/<name>-<width>.png, checks there is no horizontal overflow
 * (the document doesn't scroll sideways and no element sticks out past the viewport, even where
 * the layout clips it) and that the page logged no errors.
 */
export async function checkPage(page, { name, path, width, ready }) {
  const problems = watchPage(page)
  await page.setViewportSize({ width, height: 900 })
  await page.goto(path)
  await ready(page)
  await page.waitForLoadState('networkidle', { timeout: 5_000 }).catch(() => {})
  await page.screenshot({ path: `e2e/screenshots/${name}-${width}.png`, fullPage: true, animations: 'disabled' })
  const { scrollWidth, innerWidth } = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    innerWidth: window.innerWidth,
  }))
  const offenders = await findOverflow(page)
  expect
    .soft(scrollWidth, `${name} at ${width}px scrolls sideways: ${offenders.join('; ')}`)
    .toBeLessThanOrEqual(innerWidth)
  expect.soft(offenders, `${name} at ${width}px has elements past the right edge`).toEqual([])
  expect(problems, `${name} at ${width}px had errors`).toEqual([])
}
