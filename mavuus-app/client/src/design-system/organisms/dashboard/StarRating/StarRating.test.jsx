import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { StarRating } from './StarRating'

describe('StarRating', () => {
  it('should read as one image with the value when read only', () => {
    render(<StarRating value={4.5} />)
    const rating = screen.getByRole('img', { name: '4.5 out of 5 stars' })
    expect(rating.querySelectorAll('svg')).toHaveLength(5)
    expect(screen.queryByRole('radio')).toBeNull()
  })

  it('should fill the stars up to the rounded value', () => {
    render(<StarRating value={3.6} />)
    const stars = screen.getByRole('img').querySelectorAll('svg')
    expect([...stars].filter((star) => star.dataset.filled === 'true')).toHaveLength(4)
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
