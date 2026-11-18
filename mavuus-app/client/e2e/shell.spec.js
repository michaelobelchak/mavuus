// App shell behavior a unit test can't see: with the document scrolling under a sticky top bar,
// keyboard focus moving backwards through a page must never land under the bar
// (WCAG 2.4.11 Focus Not Obscured). styles/app-shell.css pads focus scrolling for this.
import { expect } from '@playwright/test'
import { DEMO_STATE, test } from './helpers.js'

test.use({ storageState: DEMO_STATE })

for (const width of [1440, 390]) {
  test(`Shift+Tab keeps focus clear of the top bar at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    await page.goto('/dashboard/jobs')
    await expect(page.locator('main').getByRole('heading').first()).toBeVisible()
    await page.waitForLoadState('networkidle', { timeout: 5_000 }).catch(() => {})
    // Start from the last control in the page and walk back up.
    await page.evaluate(() => {
      const focusable = [...document.querySelectorAll('#main-content a[href], #main-content button')]
      focusable.at(-1).focus()
    })
    const hidden = []
    let inMain = 0
    for (let step = 0; step < 40; step += 1) {
      await page.keyboard.press('Shift+Tab')
      // html has scroll-behavior: smooth, so wait until the focus scroll has stopped moving.
      await page.evaluate(async () => {
        let last = -1
        let still = 0
        while (still < 4) {
          await new Promise((resolve) => setTimeout(resolve, 50))
          if (window.scrollY === last) still += 1
          else [last, still] = [window.scrollY, 0]
        }
      })
      const state = await page.evaluate(() => {
        const active = document.activeElement
        const main = document.getElementById('main-content')
        const bar = document.querySelector('[data-app-shell] header').getBoundingClientRect()
        const box = active.getBoundingClientRect()
        return {
          inMain: main.contains(active),
          top: Math.round(box.top),
          barBottom: Math.round(bar.bottom),
          name: (active.getAttribute('aria-label') || active.textContent || active.tagName).trim().slice(0, 40),
        }
      })
      if (!state.inMain) break
      inMain += 1
      if (state.top < state.barBottom) hidden.push(`${state.name} top=${state.top} bar=${state.barBottom}`)
    }
    expect(inMain).toBeGreaterThan(5)
    expect(hidden).toEqual([])
  })
}
