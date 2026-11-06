import { act, render, screen, waitFor, within } from '@testing-library/react'
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
  const viewport = mockViewport(width)
  const result = render(
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
  return { ...result, resize: (next) => act(() => viewport.resize(next)) }
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

  it('should show the stored expanded preference in the 1024 to 1279px band', () => {
    window.localStorage.setItem(SIDEBAR_STORAGE_KEY, 'false')
    renderShell(1100)
    expect(screen.getByRole('button', { name: 'Collapse sidebar' })).toBeInTheDocument()
    expect(within(screen.getByRole('navigation', { name: 'Main' })).getByRole('link', { name: 'Jobs' })).toHaveTextContent(
      'Jobs',
    )
  })

  it('should always show the full sidebar without a toggle at 1280px and up, whatever is stored', () => {
    window.localStorage.setItem(SIDEBAR_STORAGE_KEY, 'true')
    renderShell(1440)
    expect(within(screen.getByRole('navigation', { name: 'Main' })).getByRole('link', { name: 'Jobs' })).toHaveTextContent(
      'Jobs',
    )
    expect(screen.queryByRole('button', { name: /(Collapse|Expand) sidebar/ })).not.toBeInTheDocument()
  })

  it('should still render and toggle when localStorage throws', async () => {
    const user = userEvent.setup()
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked')
    })
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked')
    })
    renderShell(1100)
    await user.click(screen.getByRole('button', { name: 'Expand sidebar' }))
    expect(screen.getByRole('button', { name: 'Collapse sidebar' })).toBeInTheDocument()
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

  it('should focus the active nav link when the sheet opens', async () => {
    const user = userEvent.setup()
    renderShell(390)
    await user.click(screen.getByRole('button', { name: 'Open menu' }))
    const dialog = await screen.findByRole('dialog')
    await waitFor(() => expect(within(dialog).getByRole('link', { name: 'Jobs' })).toHaveFocus())
  })

  it('should focus the first nav link when no item is active', async () => {
    const user = userEvent.setup()
    renderShell(390, { path: '/dashboard/somewhere-else' })
    await user.click(screen.getByRole('button', { name: 'Open menu' }))
    const dialog = await screen.findByRole('dialog')
    await waitFor(() => expect(within(dialog).getByRole('link', { name: 'Home' })).toHaveFocus())
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

  it('should keep the sheet closed after resizing to desktop and back while it was open', async () => {
    const { resize } = renderShell(390, { defaultNavOpen: true })
    await screen.findByRole('dialog')
    resize(1440)
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    expect(screen.getByRole('navigation', { name: 'Main' })).toBeInTheDocument()
    resize(390)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Open menu' })).toHaveAttribute('aria-expanded', 'false')
  })

  it('should release the scroll lock and the inert outside content when the open sheet unmounts on resize', async () => {
    const { resize } = renderShell(390, { defaultNavOpen: true })
    await screen.findByRole('dialog')
    resize(1440)
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    await waitFor(() => {
      expect(document.body.style.overflow).toBe('')
      expect(document.documentElement.style.overflow).toBe('')
      expect(document.querySelectorAll('[inert], [aria-hidden="true"][data-base-ui-inert]')).toHaveLength(0)
    })
    expect(screen.getByRole('main')).not.toHaveAttribute('inert')
  })

  it('should go rail, full, then rail again across 1280px with a stored collapsed preference', () => {
    window.localStorage.setItem(SIDEBAR_STORAGE_KEY, 'true')
    const { resize } = renderShell(1100)
    const jobs = () => within(screen.getByRole('navigation', { name: 'Main' })).getByRole('link', { name: 'Jobs' })
    expect(jobs()).not.toHaveTextContent('Jobs')
    resize(1440)
    expect(jobs()).toHaveTextContent('Jobs')
    resize(1100)
    expect(jobs()).not.toHaveTextContent('Jobs')
    expect(screen.getByRole('button', { name: 'Expand sidebar' })).toBeInTheDocument()
  })
})
