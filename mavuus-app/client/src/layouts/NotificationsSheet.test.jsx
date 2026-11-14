import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { NotificationsSheet } from './NotificationsSheet'

const FOCUSABLE = 'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])'

const now = new Date().toISOString()
const items = [
  { id: 1, type: 'message', title: 'New message from Leah', message: 'Hi there', link: '/dashboard/messages', is_read: 0, created_at: now },
  { id: 2, type: 'job', title: 'Application viewed', message: 'Acme looked at it', link: '/dashboard/my-jobs', is_read: 1, created_at: now },
]

function Where() {
  return <p data-testid="where">{useLocation().pathname}</p>
}

function renderSheet(props = {}) {
  const handlers = { onOpenChange: vi.fn(), onMarkRead: vi.fn(), onMarkAllRead: vi.fn(), onRetry: vi.fn() }
  const result = render(
    <MemoryRouter initialEntries={['/dashboard']}>
      <button type="button">Bell</button>
      <NotificationsSheet id="notifications" open items={items} unreadCount={1} {...handlers} {...props} />
      <Routes>
        <Route path="*" element={<Where />} />
      </Routes>
    </MemoryRouter>,
  )
  return { ...result, ...handlers }
}

describe('NotificationsSheet', () => {
  it('should render nothing focusable when closed', () => {
    const { baseElement } = renderSheet({ open: false })
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /New message from Leah/ })).not.toBeInTheDocument()
    // Only the page's own Bell button stays focusable.
    const focusable = [...baseElement.querySelectorAll(FOCUSABLE)].map((el) => el.textContent)
    expect(focusable).toEqual(['Bell'])
  })

  it('should list notifications in a named dialog with the unread count', () => {
    renderSheet()
    const dialog = screen.getByRole('dialog', { name: 'Notifications' })
    expect(dialog).toHaveAttribute('id', 'notifications')
    expect(within(dialog).getByText('1 unread')).toBeInTheDocument()
    const link = within(dialog).getByRole('link', { name: /New message from Leah/ })
    expect(link).toHaveAttribute('href', '/dashboard/messages')
    expect(link).toHaveTextContent('Unread')
    expect(within(dialog).getByRole('link', { name: /Application viewed/ })).not.toHaveTextContent('Unread')
  })

  it('should mark an unread notification read, close and go to its link when picked', async () => {
    const user = userEvent.setup()
    const { onMarkRead, onOpenChange } = renderSheet()
    await user.click(screen.getByRole('link', { name: /New message from Leah/ }))
    expect(onMarkRead).toHaveBeenCalledWith(1)
    expect(onOpenChange).toHaveBeenCalledWith(false)
    expect(screen.getByTestId('where')).toHaveTextContent('/dashboard/messages')
  })

  it('should not mark a read notification again', async () => {
    const user = userEvent.setup()
    const { onMarkRead } = renderSheet()
    await user.click(screen.getByRole('link', { name: /Application viewed/ }))
    expect(onMarkRead).not.toHaveBeenCalled()
  })

  it('should mark all read and only offer it while something is unread', async () => {
    const user = userEvent.setup()
    const { onMarkAllRead, rerender } = renderSheet()
    await user.click(screen.getByRole('button', { name: 'Mark all read' }))
    expect(onMarkAllRead).toHaveBeenCalledOnce()
    rerender(
      <MemoryRouter>
        <NotificationsSheet open items={items.map((n) => ({ ...n, is_read: 1 }))} unreadCount={0} onOpenChange={() => {}} />
      </MemoryRouter>,
    )
    expect(screen.queryByRole('button', { name: 'Mark all read' })).not.toBeInTheDocument()
  })

  it('should filter to unread notifications and show an empty state when none are left', async () => {
    const user = userEvent.setup()
    renderSheet({ items: [items[1]], unreadCount: 0 })
    const unread = screen.getByRole('button', { name: /^Unread/ })
    expect(unread).toHaveAttribute('aria-pressed', 'false')
    await user.click(unread)
    expect(unread).toHaveAttribute('aria-pressed', 'true')
    expect(screen.queryByRole('link', { name: /Application viewed/ })).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'All caught up' })).toBeInTheDocument()
  })

  it('should show an empty state when there are no notifications', () => {
    renderSheet({ items: [], unreadCount: 0 })
    expect(screen.getByRole('heading', { name: 'No notifications yet' })).toBeInTheDocument()
  })

  it('should show a busy list while loading and an error with retry when the fetch fails', async () => {
    const user = userEvent.setup()
    const { rerender, onRetry } = renderSheet({ items: [], loading: true })
    expect(screen.getByRole('dialog')).toHaveAttribute('aria-busy', 'true')
    rerender(
      <MemoryRouter>
        <NotificationsSheet open items={[]} error="Network down" unreadCount={0} onOpenChange={() => {}} onRetry={onRetry} />
      </MemoryRouter>,
    )
    expect(screen.getByRole('alert')).toHaveTextContent("Couldn't load your notifications")
    await user.click(screen.getByRole('button', { name: 'Try again' }))
    expect(onRetry).toHaveBeenCalledOnce()
  })
})
