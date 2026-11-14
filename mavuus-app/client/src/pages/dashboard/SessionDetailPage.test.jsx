import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { toast } from 'sonner'
import { mockApi } from '../../test/mockApi'
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

function renderPage(path, routes) {
  const fetchMock = mockApi({ 'GET /api/comments': [], 'PUT /api/sessions/1/view': {}, 'PUT /api/sessions/7/view': {}, ...routes })
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/dashboard/live-sessions/:id" element={<SessionDetailPage />} />
        <Route path="/dashboard/on-demand/:id" element={<SessionDetailPage />} />
      </Routes>
    </MemoryRouter>,
  )
  return fetchMock
}

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
    renderPage('/dashboard/live-sessions/1', { ...liveRoutes(), 'POST /api/sessions/1/register': { status: 400, body: { error: 'Session is full' } } })
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
    expect(screen.getByTitle('Mastering LinkedIn Ads')).toHaveAttribute('src', 'https://www.youtube.com/embed/abc')
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
})
