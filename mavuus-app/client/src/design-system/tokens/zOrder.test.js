// @vitest-environment node
import { describe, it, expect } from 'vitest'
import { tokens } from './tokens'

const z = (name) => Number(tokens[`ds-z-${name}`])

describe('z-index layers', () => {
  it('should put dropdowns above modals and modals above the overlay', () => {
    expect(z('dropdown')).toBeGreaterThan(z('modal'))
    expect(z('modal')).toBeGreaterThan(z('overlay'))
  })

  it('should put tooltips above popovers and popovers above dropdowns', () => {
    expect(z('tooltip')).toBeGreaterThan(z('popover'))
    expect(z('popover')).toBeGreaterThan(z('dropdown'))
  })

  it('should keep toasts on top of everything', () => {
    expect(z('toast')).toBeGreaterThan(z('tooltip'))
  })
})
