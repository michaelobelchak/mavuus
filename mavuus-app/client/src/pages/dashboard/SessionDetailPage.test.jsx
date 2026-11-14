import { describe, it, expect, vi, afterEach } from 'vitest'
import { StrictMode } from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { toast } from 'sonner'
import { mockApi, reply } from '../../test/mockApi'
import SessionDetailPage from './SessionDetailPage'

vi.mock('../../context/AuthContext', async () => {
  const { demoAuth } = await import('../../test/mockApi')
  return { useAuth: () => demoAuth }
})
vi.mock('../../hooks/useConfetti', () => ({ fireConfetti: vi.fn() }))

const future = new Date(Date.now() + 3 * 86400000).toISOString()
const liveSession = {
  id: 1,
  type: 'live',
  title: 'Building a Content Engine',
  category: 'Content Strategy',
  scheduled_date: future,
  duration: '60 min',
  views: 2,
  description: 'Learn how to build a content machine.',
  speaker_name: 'Sarah Chen',
  speaker_title: 'VP of Marketing, TechFlow',
}
const recording = { ...liveSession, id: 7, type: 'on-demand', title: 'Mastering LinkedIn Ads', scheduled_date: null, video_url: 'https://youtu.be/abc' }
const related = [{ id: 2, type: 'live', title: 'ABM at Scale', category: 'ABM', scheduled_date: '2026-04-02', duration: '45 min' }]

function renderPage(path, routes, { strict = false } = {}) {
  const fetchMock = mockApi({ 'GET /api/comments': [], 'PUT /api/sessions/1/view': {}, 'PUT /api/sessions/2/view': {}, 'PUT /api/sessions/7/view': {}, ...routes })
  const tree = (
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/dashboard/live-sessions/:id" element={<SessionDetailPage />} />
        <Route path="/dashboard/on-demand/:id" element={<SessionDetailPage />} />
      </Routes>
    </MemoryRouter>
  )
  render(strict ? <StrictMode>{tree}</StrictMode> : tree)
  return fetchMock
}

const viewCalls = (fetchMock, id) => fetchMock.mock.calls.filter(([url, init]) => url === `/api/sessions/${id}/view` && init?.method === 'PUT').length

