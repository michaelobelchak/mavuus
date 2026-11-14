import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { mockApi, reply } from '../../test/mockApi'
import LiveSessionsPage from './LiveSessionsPage'

const live = [
  { id: 1, type: 'live', title: 'Building a Content Engine', category: 'Content Strategy', scheduled_date: '2026-03-20', duration: '60 min', speaker_name: 'Sarah Chen' },
  { id: 2, type: 'live', title: 'ABM at Scale', category: 'ABM', scheduled_date: '2026-04-02', duration: '45 min', speaker_name: 'Leah Andrew' },
]

function renderPage(routes) {
  const fetchMock = mockApi(routes ?? { 'GET /api/sessions': { data: live, totalPages: 2 } })
  render(
    <MemoryRouter>
      <LiveSessionsPage />
    </MemoryRouter>,
  )
  return fetchMock
}

const lastQuery = (fetchMock) => new URL(fetchMock.mock.calls.at(-1)[0], 'http://x').searchParams

afterEach(() => vi.unstubAllGlobals())

describe('LiveSessionsPage', () => {
  it('should list live sessions as linked cards with no page h1', async () => {
    const fetchMock = renderPage()
    expect(await screen.findByRole('link', { name: 'Building a Content Engine' })).toHaveAttribute('href', '/dashboard/live-sessions/1')
    expect(screen.getByText('Fri, Mar 20')).toBeInTheDocument()
    expect(screen.queryByRole('heading', { level: 1 })).not.toBeInTheDocument()
    expect(Object.fromEntries(lastQuery(fetchMock))).toEqual({ type: 'live', page: '1', limit: '20' })
  })

  it('should filter by category and search, back on page 1', async () => {
    const user = userEvent.setup()
    const fetchMock = renderPage()
    await screen.findByRole('link', { name: 'ABM at Scale' })
    await user.click(screen.getByRole('button', { name: 'Next page' }))
    await waitFor(() => expect(lastQuery(fetchMock).get('page')).toBe('2'))
    await user.click(screen.getByRole('button', { name: 'ABM' }))
    await waitFor(() => expect(lastQuery(fetchMock).get('category')).toBe('ABM'))
    expect(lastQuery(fetchMock).get('page')).toBe('1')
    await user.type(screen.getByRole('searchbox', { name: 'Search sessions' }), 'scale')
    await waitFor(() => expect(lastQuery(fetchMock).get('search')).toBe('scale'))
  })

  it('should show the empty state when nothing matches', async () => {
    renderPage({ 'GET /api/sessions': { data: [], totalPages: 1 } })
    expect(await screen.findByRole('heading', { name: 'No sessions found' })).toBeInTheDocument()
  })

  it('should show an error with Try again when the request fails', async () => {
    const user = userEvent.setup()
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const fetchMock = renderPage({ 'GET /api/sessions': reply(500, {}) })
    expect(await screen.findByRole('alert')).toHaveTextContent("We couldn't load the live sessions")
    const calls = fetchMock.mock.calls.length
    await user.click(screen.getByRole('button', { name: 'Try again' }))
    await waitFor(() => expect(fetchMock.mock.calls.length).toBe(calls + 1))
  })
})
