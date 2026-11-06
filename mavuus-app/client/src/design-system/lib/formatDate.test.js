import { describe, expect, it } from 'vitest'
import { formatDate, parseDate, toDateTime } from './formatDate'

describe('formatDate', () => {
  it('should read a date-only string as a local date in any time zone', () => {
    const date = parseDate('2026-10-28')
    expect([date.getFullYear(), date.getMonth(), date.getDate()]).toEqual([2026, 9, 28])
    expect(formatDate('2026-10-28')).toBe('Oct 28, 2026')
    expect(toDateTime('2026-10-28')).toBe('2026-10-28')
  })

  it('should read a SQLite timestamp as UTC in any time zone', () => {
    expect(parseDate('2026-10-28 23:30:00').getTime()).toBe(Date.UTC(2026, 9, 28, 23, 30, 0))
    expect(parseDate('2026-10-28 23:30').getTime()).toBe(Date.UTC(2026, 9, 28, 23, 30, 0))
    expect(toDateTime('2026-10-28 23:30:00')).toBe('2026-10-28T23:30:00.000Z')
  })

  it('should format a SQLite timestamp in the local time zone', () => {
    const local = new Date(Date.UTC(2026, 9, 28, 23, 30, 0))
    const expected = local.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    expect(formatDate('2026-10-28 23:30:00')).toBe(expected)
  })

  it('should take ISO strings, Date objects and timestamps', () => {
    const date = new Date(2026, 8, 14, 12)
    expect(formatDate(date)).toBe('Sep 14, 2026')
    expect(formatDate(date.getTime())).toBe('Sep 14, 2026')
    expect(parseDate('2026-09-14T12:00:00Z').getTime()).toBe(Date.UTC(2026, 8, 14, 12))
  })

  it('should return an empty string for empty or invalid values', () => {
    for (const value of [undefined, null, '', 'Last week', '2026-13-45', Number.NaN]) {
      expect(formatDate(value)).toBe('')
      expect(toDateTime(value)).toBe('')
      expect(parseDate(value)).toBeNull()
    }
  })

  it('should take Intl options to change the format', () => {
    expect(formatDate('2026-10-28', { month: 'long', day: 'numeric' })).toBe('October 28')
  })
})
