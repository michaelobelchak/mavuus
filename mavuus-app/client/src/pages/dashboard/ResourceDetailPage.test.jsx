import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { mockApi, reply } from '../../test/mockApi'
import ResourceDetailPage from './ResourceDetailPage'

vi.mock('../../context/AuthContext', async () => {
  const { demoAuth } = await import('../../test/mockApi')
  return { useAuth: () => demoAuth }
})

const guide = {
  id: 2,
  title: 'State of B2B Marketing',
  type: 'guide',
  category: 'Report',
  author: 'Mavuus Research',
  read_time: '15 min read',
  content: '## Key findings\n\nBudgets grew **12%** this year.\n\n- First point\n- Second point',
}
const template = { ...guide, id: 1, type: 'template', title: 'Budget Template', content: '' , description: 'Plan spend.' }

function renderPage(id, routes) {
  const fetchMock = mockApi({
    'GET /api/comments': [],
    'GET /api/resources/bookmarked': [],
    'GET /api/resources': { data: [guide, { id: 9, title: 'Another Report', category: 'Report' }] },
    ...routes,
  })
  render(
    <MemoryRouter initialEntries={[`/dashboard/resources/${id}`]}>
      <Routes>
        <Route path="/dashboard/resources/:id" element={<ResourceDetailPage />} />
      </Routes>
    </MemoryRouter>,
  )
  return fetchMock
}

afterEach(() => vi.unstubAllGlobals())

describe('ResourceDetailPage', () => {
  it('should render the title as an h2 and the content headings below it', async () => {
    renderPage(2, { 'GET /api/resources/2': guide })
    expect(await screen.findByRole('heading', { level: 2, name: 'State of B2B Marketing' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { level: 1 })).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 3, name: 'Key findings' })).toBeInTheDocument()
    expect(screen.getByText('12%').tagName).toBe('STRONG')
    expect(screen.getByText('Second point').tagName).toBe('LI')
    expect(screen.getByRole('link', { name: 'Back to Resources' })).toHaveAttribute('href', '/dashboard/resources')
  })

  it('should show related resources from the same category, without this one', async () => {
    renderPage(2, { 'GET /api/resources/2': guide })
    expect(await screen.findByRole('link', { name: 'Another Report' })).toHaveAttribute('href', '/dashboard/resources/9')
    expect(screen.queryByRole('link', { name: 'State of B2B Marketing' })).not.toBeInTheDocument()
  })

  it('should toggle the bookmark through the API', async () => {
    const user = userEvent.setup()
    const fetchMock = renderPage(2, { 'GET /api/resources/2': guide, 'POST /api/resources/2/bookmark': { bookmarked: true } })
    const button = await screen.findByRole('button', { name: 'Bookmark' })
    expect(button).toHaveAttribute('aria-pressed', 'false')
    await user.click(button)
    await waitFor(() => expect(screen.getByRole('button', { name: 'Bookmarked' })).toHaveAttribute('aria-pressed', 'true'))
    expect(fetchMock.mock.calls.some(([url, init]) => url === '/api/resources/2/bookmark' && init?.method === 'POST')).toBe(true)
  })

  it('should link Download Template to the file when the template has one', async () => {
    renderPage(1, { 'GET /api/resources/1': { ...template, url: '/files/budget.xlsx' } })
    expect(await screen.findByRole('link', { name: 'Download Template' })).toHaveAttribute('href', '/files/budget.xlsx')
    expect(screen.getByText('Plan spend.')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Bookmark' })).not.toBeInTheDocument()
  })

  it('should leave Download Template out when the file URL is not http or https', async () => {
    renderPage(1, { 'GET /api/resources/1': { ...template, url: 'javascript:alert(1)' } })
    expect(await screen.findByText('Plan spend.')).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Download Template' })).not.toBeInTheDocument()
  })

  it('should leave Download Template out when the template has no file', async () => {
    renderPage(1, { 'GET /api/resources/1': template })
    expect(await screen.findByText('Plan spend.')).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Download Template' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Download Template' })).not.toBeInTheDocument()
  })

  it('should say when the resource is not found', async () => {
    renderPage(5, {})
    expect(await screen.findByRole('heading', { name: 'Resource not found' })).toBeInTheDocument()
  })

  it('should show an error with Try again when the resource fails to load, then load it on retry', async () => {
    const user = userEvent.setup()
    let fail = true
    renderPage(2, { 'GET /api/resources/2': () => (fail ? reply(500, {}) : guide) })
    expect(await screen.findByRole('alert')).toHaveTextContent("We couldn't load this resource")
    expect(screen.queryByRole('heading', { name: 'Resource not found' })).not.toBeInTheDocument()
    fail = false
    await user.click(screen.getByRole('button', { name: 'Try again' }))
    expect(await screen.findByRole('heading', { level: 2, name: 'State of B2B Marketing' })).toBeInTheDocument()
  })

  it('should put the action and info cards before the comments, so phones reach them first', async () => {
    renderPage(2, { 'GET /api/resources/2': guide })
    const aside = await screen.findByRole('complementary', { name: 'Resource info' })
    const comments = screen.getByRole('region', { name: /^Comments/ })
    expect(aside.compareDocumentPosition(comments) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })

  it('should show the skeleton, then the new resource with its own bookmark state, when a related card is followed', async () => {
    const user = userEvent.setup()
    let answer
    renderPage(2, {
      'GET /api/resources/2': guide,
      'GET /api/resources/9': () => new Promise((resolve) => (answer = resolve)),
      'GET /api/resources/bookmarked': [{ id: 2 }],
    })
    expect(await screen.findByRole('button', { name: 'Bookmarked' })).toBeInTheDocument()
    await user.click(await screen.findByRole('link', { name: 'Another Report' }))
    expect(screen.getByText('Loading resource')).toBeInTheDocument()
    answer({ id: 9, title: 'Another Report', type: 'guide', category: 'Report', description: 'More data.' })
    expect(await screen.findByRole('heading', { level: 2, name: 'Another Report' })).toBeInTheDocument()
    expect(await screen.findByRole('button', { name: 'Bookmark' })).toHaveAttribute('aria-pressed', 'false')
  })

  it('should show not found when a followed related resource is missing', async () => {
    const user = userEvent.setup()
    renderPage(2, { 'GET /api/resources/2': guide })
    await user.click(await screen.findByRole('link', { name: 'Another Report' }))
    expect(await screen.findByRole('heading', { name: 'Resource not found' })).toBeInTheDocument()
  })
})
