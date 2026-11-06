import { describe, expect, it } from 'vitest'
import { contrastLabel, contrastLevel, contrastRatio, parseColor } from './contrast'

describe('contrast helpers', () => {
  it('should parse short and long hex and rgba values', () => {
    expect(parseColor('#fff')).toEqual({ r: 255, g: 255, b: 255, a: 1 })
    expect(parseColor('#1C2232')).toEqual({ r: 28, g: 34, b: 50, a: 1 })
    expect(parseColor('rgba(0, 0, 0, 0.5)')).toEqual({ r: 0, g: 0, b: 0, a: 0.5 })
    expect(parseColor('linear-gradient(90deg, red, blue)')).toBeNull()
  })

  it('should give 21:1 for black on white and 1:1 for white on white', () => {
    expect(contrastRatio('#000000')).toBeCloseTo(21, 5)
    expect(contrastRatio('#ffffff')).toBeCloseTo(1, 5)
  })

  it('should composite translucent colors over white before measuring', () => {
    expect(contrastRatio('rgba(0, 0, 0, 0)')).toBeCloseTo(1, 5)
    expect(contrastRatio('rgba(0, 0, 0, 0.5)')).toBeGreaterThan(3)
  })

  it('should map ratios to WCAG levels', () => {
    expect(contrastLevel(7.2)).toBe('AAA')
    expect(contrastLevel(4.6)).toBe('AA')
    expect(contrastLevel(3.1)).toBe('AA large')
    expect(contrastLevel(2)).toBe('Fail')
    expect(contrastLevel(null)).toBe('n/a')
  })

  it('should label subtle backgrounds, unparseable values and ratios for the On white column', () => {
    expect(contrastLabel('status-success-subtle', '#f0fdf4')).toBe('Background')
    expect(contrastLabel('gradient-active', 'linear-gradient(90deg, #1F648D, #1C2232)')).toBe('n/a')
    expect(contrastLabel('text-primary', '#000000')).toBe('21.00:1 AAA')
  })
})