const liveRoutes = (registered = false) => ({
  'GET /api/sessions/1': liveSession,
  'GET /api/sessions/1/registration-status': { registered },
  'GET /api/sessions/1/related': related,
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('SessionDetailPage', () => {
  it('should show the session as an h2 under the shell title, with a back link and details', async () => {
    renderPage('/dashboard/live-sessions/1', liveRoutes())
    expect(await screen.findByRole('heading', { level: 2, name: 'Building a Content Engine' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { level: 1 })).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Back to Live Sessions' })).toHaveAttribute('href', '/dashboard/live-sessions')
    expect(screen.getByText('Learn how to build a content machine.')).toBeInTheDocument()
    expect(screen.getByText('Sarah Chen')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'ABM at Scale' })).toHaveAttribute('href', '/dashboard/live-sessions/2')
    expect(screen.getByRole('heading', { name: 'Comments (0)' })).toBeInTheDocument()
  })

  it('should show the countdown and registration form for an upcoming session', async () => {
    renderPage('/dashboard/live-sessions/1', liveRoutes())
    expect(await screen.findByText('Live session starts in')).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: /First name/ })).toHaveValue('Demo')
    expect(screen.getByRole('textbox', { name: /Email address/ })).toHaveValue('demo@mavuus.com')
  })

  it('should register, confirm with a toast and switch to the registered state', async () => {
    const user = userEvent.setup()
    const success = vi.spyOn(toast, 'success').mockImplementation(() => {})
    const fetchMock = renderPage('/dashboard/live-sessions/1', { ...liveRoutes(), 'POST /api/sessions/1/register': { alreadyRegistered: false } })
    await user.click(await screen.findByRole('button', { name: 'Register for Session' }))
    await waitFor(() => expect(success).toHaveBeenCalled())
    expect(fetchMock.mock.calls.some(([url, init]) => url === '/api/sessions/1/register' && init?.method === 'POST')).toBe(true)
    expect(screen.getByText("You're Registered!")).toBeInTheDocument()
    expect(screen.queryByText('Live session starts in')).not.toBeInTheDocument()
  })

  it('should show the error from the API in a toast when registering fails', async () => {
    const user = userEvent.setup()
    const error = vi.spyOn(toast, 'error').mockImplementation(() => {})
    renderPage('/dashboard/live-sessions/1', { ...liveRoutes(), 'POST /api/sessions/1/register': reply(400, { error: 'Session is full' }) })
    await user.click(await screen.findByRole('button', { name: 'Register for Session' }))
    await waitFor(() => expect(error).toHaveBeenCalledWith('Session is full', undefined))
  })

  it('should play a recording and link back to On-Demand', async () => {
    renderPage('/dashboard/on-demand/7', {
      'GET /api/sessions/7': recording,
      'GET /api/sessions/7/registration-status': { registered: false },
      'GET /api/sessions/7/related': [],
    })
    expect(await screen.findByRole('heading', { level: 2, name: 'Watch' })).toBeInTheDocument()
    expect(screen.getByTitle('Mastering LinkedIn Ads')).toHaveAttribute('src', 'https://www.youtube-nocookie.com/embed/abc')
    expect(screen.getByRole('link', { name: 'Back to On-Demand' })).toHaveAttribute('href', '/dashboard/on-demand')
    expect(screen.getByRole('link', { name: 'Watch Now' })).toHaveAttribute('href', '#watch')
  })

  it('should open the share dialog from Share', async () => {
    const user = userEvent.setup()
    renderPage('/dashboard/live-sessions/1', liveRoutes(true))
    await user.click(await screen.findByRole('button', { name: 'Share' }))
    expect(screen.getByRole('dialog', { name: 'Share Event With Your Friends' })).toBeInTheDocument()
  })

  it('should say when the session is not found', async () => {
    renderPage('/dashboard/live-sessions/1', {})
    expect(await screen.findByRole('heading', { name: 'Session not found' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Back to Live Sessions' })).toHaveAttribute('href', '/dashboard/live-sessions')
  })

  it('should show an error with Try again when the session fails to load, then load it on retry', async () => {
    const user = userEvent.setup()
    let fail = true
    renderPage('/dashboard/live-sessions/1', {
      ...liveRoutes(),
      'GET /api/sessions/1': () => (fail ? reply(500, {}) : liveSession),
    })
    expect(await screen.findByRole('alert')).toHaveTextContent("We couldn't load this session")
    expect(screen.queryByRole('heading', { name: 'Session not found' })).not.toBeInTheDocument()
    fail = false
    await user.click(screen.getByRole('button', { name: 'Try again' }))
    expect(await screen.findByRole('heading', { level: 2, name: 'Building a Content Engine' })).toBeInTheDocument()
  })

  it('should show the error, not "not found", when the network fails', async () => {
    renderPage('/dashboard/live-sessions/1', { 'GET /api/sessions/1': () => new TypeError('Failed to fetch') })
    expect(await screen.findByRole('alert')).toHaveTextContent("We couldn't load this session")
  })

  it('should put the action and info cards before the comments, so phones reach them first', async () => {
    renderPage('/dashboard/live-sessions/1', liveRoutes())
    const aside = await screen.findByRole('complementary', { name: 'Session info' })
    const comments = screen.getByRole('region', { name: /^Comments/ })
    expect(aside.compareDocumentPosition(comments) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })

  it('should show the skeleton, then the new session, when a related card is followed', async () => {
    const user = userEvent.setup()
    let answer
    renderPage('/dashboard/live-sessions/1', {
      ...liveRoutes(true),
      'GET /api/sessions/2': () => new Promise((resolve) => (answer = resolve)),
      'GET /api/sessions/2/registration-status': { registered: false },
      'GET /api/sessions/2/related': [],
    })
    expect(await screen.findByText("You're Registered!")).toBeInTheDocument()
    await user.click(screen.getByRole('link', { name: 'ABM at Scale' }))
    expect(screen.getByText('Loading session')).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Building a Content Engine' })).not.toBeInTheDocument()
    answer({ ...related[0], description: 'Account based.' })
    expect(await screen.findByRole('heading', { level: 2, name: 'ABM at Scale' })).toBeInTheDocument()
    // Registration is per session: the new one isn't registered.
    expect(await screen.findByRole('button', { name: 'Register for Session' })).toBeInTheDocument()
    expect(screen.queryByText("You're Registered!")).not.toBeInTheDocument()
  })

  it('should show not found when a followed related session is missing', async () => {
    const user = userEvent.setup()
    renderPage('/dashboard/live-sessions/1', liveRoutes())
    await user.click(await screen.findByRole('link', { name: 'ABM at Scale' }))
    expect(await screen.findByRole('heading', { name: 'Session not found' })).toBeInTheDocument()
  })

  it('should count one view per session, even in StrictMode', async () => {
    const user = userEvent.setup()
    const fetchMock = renderPage(
      '/dashboard/live-sessions/1',
      { ...liveRoutes(), 'GET /api/sessions/2': related[0], 'GET /api/sessions/2/related': [] },
      { strict: true },
    )
    await screen.findByRole('heading', { level: 2, name: 'Building a Content Engine' })
    expect(viewCalls(fetchMock, 1)).toBe(1)
    await user.click(screen.getByRole('link', { name: 'ABM at Scale' }))
    await screen.findByRole('heading', { level: 2, name: 'ABM at Scale' })
    expect(viewCalls(fetchMock, 2)).toBe(1)
    expect(viewCalls(fetchMock, 1)).toBe(1)
  })

  it('should prefill the job title and company from the profile', async () => {
    renderPage('/dashboard/live-sessions/1', { ...liveRoutes(), 'GET /api/profile/me': { title: 'VP Marketing', company: 'Acme' } })
    expect(await screen.findByRole('textbox', { name: 'Current job title' })).toHaveValue('VP Marketing')
    expect(screen.getByRole('textbox', { name: 'Company name' })).toHaveValue('Acme')
    expect(screen.getByRole('textbox', { name: /First name/ })).toHaveAttribute('placeholder', 'Enter your first name')
  })

  it('should not jump to the confirmation after the member has left the page', async () => {
    const user = userEvent.setup()
    vi.spyOn(toast, 'success').mockImplementation(() => {})
    const fetchMock = mockApi({ 'GET /api/comments': [], ...liveRoutes(), 'POST /api/sessions/1/register': { alreadyRegistered: true } })
    render(
      <MemoryRouter initialEntries={['/dashboard/live-sessions/1']}>
        <Routes>
          <Route path="/dashboard/live-sessions" element={<p>Session list</p>} />
          <Route path="/dashboard/live-sessions/:id" element={<SessionDetailPage />} />
          <Route path="/events/:id/confirmation" element={<p>Confirmation</p>} />
        </Routes>
      </MemoryRouter>,
    )
    await user.click(await screen.findByRole('button', { name: 'Register for Session' }))
    await waitFor(() => expect(fetchMock.mock.calls.some(([url]) => url === '/api/sessions/1/register')).toBe(true))
    await user.click(screen.getByRole('link', { name: 'Back to Live Sessions' }))
    expect(screen.getByText('Session list')).toBeInTheDocument()
    await new Promise((resolve) => setTimeout(resolve, 1400))
    expect(screen.queryByText('Confirmation')).not.toBeInTheDocument()
  })
})
