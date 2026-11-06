import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { AppTopBar } from './AppTopBar'

const admin = { name: 'Demo User', email: 'demo@mavuus.com', role: 'admin', avatar_url: null }

function renderBar(props = {}) {
  return render(
    <MemoryRouter>
      <AppTopBar title="Jobs" user={admin} {...props} />
    </MemoryRouter>,
  )
}

describe('AppTopBar', () => {
  it('should render the title as the page h1', () => {
    renderBar()
    expect(screen.getByRole('heading', { level: 1, name: 'Jobs' })).toBeInTheDocument()
  })

  it('should render breadcrumbs above the title when given', () => {
    renderBar({ breadcrumbs: [{ label: 'Users', to: '/admin/users' }, { label: 'Ada Lovelace' }] })
    expect(screen.getByRole('navigation', { name: 'Breadcrumb' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Users' })).toHaveAttribute('href', '/admin/users')
  })

  it('should name the notifications button with the unread count and call onClick', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    renderBar({ notifications: { count: 3, onClick } })
    await user.click(screen.getByRole('button', { name: 'Notifications, 3 unread' }))
    expect(onClick).toHaveBeenCalledOnce()
  })

  it('should drop the count from the name when nothing is unread', () => {
    renderBar({ notifications: { count: 0, onClick: () => {} } })
    expect(screen.getByRole('button', { name: 'Notifications' })).toBeInTheDocument()
  })

  it('should open the account menu with the admin panel for admins and log out from it', async () => {
    const user = userEvent.setup()
    const onLogout = vi.fn()
    renderBar({ onLogout })
    await user.click(screen.getByRole('button', { name: 'Account menu' }))
    expect(await screen.findByRole('menuitem', { name: 'Profile' })).toBeInTheDocument()
    expect(screen.getByRole('menuitem', { name: 'Admin panel' })).toBeInTheDocument()
    await user.click(screen.getByRole('menuitem', { name: 'Log out' }))
    expect(onLogout).toHaveBeenCalledOnce()
  })

  it('should use the userMenuItems it is given', async () => {
    const user = userEvent.setup()
    renderBar({ userMenuItems: [{ label: 'Billing', to: '/billing' }] })
    await user.click(screen.getByRole('button', { name: 'Account menu' }))
    expect(await screen.findByRole('menuitem', { name: 'Billing' })).toBeInTheDocument()
    expect(screen.queryByRole('menuitem', { name: 'Profile' })).not.toBeInTheDocument()
  })

  it('should show the menu button only with onOpenNav and reflect navOpen', async () => {
    const user = userEvent.setup()
    const onOpenNav = vi.fn()
    const { rerender } = renderBar()
    expect(screen.queryByRole('button', { name: 'Open menu' })).not.toBeInTheDocument()
    rerender(
      <MemoryRouter>
        <AppTopBar title="Jobs" user={admin} onOpenNav={onOpenNav} navOpen={false} />
      </MemoryRouter>,
    )
    const button = screen.getByRole('button', { name: 'Open menu' })
    expect(button).toHaveAttribute('aria-expanded', 'false')
    await user.click(button)
    expect(onOpenNav).toHaveBeenCalledOnce()
  })

  it('should render the search and actions slots', () => {
    renderBar({ search: <input aria-label="Search everything" />, actions: <button type="button">New job</button> })
    expect(screen.getByRole('textbox', { name: 'Search everything' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'New job' })).toBeInTheDocument()
  })
})
