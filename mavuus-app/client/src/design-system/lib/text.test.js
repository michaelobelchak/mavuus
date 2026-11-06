import { describe, it, expect } from 'vitest'
import { lowerFirst, shortCount } from './text'

describe('lowerFirst', () => {
  it('should lowercase only the first letter when given text', () => {
    expect(lowerFirst('Last 30 days')).toBe('last 30 days')
  })

  it('should return null when the value is empty or not a string', () => {
    expect(lowerFirst('')).toBeNull()
    expect(lowerFirst(undefined)).toBeNull()
    expect(lowerFirst(42)).toBeNull()
  })
})

describe('shortCount', () => {
  it('should show the count when it is at or under the cap', () => {
    expect(shortCount(7)).toBe('7')
    expect(shortCount(99)).toBe('99')
  })

  it('should show the cap with a plus when the count is over it', () => {
    expect(shortCount(100)).toBe('99+')
  })

  it('should use a custom cap when one is given', () => {
    expect(shortCount(9, 9)).toBe('9')
    expect(shortCount(12, 9)).toBe('9+')
  })
})
