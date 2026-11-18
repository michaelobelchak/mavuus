import { describe, expect, it } from 'vitest'
import { timeAgo } from './timeAgo'

const now = new Date('2026-11-14T12:00:00Z')

describe('timeAgo', () => {
  it.each([
    ['2026-11-14T11:59:40Z', 'Just now'],
    ['2026-11-14T11:55:00Z', '5m ago'],
    ['2026-11-14 09:00:00', '3h ago'],
    ['2026-11-12T12:00:00Z', '2d ago'],
    ['2026-11-01T12:00:00Z', 'Nov 1'],
  ])('should describe %s as %s', (value, expected) => {
    expect(timeAgo(value, now)).toBe(expected)
  })

  it('should return an empty string when the date is missing or invalid', () => {
    expect(timeAgo(null, now)).toBe('')
    expect(timeAgo('not a date', now)).toBe('')
  })
})
