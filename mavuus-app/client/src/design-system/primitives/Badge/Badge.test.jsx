import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ArrowRight, Star } from 'lucide-react'
import { Badge } from './Badge'

describe('Badge', () => {
  it('should render its children text when given children', () => {
    render(<Badge>Pro member</Badge>)
    expect(screen.getByText('Pro member').tagName).toBe('SPAN')
  })

  it.each([
    ['neutral', 'bg-surface-sunken', 'text-text-secondary'],
    ['brand', 'bg-surface-selected', 'text-text-brand-strong'],
    ['success', 'bg-status-success-subtle', 'text-status-success'],
    ['warning', 'bg-status-warning-subtle', 'text-status-warning'],
    ['error', 'bg-status-error-subtle', 'text-status-error'],
    ['info', 'bg-status-info-subtle', 'text-status-info'],
  ])('should use its subtle background and text color when tone is %s', (tone, bg, text) => {
    render(<Badge tone={tone}>Status</Badge>)
    expect(screen.getByText('Status')).toHaveClass(bg, text)
  })

  it('should use the dark inverse surface with on-brand text when tone is inverse', () => {
    render(<Badge tone="inverse">3</Badge>)
    expect(screen.getByText('3')).toHaveClass('bg-surface-inverse', 'text-text-on-brand')
  })

  it('should use the neutral tone when no tone is given', () => {
    render(<Badge>Draft</Badge>)
    expect(screen.getByText('Draft')).toHaveClass('bg-surface-sunken')
  })

  it('should render decorative icons sized to the badge when given leadingIcon and trailingIcon', () => {
    render(
      <Badge size="sm" leadingIcon={Star} trailingIcon={ArrowRight}>
        Featured
      </Badge>,
    )
    const icons = screen.getByText('Featured').querySelectorAll('svg')
    expect(icons).toHaveLength(2)
    for (const icon of icons) {
      expect(icon).toHaveAttribute('aria-hidden', 'true')
      expect(icon).toHaveClass('size-3')
    }
  })
})
