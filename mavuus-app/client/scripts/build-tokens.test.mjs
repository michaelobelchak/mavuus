// @vitest-environment node
import { describe, it, expect } from 'vitest'
import { buildTokens } from './build-tokens.mjs'

const src = {
  primitive: { color: { pink: { 500: { $value: '#F26D92' } } }, size: { 16: { $value: '16px' } } },
  alias: { space: { md: { $value: '{primitive.size.16}' } } },
  role: { light: { surface: { brand: { $value: '{primitive.color.pink.500}' } } } },
}

const full = {
  primitive: {
    color: { pink: { 500: { $value: '#F26D92' } }, navy: { 900: { $value: '#1C2232' } } },
    size: { 4: { $value: '4px' }, 16: { $value: '16px' } },
  },
  alias: {
    space: { md: { $value: '{primitive.size.16}' } },
    radius: { xs: { $value: '{primitive.size.4}' }, lg: { $value: '{primitive.size.16}' } },
    'font-size': { body: { $value: '{primitive.size.16}' }, h1: { $value: '40px' } },
    'line-height': { body: { $value: '1.6' }, h1: { $value: 1.15 } },
    shadow: { card: { $value: '0 12px 32px rgba(17, 24, 39, 0.06)' } },
    easing: {
      out: { $value: 'cubic-bezier(0.16, 1, 0.3, 1)' },
      in: { $value: 'cubic-bezier(0.4, 0, 1, 1)' },
      'in-out': { $value: 'cubic-bezier(0.65, 0, 0.35, 1)' },
    },
  },
  role: {
    light: {
      surface: { brand: { $value: '{primitive.color.pink.500}' } },
      text: { primary: { $value: '{primitive.color.navy.900}' } },
      chart: {
        10: { $value: '#000010' },
        2: { $value: '#000002' },
        1: { $value: '#000001' },
        grid: { $value: '#eeeeee' },
      },
    },
  },
}

const themeBlock = (css) => css.slice(css.indexOf('@theme inline'))

