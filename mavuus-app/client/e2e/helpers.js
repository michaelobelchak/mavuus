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

/**
 * Collects the problems a page should never have: uncaught errors, console errors from the app,
 * and /api responses of 500 or more. Allowed: the 401 from /api/auth/me when logged out, and
 * failed loads of third-party resources (live Webflow CDN images and fonts, avatars) when offline.
 */
export function watchPage(page) {
  const problems = []
  page.on('pageerror', (error) => problems.push(`page error: ${error.message}`))
  page.on('console', (message) => {
    if (message.type() !== 'error') return
    const text = message.text()
    const source = message.location()?.url || ''
    if (text.startsWith('Failed to load resource')) {
      if (!isLocal(source)) return
      if (/\/api\/auth\/me(\?|$)/.test(source) && text.includes('401')) return
      // /api failures are reported once by the response listener below.
      if (/\/api\//.test(source) && !/status of 5\d\d/.test(text)) return
    }
    problems.push(`console error: ${text}${source ? ` (${source})` : ''}`)
  })
  page.on('response', (response) => {
    const url = response.url()
    if (isLocal(url) && new URL(url).pathname.startsWith('/api/') && response.status() >= 500) {
      problems.push(`api ${response.status()}: ${response.request().method()} ${url}`)
    }
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
  await page.waitForLoadState('networkidle').catch(() => {})
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
