import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { toast } from 'sonner'
import { mockApi, reply } from '../../test/mockApi'
import MemberProfilePage from './MemberProfilePage'

vi.mock('../../context/AuthContext', async () => {
  const { demoAuth } = await import('../../test/mockApi')
  return { useAuth: () => demoAuth }
})

const sarah = {
  id: 1,
  name: 'Sarah Chen',
  title: 'VP of Marketing',
  company: 'TechFlow',
  membership_tier: 'pro',
  created_at: '2026-01-05 10:00:00',
  bio: 'Scaling content programs.',
  industry: 'Technology',
  years_experience: 12,
  location: 'San Francisco, CA',
  linkedin_url: 'https://linkedin.com/in/sarahchen',
  resume_url: '/uploads/resumes/sarah.pdf',
  resume_filename: 'sarah.pdf',
  skills: ['SEO', 'Content Strategy'],
  experience: [{ id: 1, title: 'VP of Marketing', company: 'TechFlow', start_date: '2022-01', is_current: 1 }],
  connection_count: 3,
  limited: false,
}

function Where() {
  const location = useLocation()
  return <output data-testid="where">{`${location.pathname}${location.search}`}</output>
}

function renderPage(id = 1, routes = {}) {
  const fetchMock = mockApi({
    'GET /api/members/1/profile': sarah,
    'GET /api/connections/status/1': { status: 'none' },
    'GET /api/jobs': { data: [{ id: 5, title: 'Content Lead', company: 'TechFlow', location: 'Remote', status: 'open' }] },
    'GET /api/jobs/completed-by/1': [],
    'GET /api/reviews/user/1': [{ id: 8, reviewer_name: 'Priya Patel', rating: 5, text: 'Great to work with.', created_at: '2026-03-10 09:00:00' }],
    'GET /api/recommendations/user/1': [{ id: 9, from_name: 'Marcus Johnson', message: 'Highly recommend.', vendor_name: 'PipelineHQ' }],
    ...routes,
  })
  render(
    <MemoryRouter initialEntries={[`/dashboard/members/${id}`]}>
      <Routes>
        <Route path="/dashboard/members/:id" element={<MemberProfilePage />} />
        <Route path="*" element={null} />
      </Routes>
      <Where />
    </MemoryRouter>,
  )
  return fetchMock
}

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('MemberProfilePage', () => {
  it('should show the full profile with the name as an h2, details, jobs, reviews and recommendations', async () => {
    const fetchMock = renderPage()
    expect(await screen.findByRole('heading', { level: 2, name: 'Sarah Chen' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { level: 1 })).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Back to Members' })).toHaveAttribute('href', '/dashboard/members')
    expect(screen.getByText('Scaling content programs.')).toBeInTheDocument()
    expect(screen.getByText('2022-01 - Present')).toBeInTheDocument()
    const info = screen.getByRole('complementary', { name: 'Member info' })
    expect(within(info).getByText('San Francisco, CA')).toBeInTheDocument()
    expect(within(info).getByText('3 connections')).toBeInTheDocument()
    expect(within(info).getByRole('link', { name: /sarah\.pdf/ })).toHaveAttribute('href', '/uploads/resumes/sarah.pdf')
    expect(await screen.findByRole('link', { name: 'Content Lead' })).toHaveAttribute('href', '/dashboard/jobs/5')
    expect(screen.getByRole('article', { name: 'Review by Priya Patel' })).toBeInTheDocument()
    expect(screen.getByRole('article', { name: 'Recommendation from Marcus Johnson' })).toBeInTheDocument()
    expect(fetchMock.mock.calls.some(([url]) => url === '/api/jobs?posted_by=1')).toBe(true)
  })

  it('should send a connection request from the header', async () => {
    const user = userEvent.setup()
    vi.spyOn(toast, 'success').mockImplementation(() => {})
    const fetchMock = renderPage(1, { 'POST /api/connections/request': { id: 40 } })
    await user.click(await screen.findByRole('button', { name: 'Connect' }))
    expect(await screen.findByRole('button', { name: 'Request sent' })).toBeDisabled()
    const [, init] = fetchMock.mock.calls.find(([url]) => url === '/api/connections/request')
    expect(JSON.parse(init.body)).toEqual({ userId: 1 })
  })

  it('should accept an incoming request and then offer Message', async () => {
    const user = userEvent.setup()
    vi.spyOn(toast, 'success').mockImplementation(() => {})
    renderPage(1, {
      'GET /api/connections/status/1': { id: 12, status: 'pending', direction: 'incoming' },
      'PUT /api/connections/12/accept': { ok: true },
    })
    await user.click(await screen.findByRole('button', { name: 'Accept request' }))
    await user.click(await screen.findByRole('button', { name: 'Message' }))
    expect(screen.getByTestId('where')).toHaveTextContent('/dashboard/messages?user=1')
  })

  it('should send one accept request however often Accept is clicked', async () => {
    const user = userEvent.setup()
    vi.spyOn(toast, 'success').mockImplementation(() => {})
    let answer
    const fetchMock = renderPage(1, { 'GET /api/connections/status/1': { id: 12, status: 'pending', direction: 'incoming' } })
    // The accept request stays open until answer() runs.
    const routes = fetchMock.getMockImplementation()
    fetchMock.mockImplementation((url, init) =>
      url === '/api/connections/12/accept'
        ? new Promise((resolve) => (answer = () => resolve({ ok: true, status: 200, json: async () => ({}) })))
        : routes(url, init),
    )
    const accept = await screen.findByRole('button', { name: 'Accept request' })
    await user.click(accept)
    await user.click(accept)
    await user.dblClick(accept)
    const puts = () => fetchMock.mock.calls.filter(([url, init]) => url === '/api/connections/12/accept' && init.method === 'PUT')
    expect(puts()).toHaveLength(1)
    answer()
    expect(await screen.findByRole('button', { name: 'Message' })).toBeInTheDocument()
    expect(puts()).toHaveLength(1)
  })

  it('should load the full profile after accepting a request on a limited profile', async () => {
    const user = userEvent.setup()
    vi.spyOn(toast, 'success').mockImplementation(() => {})
    let connected = false
    renderPage(17, {
      'GET /api/members/17/profile': () =>
        connected
          ? { ...sarah, id: 17, name: 'Rachel Foster', bio: 'Content leader at Asana.', limited: false }
          : { id: 17, name: 'Rachel Foster', profile_visibility: 'connections', limited: true },
      'GET /api/connections/status/17': { id: 30, status: 'pending', direction: 'incoming' },
      'PUT /api/connections/30/accept': () => {
        connected = true
        return { ok: true }
      },
      'GET /api/jobs/completed-by/17': [],
      'GET /api/reviews/user/17': [],
      'GET /api/recommendations/user/17': [],
    })
    expect(await screen.findByText('Limited profile')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Accept request' }))
    expect(await screen.findByText('Content leader at Asana.')).toBeInTheDocument()
    expect(screen.queryByText('Limited profile')).not.toBeInTheDocument()
  })

  it('should not offer Connect when the connection status fails to load, and retry it', async () => {
    const user = userEvent.setup()
    let fail = true
    renderPage(1, { 'GET /api/connections/status/1': () => (fail ? reply(500, { error: 'boom' }) : { status: 'none' }) })
    expect(await screen.findByText('Connection status unavailable.')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Connect' })).not.toBeInTheDocument()
    fail = false
    await user.click(screen.getByRole('button', { name: 'Try again' }))
    expect(await screen.findByRole('button', { name: 'Connect' })).toBeInTheDocument()
  })

  it('should show a limited profile without loading jobs, reviews or recommendations', async () => {
    const fetchMock = renderPage(17, {
      'GET /api/members/17/profile': { id: 17, name: 'Rachel Foster', title: 'Head of Content', company: 'Asana', profile_visibility: 'connections', limited: true },
      'GET /api/connections/status/17': { status: 'none' },
    })
    expect(await screen.findByText('Limited profile')).toBeInTheDocument()
    expect(screen.getByText(/Connect to see their full profile\./)).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: 'Rachel Foster' })).toBeInTheDocument()
    expect(fetchMock.mock.calls.some(([url]) => url.startsWith('/api/reviews') || url.startsWith('/api/jobs'))).toBe(false)
  })

  it('should tell a missing member from a failed load', async () => {
    renderPage(99, { 'GET /api/members/99/profile': reply(404, { error: 'Member not found' }) })
    expect(await screen.findByRole('heading', { name: 'Member not found' })).toBeInTheDocument()
  })

  it('should offer Try again when the profile fails to load', async () => {
    renderPage(1, { 'GET /api/members/1/profile': reply(500, { error: 'boom' }) })
    expect(await screen.findByText("We couldn't load this profile")).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Try again' })).toBeInTheDocument()
  })

  it('should send you to your own Profile page for your own id', async () => {
    renderPage(7)
    await waitFor(() => expect(screen.getByTestId('where')).toHaveTextContent('/dashboard/profile'))
  })
})
