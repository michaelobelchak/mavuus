import { describe, it, expect, afterEach, vi } from 'vitest'
import { act, render } from '@testing-library/react'
import { ScrollProgress } from './ScrollProgress'

function setScroll({ scrollY, scrollHeight, innerHeight }) {
  Object.defineProperty(window, 'scrollY', { configurable: true, value: scrollY })
  Object.defineProperty(window, 'innerHeight', { configurable: true, value: innerHeight })
  Object.defineProperty(document.documentElement, 'scrollHeight', { configurable: true, value: scrollHeight })
}

afterEach(() => {
  setScroll({ scrollY: 0, scrollHeight: 0, innerHeight: 768 })
  vi.unstubAllGlobals()
})

describe('ScrollProgress', () => {
  it('should be decorative and hidden from assistive tech', () => {
    const { container } = render(<ScrollProgress />)
    expect(container.firstElementChild).toHaveAttribute('aria-hidden', 'true')
    expect(container.firstElementChild).toHaveClass('pointer-events-none', 'fixed')
  })

  it('should scale the bar to the scrolled share once per frame, however many scroll events come', () => {
    const frames = []
    vi.stubGlobal('requestAnimationFrame', (cb) => frames.push(cb))
    vi.stubGlobal('cancelAnimationFrame', () => {})
    setScroll({ scrollY: 0, scrollHeight: 2000, innerHeight: 1000 })
    const { container } = render(<ScrollProgress />)
    const bar = container.firstElementChild.firstElementChild
    expect(bar).toHaveClass('origin-left', 'scale-x-(--scroll-progress)', 'motion-reduce:transition-none')
    expect(bar.style.getPropertyValue('--scroll-progress')).toBe('0')
    act(() => frames.shift()())
    setScroll({ scrollY: 500, scrollHeight: 2000, innerHeight: 1000 })
    act(() => {
      window.dispatchEvent(new Event('scroll'))
      window.dispatchEvent(new Event('scroll'))
      window.dispatchEvent(new Event('scroll'))
    })
    expect(frames).toHaveLength(1)
    act(() => frames[0]())
    expect(bar.style.getPropertyValue('--scroll-progress')).toBe('0.5')
  })
})
