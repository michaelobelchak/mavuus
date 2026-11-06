import { describe, it, expect, vi, afterEach } from 'vitest'
import { resetWarnings } from './warnOnce'
import { resolveHeadingLevel, resolveOption } from './resolveOption'

afterEach(() => {
  vi.restoreAllMocks()
  resetWarnings()
})

describe('resolveOption', () => {
  it('should return an allowed value as is', () => {
    expect(resolveOption('muted', ['primary', 'muted'], 'primary', 'Text', 'tone')).toBe('muted')
  })

  it('should return the fallback silently when the value is missing', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(resolveOption(undefined, ['primary'], 'primary', 'Text', 'tone')).toBe('primary')
    expect(error).not.toHaveBeenCalled()
  })

  it('should warn with the component, prop and value and return the fallback when unknown', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(resolveOption('pink', ['primary'], 'primary', 'Text', 'tone')).toBe('primary')
    expect(error).toHaveBeenCalledWith(expect.stringMatching(/Text: tone "pink"/))
  })
})

describe('resolveHeadingLevel', () => {
  it('should accept numeric strings and warn with the headingLevel prop name when unsupported', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(resolveHeadingLevel('2', [2, 3], 3, 'Accordion')).toBe(2)
    expect(resolveHeadingLevel(undefined, [2, 3], 3, 'Accordion')).toBe(3)
    expect(resolveHeadingLevel(9, [2, 3], 3, 'Accordion')).toBe(3)
    expect(error).toHaveBeenCalledWith(expect.stringMatching(/Accordion: headingLevel "9"/))
  })
})
