import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { MessageThreadItem, MessageThreadItemSkeleton } from './MessageThreadItem'

const thread = {
  name: 'Marcus Lee',
  preview: 'Happy to share the deck from the pipeline review. Does Thursday work?',
  time: '10:42 AM',
}

describe('MessageThreadItem', () => {
  it('should render a button that calls onSelect when given onSelect', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    render(<MessageThreadItem {...thread} onSelect={onSelect} />)
    const button = screen.getByRole('button', { name: /Marcus Lee/ })
    expect(button).toHaveAttribute('type', 'button')
    await user.click(button)
    expect(onSelect).toHaveBeenCalledTimes(1)
  })

  it('should render a link when given to', () => {
    render(
      <MemoryRouter>
        <MessageThreadItem {...thread} to="/dashboard/messages/4" />
      </MemoryRouter>,
    )
    expect(screen.getByRole('link', { name: /Marcus Lee/ })).toHaveAttribute('href', '/dashboard/messages/4')
  })

  it('should mark the selected thread with aria-current and the selected surface', () => {
    render(<MessageThreadItem {...thread} selected onSelect={() => {}} />)
    const button = screen.getByRole('button', { name: /Marcus Lee/ })
    expect(button).toHaveAttribute('aria-current', 'true')
    expect(button).toHaveClass('bg-surface-selected')
  })

  it('should show the unread count with words for screen readers and bold the name', () => {
    render(<MessageThreadItem {...thread} unreadCount={3} onSelect={() => {}} />)
    expect(screen.getByRole('button')).toHaveAccessibleName(/3 unread messages/)
    expect(screen.getByText('Marcus Lee')).toHaveClass('font-bold')
  })

  it('should prefix your own last message and fall back when there is none', () => {
    const { rerender } = render(<MessageThreadItem {...thread} fromSelf onSelect={() => {}} />)
    expect(screen.getByText(/^You:/)).toBeInTheDocument()
    rerender(<MessageThreadItem name="Ana Souza" onSelect={() => {}} />)
    expect(screen.getByText('No messages yet')).toBeInTheDocument()
    expect(screen.getByText('AS')).toBeInTheDocument()
  })

  it('should truncate the preview to one line', () => {
    render(<MessageThreadItem {...thread} onSelect={() => {}} />)
    expect(screen.getByText(thread.preview)).toHaveClass('truncate')
  })

  it('should render a busy skeleton row', () => {
    render(<MessageThreadItemSkeleton data-testid="skeleton" />)
    expect(screen.getByTestId('skeleton')).toHaveAttribute('aria-busy', 'true')
  })

  it('should leave the skeleton silent with announce false, for grids that set aria-busy on the list', () => {
    render(<MessageThreadItemSkeleton data-testid="quiet" announce={false} />)
    const quiet = screen.getByTestId('quiet')
    expect(quiet).toHaveAttribute('aria-hidden', 'true')
    expect(quiet).not.toHaveAttribute('aria-busy')
    expect(screen.queryByText('Loading conversation')).toBeNull()
  })

  it('should use the skeleton label prop', () => {
    render(<MessageThreadItemSkeleton label="Loading more" />)
    expect(screen.getByText('Loading more')).toHaveClass('sr-only')
  })
})
