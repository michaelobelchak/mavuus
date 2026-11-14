import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { StarRating } from './StarRating'

describe('StarRating', () => {
  it('should read as one image with the value when read only', () => {
    render(<StarRating value={4.5} />)
    const rating = screen.getByRole('img', { name: '4.5 out of 5 stars' })
    expect(rating.querySelectorAll('[data-star]')).toHaveLength(5)
    expect(screen.queryByRole('radio')).toBeNull()
  })

  it('should fill the stars to the nearest half star', () => {
    render(<StarRating value={3.6} />)
    const stars = [...screen.getByRole('img').querySelectorAll('[data-star]')]
    expect(stars.map((star) => star.dataset.star)).toEqual(['full', 'full', 'full', 'half', 'empty'])
  })

  it('should show 4.5 as four full stars and a half star', () => {
    render(<StarRating value={4.5} />)
    const stars = [...screen.getByRole('img').querySelectorAll('[data-star]')]
    expect(stars.map((star) => star.dataset.star)).toEqual(['full', 'full', 'full', 'full', 'half'])
  })

  it('should use the rating color for filled stars and the muted text color for empty ones', () => {
    render(<StarRating value={1} />)
    const stars = screen.getByRole('img').querySelectorAll('[data-star]')
    expect(stars[0].querySelector('svg')).toHaveClass('text-status-rating', 'fill-current')
    expect(stars[1].querySelector('svg')).toHaveClass('text-text-muted')
  })

  it('should call the consumer onMouseLeave as well as resetting the hover preview', () => {
    const onMouseLeave = vi.fn()
    render(<StarRating value={2} onChange={() => {}} onMouseLeave={onMouseLeave} />)
    fireEvent.mouseLeave(screen.getByRole('group'))
    expect(onMouseLeave).toHaveBeenCalledTimes(1)
  })

  it('should render a labelled radio group and call onChange when given onChange', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<StarRating value={2} onChange={onChange} label="Your rating" />)
    expect(screen.getByRole('group', { name: 'Your rating' })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: '2 stars' })).toBeChecked()
    await user.click(screen.getByRole('radio', { name: '4 stars' }))
    expect(onChange).toHaveBeenCalledWith(4)
  })

  it('should move the rating with the arrow keys like any radio group', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<StarRating value={3} onChange={onChange} />)
    screen.getByRole('radio', { name: '3 stars' }).focus()
    await user.keyboard('{ArrowRight}')
    expect(onChange).toHaveBeenCalledWith(4)
  })

  it('should name the first star in the singular', () => {
    render(<StarRating value={0} onChange={() => {}} />)
    expect(screen.getByRole('radio', { name: '1 star' })).not.toBeChecked()
  })
})
