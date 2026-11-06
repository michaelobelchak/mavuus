// @vitest-environment node
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { describe, it, expect } from 'vitest'
import { buildTokens } from '../../../scripts/build-tokens.mjs'

const read = (name) => readFileSync(new URL(`./${name}`, import.meta.url), 'utf8')
const built = buildTokens(JSON.parse(read('tokens.json')))

describe('design tokens', () => {
  it('should match the committed tokens.css (run npm run tokens if this fails)', () => {
    expect(read('tokens.css')).toBe(built.css)
  })

  it('should match the committed tokens.js (run npm run tokens if this fails)', () => {
    expect(read('tokens.js')).toBe(built.js)
  })

  it('should not override Tailwind default theme keys except allow-listed ones', () => {
    // Tailwind's default theme, e.g. --radius-lg, --text-xs, --shadow-md, --ease-out, --font-sans.
    const require = createRequire(import.meta.url)
    const tailwindTheme = readFileSync(require.resolve('tailwindcss/theme.css'), 'utf8')
    const tailwindKeys = new Set([...tailwindTheme.matchAll(/^\s*(--[\w-]+)\s*:/gm)].map((m) => m[1]))
    expect(tailwindKeys).toContain('--radius-lg')

    // Everything outside @theme lands in :root or a [data-theme] block.
    const variables = built.css.slice(0, built.css.indexOf('@theme inline'))
    const emitted = [...variables.matchAll(/^\s*(--[\w-]+)\s*:/gm)].map((m) => m[1])
    expect(emitted.length).toBeGreaterThan(0)
    expect(emitted.filter((name) => tailwindKeys.has(name) || name.startsWith('--container-'))).toEqual([])

    // @theme inline keys become Tailwind theme keys, so one that matches a default replaces it
    // everywhere. Only the allow-listed ones do that on purpose.
    const allowedOverrides = ['--font-sans']
    expect(tailwindKeys).toContain('--font-sans')
    const themeKeys = [...built.css.slice(built.css.indexOf('@theme inline')).matchAll(/^\s*(--[\w-]+)\s*:/gm)].map((m) => m[1])
    expect(themeKeys.length).toBeGreaterThan(0)
    expect(themeKeys.filter((name) => tailwindKeys.has(name) && !allowedOverrides.includes(name))).toEqual([])
    expect(themeKeys.filter((name) => name.startsWith('--container-'))).toEqual([])
  })
})
