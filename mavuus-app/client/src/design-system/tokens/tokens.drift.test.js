// @vitest-environment node
import { readFileSync } from 'node:fs'
import { describe, it, expect } from 'vitest'
import { buildTokens } from '../../../scripts/build-tokens.mjs'

const read = (name) => readFileSync(new URL(`./${name}`, import.meta.url), 'utf8')

describe('design tokens', () => {
  const built = buildTokens(JSON.parse(read('tokens.json')))

  it('should match the committed tokens.css', () => {
    expect(read('tokens.css') === built.css, 'tokens.css is stale. Run npm run tokens').toBe(true)
  })

  it('should match the committed tokens.js', () => {
    expect(read('tokens.js') === built.js, 'tokens.js is stale. Run npm run tokens').toBe(true)
  })
})
