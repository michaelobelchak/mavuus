import { describe, it, expect } from 'vitest'
import { cn } from './cn'

describe('cn', () => {
  it('should keep the last padding when two paddings conflict', () => {
    expect(cn('p-2', 'p-4')).toBe('p-4')
  })

  it('should keep conditional classes when the condition is true', () => {
    expect(cn('flex', { 'items-center': true, hidden: false }, ['gap-2'])).toBe('flex items-center gap-2')
  })

  it('should drop falsy values when given false, null, undefined or an empty string', () => {
    expect(cn('flex', false, null, undefined, '', 0)).toBe('flex')
  })

  it('should keep both a font size and a text color when both are design tokens', () => {
    expect(cn('text-body', 'text-text-primary')).toBe('text-body text-text-primary')
  })

  it('should keep the last token font size when two font sizes conflict', () => {
    expect(cn('text-body', 'text-h2')).toBe('text-h2')
    expect(cn('text-body-sm', 'text-sm')).toBe('text-sm')
  })

  it('should keep the last token text color when two text colors conflict', () => {
    expect(cn('text-text-primary', 'text-text-muted')).toBe('text-text-muted')
    expect(cn('text-status-error', 'text-text-brand')).toBe('text-text-brand')
  })

  it('should keep only the last ds spacing when two ds paddings conflict', () => {
    expect(cn('p-ds-md', 'p-ds-lg')).toBe('p-ds-lg')
    expect(cn('px-ds-md', 'px-ds-xl')).toBe('px-ds-xl')
    expect(cn('gap-ds-xs', 'gap-ds-sm')).toBe('gap-ds-sm')
  })

  it('should keep only the last radius when two token radii conflict', () => {
    expect(cn('rounded-card', 'rounded-chip')).toBe('rounded-chip')
    expect(cn('rounded-lg', 'rounded-control')).toBe('rounded-control')
  })

  it('should resolve token colors per property when backgrounds and borders conflict', () => {
    expect(cn('bg-surface-brand', 'bg-status-error')).toBe('bg-status-error')
    expect(cn('border-border-default', 'border-status-error')).toBe('border-status-error')
    expect(cn('border', 'border-border-default')).toBe('border border-border-default')
    expect(cn('bg-surface-raised', 'text-text-primary', 'border-border-strong')).toBe(
      'bg-surface-raised text-text-primary border-border-strong',
    )
  })

  it('should keep only the last token shadow when two shadows conflict', () => {
    expect(cn('shadow-card', 'shadow-float')).toBe('shadow-float')
  })

  it('should keep only the last token easing when two easings conflict', () => {
    expect(cn('ease-enter', 'ease-exit')).toBe('ease-exit')
  })
})
