// Resets the e2e database: removes server/db/e2e.db and seeds it fresh, so e2e runs never touch
// the developer's db/mavuus.db. Playwright starts webServer before its globalSetup hook, and the
// API server opens the database on start, so playwright.config.js runs this file as the first
// step of the server's webServer command instead of as globalSetup.
import { execSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

export const E2E_DB_PATH = 'db/e2e.db'
const serverDir = fileURLToPath(new URL('../../server/', import.meta.url))

export default function resetE2eDatabase() {
  const file = path.join(serverDir, E2E_DB_PATH)
  for (const suffix of ['', '-wal', '-shm']) fs.rmSync(`${file}${suffix}`, { force: true })
  const env = { ...process.env, DB_PATH: E2E_DB_PATH }
  // seed.js creates every table and the demo admin; seed-demo.js adds the demo user's
  // conversations, applications and other dashboard data.
  // Keep stderr so a failing seed says why.
  const stdio = ['ignore', 'ignore', 'inherit']
  execSync('node db/seed.js', { cwd: serverDir, env, stdio })
  execSync('node db/seed-demo.js', { cwd: serverDir, env, stdio })
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) resetE2eDatabase()
