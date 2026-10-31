---
description: Run the Mavuus verification gate for the current branch.
---

Run these in order. Stop on the first failure.

1. Client build: `cd mavuus-app/client && npx vite build`
2. Server tests: `cd mavuus-app/server && npm test`
3. Client lint (advisory): `cd mavuus-app/client && npx eslint <changed client files>`. The repo has pre-existing lint debt, so only problems in files this branch changed count. Get the list with `git diff --name-only main...HEAD -- mavuus-app/client/src`.
4. If the change touched the UI, start `mavuus-client` and `mavuus-server` from `.claude/launch.json` and check the affected pages in the browser, logged in as the demo user if needed.

Report pass or fail for each step with the relevant output. Don't commit anything.
