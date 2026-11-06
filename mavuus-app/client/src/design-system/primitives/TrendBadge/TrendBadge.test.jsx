import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { TrendBadge } from './TrendBadge'

const badge = (container) => container.firstElementChild

describe('TrendBadge', () => {
  it.each([
    ['up', 'up', 'text-status-success'],
    ['down', 'up', 'text-status-error'],
    ['down', 'down', 'text-status-success'],
    ['up', 'down', 'text-status-error'],
    ['flat', 'up', 'text-text-secondary'],
    ['flat', 'down', 'text-text-secondary'],
  ])('should use %s with goodWhen %s as %s', (direction, goodWhen, toneClass) => {
    const { container } = render(<TrendBadge value={4.2} direction={direction} goodWhen={goodWhen} />)
    expect(badge(container)).toHaveClass(toneClass)
  })

  it('should show the value with two decimals and a percent sign when given a number', () => {
    render(<TrendBadge value={32.5} direction="up" />)
    expect(screen.getByText('32.50%')).toHaveAttribute('aria-hidden', 'true')
  })

  it('should announce direction and value to screen readers when rendered', () => {
    render(<TrendBadge value={32.54} direction="up" />)
    expect(screen.getByText('up 32.54 percent')).toHaveClass('sr-only')
  })

  it('should show the absolute value when the value is negative', () => {
    render(<TrendBadge value={-1.234} direction="down" />)
    expect(screen.getByText('1.23%')).toBeInTheDocument()
    expect(screen.getByText('down 1.23 percent')).toBeInTheDocument()
  })

  it('should announce no change when direction is flat', () => {
    render(<TrendBadge value={0} direction="flat" />)
    expect(screen.getByText('no change 0.00 percent')).toBeInTheDocument()
  })

  it('should infer the direction from the sign when direction is omitted', () => {
    render(<TrendBadge value={-3} />)
    expect(screen.getByText('down 3.00 percent')).toBeInTheDocument()
  })
})
