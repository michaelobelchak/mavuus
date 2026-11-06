import { defineConfig, devices } from '@playwright/test'
import { E2E_DB_PATH } from './e2e/global-setup.js'

// Dedicated ports keep e2e apart from the dev servers on 3001 and 5180.
const API_PORT = 3101
const WEB_PORT = 5181

export default defineConfig({
  testDir: 'e2e',
  outputDir: 'test-results',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  timeout: 60_000,
  use: {
    baseURL: `http://localhost:${WEB_PORT}`,
    trace: 'retain-on-failure',
    // Optional: point at an already-downloaded Chromium instead of the revision this Playwright
    // version expects (CI runs `npx playwright install` and leaves this unset).
    launchOptions: process.env.PLAYWRIGHT_CHROMIUM_PATH ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH } : {},
  },
  projects: [
    { name: 'setup', testMatch: /auth\.setup\.js/ },
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      dependencies: ['setup'],
    },
  ],
  webServer: [
    {
      // Resets and seeds db/e2e.db, then starts the API on its own port and database.
      command: 'node ../client/e2e/global-setup.js && node index.js',
      cwd: '../server',
      url: `http://localhost:${API_PORT}/api/health`,
      reuseExistingServer: !process.env.CI,
      timeout: 60_000,
      env: {
        PORT: String(API_PORT),
        DB_PATH: E2E_DB_PATH,
        API_RATE_LIMIT_MAX: '100000',
        AUTH_RATE_LIMIT_MAX: '100000',
      },
    },
    {
      command: `npx vite --port ${WEB_PORT} --strictPort`,
      url: `http://localhost:${WEB_PORT}`,
      reuseExistingServer: !process.env.CI,
      timeout: 60_000,
      env: { VITE_API_TARGET: `http://localhost:${API_PORT}` },
    },
  ],
})
