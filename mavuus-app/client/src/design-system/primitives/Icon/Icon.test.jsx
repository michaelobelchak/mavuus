import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Star } from 'lucide-react'
import { Icon } from './Icon'

describe('Icon', () => {
  it('should be decorative and aria-hidden when no label is given', () => {
    const { container } = render(<Icon icon={Star} />)
    const svg = container.querySelector('svg')
    expect(svg).toHaveAttribute('aria-hidden', 'true')
    expect(screen.queryByRole('img')).toBeNull()
  })

  it('should be a labeled img when given label', () => {
    render(<Icon icon={Star} label="Top rated" />)
    const img = screen.getByRole('img', { name: 'Top rated' })
    expect(img).not.toHaveAttribute('aria-hidden')
  })

  it.each([
    ['sm', 'size-4'],
    ['md', 'size-5'],
    ['lg', 'size-6'],
    [undefined, 'size-5'],
  ])('should use the icon size scale when size is %s', (size, cls) => {
    const { container } = render(<Icon icon={Star} size={size} />)
    expect(container.querySelector('svg')).toHaveClass(cls, 'shrink-0')
  })

  it('should merge className and pass props to the svg', () => {
    const { container } = render(<Icon icon={Star} className="text-text-brand" data-testid="star" />)
    const svg = container.querySelector('svg')
    expect(svg).toHaveClass('text-text-brand')
    expect(svg).toHaveAttribute('data-testid', 'star')
  })
})
