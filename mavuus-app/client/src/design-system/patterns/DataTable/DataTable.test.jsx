import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { useState } from 'react'
import { resetWarnings } from '../../lib/warnOnce'
import { mockViewport } from '../../test/browserMocks'
import { DataTable } from './DataTable'

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
  resetWarnings()
})

const users = [
  { id: 1, name: 'Dilya Abushayeva', role: 'admin', joined: '2026-01-10', reviews: 12 },
  { id: 2, name: 'Elmira Abushayeva', role: 'admin', joined: '2025-11-02', reviews: 30 },
  { id: 3, name: 'Sam Carter', role: 'member', joined: '2026-03-21', reviews: 4 },
]

const columns = [
  { key: 'name', header: 'Name', sortable: true },
  { key: 'role', header: 'Role' },
  { key: 'reviews', header: 'Reviews', sortable: true, align: 'right' },
]

function renderTable(props = {}) {
  return render(
    <MemoryRouter>
      <DataTable caption="Members" columns={columns} rows={users} {...props} />
    </MemoryRouter>,
  )
}

// The first data column of each body row, in order.
function names() {
  const [, ...bodyRows] = screen.getAllByRole('row')
  return bodyRows.map((row) => within(row).getAllByRole('cell')[0].textContent)
}

describe('DataTable', () => {
  it('should render a table named by the caption with a header per column', () => {
    renderTable()
    const table = screen.getByRole('table', { name: 'Members' })
    expect(within(table).getAllByRole('columnheader').map((th) => th.textContent)).toEqual(['Name', 'Role', 'Reviews'])
    expect(names()).toEqual(['Dilya Abushayeva', 'Elmira Abushayeva', 'Sam Carter'])
  })

  it('should render cells with the column cell function', () => {
    renderTable({ columns: [{ key: 'name', header: 'Name', cell: (row) => <strong>{row.name.toUpperCase()}</strong> }] })
    expect(screen.getByText('SAM CARTER').tagName).toBe('STRONG')
  })

  it('should warn in dev when the caption is missing', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})
    renderTable({ caption: undefined })
    expect(error).toHaveBeenCalledWith(expect.stringMatching(/DataTable: .*caption/))
  })

  it('should sort rows on the client and toggle aria-sort when a sortable header is clicked', async () => {
    const user = userEvent.setup()
    renderTable()
    const header = screen.getByRole('columnheader', { name: /Reviews/ })
    expect(header).toHaveAttribute('aria-sort', 'none')
    expect(screen.getByRole('columnheader', { name: 'Role' })).not.toHaveAttribute('aria-sort')

    await user.click(within(header).getByRole('button', { name: /Reviews/ }))
    expect(header).toHaveAttribute('aria-sort', 'ascending')
    expect(names()).toEqual(['Sam Carter', 'Dilya Abushayeva', 'Elmira Abushayeva'])

    await user.click(within(header).getByRole('button', { name: /Reviews/ }))
    expect(header).toHaveAttribute('aria-sort', 'descending')
    expect(names()).toEqual(['Elmira Abushayeva', 'Dilya Abushayeva', 'Sam Carter'])
  })

  it('should call onSortChange and keep the row order when sorting is manual', async () => {
    const user = userEvent.setup()
    const onSortChange = vi.fn()
    renderTable({ manualSorting: true, sort: { key: 'name', direction: 'asc' }, onSortChange })
    expect(screen.getByRole('columnheader', { name: /Name/ })).toHaveAttribute('aria-sort', 'ascending')
    await user.click(screen.getByRole('button', { name: /Name/ }))
    expect(onSortChange).toHaveBeenCalledWith({ key: 'name', direction: 'desc' })
    await user.click(screen.getByRole('button', { name: /Reviews/ }))
    expect(onSortChange).toHaveBeenLastCalledWith({ key: 'reviews', direction: 'asc' })
    expect(names()).toEqual(['Dilya Abushayeva', 'Elmira Abushayeva', 'Sam Carter'])
  })

  it('should page rows on the client with pageSize and call onPageChange', async () => {
    const user = userEvent.setup()
    const onPageChange = vi.fn()
    renderTable({ pageSize: 2, onPageChange })
    expect(names()).toEqual(['Dilya Abushayeva', 'Elmira Abushayeva'])
    expect(screen.getByText('Showing 1-2 of 3')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Page 2' }))
    expect(onPageChange).toHaveBeenCalledWith(2)
    expect(names()).toEqual(['Sam Carter'])
    expect(screen.getByRole('button', { name: 'Page 2' })).toHaveAttribute('aria-current', 'page')
  })

  it('should show the given rows and ask for a page when pagination is manual', async () => {
    const user = userEvent.setup()
    const onPageChange = vi.fn()
    renderTable({ manualPagination: true, page: 1, pageCount: 5, rowCount: 98, pageSize: 3, onPageChange })
    expect(names()).toHaveLength(3)
    expect(screen.getByText('Showing 1-3 of 98')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Next page' }))
    expect(onPageChange).toHaveBeenCalledWith(2)
    expect(screen.getByRole('button', { name: 'Page 1' })).toHaveAttribute('aria-current', 'page')
  })

  it('should show skeleton rows and mark the table busy while loading', () => {
    const { container } = renderTable({ loading: true, rows: [] })
    expect(screen.getByRole('table', { name: 'Members' })).toHaveAttribute('aria-busy', 'true')
    expect(container.querySelectorAll('tbody tr')).toHaveLength(5)
    expect(container.querySelector('tbody [aria-hidden="true"]')).toBeInTheDocument()
    expect(screen.getByText('Loading Members')).toHaveClass('sr-only')
  })

  it('should show the default empty state when there are no rows', () => {
    renderTable({ rows: [] })
    expect(screen.getByRole('heading', { name: 'No results' })).toBeInTheDocument()
    expect(screen.getByText(/Try a different search/)).toBeInTheDocument()
  })

  it('should show a custom empty state', () => {
    renderTable({ rows: [], emptyState: <p>No members yet</p> })
    expect(screen.getByText('No members yet')).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'No results' })).toBeNull()
  })

  it('should select rows and select all on the page with an indeterminate header checkbox', async () => {
    const user = userEvent.setup()
    const onSelectionChange = vi.fn()
    function Harness() {
      const [selected, setSelected] = useState([])
      return (
        <DataTable
          caption="Members"
          columns={columns}
          rows={users}
          pageSize={2}
          selectable
          selectedIds={selected}
          onSelectionChange={(ids) => {
            onSelectionChange(ids)
            setSelected(ids)
          }}
        />
      )
    }
    render(<Harness />)
    const all = screen.getByRole('checkbox', { name: 'Select all rows on this page' })
    expect(all).not.toBeChecked()

    await user.click(screen.getByRole('checkbox', { name: 'Select row Dilya Abushayeva' }))
    expect(onSelectionChange).toHaveBeenLastCalledWith([1])
    expect(all).toHaveAttribute('aria-checked', 'mixed')

    await user.click(all)
    expect(onSelectionChange).toHaveBeenLastCalledWith([1, 2])
    expect(all).toBeChecked()

    await user.click(all)
    expect(onSelectionChange).toHaveBeenLastCalledWith([])
  })

  it('should keep selections from other pages when select all changes the current page', async () => {
    const user = userEvent.setup()
    const onSelectionChange = vi.fn()
    render(
      <DataTable
        caption="Members"
        columns={columns}
        rows={users}
        pageSize={2}
        page={2}
        selectable
        selectedIds={[1]}
        onSelectionChange={onSelectionChange}
      />,
    )
    await user.click(screen.getByRole('checkbox', { name: 'Select all rows on this page' }))
    expect(onSelectionChange).toHaveBeenLastCalledWith([1, 3])
  })

  it('should open a row actions menu from a labelled kebab button', async () => {
    const user = userEvent.setup()
    const onBan = vi.fn()
    renderTable({ rowActions: (row) => [{ label: 'Ban', tone: 'danger', onSelect: () => onBan(row.id) }] })
    expect(screen.getByRole('columnheader', { name: 'Actions' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Actions for Sam Carter' }))
    await user.click(await screen.findByRole('menuitem', { name: 'Ban' }))
    expect(onBan).toHaveBeenCalledWith(3)
  })

  it('should make the first cell a link named by the row when rowHref is given', () => {
    renderTable({ rowHref: (row) => `/admin/users/${row.id}` })
    const link = screen.getByRole('link', { name: 'Sam Carter' })
    expect(link).toHaveAttribute('href', '/admin/users/3')
    expect(link.closest('tr')).toHaveClass('relative')
    expect(screen.getAllByRole('link')).toHaveLength(3)
  })

  it('should call onRowClick from a button in the first cell', async () => {
    const user = userEvent.setup()
    const onRowClick = vi.fn()
    renderTable({ onRowClick })
    await user.click(screen.getByRole('button', { name: 'Sam Carter' }))
    expect(onRowClick).toHaveBeenCalledWith(users[2])
  })

  it('should hide columns below a breakpoint with hideBelow', () => {
    renderTable({ columns: [...columns, { key: 'joined', header: 'Joined', hideBelow: 'lg' }] })
    expect(screen.getByRole('columnheader', { name: 'Joined' })).toHaveClass('hidden', 'lg:table-cell')
    expect(screen.getByRole('cell', { name: '2026-03-21' })).toHaveClass('hidden', 'lg:table-cell')
  })

  it('should render the toolbar slot above the table', () => {
    renderTable({ toolbar: <button type="button">Export</button> })
    const toolbar = screen.getByRole('button', { name: 'Export' })
    expect(toolbar.compareDocumentPosition(screen.getByRole('table'))).toBe(Node.DOCUMENT_POSITION_FOLLOWING)
  })

  it('should stack rows as labelled cards on small screens', () => {
    mockViewport(375)
    renderTable({ rowActions: () => [{ label: 'Ban' }], rowHref: (row) => `/admin/users/${row.id}` })
    expect(screen.queryByRole('table')).toBeNull()
    const list = screen.getByRole('list', { name: 'Members' })
    const cards = within(list).getAllByRole('listitem')
    expect(cards).toHaveLength(3)
    const sam = cards[2]
    expect(within(sam).getByText('Reviews')).toBeInTheDocument()
    expect(within(sam).getByText('4')).toBeInTheDocument()
    expect(within(sam).getByRole('link', { name: 'Sam Carter' })).toHaveAttribute('href', '/admin/users/3')
    expect(within(sam).getByRole('button', { name: 'Actions for Sam Carter' })).toBeInTheDocument()
  })

  it('should keep the table on small screens when mobileLayout is scroll', () => {
    mockViewport(375)
    renderTable({ mobileLayout: 'scroll' })
    expect(screen.getByRole('table', { name: 'Members' })).toBeInTheDocument()
  })
})
