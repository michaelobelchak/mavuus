import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { SessionCard, SessionCardSkeleton } from './SessionCard'

const session = {
  title: 'Building a category from zero: lessons from three B2B launches',
  category: 'Brand',
  dateLabel: 'Thu, Nov 20',
  duration: '45 min',
  speaker: { name: 'Elmira Abushayeva', title: 'Co-founder, Mavuus' },
}

function renderCard(props = {}) {
  return render(
    <MemoryRouter>
      <SessionCard {...session} to="/dashboard/live-sessions/3" {...props} />
    </MemoryRouter>,
  )
}

describe('SessionCard', () => {
  it('should link the card through the title', () => {
    renderCard()
    expect(screen.getByRole('link', { name: session.title })).toHaveAttribute('href', '/dashboard/live-sessions/3')
  })

  it('should show the category, date, duration and speaker', () => {
    renderCard()
    expect(screen.getByText('Brand')).toBeInTheDocument()
    expect(screen.getByText('Thu, Nov 20')).toBeInTheDocument()
    expect(screen.getByText('45 min')).toBeInTheDocument()
    expect(screen.getByText('Elmira Abushayeva')).toBeInTheDocument()
    expect(screen.getByText('Co-founder, Mavuus')).toBeInTheDocument()
  })

  it('should show a decorative thumbnail when given thumbnailSrc and a tinted fallback otherwise', () => {
    const { container, unmount } = renderCard({ thumbnailSrc: '/thumb.jpg' })
    expect(container.querySelector('img[src="/thumb.jpg"]')).toHaveAttribute('alt', '')
    unmount()
    const fallback = renderCard()
    expect(fallback.container.querySelector('[data-media-fallback]')).not.toBeNull()
  })

  it('should show the play overlay and views for a recording', () => {
    const { container } = renderCard({ kind: 'recording', views: 1284, thumbnailSrc: '/thumb.jpg' })
    expect(screen.getByText('1,284 views')).toBeInTheDocument()
    expect(container.querySelector('[data-play]')).not.toBeNull()
  })

  it('should clamp a long title to two lines', () => {
    renderCard()
    expect(screen.getByRole('heading', { name: session.title })).toHaveClass('line-clamp-2')
  })

  it('should leave out the speaker row when there is no speaker', () => {
    renderCard({ speaker: undefined })
    expect(screen.queryByText('Elmira Abushayeva')).toBeNull()
  })

  it('should render a busy skeleton', () => {
    render(<SessionCardSkeleton data-testid="skeleton" />)
    expect(screen.getByTestId('skeleton')).toHaveAttribute('aria-busy', 'true')
  })
})
