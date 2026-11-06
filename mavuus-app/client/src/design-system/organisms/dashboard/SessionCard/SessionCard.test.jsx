import { describe, expect, it, vi } from 'vitest'
import userEvent from '@testing-library/user-event'
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

  it('should name the article by its title', () => {
    renderCard()
    expect(screen.getByRole('article', { name: session.title })).toBeInTheDocument()
  })

  it('should keep actions clickable outside the card link', async () => {
    const user = userEvent.setup()
    const onRegister = vi.fn()
    renderCard({ actions: <button type="button" onClick={onRegister}>Register</button> })
    const button = screen.getByRole('button', { name: 'Register' })
    expect(button.closest('a')).toBeNull()
    await user.click(button)
    expect(onRegister).toHaveBeenCalledTimes(1)
  })

  it('should only zoom the image on hover when the card is a link', () => {
    const { unmount } = renderCard()
    expect(screen.getByRole('article')).toHaveClass('group')
    unmount()
    render(<SessionCard {...session} />)
    expect(screen.getByRole('article')).not.toHaveClass('group')
  })

  it('should leave the skeleton silent with announce false, for grids that set aria-busy on the list', () => {
    render(<SessionCardSkeleton data-testid="quiet" announce={false} />)
    const quiet = screen.getByTestId('quiet')
    expect(quiet).toHaveAttribute('aria-hidden', 'true')
    expect(quiet).not.toHaveAttribute('aria-busy')
    expect(screen.queryByText('Loading session')).toBeNull()
  })

  it('should use the skeleton label prop', () => {
    render(<SessionCardSkeleton label="Loading more" />)
    expect(screen.getByText('Loading more')).toHaveClass('sr-only')
  })
})
