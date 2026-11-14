import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mockViewport } from '@/design-system/test/browserMocks'
import AdminLayout from './AdminLayout'
import MemberLayout from './MemberLayout'

const auth = vi.hoisted(() => ({ value: null }))
vi.mock('../context/AuthContext', () => ({ useAuth: () => auth.value }))

const now = new Date().toISOString()
const NOTIFICATIONS = [
  { id: 1, type: 'message', title: 'New message from Leah', message: 'Hi', link: '/dashboard/messages', is_read: 0, created_at: now },
  { id: 2, type: 'job', title: 'Application viewed', message: 'Acme', link: '/dashboard/my-jobs', is_read: 0, created_at: now },
]

function json(body, ok = true) {
  return { ok, status: ok ? 200 : 500, json: async () => body }
}

let fetchMock
function routeFetch(url, init = {}) {
  if (url === '/api/notifications/unread-count') return json({ count: 2 })
  if (url === '/api/messages/unread-count') return json({ count: 4 })
  if (url === '/api/notifications') return json(NOTIFICATIONS)
  if (init.method === 'PUT') return json({ success: true })
  if (url === '/api/auth/resend-verification') return json({ ok: true })
  return json({})
}

function Page({ name }) {
  return <h2>{`${name} page at ${useLocation().pathname}`}</h2>
}

function renderApp(path, width = 1440) {
  mockViewport(width)
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/" element={<Page name="Public" />} />
        <Route path="/dashboard" element={<MemberLayout />}>
          <Route index element={<Page name="Home" />} />
          <Route path="jobs" element={<Page name="Jobs" />} />
          <Route path="jobs/:id" element={<Page name="Job" />} />
          <Route path="messages" element={<Page name="Messages" />} />
        </Route>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Page name="Admin" />} />
          <Route path="users" element={<Page name="Users" />} />
        </Route>
      </Routes>
    </MemoryRouter>,
  )
}

