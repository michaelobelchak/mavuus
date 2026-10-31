## Summary

<1 to 3 bullets: what changed and why>

## Plan

Plan file: <mavuus-app/plans/... or N/A>

## Verification

- [ ] `cd mavuus-app/client && npx vite build` passes
- [ ] `cd mavuus-app/server && npm test` passes
- [ ] `cd mavuus-app/client && npx eslint . --max-warnings 0` passes
- [ ] UI checked in the browser (desktop and mobile width), if UI changed

## Checklist

- [ ] `CHANGELOG.md` updated
- [ ] Schema changes mirrored in `seed.js` and `seed-demo.js`
- [ ] No secrets, `.env` files, or `*.db` files committed
- [ ] Brand tokens from `index.css` used instead of raw hex values
- [ ] Server routes validate input and use parameterized SQL
