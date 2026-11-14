import { describe, it, expect } from 'vitest'
import { isHttpUrl } from './safeUrl'

describe('isHttpUrl', () => {
  it('should accept http, https and same-site paths', () => {
    expect(isHttpUrl('https://example.com/a')).toBe(true)
    expect(isHttpUrl('http://example.com')).toBe(true)
    expect(isHttpUrl('/files/budget.xlsx')).toBe(true)
  })

  it('should refuse other schemes and empty values', () => {
    expect(isHttpUrl('javascript:alert(1)')).toBe(false)
    expect(isHttpUrl('JaVaScRiPt:alert(1)')).toBe(false)
    expect(isHttpUrl('data:text/html,hi')).toBe(false)
    expect(isHttpUrl('mailto:a@b.co')).toBe(false)
    expect(isHttpUrl('')).toBe(false)
    expect(isHttpUrl(null)).toBe(false)
  })
})
