import { describe, it, expect, vi, afterEach } from 'vitest'
import { resetWarnings } from './warnOnce'
import { controlHeights, controlSquares, resolveControlSize } from './controlSizes'

afterEach(() => {
  vi.restoreAllMocks()
  resetWarnings()
})

describe('controlSizes', () => {
  it('should map xs to lg onto 32, 40, 48 and 56px heights and squares', () => {
    expect(controlHeights).toEqual({ xs: 'h-8', sm: 'h-10', md: 'h-12', lg: 'h-14' })
    expect(controlSquares).toEqual({ xs: 'size-8', sm: 'size-10', md: 'size-12', lg: 'size-14' })
  })
})

describe('resolveControlSize', () => {
  it('should return the size when it is allowed', () => {
    expect(resolveControlSize('sm', ['sm', 'md', 'lg'], 'md', 'Button')).toBe('sm')
  })

  it('should return the fallback without warning when size is missing', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(resolveControlSize(undefined, ['xs', 'sm'], 'sm', 'Chip')).toBe('sm')
    expect(resolveControlSize(null, ['sm', 'md', 'lg'], 'md', 'Button')).toBe('md')
    expect(error).not.toHaveBeenCalled()
  })

  it('should return the fallback and warn with the component and size when size is unknown', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(resolveControlSize('huge', ['sm', 'md', 'lg'], 'md', 'Button')).toBe('md')
    expect(error).toHaveBeenCalledTimes(1)
    expect(error.mock.calls[0][0]).toMatch(/Button/)
    expect(error.mock.calls[0][0]).toMatch(/"huge"/)
  })

  it('should pick the nearest allowed step and warn when size is on the scale but not allowed', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(resolveControlSize('xs', ['sm', 'md', 'lg'], 'md', 'IconButton')).toBe('sm')
    expect(resolveControlSize('md', ['xs', 'sm'], 'sm', 'Chip')).toBe('sm')
    expect(resolveControlSize('lg', ['xs', 'sm'], 'sm', 'Chip')).toBe('sm')
    expect(error).toHaveBeenCalledWith(expect.stringMatching(/IconButton.*"xs"/))
    expect(error).toHaveBeenCalledWith(expect.stringMatching(/Chip.*"md"/))
  })

  it('should default to the full scale and md when only size is given', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(resolveControlSize('xs')).toBe('xs')
    expect(resolveControlSize('huge')).toBe('md')
  })
})
