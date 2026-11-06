import { describe, it, expect } from 'vitest'
import { controlHeights, controlSquares, resolveControlSize } from './controlSizes'

describe('controlSizes', () => {
  it('should map xs to lg onto 32, 40, 48 and 56px heights and squares', () => {
    expect(controlHeights).toEqual({ xs: 'h-8', sm: 'h-10', md: 'h-12', lg: 'h-14' })
    expect(controlSquares).toEqual({ xs: 'size-8', sm: 'size-10', md: 'size-12', lg: 'size-14' })
  })

  it('should fall back to md when the size is unknown or missing', () => {
    expect(resolveControlSize('huge')).toBe('md')
    expect(resolveControlSize(undefined)).toBe('md')
    expect(resolveControlSize('sm')).toBe('sm')
  })
})
