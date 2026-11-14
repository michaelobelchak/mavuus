import { describe, it, expect, afterEach } from 'vitest'
import { act, render } from '@testing-library/react'
import { ScrollProgress } from './ScrollProgress'

function setScroll({ scrollY, scrollHeight, innerHeight }) {
  Object.defineProperty(window, 'scrollY', { configurable: true, value: scrollY })
  Object.defineProperty(window, 'innerHeight', { configurable: true, value: innerHeight })
  Object.defineProperty(document.documentElement, 'scrollHeight', { configurable: true, value: scrollHeight })
}

afterEach(() => setScroll({ scrollY: 0, scrollHeight: 0, innerHeight: 768 }))

describe('ScrollProgress', () => {
  it('should be decorative and hidden from assistive tech', () => {
    const { container } = render(<ScrollProgress />)
    expect(container.firstElementChild).toHaveAttribute('aria-hidden', 'true')
    expect(container.firstElementChild).toHaveClass('pointer-events-none', 'fixed')
  })

  it('should fill to the scrolled share of the document when the window scrolls', () => {
    setScroll({ scrollY: 0, scrollHeight: 2000, innerHeight: 1000 })
    const { container } = render(<ScrollProgress />)
    const bar = container.firstElementChild.firstElementChild
    expect(bar.style.getPropertyValue('--scroll-progress')).toBe('0%')
    act(() => {
      setScroll({ scrollY: 500, scrollHeight: 2000, innerHeight: 1000 })
      window.dispatchEvent(new Event('scroll'))
    })
    expect(bar.style.getPropertyValue('--scroll-progress')).toBe('50%')
    expect(bar).toHaveClass('motion-reduce:transition-none')
  })
})
