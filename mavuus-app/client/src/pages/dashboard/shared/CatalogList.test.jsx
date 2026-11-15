import { describe, it, expect, vi, afterEach } from 'vitest'
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, useLocation } from 'react-router-dom'
import { mockApi } from '../../../test/mockApi'
import { CatalogList } from './CatalogList'

afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

const things = [
  { id: 1, name: 'Alpha', kind: 'pro' },
  { id: 2, name: 'Beta', kind: 'free' },
]

function Where() {
  return <output data-testid="where">{useLocation().search}</output>
}

function renderList(props, { url = '/things', routes } = {}) {
  const fetchMock = mockApi(routes ?? { 'GET /api/things': { data: things, totalPages: 1 } })
  render(
    <MemoryRouter initialEntries={[url]}>
      <Where />
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

  it('should treat a filter value it does not offer as All', async () => {
    const fetchMock = renderList({}, { url: '/things?category=Bogus' })
    await screen.findByText('Alpha')
    expect(lastQuery(fetchMock).has('category')).toBe(false)
    expect(screen.getByRole('button', { name: 'All' })).toHaveAttribute('aria-pressed', 'true')
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

  it('should keep what was typed after a search whose URL update lands late', async () => {
    renderList({})
    await screen.findByText('Alpha')
    vi.useFakeTimers()
    const box = screen.getByRole('searchbox', { name: 'Search things' })
    fireEvent.change(box, { target: { value: 'ab' } })
    // The debounce fires and searches "ab". The router puts the new URL in a transition, so it
    // hasn't rendered yet when the next key arrives.
    vi.advanceTimersByTime(300)
    fireEvent.change(box, { target: { value: 'abm' } })
    expect(box).toHaveValue('abm')
    await act(async () => {
      vi.advanceTimersByTime(300)
    })
    expect(box).toHaveValue('abm')
    expect(screen.getByTestId('where')).toHaveTextContent('?q=abm')
  })

  it('should keep a search whose URL update is still pending when a chip is clicked', async () => {
    renderList({})
    await screen.findByText('Alpha')
    vi.useFakeTimers()
    fireEvent.change(screen.getByRole('searchbox', { name: 'Search things' }), { target: { value: 'ab' } })
    // The search for "ab" is sent, but its URL hasn't rendered when the chip is clicked.
    vi.advanceTimersByTime(300)
    fireEvent.click(screen.getByRole('button', { name: 'Guide' }))
    await act(async () => {})
    expect(screen.getByTestId('where')).toHaveTextContent('?q=ab&category=Guide')
  })

  it('should keep a cleared field when an older search lands after it', async () => {
    renderList({})
    await screen.findByText('Alpha')
    vi.useFakeTimers()
    const box = screen.getByRole('searchbox', { name: 'Search things' })
    fireEvent.change(box, { target: { value: 'ab' } })
    vi.advanceTimersByTime(300)
    // Cleared before the URL for "ab" rendered: the clear searches '' right away.
    fireEvent.change(box, { target: { value: '' } })
    await act(async () => {})
    expect(box).toHaveValue('')
    expect(screen.getByTestId('where')).toHaveTextContent(/^$/)
  })

  describe('with several filters', () => {
    const filters = [
      {
        param: 'type',
        label: 'Job type',
        allLabel: 'Any type',
        options: [{ value: 'full-time', label: 'Full-time' }, { value: 'contract', label: 'Contract' }],
      },
      { param: 'level', label: 'Level', allLabel: 'Any level', options: ['Junior', 'Senior'] },
    ]

    it('should read every filter from the URL, send each to the API and name the selects', async () => {
      const fetchMock = renderList({ filters }, { url: '/things?type=contract&level=Senior' })
      await screen.findByText('Alpha')
      expect(lastQuery(fetchMock).get('type')).toBe('contract')
      expect(lastQuery(fetchMock).get('level')).toBe('Senior')
      expect(screen.getByRole('combobox', { name: 'Job type' })).toHaveTextContent('Contract')
      expect(screen.getByRole('combobox', { name: 'Level' })).toHaveTextContent('Senior')
      // The single-filter chips are not shown.
      expect(screen.queryByRole('group', { name: 'Category' })).not.toBeInTheDocument()
    })

    it('should treat a value a filter does not offer as Any', async () => {
      const fetchMock = renderList({ filters }, { url: '/things?type=bogus' })
      await screen.findByText('Alpha')
      expect(lastQuery(fetchMock).has('type')).toBe(false)
      expect(screen.getByRole('combobox', { name: 'Job type' })).toHaveTextContent('Any type')
    })

    it('should put a picked option in the URL, keep the others and go back to page 1', async () => {
      const user = userEvent.setup()
      const fetchMock = renderList({ filters }, { url: '/things?level=Junior&page=2' })
      await screen.findByText('Alpha')
      await user.click(screen.getByRole('combobox', { name: 'Job type' }))
      await user.click(await screen.findByRole('option', { name: 'Full-time' }))
      await waitFor(() => expect(screen.getByTestId('where')).toHaveTextContent('?level=Junior&type=full-time'))
      await waitFor(() => expect(lastQuery(fetchMock).get('type')).toBe('full-time'))
      expect(lastQuery(fetchMock).get('level')).toBe('Junior')
      expect(lastQuery(fetchMock).get('page')).toBe('1')
    })

    it('should clear every filter and keep the search', async () => {
      const user = userEvent.setup()
      renderList({ filters }, { url: '/things?q=ab&type=contract&level=Senior' })
      await screen.findByText('Alpha')
      await user.click(screen.getByRole('button', { name: 'Clear filters' }))
      await waitFor(() => expect(screen.getByTestId('where')).toHaveTextContent(/^\?q=ab$/))
      expect(screen.queryByRole('button', { name: 'Clear filters' })).not.toBeInTheDocument()
    })
  })

  it('should say how many results the API found with resultLabel', async () => {
    renderList(
      { resultLabel: (total) => `${total} things found` },
      { routes: { 'GET /api/things': { data: things, total: 12, totalPages: 1 } } },
    )
    expect(await screen.findByText('12 things found')).toBeInTheDocument()
  })

  it('should count the loaded list when the API sends no total', async () => {
    renderList({ resultLabel: (total) => `${total} things found` })
    expect(await screen.findByText('2 things found')).toBeInTheDocument()
  })
})
