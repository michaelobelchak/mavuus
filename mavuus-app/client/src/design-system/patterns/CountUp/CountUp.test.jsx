import { describe, it, expect, afterEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { mockIntersectionObserver, mockReducedMotion } from '../../test/browserMocks'
import { CountUp } from './CountUp'

afterEach(() => vi.unstubAllGlobals())

describe('CountUp', () => {
  it('should show the final value right away when the user prefers reduced motion', () => {
    mockReducedMotion(true)
    mockIntersectionObserver()
    const { container } = render(<CountUp value="1,100+" />)
    expect(container.querySelector('[aria-hidden="true"]')).toHaveTextContent('1,100+')
  })

  it('should give screen readers the final value while the visual count starts at zero', () => {
    mockReducedMotion(false)
    mockIntersectionObserver()
    const { container } = render(<CountUp value="~$2.1M" />)
    expect(container.querySelector('[aria-hidden="true"]')).toHaveTextContent('~$0.0M')
    expect(screen.getByText('~$2.1M')).toHaveClass('sr-only')
  })

  it('should render non numeric values as they are', () => {
    mockReducedMotion(false)
    mockIntersectionObserver()
    const { container } = render(<CountUp value="Soon" />)
    expect(container.querySelector('[aria-hidden="true"]')).toHaveTextContent('Soon')
  })

  it('should use tabular numbers so the width does not jump', () => {
    mockReducedMotion(true)
    const { container } = render(<CountUp value={430} className="text-h2" />)
    expect(container.firstElementChild).toHaveClass('tabular-nums', 'text-h2')
    expect(container.firstElementChild).toHaveTextContent('430')
  })
})
