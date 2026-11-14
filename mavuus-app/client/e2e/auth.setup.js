// Logs in once through the UI as the seeded demo admin and saves the session for the
// member and admin smoke tests.
import { expect, test as setup } from '@playwright/test'
import { DEMO_STATE } from './helpers.js'

setup('log in as the demo user', async ({ page }) => {
  await page.goto('/login')
  await page.getByPlaceholder('you@company.com').fill('demo@mavuus.com')
  await page.getByPlaceholder('Enter your password').fill('demo123')
  await page.getByRole('button', { name: 'Sign In', exact: true }).click()
  await expect(page).toHaveURL(/\/dashboard$/)
  await expect(page.locator('main')).toBeVisible()
  await page.context().storageState({ path: DEMO_STATE })
})
