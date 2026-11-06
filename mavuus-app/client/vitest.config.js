import path from 'node:path'
import { defineConfig } from 'vitest/config'
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
    setupFiles: ['./src/test/setup.js'],
    passWithNoTests: true,
  },
})
