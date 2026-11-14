import { describe, it, expect, vi, afterEach } from 'vitest'
import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, RouterProvider, createMemoryRouter, useLocation } from 'react-router-dom'
import { mockApi, reply } from '../../test/mockApi'
import LiveSessionsPage from './LiveSessionsPage'

const live = [
  { id: 1, type: 'live', title: 'Building a Content Engine', category: 'Content Strategy', scheduled_date: '2026-03-20', duration: '60 min', speaker_name: 'Sarah Chen' },
  { id: 2, type: 'live', title: 'ABM at Scale', category: 'ABM', scheduled_date: '2026-04-02', duration: '45 min', speaker_name: 'Leah Andrew' },
]

function Where() {
  const { search } = useLocation()
  return <p data-testid="where">{search}</p>
}

function renderPage(routes, { url = '/dashboard/live-sessions' } = {}) {
  const fetchMock = mockApi(routes ?? { 'GET /api/sessions': { data: live, totalPages: 2 } })
  render(
    <MemoryRouter initialEntries={[url]}>
      <LiveSessionsPage />
      <Where />
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

  it('should keep search, category and page in the URL', async () => {
    const user = userEvent.setup()
    const fetchMock = renderPage()
    await screen.findByRole('link', { name: 'ABM at Scale' })
    await user.click(screen.getByRole('button', { name: 'ABM' }))
    await waitFor(() => expect(screen.getByTestId('where')).toHaveTextContent('?category=ABM'))
    await user.click(await screen.findByRole('button', { name: 'Next page' }))
    await waitFor(() => expect(screen.getByTestId('where')).toHaveTextContent('?category=ABM&page=2'))
    await user.type(screen.getByRole('searchbox', { name: 'Search sessions' }), 'scale')
    await waitFor(() => expect(screen.getByTestId('where')).toHaveTextContent('?category=ABM&q=scale'))
    expect(lastQuery(fetchMock).get('page')).toBe('1')
  })

  it('should start from the filters in a shared link', async () => {
    const fetchMock = renderPage(undefined, { url: '/dashboard/live-sessions?category=ABM&page=2&q=scale' })
    await screen.findByRole('link', { name: 'ABM at Scale' })
    expect(Object.fromEntries(lastQuery(fetchMock))).toMatchObject({ category: 'ABM', page: '2', search: 'scale', type: 'live' })
    expect(screen.getByRole('button', { name: 'ABM' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('searchbox', { name: 'Search sessions' })).toHaveValue('scale')
  })

  it('should treat a response that is not a list as empty', async () => {
    renderPage({ 'GET /api/sessions': { data: { oops: true } } })
    expect(await screen.findByRole('heading', { name: 'No sessions found' })).toBeInTheDocument()
  })

  it('should abort the old request and never show its late answer when the filter changes', async () => {
    const user = userEvent.setup()
    let finishOld
    const fetchMock = renderPage({
      'GET /api/sessions': (url) =>
        url.includes('category=ABM')
          ? { data: [live[1]], totalPages: 1 }
          : new Promise((resolve) => (finishOld = resolve)),
    })
    expect(screen.getByRole('list', { name: 'Live sessions' })).toHaveAttribute('aria-busy', 'true')
    await user.click(screen.getByRole('button', { name: 'ABM' }))
    expect(await screen.findByRole('link', { name: 'ABM at Scale' })).toBeInTheDocument()
    expect(fetchMock.mock.calls[0][1].signal.aborted).toBe(true)
    await act(async () => finishOld({ data: live, totalPages: 2 }))
    expect(screen.queryByRole('link', { name: 'Building a Content Engine' })).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'ABM at Scale' })).toBeInTheDocument()
  })

  it('should keep a typed trailing space after the search runs', async () => {
    const user = userEvent.setup()
    const fetchMock = renderPage()
    await screen.findByRole('link', { name: 'ABM at Scale' })
    const field = screen.getByRole('searchbox', { name: 'Search sessions' })
    await user.type(field, 'growth ')
    await waitFor(() => expect(lastQuery(fetchMock).get('search')).toBe('growth'))
    await new Promise((resolve) => setTimeout(resolve, 400))
    expect(field).toHaveValue('growth ')
  })

  it('should replace the history entry while typing and push one for chips and pages', async () => {
    const user = userEvent.setup()
    mockApi({ 'GET /api/sessions': { data: live, totalPages: 2 } })
    const router = createMemoryRouter([{ path: '/dashboard/live-sessions', element: <LiveSessionsPage /> }], {
      initialEntries: ['/dashboard/live-sessions'],
    })
    render(<RouterProvider router={router} />)
    await screen.findByRole('link', { name: 'ABM at Scale' })

    await user.type(screen.getByRole('searchbox', { name: 'Search sessions' }), 'abm')
    await waitFor(() => expect(router.state.location.search).toBe('?q=abm'))
    expect(router.state.historyAction).toBe('REPLACE')

    await user.click(screen.getByRole('button', { name: 'ABM' }))
    await waitFor(() => expect(router.state.location.search).toBe('?q=abm&category=ABM'))
    expect(router.state.historyAction).toBe('PUSH')

    await user.click(await screen.findByRole('button', { name: 'Next page' }))
    await waitFor(() => expect(router.state.location.search).toBe('?q=abm&category=ABM&page=2'))
    expect(router.state.historyAction).toBe('PUSH')

    await act(() => router.navigate(-1))
    expect(router.state.location.search).toBe('?q=abm&category=ABM')
    await act(() => router.navigate(-1))
    // The typed search replaced the first entry, so back lands on it, not on each keystroke.
    expect(router.state.location.search).toBe('?q=abm')
    expect(screen.getByRole('button', { name: 'ABM' })).toHaveAttribute('aria-pressed', 'false')
  })
})
