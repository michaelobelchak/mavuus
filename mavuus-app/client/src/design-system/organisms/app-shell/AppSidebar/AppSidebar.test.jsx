import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { ADMIN_NAV, MEMBER_NAV } from '../nav'
import { AppSidebar } from './AppSidebar'

function renderSidebar(props = {}, path = '/dashboard') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <AppSidebar nav={MEMBER_NAV} {...props} />
    </MemoryRouter>,
  )
}

describe('AppSidebar', () => {
  it('should render the nav as a Main landmark with every item', () => {
    renderSidebar()
    const nav = screen.getByRole('navigation', { name: 'Main' })
    expect(within(nav).getByRole('link', { name: 'Home' })).toBeInTheDocument()
    expect(within(nav).getByRole('link', { name: 'Invite' })).toBeInTheDocument()
  })

  it('should mark exactly one item current when two items share a path', () => {
    renderSidebar({}, '/dashboard/members?filter=connections')
    const current = screen.getAllByRole('link', { current: 'page' })
    expect(current).toHaveLength(1)
    expect(current[0]).toHaveAccessibleName('Connections')
  })

  it('should label each admin section list with its heading', () => {
    renderSidebar({ nav: ADMIN_NAV }, '/admin/users/3')
    const people = screen.getByRole('list', { name: 'People' })
    expect(within(people).getByRole('link', { name: 'Users' })).toHaveAttribute('aria-current', 'page')
  })

  it('should link the default logo home', () => {
    renderSidebar({ logoTo: '/dashboard' })
    expect(screen.getByRole('link', { name: 'Mavuus home' })).toHaveAttribute('href', '/dashboard')
    expect(screen.getByRole('img', { name: 'Mavuus' })).toBeInTheDocument()
  })

  it('should keep section names and item names but drop visible labels when collapsed', () => {
    renderSidebar({ nav: ADMIN_NAV, collapsed: true }, '/admin')
    expect(screen.getByRole('list', { name: 'People' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Users' })).not.toHaveTextContent('Users')
    expect(screen.getByRole('link', { name: 'Mavuus home' })).toBeInTheDocument()
  })

  it('should call onNavigate when an item is followed', async () => {
    const user = userEvent.setup()
    const onNavigate = vi.fn()
    renderSidebar({ onNavigate })
    await user.click(screen.getByRole('link', { name: 'Speakers' }))
    expect(onNavigate).toHaveBeenCalledOnce()
  })

  it('should render the footer slot and badge counts', () => {
    renderSidebar({ footer: <button type="button">Log out</button>, badges: { messages: 2 } })
    expect(screen.getByRole('button', { name: 'Log out' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Messages, 2 new' })).toBeInTheDocument()
  })

  it('should offer a collapse toggle that reports the next state when onCollapsedChange is set', async () => {
    const user = userEvent.setup()
    const onCollapsedChange = vi.fn()
    const { rerender } = renderSidebar({ onCollapsedChange })
    await user.click(screen.getByRole('button', { name: 'Collapse sidebar' }))
    expect(onCollapsedChange).toHaveBeenLastCalledWith(true)
    rerender(
      <MemoryRouter>
        <AppSidebar nav={MEMBER_NAV} collapsed onCollapsedChange={onCollapsedChange} />
      </MemoryRouter>,
    )
    await user.click(screen.getByRole('button', { name: 'Expand sidebar' }))
    expect(onCollapsedChange).toHaveBeenLastCalledWith(false)
  })
})