beforeEach(() => {
  window.localStorage.clear()
  auth.value = {
    user: { id: 1, name: 'Demo User', email: 'demo@mavuus.com', role: 'admin', avatar_url: null, email_verified: 1 },
    token: 'token-123',
    logout: vi.fn(),
  }
  fetchMock = vi.fn(async (url, init) => routeFetch(url, init))
  vi.stubGlobal('fetch', fetchMock)
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('MemberLayout', () => {
  it('should frame the page with the member nav, the route title and one skip link', async () => {
    renderApp('/dashboard/jobs')
    expect(await screen.findByRole('heading', { name: 'Jobs page at /dashboard/jobs' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 1, name: 'Jobs' })).toBeInTheDocument()
    const nav = screen.getByRole('navigation', { name: 'Main' })
    expect(within(nav).getByRole('link', { name: 'Jobs' })).toHaveAttribute('aria-current', 'page')
    expect(screen.getAllByRole('link', { name: 'Skip to main content' })).toHaveLength(1)
    expect(within(screen.getByRole('main')).getByRole('heading', { name: /Jobs page/ })).toBeInTheDocument()
  })

  it('should title detail pages and keep their list item current', async () => {
    renderApp('/dashboard/jobs/9')
    expect(await screen.findByRole('heading', { level: 1, name: 'Job details' })).toBeInTheDocument()
    const nav = screen.getByRole('navigation', { name: 'Main' })
    expect(within(nav).getByRole('link', { name: 'Jobs' })).toHaveAttribute('aria-current', 'page')
  })

  it('should show the unread counts on the bell and the Messages item with the token', async () => {
    renderApp('/dashboard')
    expect(await screen.findByRole('button', { name: 'Notifications, 2 unread' })).toBeInTheDocument()
    expect(await screen.findByRole('link', { name: 'Messages, 4 new' })).toBeInTheDocument()
    const call = fetchMock.mock.calls.find(([url]) => url === '/api/notifications/unread-count')
    expect(call[1].headers).toEqual({ Authorization: 'Bearer token-123' })
  })

  it('should keep the closed notifications panel out of the page and the tab order', async () => {
    renderApp('/dashboard')
    await screen.findByRole('button', { name: 'Notifications, 2 unread' })
    expect(screen.queryByRole('dialog', { name: 'Notifications' })).not.toBeInTheDocument()
    expect(screen.queryByText('New message from Leah')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Mark all read' })).not.toBeInTheDocument()
  })

  it('should open the notifications sheet from the bell, mark one read and return focus on close', async () => {
    const user = userEvent.setup()
    renderApp('/dashboard')
    const bell = await screen.findByRole('button', { name: 'Notifications, 2 unread' })
    await user.click(bell)
    const dialog = await screen.findByRole('dialog', { name: 'Notifications' })
    expect(bell).toHaveAttribute('aria-expanded', 'true')
    expect(bell).toHaveAttribute('aria-controls', dialog.id)
    await user.click(await within(dialog).findByRole('link', { name: /New message from Leah/ }))
    expect(fetchMock).toHaveBeenCalledWith('/api/notifications/1/read', expect.objectContaining({ method: 'PUT' }))
    expect(await screen.findByRole('heading', { name: 'Messages page at /dashboard/messages' })).toBeInTheDocument()
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    expect(await screen.findByRole('button', { name: 'Notifications, 1 unread' })).toBeInTheDocument()
  })

  it('should mark all read from the sheet and drop the count', async () => {
    const user = userEvent.setup()
    renderApp('/dashboard')
    await user.click(await screen.findByRole('button', { name: 'Notifications, 2 unread' }))
    const dialog = await screen.findByRole('dialog', { name: 'Notifications' })
    await user.click(within(dialog).getByRole('button', { name: 'Mark all read' }))
    expect(fetchMock).toHaveBeenCalledWith('/api/notifications/read-all', expect.objectContaining({ method: 'PUT' }))
    await user.keyboard('{Escape}')
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    expect(screen.getByRole('button', { name: 'Notifications' })).toHaveFocus()
  })

  it('should offer the admin panel and sign out from the account menu', async () => {
    const user = userEvent.setup()
    renderApp('/dashboard')
    await user.click(screen.getByRole('button', { name: 'Account menu' }))
    expect(await screen.findByRole('menuitem', { name: 'Admin panel' })).toBeInTheDocument()
    await user.click(screen.getByRole('menuitem', { name: 'Log out' }))
    expect(auth.value.logout).toHaveBeenCalledOnce()
    expect(await screen.findByRole('heading', { name: 'Public page at /' })).toBeInTheDocument()
  })

  it('should leave the admin panel out of the account menu for members', async () => {
    const user = userEvent.setup()
    auth.value.user = { ...auth.value.user, role: 'member' }
    renderApp('/dashboard')
    await user.click(screen.getByRole('button', { name: 'Account menu' }))
    expect(await screen.findByRole('menuitem', { name: 'Log out' })).toBeInTheDocument()
    expect(screen.queryByRole('menuitem', { name: 'Admin panel' })).not.toBeInTheDocument()
  })

  it('should ask unverified members to verify their email and resend the link', async () => {
    const user = userEvent.setup()
    auth.value.user = { ...auth.value.user, email_verified: 0 }
    renderApp('/dashboard')
    expect(screen.getByText('Please verify your email')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Resend' }))
    expect(fetchMock).toHaveBeenCalledWith('/api/auth/resend-verification', expect.objectContaining({ method: 'POST' }))
    expect(await screen.findByText('We sent a new link. Check your inbox.')).toBeInTheDocument()
  })

  it('should put the search in the top bar', () => {
    renderApp('/dashboard')
    expect(screen.getByRole('searchbox', { name: 'Search sessions, resources, members' })).toBeInTheDocument()
  })
})

describe('AdminLayout', () => {
  it('should frame admin pages with the admin nav, title and a way back to the dashboard', async () => {
    renderApp('/admin/users')
    expect(await screen.findByRole('heading', { name: 'Users page at /admin/users' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 1, name: 'Users' })).toBeInTheDocument()
    const nav = screen.getByRole('navigation', { name: 'Admin' })
    expect(within(nav).getByRole('link', { name: 'Users' })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('link', { name: 'Back to dashboard' })).toHaveAttribute('href', '/dashboard')
    expect(screen.getByRole('link', { name: 'Mavuus home' })).toHaveAttribute('href', '/admin')
    expect(screen.queryByRole('searchbox')).not.toBeInTheDocument()
  })

  it('should keep the way back as an icon link with its name in the rail', async () => {
    renderApp('/admin', 1100)
    expect(await screen.findByRole('heading', { level: 1, name: 'Overview' })).toBeInTheDocument()
    const back = screen.getByRole('link', { name: 'Back to dashboard' })
    expect(back).not.toHaveTextContent('Back to dashboard')
  })
})
