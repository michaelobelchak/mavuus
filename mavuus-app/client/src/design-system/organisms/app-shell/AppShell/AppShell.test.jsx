import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mockViewport } from '../../../test/browserMocks'
import { MEMBER_NAV } from '../nav'
import { AppShell } from './AppShell'
import { SIDEBAR_STORAGE_KEY } from './sidebarStorage'

const member = { name: 'Demo User', email: 'demo@mavuus.com', role: 'member', avatar_url: null }

function Where() {
  return <p data-testid="where">{useLocation().pathname}</p>
}

function renderShell(width, { path = '/dashboard/jobs', ...props } = {}) {
  mockViewport(width)
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route
          path="*"
          element={
            <AppShell nav={MEMBER_NAV} user={member} title="Jobs" notifications={{ count: 2, onClick: () => {} }} {...props}>
              <p>Page content</p>
              <Where />
            </AppShell>
          }
        />
      </Routes>
    </MemoryRouter>,
  )
}

beforeEach(() => {
  window.localStorage.clear()
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('AppShell', () => {
  it('should show the full sidebar with the active item marked current at 1280px and up', () => {
    renderShell(1440)
    const nav = screen.getByRole('navigation', { name: 'Main' })
    expect(within(nav).getByRole('link', { name: 'Jobs' })).toHaveAttribute('aria-current', 'page')
    expect(within(nav).getByRole('link', { name: 'Jobs' })).toHaveTextContent('Jobs')
    expect(screen.queryByRole('button', { name: 'Open menu' })).not.toBeInTheDocument()
  })

  it('should render the content in the main landmark with the page title', () => {
    renderShell(1440)
    expect(screen.getByRole('main')).toHaveAttribute('id', 'main-content')
    expect(within(screen.getByRole('main')).getByText('Page content')).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 1, name: 'Jobs' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Notifications, 2 unread' })).toBeInTheDocument()
  })

  it('should show an icon rail with tooltip labels between 1024 and 1279px', () => {
    renderShell(1100)
    const link = within(screen.getByRole('navigation', { name: 'Main' })).getByRole('link', { name: 'Jobs' })
    expect(link).not.toHaveTextContent('Jobs')
    expect(link).toHaveAccessibleDescription('Jobs')
    expect(link).toHaveAttribute('aria-current', 'page')
  })

  it('should expand the rail and remember the choice when the toggle is pressed', async () => {
    const user = userEvent.setup()
    renderShell(1100)
    await user.click(screen.getByRole('button', { name: 'Expand sidebar' }))
    expect(within(screen.getByRole('navigation', { name: 'Main' })).getByRole('link', { name: 'Jobs' })).toHaveTextContent(
      'Jobs',
    )
    expect(window.localStorage.getItem(SIDEBAR_STORAGE_KEY)).toBe('false')
  })

  it('should start collapsed when the stored preference says so', () => {
    window.localStorage.setItem(SIDEBAR_STORAGE_KEY, 'true')
    renderShell(1440)
    expect(screen.getByRole('button', { name: 'Expand sidebar' })).toBeInTheDocument()
  })

  it('should still render when localStorage throws', async () => {
    const user = userEvent.setup()
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked')
    })
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked')
    })
    renderShell(1440)
    await user.click(screen.getByRole('button', { name: 'Collapse sidebar' }))
    expect(screen.getByRole('button', { name: 'Expand sidebar' })).toBeInTheDocument()
  })

  it('should hide the sidebar below 1024px and open it in a sheet from the menu button', async () => {
    const user = userEvent.setup()
    renderShell(390)
    expect(screen.queryByRole('navigation', { name: 'Main' })).not.toBeInTheDocument()
    const button = screen.getByRole('button', { name: 'Open menu' })
    await user.click(button)
    const dialog = await screen.findByRole('dialog')
    expect(within(dialog).getByRole('navigation', { name: 'Main' })).toBeInTheDocument()
    expect(button).toHaveAttribute('aria-expanded', 'true')
  })

  it('should close the sheet on Escape and return focus to the menu button', async () => {
    const user = userEvent.setup()
    renderShell(390)
    const button = screen.getByRole('button', { name: 'Open menu' })
    await user.click(button)
    await screen.findByRole('dialog')
    await user.keyboard('{Escape}')
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    await waitFor(() => expect(button).toHaveFocus())
  })

  it('should close the sheet when a nav link is followed', async () => {
    const user = userEvent.setup()
    renderShell(390)
    await user.click(screen.getByRole('button', { name: 'Open menu' }))
    const dialog = await screen.findByRole('dialog')
    await user.click(within(dialog).getByRole('link', { name: 'Speakers' }))
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    expect(screen.getByTestId('where')).toHaveTextContent('/dashboard/speakers')
  })

  it('should open the sheet on first render with defaultNavOpen', async () => {
    renderShell(390, { defaultNavOpen: true })
    expect(await screen.findByRole('dialog')).toBeInTheDocument()
  })

  it('should move focus to the main region from the skip link', async () => {
    const user = userEvent.setup()
    renderShell(1440)
    await user.click(screen.getByRole('link', { name: 'Skip to main content' }))
    expect(screen.getByRole('main')).toHaveFocus()
  })
})
