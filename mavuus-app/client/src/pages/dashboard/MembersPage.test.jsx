import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { toast } from 'sonner'
import { mockApi } from '../../test/mockApi'
import MembersPage from './MembersPage'

vi.mock('../../context/AuthContext', async () => {
  const { demoAuth } = await import('../../test/mockApi')
  return { useAuth: () => demoAuth }
})

const members = [
  { id: 1, name: 'Sarah Chen', title: 'VP of Marketing', company: 'TechFlow', membership_tier: 'pro' },
  { id: 2, name: 'Lisa Park', title: 'VP Demand Gen', company: 'Notion', membership_tier: 'free' },
  { id: 3, name: 'Priya Patel', title: 'Director of Demand Gen', company: 'CloudScale', membership_tier: 'pro' },
  { id: 4, name: 'Alex Thompson', title: 'Head of Growth', company: 'Stripe', membership_tier: 'pro' },
  { id: 7, name: 'Demo User', title: 'Marketing Director', company: 'Mavuus', membership_tier: 'pro' },
]
const connections = [{ id: 11, connected_user_id: 1, name: 'Sarah Chen' }]
const pending = {
  incoming: [{ id: 21, user_id: 3, name: 'Priya Patel', title: 'Director of Demand Gen', company: 'CloudScale' }],
  outgoing: [{ id: 22, user_id: 4, name: 'Alex Thompson' }],
}

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

function renderPage(url = '/dashboard/members', routes = {}) {
  const fetchMock = mockApi({
    'GET /api/members': { data: members, totalPages: 1 },
    'GET /api/connections': connections,
    'GET /api/connections/pending': pending,
    ...routes,
  })
  render(
    <MemoryRouter initialEntries={[url]}>
      <MembersPage />
    </MemoryRouter>,
  )
  return fetchMock
}

const card = (name) => screen.getByRole('article', { name })

describe('MembersPage', () => {
  it('should list members with their connection state and no page h1', async () => {
    const fetchMock = renderPage()
    expect(await screen.findByRole('link', { name: 'Lisa Park' })).toHaveAttribute('href', '/dashboard/members/2')
    expect(screen.queryByRole('heading', { level: 1 })).not.toBeInTheDocument()
    await waitFor(() => expect(within(card('Sarah Chen')).getByRole('link', { name: 'Message Sarah Chen' })).toHaveAttribute('href', '/dashboard/messages?user=1'))
    expect(within(card('Alex Thompson')).getByRole('button', { name: 'Request sent' })).toBeDisabled()
    expect(within(card('Lisa Park')).getByRole('button', { name: 'Connect with Lisa Park' })).toBeEnabled()
    expect(within(card('Demo User')).queryByRole('button')).not.toBeInTheDocument()
    const query = new URL(fetchMock.mock.calls.find(([url]) => url.startsWith('/api/members'))[0], 'http://x').searchParams
    expect(query.get('page')).toBe('1')
    expect(query.get('limit')).toBe('20')
  })

  it('should send a connection request and mark the card as sent', async () => {
    const user = userEvent.setup()
    const success = vi.spyOn(toast, 'success').mockImplementation(() => {})
    const fetchMock = renderPage('/dashboard/members', { 'POST /api/connections/request': { id: 30 } })
    await user.click(await screen.findByRole('button', { name: 'Connect with Lisa Park' }))
    await waitFor(() => expect(within(card('Lisa Park')).getByRole('button', { name: 'Request sent' })).toBeDisabled())
    const [, init] = fetchMock.mock.calls.find(([url]) => url === '/api/connections/request')
    expect(JSON.parse(init.body)).toEqual({ userId: 2 })
    expect(success).toHaveBeenCalledWith('Connection request sent!', undefined)
  })

  it('should accept a pending request and drop it from the list', async () => {
    const user = userEvent.setup()
    vi.spyOn(toast, 'success').mockImplementation(() => {})
    const fetchMock = renderPage('/dashboard/members', { 'PUT /api/connections/21/accept': { ok: true } })
    const requests = await screen.findByRole('region', { name: 'Pending connection requests (1)' })
    await user.click(within(requests).getByRole('button', { name: 'Accept Priya Patel' }))
    await waitFor(() => expect(screen.queryByRole('region', { name: /Pending connection requests/ })).not.toBeInTheDocument())
    expect(fetchMock.mock.calls.some(([url, init]) => url === '/api/connections/21/accept' && init.method === 'PUT')).toBe(true)
    expect(within(card('Priya Patel')).getByRole('link', { name: 'Message Priya Patel' })).toBeInTheDocument()
  })

  it('should decline a pending request', async () => {
    const user = userEvent.setup()
    const info = vi.spyOn(toast, 'info').mockImplementation(() => {})
    renderPage('/dashboard/members', { 'PUT /api/connections/21/decline': { ok: true } })
    const requests = await screen.findByRole('region', { name: 'Pending connection requests (1)' })
    await user.click(within(requests).getByRole('button', { name: 'Decline Priya Patel' }))
    await waitFor(() => expect(info).toHaveBeenCalledWith('Connection declined', undefined))
    expect(within(card('Priya Patel')).getByRole('button', { name: 'Connect with Priya Patel' })).toBeInTheDocument()
  })

  it('should ask the API for your connections under ?filter=connections and hide the pending requests', async () => {
    const fetchMock = renderPage('/dashboard/members?filter=connections', {
      'GET /api/members?page=1&limit=20&connections=1': { data: [members[0]], totalPages: 1 },
    })
    expect(await screen.findByRole('link', { name: 'Sarah Chen' })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Lisa Park' })).not.toBeInTheDocument()
    expect(screen.queryByRole('region', { name: /Pending connection requests/ })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'My Connections' })).toHaveAttribute('aria-pressed', 'true')
    const memberCalls = fetchMock.mock.calls.filter(([url]) => url.startsWith('/api/members'))
    expect(memberCalls.every(([url]) => !new URL(url, 'http://x').searchParams.has('filter'))).toBe(true)
  })

  it('should send the tier to the API and say when there are no connections', async () => {
    const user = userEvent.setup()
    const fetchMock = renderPage('/dashboard/members', {
      'GET /api/members?page=1&limit=20&tier=free': { data: [members[1]], totalPages: 1 },
      'GET /api/members?page=1&limit=20&connections=1': { data: [], totalPages: 1 },
    })
    await screen.findByRole('link', { name: 'Sarah Chen' })
    await user.click(screen.getByRole('button', { name: 'Free' }))
    await waitFor(() => expect(screen.queryByRole('link', { name: 'Sarah Chen' })).not.toBeInTheDocument())
    expect(screen.getByRole('link', { name: 'Lisa Park' })).toBeInTheDocument()
    expect(new URL(fetchMock.mock.calls.filter(([url]) => url.startsWith('/api/members')).at(-1)[0], 'http://x').searchParams.get('tier')).toBe('free')
    await user.click(screen.getByRole('button', { name: 'My Connections' }))
    expect(await screen.findByRole('heading', { name: 'No connections yet' })).toBeInTheDocument()
    expect(screen.getByText('Connect with members to see them here.')).toBeInTheDocument()
  })
})
