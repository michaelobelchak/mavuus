import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ReviewCard, ReviewCardSkeleton } from './ReviewCard'

const review = {
  reviewerName: 'Priya Nair',
  reviewerTitle: 'VP Marketing, Contoso',
  rating: 5,
  text: 'Ran our ABM program end to end and doubled pipeline in two quarters.',
  dateLabel: 'Oct 28, 2026',
  dateTime: '2026-10-28',
  subject: 'Northwind Growth',
}

describe('ReviewCard', () => {
  it('should show the reviewer, rating, text and formatted date', () => {
    render(<ReviewCard {...review} />)
    expect(screen.getByText('Priya Nair')).toBeInTheDocument()
    expect(screen.getByText('VP Marketing, Contoso')).toBeInTheDocument()
    expect(screen.getByRole('img', { name: '5 out of 5 stars' })).toBeInTheDocument()
    expect(screen.getByText(review.text)).toBeInTheDocument()
    expect(screen.getByText('Oct 28, 2026')).toBeInTheDocument()
    expect(screen.getByText('Re: Northwind Growth')).toBeInTheDocument()
  })

  it('should be an article named by the reviewer', () => {
    render(<ReviewCard {...review} />)
    expect(screen.getByRole('article', { name: 'Review by Priya Nair' })).toBeInTheDocument()
  })

  it('should put the date label in a time element with dateTime', () => {
    render(<ReviewCard {...review} />)
    const time = screen.getByText('Oct 28, 2026')
    expect(time.tagName).toBe('TIME')
    expect(time).toHaveAttribute('datetime', '2026-10-28')
  })

  it('should skip missing fields', () => {
    const { container } = render(<ReviewCard reviewerName="Sam Carter" rating={3} />)
    expect(container.querySelector('time')).toBeNull()
    expect(screen.getByText('SC')).toBeInTheDocument()
    expect(screen.queryByText(/^Re:/)).toBeNull()
  })

  it('should clamp the text when given clamp', () => {
    render(<ReviewCard {...review} clamp />)
    expect(screen.getByText(review.text)).toHaveClass('line-clamp-4')
  })

  it('should render a busy skeleton', () => {
    render(<ReviewCardSkeleton data-testid="skeleton" />)
    expect(screen.getByTestId('skeleton')).toHaveAttribute('aria-busy', 'true')
  })

  it('should leave the skeleton silent with announce false, for grids that set aria-busy on the list', () => {
    render(<ReviewCardSkeleton data-testid="quiet" announce={false} />)
    const quiet = screen.getByTestId('quiet')
    expect(quiet).toHaveAttribute('aria-hidden', 'true')
    expect(quiet).not.toHaveAttribute('aria-busy')
    expect(screen.queryByText('Loading review')).toBeNull()
  })

  it('should use the skeleton label prop', () => {
    render(<ReviewCardSkeleton label="Loading more" />)
    expect(screen.getByText('Loading more')).toHaveClass('sr-only')
  })
})
