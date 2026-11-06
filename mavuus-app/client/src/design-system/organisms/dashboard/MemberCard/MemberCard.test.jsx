import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { MemberCard, MemberCardSkeleton } from './MemberCard'

const member = { name: 'Priya Nair', title: 'VP Marketing', company: 'Contoso', tier: 'Pro' }

function renderCard(props = {}) {
  return render(
    <MemoryRouter>
      <MemberCard {...member} to="/dashboard/members/7" {...props} />
    </MemoryRouter>,
  )
}

describe('MemberCard', () => {
  it('should link the card through the name', () => {
    renderCard()
    expect(screen.getByRole('link', { name: 'Priya Nair' })).toHaveAttribute('href', '/dashboard/members/7')
    expect(screen.getByText('VP Marketing')).toBeInTheDocument()
    expect(screen.getByText('Contoso')).toBeInTheDocument()
    expect(screen.getByText('Pro member')).toBeInTheDocument()
  })

  it('should show initials when there is no avatar', () => {
    renderCard()
    expect(screen.getByText('PN')).toBeInTheDocument()
  })

  it('should call onConnect from the Connect button outside the card link', async () => {
    const user = userEvent.setup()
    const onConnect = vi.fn()
    renderCard({ connection: 'none', onConnect })
    const button = screen.getByRole('button', { name: 'Connect with Priya Nair' })
    expect(button.closest('a')).toBeNull()
    await user.click(button)
    expect(onConnect).toHaveBeenCalledTimes(1)
  })

  it('should show a disabled Request sent button when the request is outgoing', () => {
    renderCard({ connection: 'outgoing' })
    expect(screen.getByRole('button', { name: /Request sent/ })).toBeDisabled()
    expect(screen.getByText('Pending')).toBeInTheDocument()
  })

  it('should call onAccept when the request is incoming', async () => {
    const user = userEvent.setup()
    const onAccept = vi.fn()
    renderCard({ connection: 'incoming', onAccept })
    await user.click(screen.getByRole('button', { name: 'Accept request from Priya Nair' }))
    expect(onAccept).toHaveBeenCalledTimes(1)
  })

  it('should link to messages when connected and given messageTo', () => {
    renderCard({ connection: 'connected', messageTo: '/dashboard/messages?user=7' })
    expect(screen.getByRole('link', { name: 'Message Priya Nair' })).toHaveAttribute('href', '/dashboard/messages?user=7')
    expect(screen.getByText('Connected')).toBeInTheDocument()
  })

  it('should show no connection action for your own card', () => {
    renderCard({ connection: 'none', onConnect: () => {}, isSelf: true })
    expect(screen.queryByRole('button')).toBeNull()
  })

  it('should keep the Connect button busy while connecting', () => {
    renderCard({ connection: 'none', onConnect: () => {}, connecting: true })
    expect(screen.getByRole('button', { name: /Connect with Priya Nair/ })).toHaveAttribute('aria-busy', 'true')
  })

  it('should render a busy skeleton', () => {
    render(<MemberCardSkeleton data-testid="skeleton" />)
    expect(screen.getByTestId('skeleton')).toHaveAttribute('aria-busy', 'true')
  })

  it('should name the article by the member name', () => {
    renderCard()
    expect(screen.getByRole('article', { name: 'Priya Nair' })).toBeInTheDocument()
  })

  it('should not render an empty action wrapper when there is no action', () => {
    const { container } = renderCard({ connection: 'none' })
    expect(container.querySelector('.z-\\(--ds-z-raised\\)')).toBeNull()
    expect(screen.queryByRole('button')).toBeNull()
  })

  it('should not render an action wrapper for an incoming request without onAccept or your own card', () => {
    const { container, unmount } = renderCard({ connection: 'incoming' })
    expect(container.querySelector('.z-\\(--ds-z-raised\\)')).toBeNull()
    unmount()
    const own = renderCard({ connection: 'none', onConnect: () => {}, isSelf: true })
    expect(own.container.querySelector('.z-\\(--ds-z-raised\\)')).toBeNull()
  })

  it('should show a brand badge for Pro, a neutral badge for other paid tiers and none for free', () => {
    const { unmount } = renderCard({ tier: 'pro' })
    expect(screen.getByText('Pro member')).toHaveClass('text-text-brand-strong')
    unmount()
    const team = renderCard({ tier: 'team' })
    expect(screen.getByText('Team member')).toHaveClass('text-text-secondary')
    team.unmount()
    renderCard({ tier: 'free' })
    expect(screen.queryByText(/member$/)).toBeNull()
  })

  it('should leave the skeleton silent with announce false, for grids that set aria-busy on the list', () => {
    render(<MemberCardSkeleton data-testid="quiet" announce={false} />)
    const quiet = screen.getByTestId('quiet')
    expect(quiet).toHaveAttribute('aria-hidden', 'true')
    expect(quiet).not.toHaveAttribute('aria-busy')
    expect(screen.queryByText('Loading member')).toBeNull()
  })

  it('should use the skeleton label prop', () => {
    render(<MemberCardSkeleton label="Loading more" />)
    expect(screen.getByText('Loading more')).toHaveClass('sr-only')
  })
})
