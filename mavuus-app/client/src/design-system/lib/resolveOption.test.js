import { describe, it, expect, vi, afterEach } from 'vitest'
import { resetWarnings } from './warnOnce'
import { resolveOption } from './resolveOption'

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
