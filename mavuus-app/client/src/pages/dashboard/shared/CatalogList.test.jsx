import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { mockApi } from '../../../test/mockApi'
import { CatalogList } from './CatalogList'

afterEach(() => vi.unstubAllGlobals())

const things = [
  { id: 1, name: 'Alpha', kind: 'pro' },
  { id: 2, name: 'Beta', kind: 'free' },
]

function renderList(props, { url = '/things', routes } = {}) {
  const fetchMock = mockApi(routes ?? { 'GET /api/things': { data: things, totalPages: 1 } })
  render(
    <MemoryRouter initialEntries={[url]}>
      <CatalogList
        endpoint="/api/things"
        categories={['All', 'Guide']}
        intro="Things."
        searchLabel="Search things"
        listLabel="Things"
        emptyTitle="No things"
        errorTitle="No luck"
        renderItem={(item) => <span>{item.name}</span>}
        skeleton={() => null}
        {...props}
      />
    </MemoryRouter>,
  )
  return fetchMock
}

const lastQuery = (fetchMock) => new URL(fetchMock.mock.calls.at(-1)[0], 'http://x').searchParams

describe('CatalogList', () => {
  it('should send the filter under the filterParam it is given', async () => {
    const fetchMock = renderList({ filterParam: 'type' }, { url: '/things?type=Guide' })
    await screen.findByText('Alpha')
    expect(lastQuery(fetchMock).get('type')).toBe('Guide')
  })

  it('should leave out page, limit and the pagination when paged is false', async () => {
    const fetchMock = renderList(
      { paged: false, categories: undefined },
      { routes: { 'GET /api/things': [...things] } },
    )
    await screen.findByText('Alpha')
    expect(lastQuery(fetchMock).has('page')).toBe(false)
    expect(lastQuery(fetchMock).has('limit')).toBe(false)
    expect(screen.queryByRole('group', { name: 'Category' })).not.toBeInTheDocument()
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument()
  })

  it('should send the API params filterQuery returns for a filter value', async () => {
    const user = userEvent.setup()
    const fetchMock = renderList({
      filterParam: 'filter',
      filterLabel: 'Filter things',
      categories: ['All', { value: 'mine', label: 'Mine' }],
      filterQuery: (value) => (value === 'mine' ? { mine: '1' } : { kind: value }),
    })
    await screen.findByText('Beta')
    expect(lastQuery(fetchMock).has('mine')).toBe(false)
    await user.click(screen.getByRole('button', { name: 'Mine' }))
    expect(screen.getByRole('button', { name: 'Mine' })).toHaveAttribute('aria-pressed', 'true')
    await waitFor(() => expect(lastQuery(fetchMock).get('mine')).toBe('1'))
    expect(lastQuery(fetchMock).has('filter')).toBe(false)
    expect(lastQuery(fetchMock).get('page')).toBe('1')
    expect(screen.getByRole('group', { name: 'Filter things' })).toBeInTheDocument()
  })

  it('should word the empty state for the current filter', async () => {
    renderList(
      {
        filterParam: 'filter',
        categories: ['All', { value: 'pro', label: 'Pro' }],
        filterQuery: () => ({ kind: 'pro' }),
        emptyTitle: (value) => (value === 'pro' ? 'No pros' : 'No things'),
        emptyDescription: (value) => (value === 'pro' ? 'Nobody went pro yet.' : 'Try again.'),
      },
      { url: '/things?filter=pro', routes: { 'GET /api/things': { data: [], totalPages: 1 } } },
    )
    expect(await screen.findByRole('heading', { name: 'No pros' })).toBeInTheDocument()
    expect(screen.getByText('Nobody went pro yet.')).toBeInTheDocument()
  })

  it('should render children between the intro and the search', async () => {
    renderList({ children: <p>Pending requests</p> })
    await screen.findByText('Alpha')
    const intro = screen.getByText('Things.')
    const lead = screen.getByText('Pending requests')
    const search = screen.getByRole('searchbox', { name: 'Search things' })
    expect(intro.compareDocumentPosition(lead) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(lead.compareDocumentPosition(search) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })

  it('should show an error with Try again that loads the list again', async () => {
    const user = userEvent.setup()
    let fail = true
    renderList({}, {
      routes: { 'GET /api/things': () => (fail ? new Error('offline') : { data: things }) },
    })
    vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(await screen.findByText('No luck')).toBeInTheDocument()
    fail = false
    await user.click(screen.getByRole('button', { name: 'Try again' }))
    await waitFor(() => expect(screen.getByText('Alpha')).toBeInTheDocument())
  })
})
