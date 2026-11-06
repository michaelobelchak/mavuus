import { describe, expect, it } from 'vitest'
import { tokens } from '../../tokens/tokens.js'
import { EASING_CLASSES, RADIUS_ROLES, SIZE_ORDER, steps } from './foundationMaps'

describe('foundation doc maps', () => {
  it('should order every space and radius step in tokens.js', () => {
    for (const step of [...steps(tokens, 'ds-space-'), ...steps(tokens, 'ds-radius-')]) {
      expect(SIZE_ORDER, `missing ${step}`).toContain(step)
    }
  })

  it('should name a rounded-* role for every radius step', () => {
    expect(Object.keys(RADIUS_ROLES).sort()).toEqual(steps(tokens, 'ds-radius-').sort())
  })

  it('should name an ease-* class for every easing step', () => {
    expect(Object.keys(EASING_CLASSES).sort()).toEqual(steps(tokens, 'ds-easing-').sort())
  })

  it('should have a line height for every font size', () => {
    expect(steps(tokens, 'ds-line-height-').sort()).toEqual(steps(tokens, 'ds-font-size-').sort())
  })
})
