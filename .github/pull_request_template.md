## Summary

<1 to 3 bullets: what changed and why>

## Plan

Plan file: <mavuus-app/plans/... or N/A>

## Verification

- [ ] `cd mavuus-app/client && npx vite build` passes
- [ ] `cd mavuus-app/server && npm test` passes
- [ ] `cd mavuus-app/client && npx vitest run` passes
- [ ] `cd mavuus-app/client && npx eslint . --max-warnings 0` passes
- [ ] `cd mavuus-app/client && npm run guard` passes (`lint:ds` and `check:stories`)
- [ ] `cd mavuus-app/client && npm run build-storybook` passes (if components or stories changed)
- [ ] `cd mavuus-app/client && npm run e2e` passes
- [ ] UI checked in the browser (desktop and mobile width), if UI changed

## Checklist

- [ ] `CHANGELOG.md` updated
- [ ] Schema changes mirrored in `seed.js` and `seed-demo.js`
- [ ] No secrets, `.env` files, or `*.db` files committed
- [ ] Role token classes from `design-system/tokens` (no raw hex or arbitrary px)
- [ ] Server routes validate input and use parameterized SQL
