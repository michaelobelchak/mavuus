---
description: Run the Mavuus verification gate for the current branch.
---

Run these in order. Stop on the first failure.

1. Client build: `cd mavuus-app/client && npx vite build`
2. Server tests: `cd mavuus-app/server && npm test`
3. Client unit tests: `cd mavuus-app/client && npx vitest run`
4. Client lint: `cd mavuus-app/client && npx eslint . --max-warnings 0`
5. Design-system guards: `cd mavuus-app/client && npm run guard` (runs `npm run lint:ds`, then `npm run check:stories`)
6. Storybook build, when components or stories changed: `cd mavuus-app/client && npm run build-storybook`
7. If the change touched the UI, start `mavuus-client` and `mavuus-server` from `.claude/launch.json` and check the affected pages in the browser, logged in as the demo user if needed.
8. E2E smoke: `cd mavuus-app/client && npm run e2e` (Playwright starts its own API on 3101 with a fresh `db/e2e.db` and Vite on 5181, so the dev servers and `db/mavuus.db` are untouched; screenshots land in `e2e/screenshots/`). If Playwright's Chromium isn't installed, run `npx playwright install chromium` once.

Report pass or fail for each step with the relevant output. Don't commit anything.
