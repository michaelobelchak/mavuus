# Mavuus design system

Tokens, primitives, patterns and organisms for the whole product. Design: `mavuus-app/plans/2026-11-06-design-system-design.md`.

## Conventions

- **Folder per component:** `primitives/Button/{Button.jsx, Button.test.jsx, Button.stories.jsx, index.js}`. Each tier has a barrel (`primitives/index.js`); add every new component to it.
- **Variants** use `cva` from `class-variance-authority`. Put the `cva` call in its own file (`buttonVariants.js`) when it's exported, so the component file only exports components (react-refresh lint).
- **Class merging** goes through `cn()` from `lib/cn.js`. It's `twMerge(clsx(inputs))` with our theme keys registered, so `cn('p-ds-md', 'p-ds-lg')` keeps `p-ds-lg` and `cn('text-body', 'text-text-primary')` keeps both.
- **Refs:** `ref` is a normal prop (React 19). No `forwardRef`.
- **Props:** take `className` (merged last with `cn`) and spread the remaining props onto the root element.
- **Interactive parts** with focus, keyboard or layering logic (menus, dialogs, popovers, tooltips) use Base UI (`@base-ui/react`).
- **Stories:** Storybook 10 CSF3, `export default { title: 'Primitives/Button', component: Button, tags: ['autodocs'] }`, one named export per variant or state.
- **Tests:** test behavior that matters (roles, aria, callbacks, keyboard). Name them "should ... when ...".
- **Focus:** the global navy `:focus-visible` outline in `index.css` handles visible focus. Don't add `outline-none`.
- **Touch targets:** the md size of any control is at least 44px tall.
- **Motion:** every animation or transition that moves things gets `motion-reduce:` handling.
- **Styling:** only token classes. No hex values, no arbitrary px values. Tailwind numeric sizes (`h-12`, `size-4`) are fine for fixed control heights and icon sizes.

## Token classes

| Kind | Classes |
|---|---|
| Color | `bg-surface-*`, `text-text-*`, `border-border-*`, `bg-status-*` and `-subtle`, `text-status-*`, `*-chart-*` |
| Spacing | `p-ds-*`, `m-ds-*`, `gap-ds-*` (`none`, `xxs`, `xs`, `sm`, `md`, `lg`, `xl`, `xxl`, `section`) |
| Radius | `rounded-tag`, `-input`, `-control`, `-card`, `-sheet`, `-panel`, `-chip` (4, 8, 12, 16, 24, 32, pill) |
| Type | `text-caption`, `-body-sm`, `-body`, `-lead`, `-h4`, `-h3`, `-h2`, `-h1`, `-display` (sizes with line heights) |
| Shadow | `shadow-card`, `-card-hover`, `-float`, `-overlay`, `-button-brand` |
| Easing | `ease-enter`, `ease-exit`, `ease-move` |

Role variables such as `--text-primary` live in `:root`, not in Tailwind's font-size namespace (`--text-*` in `@theme`). Tailwind sees them through `--color-text-primary`, so the class is `text-text-primary`. `text-body` is a font size, `text-text-primary` is a color.

Tokens come from `tokens/tokens.json`. Run `npm run tokens` after editing it. The drift test fails when `tokens.css` or `tokens.js` is stale, and `lib/cn.test.js` fails when a new theme key isn't registered in `lib/twMergeConfig.js`.
