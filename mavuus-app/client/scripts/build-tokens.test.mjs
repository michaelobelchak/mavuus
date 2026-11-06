import { describe, it, expect } from 'vitest'
import { buildTokens } from './build-tokens.mjs'

const src = {
  primitive: { color: { pink: { 500: { $value: '#F26D92' } } }, size: { 16: { $value: '16px' } } },
  alias: { space: { md: { $value: '{primitive.size.16}' } } },
  role: { light: { surface: { brand: { $value: '{primitive.color.pink.500}' } } } },
}

describe('buildTokens', () => {
  it('should emit primitives, aliases and roles as CSS variables with references', () => {
    const { css } = buildTokens(src)
    expect(css).toContain('--mv-color-pink-500: #F26D92;')
    expect(css).toContain('--space-md: var(--mv-size-16);')
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

  it('should emit a role.dark group as a [data-theme="dark"] block', () => {
    const { css } = buildTokens({
      ...src,
      role: { ...src.role, dark: { surface: { brand: { $value: '{primitive.size.16}' } } } },
    })
    expect(css).toMatch(/\[data-theme="dark"\] \{[^}]*--surface-brand: var\(--mv-size-16\);/s)
  })

  it('should not map space or radius aliases onto Tailwind keys that already exist', () => {
    const { css } = buildTokens({
      ...src,
      alias: {
        space: { md: { $value: '{primitive.size.16}' } },
        radius: { lg: { $value: '{primitive.size.16}' } },
      },
    })
    const theme = css.slice(css.indexOf('@theme inline'))
    expect(theme).not.toContain('--spacing-md:')
    expect(theme).toContain('--spacing-ds-md: var(--space-md);')
    expect(theme).not.toContain('--radius-lg:')
    expect(theme).toContain('--radius-card: var(--radius-lg);')
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
})
