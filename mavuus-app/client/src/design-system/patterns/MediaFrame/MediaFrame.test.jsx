import { describe, it, expect, afterEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { resetWarnings } from '../../lib/warnOnce'
import { MediaFrame } from './MediaFrame'

afterEach(() => {
  vi.restoreAllMocks()
  resetWarnings()
})

describe('MediaFrame', () => {
  it('should render a lazy decorative image in a 3/2 card-radius frame by default', () => {
    const { container } = render(<MediaFrame src="/hero.jpg" />)
    const frame = container.firstElementChild
    expect(frame).toHaveClass('aspect-3/2', 'rounded-card', 'overflow-hidden')
    const img = container.querySelector('img')
    expect(img).toHaveAttribute('alt', '')
    expect(img).toHaveAttribute('loading', 'lazy')
  })

  it('should load eagerly and expose the alt text when given eager and alt', () => {
    render(<MediaFrame src="/hero.jpg" alt="Members at the summit" eager />)
    expect(screen.getByRole('img', { name: 'Members at the summit' })).toHaveAttribute('loading', 'eager')
  })

  it('should zoom on group hover with a reduced motion fallback', () => {
    render(<MediaFrame src="/hero.jpg" alt="Summit" />)
    expect(screen.getByRole('img')).toHaveClass('group-hover:scale-105', 'motion-reduce:transition-none', 'motion-reduce:group-hover:scale-100')
  })

  it('should use the ratio given and warn on an unknown one', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})
    const { container, rerender } = render(<MediaFrame src="/a.jpg" ratio="16/9" />)
    expect(container.firstElementChild).toHaveClass('aspect-video')
    rerender(<MediaFrame src="/a.jpg" ratio="21/9" />)
    expect(container.firstElementChild).toHaveClass('aspect-3/2')
    expect(error).toHaveBeenCalledWith(expect.stringMatching(/MediaFrame: ratio "21\/9"/))
  })

  it('should zoom when the group is hovered or holds keyboard focus, with no zoom for reduced motion', () => {
    const { container } = render(<MediaFrame src="/recap.jpg" />)
    expect(container.querySelector('img')).toHaveClass(
      'group-hover:scale-105',
      'group-has-[:focus-visible]:scale-105',
      'motion-reduce:group-has-[:focus-visible]:scale-100',
    )
  })
})
