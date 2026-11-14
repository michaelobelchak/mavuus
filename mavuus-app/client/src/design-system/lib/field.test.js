import { describe, it, expect } from 'vitest'
import { fieldVariants, isInvalid } from './field'

describe('isInvalid', () => {
  it('should be true when invalid is set or aria-invalid is truthy', () => {
    expect(isInvalid(true, undefined)).toBe(true)
    expect(isInvalid(false, true)).toBe(true)
    expect(isInvalid(false, 'true')).toBe(true)
    expect(isInvalid(false, 'grammar')).toBe(true)
  })

  it('should be false when neither is set or aria-invalid is "false"', () => {
    expect(isInvalid(false, undefined)).toBe(false)
    expect(isInvalid(undefined, 'false')).toBe(false)
    expect(isInvalid(false, false)).toBe(false)
  })
})

describe('fieldVariants', () => {
  it('should use the error border when invalid and the default border otherwise', () => {
    expect(fieldVariants({ invalid: true })).toContain('border-status-error')
    expect(fieldVariants({})).toContain('border-border-default')
  })
})
