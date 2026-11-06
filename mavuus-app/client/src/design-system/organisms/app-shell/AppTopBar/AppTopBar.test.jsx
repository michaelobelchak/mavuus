import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { createRef } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { mockViewport } from '../../../test/browserMocks'
import { AppTopBar } from './AppTopBar'

const admin = { name: 'Demo User', email: 'demo@mavuus.com', role: 'admin', avatar_url: null }

function renderBar(props = {}) {
  return render(
    <MemoryRouter>
      <AppTopBar title="Jobs" user={admin} {...props} />
    </MemoryRouter>,
  )
}

afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

const searchSlot = <input aria-label="Search everything" />

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
    mockViewport(1024)
    renderBar({ search: <input aria-label="Search everything" />, actions: <button type="button">New job</button> })
    expect(screen.getByRole('textbox', { name: 'Search everything' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'New job' })).toBeInTheDocument()
  })

  it('should expose open, controls and a ref on the notifications button for a drawer', () => {
    const buttonRef = createRef()
    renderBar({ notifications: { count: 3, onClick: () => {}, open: true, controlsId: 'notifications-drawer', buttonRef } })
    const button = screen.getByRole('button', { name: 'Notifications, 3 unread' })
    expect(button).toHaveAttribute('aria-expanded', 'true')
    expect(button).toHaveAttribute('aria-controls', 'notifications-drawer')
    expect(buttonRef.current).toBe(button)
  })

  it('should leave aria-expanded off when open is not given', () => {
    renderBar({ notifications: { count: 1, onClick: () => {} } })
    expect(screen.getByRole('button', { name: 'Notifications, 1 unread' })).not.toHaveAttribute('aria-expanded')
  })

  it('should pulse the bell briefly when the count goes up and pulse is on', () => {
    vi.useFakeTimers()
    const { rerender } = renderBar({ notifications: { count: 2, onClick: () => {}, pulse: true } })
    const wrapper = () => screen.getByRole('button', { name: /^Notifications/ }).parentElement
    expect(wrapper()).not.toHaveAttribute('data-pulse')
    rerender(
      <MemoryRouter>
        <AppTopBar title="Jobs" user={admin} notifications={{ count: 3, onClick: () => {}, pulse: true }} />
      </MemoryRouter>,
    )
    expect(wrapper()).toHaveAttribute('data-pulse')
    expect(wrapper()).toHaveClass('ds-animate-pulse')
    act(() => vi.advanceTimersByTime(700))
    expect(wrapper()).not.toHaveAttribute('data-pulse')
  })

  it('should not pulse when pulse is off', () => {
    const { rerender } = renderBar({ notifications: { count: 2, onClick: () => {} } })
    rerender(
      <MemoryRouter>
        <AppTopBar title="Jobs" user={admin} notifications={{ count: 3, onClick: () => {} }} />
      </MemoryRouter>,
    )
    expect(screen.getByRole('button', { name: /^Notifications/ }).parentElement).not.toHaveAttribute('data-pulse')
  })

  it('should put search behind a button below 768px that opens it with focus in the field', async () => {
    const user = userEvent.setup()
    mockViewport(390)
    renderBar({ search: searchSlot })
    expect(screen.queryByRole('textbox', { name: 'Search everything' })).not.toBeInTheDocument()
    const button = screen.getByRole('button', { name: 'Search' })
    await user.click(button)
    await waitFor(() => expect(screen.getByRole('textbox', { name: 'Search everything' })).toHaveFocus(), { timeout: 3000 })
    await user.keyboard('{Escape}')
    await waitFor(() => expect(screen.queryByRole('textbox', { name: 'Search everything' })).not.toBeInTheDocument(), {
      timeout: 3000,
    })
    await waitFor(() => expect(button).toHaveFocus(), { timeout: 3000 })
  })

  it('should focus the search field when / is pressed outside a field', async () => {
    const user = userEvent.setup()
    mockViewport(1024)
    renderBar({ search: searchSlot })
    await user.keyboard('/')
    expect(screen.getByRole('textbox', { name: 'Search everything' })).toHaveFocus()
    expect(screen.getByRole('textbox', { name: 'Search everything' })).toHaveValue('')
  })

  it('should ignore / while typing in another field', async () => {
    const user = userEvent.setup()
    mockViewport(1024)
    render(
      <MemoryRouter>
        <textarea aria-label="Note" />
        <AppTopBar title="Jobs" user={admin} search={searchSlot} />
      </MemoryRouter>,
    )
    const note = screen.getByRole('textbox', { name: 'Note' })
    await user.click(note)
    await user.keyboard('a/b')
    expect(note).toHaveFocus()
    expect(note).toHaveValue('a/b')
  })

  it('should open the mobile search with / below 768px', async () => {
    const user = userEvent.setup()
    mockViewport(390)
    renderBar({ search: searchSlot })
    await user.keyboard('/')
    await waitFor(() => expect(screen.getByRole('textbox', { name: 'Search everything' })).toHaveFocus(), { timeout: 3000 })
  })

  it('should keep the mobile search closed after widening past 768px and narrowing again', async () => {
    const user = userEvent.setup()
    const viewport = mockViewport(390)
    renderBar({ search: searchSlot })
    await user.click(screen.getByRole('button', { name: 'Search' }))
    await waitFor(() => expect(screen.getByRole('textbox', { name: 'Search everything' })).toHaveFocus(), { timeout: 3000 })
    act(() => viewport.resize(1024))
    expect(screen.queryByRole('button', { name: 'Search' })).not.toBeInTheDocument()
    act(() => viewport.resize(390))
    await waitFor(() => expect(screen.queryByRole('textbox', { name: 'Search everything' })).not.toBeInTheDocument(), {
      timeout: 3000,
    })
    expect(screen.getByRole('button', { name: 'Search' })).toHaveAttribute('aria-expanded', 'false')
  })
})
