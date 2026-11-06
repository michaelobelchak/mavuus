import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ReviewCard, ReviewCardSkeleton } from './ReviewCard'

const review = {
  reviewerName: 'Priya Nair',
  reviewerTitle: 'VP Marketing, Contoso',
  rating: 5,
  text: 'Ran our ABM program end to end and doubled pipeline in two quarters.',
  date: '2026-10-28T12:00:00Z',
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

  it('should show a date string that does not parse as is and skip missing fields', () => {
    render(<ReviewCard reviewerName="Sam Carter" rating={3} date="Last week" />)
    expect(screen.getByText('Last week')).toBeInTheDocument()
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
})
