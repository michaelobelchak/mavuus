# Design system rules for agents

Read `DESIGN.md` at the repo root for the catalog and `README.md` here for the full conventions.

## Use it

- Import from the tier barrels: `@/design-system/primitives`, `@/design-system/patterns`, `@/design-system/organisms`, `@/design-system/hooks`. Helpers come from their module, like `@/design-system/lib/formatDate`. Inside `src/design-system/`, use relative paths.
- Tokens only: role classes such as `bg-surface-raised`, `text-text-secondary`, `p-ds-lg`, `rounded-card`, `text-body`, `shadow-card`, `z-(--ds-z-modal)`. No hex, no `rgb(`, no arbitrary px, no `style={{ }}` beyond `backgroundImage`, `--custom` properties and `var()` values.
- Pages compose organisms and patterns. Organisms take data as props and never fetch.
- Layering: primitives never import patterns or organisms; patterns never import organisms; organisms never import app `components/`, `context/` or `pages/`. Nothing here imports the retired `components/ui/` or `components/live/`.
- Copy: American English, plain, no em or en dashes.

## Add a component

1. Pick the tier. Make a folder: `primitives/Name/`, `patterns/Name/` or `organisms/<domain>/Name/`.
2. `Name.jsx`: a function component with JSDoc, `className` merged last with `cn()`, other props spread on the root, `ref` as a prop. Variants go in `nameVariants.js` with `cva`.
3. `Name.test.jsx`: behavior that matters (roles, aria, callbacks, keyboard), named "should ... when ...".
4. `Name.stories.jsx`: CSF3, `title: '<Tier>/Name'`, `tags: ['autodocs']`, one export per variant or state.
5. `index.js` in the folder, then add the exports to the tier barrel (`primitives/index.js`, `patterns/index.js` or `organisms/<domain>/index.js`). The barrel test fails if you skip it.
6. New token? Edit `tokens/tokens.json` and run `npm run tokens`. Never edit the generated files.

## Prove it (in `mavuus-app/client`)

- `npx vitest run` - unit tests, barrel tests, token drift test
- `npx eslint . --max-warnings 0`
- `npm run guard` - `lint:ds` (tokens, dashes, layering) and `check:stories`
- `npm run build-storybook`
- `npm run e2e` - Playwright smoke, required when a page changes
