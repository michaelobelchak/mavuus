import { describe, it, expect, vi, afterEach } from 'vitest'
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, useLocation, useNavigate } from 'react-router-dom'
import { mockViewport } from '@/design-system/test/browserMocks'
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

function Where() {
  const location = useLocation()
  const navigate = useNavigate()
  return (
    <>
      <output data-testid="where">{location.search}</output>
      <output data-testid="path">{location.pathname}</output>
      <button type="button" onClick={() => navigate(-1)}>
        Browser back
      </button>
    </>
  )
}

function renderPage(url = '/dashboard/speakers', routes = {}, { before = [] } = {}) {
  const fetchMock = mockApi({ 'GET /api/speakers': speakers, 'GET /api/speakers/1': sarah, ...routes })
  render(
    <MemoryRouter initialEntries={[...before, url]} initialIndex={before.length}>
      <SpeakersPage />
      <Where />
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
    mockViewport(1440)
    renderPage()
    await user.click(await screen.findByRole('link', { name: 'Sarah Chen' }))
    const panel = await screen.findByRole('complementary', { name: 'Speaker details' })
    expect(await within(panel).findByRole('heading', { level: 2, name: 'Sarah Chen' })).toBeInTheDocument()
    expect(within(panel).getByText('Sarah leads marketing at TechFlow.')).toBeInTheDocument()
    expect(within(panel).getByRole('link', { name: /LinkedIn Profile/ })).toHaveAttribute('href', 'https://linkedin.com/in/sarahchen')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(within(panel).getByRole('heading', { level: 3, name: 'Sessions (2)' })).toBeInTheDocument()
    expect(within(panel).getByRole('link', { name: 'Building a Content Engine' })).toHaveAttribute('href', '/dashboard/live-sessions/4')
    expect(within(panel).getByRole('link', { name: 'Brand Basics' })).toHaveAttribute('href', '/dashboard/on-demand/9')
  })

  it('should open the details in a sheet on phones and return focus to the card on Escape', async () => {
    const user = userEvent.setup()
    mockViewport(390)
    renderPage()
    const card = await screen.findByRole('link', { name: 'Sarah Chen' })
    await user.click(card)
    const sheet = await screen.findByRole('dialog', { name: 'Speaker details' })
    expect(await within(sheet).findByRole('heading', { name: 'Sarah Chen' })).toBeInTheDocument()
    await waitFor(() => expect(sheet.contains(document.activeElement)).toBe(true))
    expect(screen.queryByRole('complementary', { name: 'Speaker details' })).not.toBeInTheDocument()
    await user.keyboard('{Escape}')
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    expect(screen.getByTestId('where')).toHaveTextContent(/^$/)
    await waitFor(() => expect(document.activeElement).toBe(screen.getByRole('link', { name: 'Sarah Chen' })))
  })

  it('should close an in-app sheet by going back, so Back leaves the list', async () => {
    const user = userEvent.setup()
    mockViewport(390)
    renderPage('/dashboard/speakers', {}, { before: ['/dashboard'] })
    await user.click(await screen.findByRole('link', { name: 'Sarah Chen' }))
    await screen.findByRole('dialog', { name: 'Speaker details' })
    await user.click(screen.getByRole('button', { name: 'Close' }))
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    expect(screen.getByTestId('where')).toHaveTextContent(/^$/)
    await user.click(screen.getByRole('button', { name: 'Browser back' }))
    expect(screen.getByTestId('path')).toHaveTextContent('/dashboard')
    expect(screen.getByTestId('path')).not.toHaveTextContent('/dashboard/speakers')
  })

  it('should close the sheet on Back and return focus to the card', async () => {
    const user = userEvent.setup()
    mockViewport(390)
    renderPage()
    await user.click(await screen.findByRole('link', { name: 'Sarah Chen' }))
    await screen.findByRole('dialog', { name: 'Speaker details' })
    fireEvent.click(screen.getByRole('button', { name: 'Browser back', hidden: true }))
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    await waitFor(() => expect(document.activeElement).toBe(screen.getByRole('link', { name: 'Sarah Chen' })))
  })

  it('should use the sheet, not the side panel, when the screen size is unknown', async () => {
    vi.stubGlobal('matchMedia', undefined)
    renderPage('/dashboard/speakers?speaker=1')
    expect(await screen.findByRole('dialog', { name: 'Speaker details' })).toBeInTheDocument()
    expect(screen.queryByRole('complementary', { name: 'Speaker details' })).not.toBeInTheDocument()
  })

  it('should open the sheet from a shared ?speaker= link on phones', async () => {
    mockViewport(390)
    renderPage('/dashboard/speakers?speaker=1')
    const sheet = await screen.findByRole('dialog', { name: 'Speaker details' })
    expect(await within(sheet).findByText('Sarah leads marketing at TechFlow.')).toBeInTheDocument()
  })

  it('should leave out a LinkedIn link that is not http or https', async () => {
    mockViewport(1440)
    renderPage('/dashboard/speakers?speaker=1', { 'GET /api/speakers/1': { ...sarah, linkedin_url: 'javascript:alert(1)' } })
    const panel = await screen.findByRole('complementary', { name: 'Speaker details' })
    expect(await within(panel).findByText('Sarah leads marketing at TechFlow.')).toBeInTheDocument()
    expect(within(panel).queryByRole('link', { name: /LinkedIn/ })).not.toBeInTheDocument()
  })

  it('should show an error with Try again when the speaker fails to load', async () => {
    mockViewport(1440)
    renderPage('/dashboard/speakers?speaker=1', { 'GET /api/speakers/1': reply(500, { error: 'boom' }) })
    const panel = await screen.findByRole('complementary', { name: 'Speaker details' })
    expect(await within(panel).findByText("We couldn't load this speaker")).toBeInTheDocument()
    expect(within(panel).getByRole('button', { name: 'Try again' })).toBeInTheDocument()
  })
})
