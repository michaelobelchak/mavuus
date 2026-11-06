import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { RecommendationCard, RecommendationCardSkeleton } from './RecommendationCard'

const recommendation = {
  fromName: 'Marcus Lee',
  fromTitle: 'CMO, Fabrikam',
  message: 'Priya rebuilt our lifecycle program in a quarter. I would hire her again tomorrow.',
  subject: 'Lumen Creative',
  dateLabel: 'Sep 14, 2026',
  dateTime: '2026-09-14',
}

describe('RecommendationCard', () => {
  it('should show who recommended, the message, the subject and the date', () => {
    render(<RecommendationCard {...recommendation} />)
    expect(screen.getByRole('article', { name: 'Recommendation from Marcus Lee' })).toBeInTheDocument()
    expect(screen.getByText('CMO, Fabrikam')).toBeInTheDocument()
    expect(screen.getByText(recommendation.message)).toBeInTheDocument()
    expect(screen.getByText('Lumen Creative')).toBeInTheDocument()
    expect(screen.getByText('Sep 14, 2026')).toBeInTheDocument()
  })

  it('should leave out the subject and the date when missing', () => {
    const { container } = render(<RecommendationCard fromName="Ana Souza" message="Great partner." />)
    expect(screen.getByText('AS')).toBeInTheDocument()
    expect(container.querySelector('time')).toBeNull()
  })

  it('should render a busy skeleton', () => {
    render(<RecommendationCardSkeleton data-testid="skeleton" />)
    expect(screen.getByTestId('skeleton')).toHaveAttribute('aria-busy', 'true')
  })

  it('should leave the skeleton silent with announce false, for grids that set aria-busy on the list', () => {
    render(<RecommendationCardSkeleton data-testid="quiet" announce={false} />)
    const quiet = screen.getByTestId('quiet')
    expect(quiet).toHaveAttribute('aria-hidden', 'true')
    expect(quiet).not.toHaveAttribute('aria-busy')
    expect(screen.queryByText('Loading recommendation')).toBeNull()
  })

  it('should use the skeleton label prop', () => {
    render(<RecommendationCardSkeleton label="Loading more" />)
    expect(screen.getByText('Loading more')).toHaveClass('sr-only')
  })
})
