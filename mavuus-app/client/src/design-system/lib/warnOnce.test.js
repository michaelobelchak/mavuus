import { describe, it, expect, vi, afterEach } from 'vitest'
import { warnOnce, resetWarnings } from './warnOnce'

afterEach(() => {
  vi.restoreAllMocks()
  resetWarnings()
})

describe('warnOnce', () => {
  it('should log a key only once until reset', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})
    warnOnce('a', 'first')
    warnOnce('a', 'again')
    warnOnce('b', 'other')
    expect(error.mock.calls).toEqual([['first'], ['other']])
    resetWarnings()
    warnOnce('a', 'after reset')
    expect(error).toHaveBeenLastCalledWith('after reset')
  })
})
