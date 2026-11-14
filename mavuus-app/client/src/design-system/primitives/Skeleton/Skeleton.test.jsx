import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { Skeleton } from './Skeleton'

describe('Skeleton', () => {
  it('should be hidden from assistive tech when rendered', () => {
    const { container } = render(<Skeleton />)
    expect(container.firstChild).toHaveAttribute('aria-hidden', 'true')
  })

  it('should render one bar per line and a shorter last line when shape is text', () => {
    const { container } = render(<Skeleton shape="text" lines={3} />)
    const bars = container.firstChild.children
    expect(bars).toHaveLength(3)
    expect(bars[2]).toHaveClass('w-3/5')
  })

  it('should render a single block when shape is circle or rect', () => {
    const { container, rerender } = render(<Skeleton shape="circle" className="size-12" />)
    expect(container.firstChild).toHaveClass('rounded-chip', 'size-12')
    expect(container.firstChild.children).toHaveLength(0)
    rerender(<Skeleton shape="rect" className="h-40 w-full" />)
    expect(container.firstChild).toHaveClass('rounded-card', 'h-40', 'w-full')
  })

  it('should pulse on the sunken surface and stop when the user prefers reduced motion', () => {
    const { container } = render(<Skeleton shape="rect" />)
    expect(container.firstChild).toHaveClass('bg-surface-sunken', 'animate-pulse', 'motion-reduce:animate-none')
  })
})
