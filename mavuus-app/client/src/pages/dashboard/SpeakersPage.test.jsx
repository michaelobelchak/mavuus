import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { mockApi, reply } from '../../test/mockApi'
import SpeakersPage from './SpeakersPage'

vi.mock('../../context/AuthContext', async () => {
  const { demoAuth } = await import('../../test/mockApi')
  return { useAuth: () => demoAuth }
})

const speakers = [
  { id: 1, name: 'Sarah Chen', title: 'VP of Marketing', company: 'TechFlow', avatar_url: '/images/avatars/avatar-01.webp', linkedin_url: 'https://linkedin.com/in/sarahchen' },
  { id: 2, name: 'Omar Hassan', title: 'VP Brand', company: 'Canva' },
]
const sarah = {
  ...speakers[0],
  bio: 'Sarah leads marketing at TechFlow.',
  sessions: [
    { id: 4, title: 'Building a Content Engine', type: 'live', duration: '60 min' },
    { id: 9, title: 'Brand Basics', type: 'on-demand', duration: '45 min' },
  ],
}

afterEach(() => vi.unstubAllGlobals())

function renderPage(url = '/dashboard/speakers', routes = {}) {
  const fetchMock = mockApi({ 'GET /api/speakers': speakers, 'GET /api/speakers/1': sarah, ...routes })
  render(
    <MemoryRouter initialEntries={[url]}>
      <SpeakersPage />
    </MemoryRouter>,
  )
  return fetchMock
}

describe('SpeakersPage', () => {
  it('should list speakers from /api/speakers without paging params or a page h1', async () => {
    const fetchMock = renderPage()
    expect(await screen.findByRole('link', { name: 'Sarah Chen' })).toBeInTheDocument()
    expect(screen.getByText('Canva')).toBeInTheDocument()
    expect(fetchMock.mock.calls[0][0]).toBe('/api/speakers')
    expect(screen.queryByRole('heading', { level: 1 })).not.toBeInTheDocument()
    expect(screen.queryByRole('complementary', { name: 'Speaker details' })).not.toBeInTheDocument()
  })

  it('should send the search to the API', async () => {
    const user = userEvent.setup()
    const fetchMock = renderPage()
    await screen.findByRole('link', { name: 'Sarah Chen' })
    await user.type(screen.getByRole('searchbox', { name: 'Search speakers' }), 'omar')
    await waitFor(() => expect(fetchMock.mock.calls.at(-1)[0]).toBe('/api/speakers?search=omar'))
  })

  it('should open the speaker details beside the list when a card is picked', async () => {
    const user = userEvent.setup()
    renderPage()
    await user.click(await screen.findByRole('link', { name: 'Sarah Chen' }))
    const panel = await screen.findByRole('complementary', { name: 'Speaker details' })
    expect(await within(panel).findByRole('heading', { level: 2, name: 'Sarah Chen' })).toBeInTheDocument()
    expect(within(panel).getByText('Sarah leads marketing at TechFlow.')).toBeInTheDocument()
    expect(within(panel).getByRole('link', { name: /LinkedIn Profile/ })).toHaveAttribute('href', 'https://linkedin.com/in/sarahchen')
    expect(within(panel).getByRole('heading', { level: 3, name: 'Sessions (2)' })).toBeInTheDocument()
    expect(within(panel).getByRole('link', { name: 'Building a Content Engine' })).toHaveAttribute('href', '/dashboard/live-sessions/4')
    expect(within(panel).getByRole('link', { name: 'Brand Basics' })).toHaveAttribute('href', '/dashboard/on-demand/9')
  })

  it('should show an error with Try again when the speaker fails to load', async () => {
    renderPage('/dashboard/speakers?speaker=1', { 'GET /api/speakers/1': reply(500, { error: 'boom' }) })
    const panel = await screen.findByRole('complementary', { name: 'Speaker details' })
    expect(await within(panel).findByText("We couldn't load this speaker")).toBeInTheDocument()
    expect(within(panel).getByRole('button', { name: 'Try again' })).toBeInTheDocument()
  })
})
