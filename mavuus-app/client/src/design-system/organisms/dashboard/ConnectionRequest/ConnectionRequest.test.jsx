import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { ConnectionRequest, ConnectionRequestSkeleton } from './ConnectionRequest'

const request = { name: 'Hana Kim', title: 'Director of Demand Gen', company: 'Adatum' }

function renderRequest(props = {}) {
  return render(
    <MemoryRouter>
      <ConnectionRequest {...request} to="/dashboard/members/12" {...props} />
    </MemoryRouter>,
  )
}

describe('ConnectionRequest', () => {
  it('should link to the profile through the name and show the role', () => {
    renderRequest()
    expect(screen.getByRole('link', { name: 'Hana Kim' })).toHaveAttribute('href', '/dashboard/members/12')
    expect(screen.getByText('Director of Demand Gen at Adatum')).toBeInTheDocument()
  })

  it('should call onAccept and onDecline without following the profile link when pending', async () => {
    const user = userEvent.setup()
    const onAccept = vi.fn()
    const onDecline = vi.fn()
    renderRequest({ onAccept, onDecline })
    const accept = screen.getByRole('button', { name: 'Accept Hana Kim' })
    expect(accept.closest('a')).toBeNull()
    await user.click(accept)
    await user.click(screen.getByRole('button', { name: 'Decline Hana Kim' }))
    expect(onAccept).toHaveBeenCalledTimes(1)
    expect(onDecline).toHaveBeenCalledTimes(1)
  })

  it('should show the busy state on the button being processed', () => {
    renderRequest({ onAccept: () => {}, onDecline: () => {}, accepting: true })
    expect(screen.getByRole('button', { name: /Accept Hana Kim/ })).toHaveAttribute('aria-busy', 'true')
    expect(screen.getByRole('button', { name: 'Decline Hana Kim' })).toBeDisabled()
  })

  it('should show Connected and a message link once accepted', () => {
    renderRequest({ status: 'accepted', messageTo: '/dashboard/messages?user=12' })
    expect(screen.queryByRole('button', { name: /Accept/ })).toBeNull()
    expect(screen.getByText('Connected')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Message Hana Kim' })).toHaveAttribute('href', '/dashboard/messages?user=12')
  })

  it('should show Declined once declined', () => {
    renderRequest({ status: 'declined' })
    expect(screen.getByText('Declined')).toBeInTheDocument()
    expect(screen.queryByRole('button')).toBeNull()
  })

  it('should announce the status change in a polite live region', () => {
    const { rerender } = renderRequest({ onAccept: () => {}, onDecline: () => {} })
    rerender(
      <MemoryRouter>
        <ConnectionRequest {...request} status="accepted" />
      </MemoryRouter>,
    )
    expect(screen.getByRole('status')).toHaveTextContent('Connected with Hana Kim')
  })

  it('should render the title alone when there is no company', () => {
    renderRequest({ company: undefined })
    expect(screen.getByText('Director of Demand Gen')).toBeInTheDocument()
  })

  it('should render a busy skeleton', () => {
    render(<ConnectionRequestSkeleton data-testid="skeleton" />)
    expect(screen.getByTestId('skeleton')).toHaveAttribute('aria-busy', 'true')
  })
})