describe('buildTokens', () => {
  it('should emit primitives, aliases and roles as CSS variables with references', () => {
    const { css } = buildTokens(src)
    expect(css).toContain('--mv-color-pink-500: #F26D92;')
    expect(css).toContain('--ds-space-md: var(--mv-size-16);')
    expect(css).toContain('--surface-brand: var(--mv-color-pink-500);')
  })

  it('should map role tokens into a Tailwind @theme block', () => {
    const { css } = buildTokens(src)
    expect(css).toMatch(/@theme inline \{[^}]*--color-surface-brand: var\(--surface-brand\);/s)
  })

  it('should export resolved values for JavaScript', () => {
    const { js } = buildTokens(src)
    expect(js).toContain('"surface-brand": "#F26D92"')
  })

  it('should throw on a reference that does not exist', () => {
    expect(() =>
      buildTokens({ ...src, alias: { space: { lg: { $value: '{primitive.size.99}' } } } }),
    ).toThrow(/primitive.size.99/)
  })

  it('should throw on a reference cycle', () => {
    expect(() =>
      buildTokens({
        primitive: {},
        alias: { space: { a: { $value: '{alias.space.b}' }, b: { $value: '{alias.space.a}' } } },
        role: { light: {} },
      }),
    ).toThrow(/cycle/i)
  })

  it('should emit a role.dark group as a [data-theme="dark"] block', () => {
    const { css } = buildTokens({
      ...src,
      role: { ...src.role, dark: { surface: { brand: { $value: '#111111' } } } },
    })
    expect(css).toMatch(/\[data-theme="dark"\] \{[^}]*--surface-brand: #111111;/s)
  })

  it('should keep dark values out of the JavaScript map, which holds the light theme only', () => {
    const { js } = buildTokens({
      ...src,
      role: { ...src.role, dark: { surface: { brand: { $value: '#111111' } } } },
    })
    expect(js).toContain('"surface-brand": "#F26D92"')
    expect(js).not.toContain('#111111')
  })

  it('should prefix aliases with ds- so they stay out of Tailwind theme namespaces', () => {
    const { css } = buildTokens(full)
    const root = css.slice(0, css.indexOf('@theme inline'))
    expect(root).toContain('--ds-radius-xs: var(--mv-size-4);')
    expect(root).not.toMatch(/--radius-xs:/)
    expect(root).not.toMatch(/^\s*--shadow-card:/m)
    expect(root).not.toMatch(/^\s*--space-md:/m)
  })

  it('should map space and radius aliases onto collision-free Tailwind keys', () => {
    const theme = themeBlock(buildTokens(full).css)
    expect(theme).not.toContain('--spacing-md:')
    expect(theme).toContain('--spacing-ds-md: var(--ds-space-md);')
    expect(theme).not.toMatch(/--radius-(xs|lg):/)
    expect(theme).toContain('--radius-tag: var(--ds-radius-xs);')
    expect(theme).toContain('--radius-card: var(--ds-radius-lg);')
  })

  it('should map easing aliases to ease-enter, ease-exit and ease-move', () => {
    const theme = themeBlock(buildTokens(full).css)
    expect(theme).toContain('--ease-enter: var(--ds-easing-out);')
    expect(theme).toContain('--ease-exit: var(--ds-easing-in);')
    expect(theme).toContain('--ease-move: var(--ds-easing-in-out);')
    expect(theme).not.toMatch(/--ease-(in|out|in-out):/)
  })

  it('should map breakpoint aliases to literal Tailwind breakpoints, since media queries cannot read variables', () => {
    const source = {
      ...full,
      primitive: { ...full.primitive, size: { ...full.primitive.size, 1200: { $value: '1200px' } } },
      alias: { ...full.alias, breakpoint: { 'site-lg': { $value: '{primitive.size.1200}' } } },
    }
    const { css, twMerge } = buildTokens(source)
    expect(themeBlock(css)).toContain('--breakpoint-site-lg: 1200px;')
    expect(twMerge).toContain('"breakpoint": [')
  })

  it('should map font sizes with line-height companions', () => {
    const theme = themeBlock(buildTokens(full).css)
    expect(theme).toContain('--text-body: var(--ds-font-size-body);')
    expect(theme).toContain('--text-body--line-height: var(--ds-line-height-body);')
    expect(theme).toContain('--text-h1: var(--ds-font-size-h1);')
    expect(theme).toContain('--text-h1--line-height: var(--ds-line-height-h1);')
  })

  it('should not let a shadow theme key reference itself', () => {
    const theme = themeBlock(buildTokens(full).css)
    expect(theme).toContain('--shadow-card: var(--ds-shadow-card);')
    expect(theme).not.toContain('--shadow-card: var(--shadow-card)')
  })

  it('should only emit the role color scheme, without short aliases or shadcn keys', () => {
    const theme = themeBlock(buildTokens(full).css)
    expect(theme).toContain('--color-text-primary: var(--text-primary);')
    expect(theme).not.toMatch(
      /--color-(primary|secondary|muted|faint|on-brand|link|brand|background|foreground|card|popover|accent|destructive|border|input|ring|sidebar)(-[a-z-]+)?:/,
    )
  })

  it('should order chartColors numerically and skip non-series keys', () => {
    const { js } = buildTokens(full)
    expect(js).toContain('export const chartColors = [\n  "#000001",\n  "#000002",\n  "#000010"\n]')
  })

  it('should throw when two tokens emit the same CSS variable', () => {
    expect(() =>
      buildTokens({
        ...src,
        role: { light: { surface: { 'brand-strong': { $value: '#000' }, brand: { strong: { $value: '#111' } } } } },
      }),
    ).toThrow(/surface-brand-strong/)
  })

  it('should throw on a composite $value', () => {
    expect(() =>
      buildTokens({ ...src, alias: { shadow: { card: { $value: { offsetX: '0px' } } } } }),
    ).toThrow(/alias.shadow.card.*string or number/)
  })

  it('should throw on an invalid theme name', () => {
    expect(() => buildTokens({ ...src, role: { ...src.role, 'Dark Mode': {} } })).toThrow(/Dark Mode/)
  })

  it('should throw when a theme lacks a role the light theme defines', () => {
    expect(() =>
      buildTokens({ ...src, role: { ...src.role, dark: { surface: { raised: { $value: '#000' } } } } }),
    ).toThrow(/dark.*surface-brand/)
  })

  it('should emit tailwind-merge theme scales for every @theme key, grouped by namespace', () => {
    const { twMerge } = buildTokens(full)
    const start = twMerge.indexOf('{')
    const scales = JSON.parse(twMerge.slice(start, twMerge.lastIndexOf('}') + 1))
    expect(scales.color).toEqual(['surface-brand', 'text-primary', 'chart-1', 'chart-2', 'chart-10', 'chart-grid'])
    expect(scales.spacing).toEqual(['ds-md'])
    expect(scales.radius).toEqual(['tag', 'card'])
    expect(scales.text).toEqual(['body', 'h1'])
    expect(scales.shadow).toEqual(['card'])
    expect(scales.ease).toEqual(['enter', 'exit', 'move'])
    expect(twMerge).toMatch(/^\/\/ Generated by scripts\/build-tokens\.mjs/)
    expect(twMerge).toContain('export const themeScales = ')
  })

  it('should leave sub-property keys like --text-body--line-height out of the tailwind-merge scales', () => {
    const { twMerge } = buildTokens(full)
    expect(twMerge).not.toContain('line-height')
  })
})
