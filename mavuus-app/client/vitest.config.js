import path from 'node:path'
import { configDefaults, defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// Date output depends on the time zone, so tests run in UTC unless TZ is set on purpose
// (TZ=Pacific/Kiritimati npx vitest run checks the zone-proof date tests).
process.env.TZ ||= 'UTC'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, 'src'),
    },
  },
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.{js,jsx}', 'scripts/**/*.test.mjs', '.storybook/**/*.test.jsx'],
    // Playwright owns e2e/; vitest must never pick up its specs.
    exclude: [...configDefaults.exclude, 'e2e/**'],
    setupFiles: ['./src/test/setup.js'],
    passWithNoTests: true,
  },
})
