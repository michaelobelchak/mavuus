// @vitest-environment node
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, it, expect } from 'vitest'
import { MAX_REVEAL_STEP } from '../patterns/Reveal/revealOptions'

const css = readFileSync(fileURLToPath(new URL('./motion.css', import.meta.url)), 'utf8')

describe('motion.css', () => {
  it('should define .ds-float and keep .live-float as an alias with the same rules', () => {
    expect(css).toMatch(/\.ds-float,\s*\.live-float\s*\{\s*animation: ds-float /)
  })

  it('should turn the float off under reduced motion for both class names', () => {
    const reduced = css.slice(css.lastIndexOf('@media (prefers-reduced-motion: reduce)'))
    expect(reduced).toContain('.ds-float')
    expect(reduced).toContain('.live-float')
  })

  it('should turn the pulse off under reduced motion', () => {
    const reduced = css.slice(css.lastIndexOf('@media (prefers-reduced-motion: reduce)'))
    expect(css).toMatch(/\.ds-animate-pulse \{ animation: ds-pulse /)
    expect(reduced).toContain('.ds-animate-pulse')
  })

  it('should have one stagger rule per step in motion.css, 70ms apart', () => {
    const rules = [...css.matchAll(/\[data-reveal-step='(\d+)'\]\s*\{\s*--reveal-delay:\s*(\d+)ms;\s*\}/g)]
    expect(rules).toHaveLength(MAX_REVEAL_STEP + 1)
    for (const [, step, delay] of rules) expect(Number(delay)).toBe(Number(step) * 70)
    expect(rules.map(([, step]) => Number(step))).toEqual(Array.from({ length: MAX_REVEAL_STEP + 1 }, (_, i) => i))
  })
})
