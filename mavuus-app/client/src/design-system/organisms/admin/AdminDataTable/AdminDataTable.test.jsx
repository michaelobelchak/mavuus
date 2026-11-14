import { afterEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { resetWarnings } from '../../../lib/warnOnce'
import { AdminDataTable } from './AdminDataTable'

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
  resetWarnings()
})

const reviews = [
  { id: 1, name: 'Priya Nair', vendor: 'Northwind Growth', status: 'flagged' },
  { id: 2, name: 'Marcus Lee', vendor: 'Brightpath Media', status: 'approved' },
  { id: 3, name: 'Ana Souza', vendor: 'Tailspin Studio', status: 'hidden' },
]

const columns = [
  { key: 'name', header: 'Reviewer' },
  { key: 'vendor', header: 'Vendor' },
  { key: 'status', header: 'Status' },
]

function renderTable(props = {}) {
  return render(
    <MemoryRouter>
      <AdminDataTable caption="Reviews" columns={columns} rows={reviews} {...props} />
    </MemoryRouter>,
  )
}

async function openActions(user, name) {
  await user.click(screen.getByRole('button', { name: `Actions for ${name}` }))
}

describe('AdminDataTable', () => {
  it('should render the rows in a table named by the caption', () => {
    renderTable()
    const table = screen.getByRole('table', { name: 'Reviews' })
    expect(within(table).getByText('Priya Nair')).toBeInTheDocument()
  })

  it('should call onSearch with the typed text when given search', async () => {
    const user = userEvent.setup()
    const onSearch = vi.fn()
    renderTable({ search: { label: 'Search reviews', onSearch, debounce: 0 } })
    await user.type(screen.getByRole('searchbox', { name: 'Search reviews' }), 'Priya')
    await waitFor(() => expect(onSearch).toHaveBeenLastCalledWith('Priya'))
  })

  it('should render the filters and call the filter onChange and onClearFilters', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    const onClearFilters = vi.fn()
    renderTable({
      filters: [
        {
          type: 'chips',
          key: 'status',
          label: 'Status',
          options: [
            { value: 'flagged', label: 'Flagged' },
            { value: 'hidden', label: 'Hidden' },
          ],
          value: 'flagged',
          onChange,
        },
      ],
      onClearFilters,
    })
    await user.click(screen.getByRole('button', { name: 'Hidden' }))
    expect(onChange).toHaveBeenCalledWith('hidden')
    await user.click(screen.getByRole('button', { name: 'Clear filters' }))
    expect(onClearFilters).toHaveBeenCalledWith({ status: null })
  })

  it('should show the selected count and run a bulk action with the selected ids', async () => {
    const user = userEvent.setup()
    const onApprove = vi.fn()
    renderTable({
      selectable: true,
      bulkActions: [{ key: 'approve', label: 'Approve', onSelect: onApprove }],
    })
    expect(screen.queryByRole('region', { name: 'Bulk actions' })).toBeNull()
    await user.click(screen.getByRole('checkbox', { name: 'Select row Priya Nair' }))
    await user.click(screen.getByRole('checkbox', { name: 'Select row Ana Souza' }))
    expect(screen.getByRole('region', { name: 'Bulk actions' })).toHaveTextContent('2 selected')
    expect(screen.getAllByRole('status').some((node) => node.textContent === '2 selected')).toBe(true)
    await user.click(screen.getByRole('button', { name: 'Approve' }))
    expect(onApprove).toHaveBeenCalledWith([1, 3], { clearSelection: expect.any(Function) })
  })

  it('should clear the selection when Clear selection is pressed', async () => {
    const user = userEvent.setup()
    const onSelectionChange = vi.fn()
    renderTable({ selectable: true, defaultSelectedIds: [2], onSelectionChange })
    expect(screen.getByRole('region', { name: 'Bulk actions' })).toHaveTextContent('1 selected')
    await user.click(screen.getByRole('button', { name: 'Clear selection' }))
    expect(onSelectionChange).toHaveBeenLastCalledWith([])
    expect(screen.queryByRole('region', { name: 'Bulk actions' })).toBeNull()
  })

  it('should run a row action right away when it is not destructive', async () => {
    const user = userEvent.setup()
    const onApprove = vi.fn()
    renderTable({ rowActions: [{ key: 'approve', label: 'Approve', onSelect: onApprove }] })
    await openActions(user, 'Priya Nair')
    await user.click(await screen.findByRole('menuitem', { name: 'Approve' }))
    expect(onApprove).toHaveBeenCalledWith(reviews[0])
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('should leave out row actions whose hidden returns true for the row', async () => {
    const user = userEvent.setup()
    renderTable({
      rowActions: [
        { key: 'approve', label: 'Approve', hidden: (row) => row.status === 'approved', onSelect: () => {} },
        { key: 'flag', label: 'Flag', onSelect: () => {} },
      ],
    })
    await openActions(user, 'Marcus Lee')
    await screen.findByRole('menuitem', { name: 'Flag' })
    expect(screen.queryByRole('menuitem', { name: 'Approve' })).toBeNull()
  })

  it('should ask for confirmation before a destructive row action and run it on confirm', async () => {
    const user = userEvent.setup()
    const onDelete = vi.fn()
    renderTable({ rowActions: [{ key: 'delete', label: 'Delete', destructive: true, onSelect: onDelete }] })
    await openActions(user, 'Priya Nair')
    const item = await screen.findByRole('menuitem', { name: 'Delete' })
    expect(item).toHaveClass('text-status-error')
    await user.click(item)
    const dialog = await screen.findByRole('dialog', { name: 'Delete Priya Nair?' })
    expect(dialog).toHaveTextContent("This can't be undone.")
    expect(onDelete).not.toHaveBeenCalled()
    await user.click(within(dialog).getByRole('button', { name: 'Delete' }))
    expect(onDelete).toHaveBeenCalledWith(reviews[0])
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
  })

  it('should not run a destructive action when the confirmation is cancelled', async () => {
    const user = userEvent.setup()
    const onDelete = vi.fn()
    renderTable({
      rowActions: [
        {
          key: 'delete',
          label: 'Delete',
          destructive: true,
          confirm: { title: 'Delete this review?', description: 'The vendor rating updates too.', confirmLabel: 'Delete review' },
          onSelect: onDelete,
        },
      ],
    })
    await openActions(user, 'Ana Souza')
    await user.click(await screen.findByRole('menuitem', { name: 'Delete' }))
    const dialog = await screen.findByRole('dialog', { name: 'Delete this review?' })
    expect(within(dialog).getByRole('button', { name: 'Delete review' })).toBeInTheDocument()
    await user.click(within(dialog).getByRole('button', { name: 'Cancel' }))
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
    expect(onDelete).not.toHaveBeenCalled()
  })

  it('should confirm a destructive bulk action with the selected count', async () => {
    const user = userEvent.setup()
    const onDelete = vi.fn()
    renderTable({
      selectable: true,
      defaultSelectedIds: [1, 2],
      bulkActions: [{ key: 'delete', label: 'Delete', destructive: true, onSelect: onDelete }],
    })
    await user.click(screen.getByRole('button', { name: 'Delete' }))
    const dialog = await screen.findByRole('dialog', { name: 'Delete 2 rows?' })
    await user.click(within(dialog).getByRole('button', { name: 'Delete' }))
    expect(onDelete).toHaveBeenCalledWith([1, 2], { clearSelection: expect.any(Function) })
  })

  it('should show an error alert with a retry button instead of the table when loading failed', async () => {
    const user = userEvent.setup()
    const onRetry = vi.fn()
    renderTable({ rows: [], error: 'The server did not respond.', onRetry })
    const alert = screen.getByRole('alert')
    expect(alert).toHaveTextContent("Couldn't load reviews")
    expect(alert).toHaveTextContent('The server did not respond.')
    expect(screen.queryByRole('table')).toBeNull()
    await user.click(within(alert).getByRole('button', { name: 'Try again' }))
    expect(onRetry).toHaveBeenCalledTimes(1)
  })

  it('should keep the old rows under the error alert when a refresh failed', () => {
    renderTable({ error: true })
    expect(screen.getByRole('alert')).toHaveTextContent("Couldn't load reviews")
    expect(screen.getByRole('table', { name: 'Reviews' })).toBeInTheDocument()
  })

  it('should show the default empty state and a custom one when there are no rows', () => {
    const { unmount } = renderTable({ rows: [] })
    expect(screen.getByRole('heading', { name: 'No results' })).toBeInTheDocument()
    unmount()
    renderTable({ rows: [], emptyState: <p>No reviews to moderate</p> })
    expect(screen.getByText('No reviews to moderate')).toBeInTheDocument()
  })

  it('should pass loading and pagination through to the DataTable', async () => {
    const user = userEvent.setup()
    const onPageChange = vi.fn()
    const { rerender } = renderTable({ loading: true, rows: [] })
    expect(screen.getByRole('table')).toHaveAttribute('aria-busy', 'true')
    rerender(
      <MemoryRouter>
        <AdminDataTable
          caption="Reviews"
          columns={columns}
          rows={reviews}
          pagination={{ pageSize: 3, page: 1, manual: true, rowCount: 9, onPageChange }}
        />
      </MemoryRouter>,
    )
    expect(screen.getByText('Showing 1-3 of 9')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /page 2/i }))
    expect(onPageChange).toHaveBeenCalledWith(2)
  })

  it('should keep the confirm dialog open and show the error when a destructive action rejects', async () => {
    const user = userEvent.setup()
    const onDelete = vi.fn().mockRejectedValue(new Error('The review is locked by another admin.'))
    renderTable({ rowActions: [{ key: 'delete', label: 'Delete', destructive: true, onSelect: onDelete }] })
    await openActions(user, 'Priya Nair')
    await user.click(await screen.findByRole('menuitem', { name: 'Delete' }))
    const dialog = await screen.findByRole('dialog', { name: 'Delete Priya Nair?' })
    await user.click(within(dialog).getByRole('button', { name: 'Delete' }))
    expect(await within(dialog).findByRole('alert')).toHaveTextContent('The review is locked by another admin.')
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('should show a fallback message when the rejection has no message', async () => {
    const user = userEvent.setup()
    renderTable({
      rowActions: [{ key: 'delete', label: 'Delete', destructive: true, onSelect: () => Promise.reject(null) }],
    })
    await openActions(user, 'Priya Nair')
    await user.click(await screen.findByRole('menuitem', { name: 'Delete' }))
    const dialog = await screen.findByRole('dialog')
    await user.click(within(dialog).getByRole('button', { name: 'Delete' }))
    expect(await within(dialog).findByRole('alert')).toHaveTextContent('Something went wrong. Try again.')
  })

  it('should close the confirm dialog once a destructive action resolves', async () => {
    const user = userEvent.setup()
    const onDelete = vi.fn().mockResolvedValue(undefined)
    renderTable({ rowActions: [{ key: 'delete', label: 'Delete', destructive: true, onSelect: onDelete }] })
    await openActions(user, 'Priya Nair')
    await user.click(await screen.findByRole('menuitem', { name: 'Delete' }))
    const dialog = await screen.findByRole('dialog')
    await user.click(within(dialog).getByRole('button', { name: 'Delete' }))
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
    expect(onDelete).toHaveBeenCalledTimes(1)
  })

  it('should ask first when an action has confirm even if it is not destructive', async () => {
    const user = userEvent.setup()
    const onFeature = vi.fn()
    renderTable({
      rowActions: [{ key: 'feature', label: 'Feature', confirm: { title: 'Feature this review?' }, onSelect: onFeature }],
    })
    await openActions(user, 'Priya Nair')
    await user.click(await screen.findByRole('menuitem', { name: 'Feature' }))
    const dialog = await screen.findByRole('dialog', { name: 'Feature this review?' })
    expect(onFeature).not.toHaveBeenCalled()
    await user.click(within(dialog).getByRole('button', { name: 'Feature' }))
    expect(onFeature).toHaveBeenCalledWith(reviews[0])
  })

  it('should pass a failed non-destructive action to onActionError instead of throwing', async () => {
    const user = userEvent.setup()
    const failure = new Error('Network down')
    const onActionError = vi.fn()
    const action = { key: 'approve', label: 'Approve', onSelect: () => Promise.reject(failure) }
    renderTable({ rowActions: [action], onActionError })
    await openActions(user, 'Priya Nair')
    await user.click(await screen.findByRole('menuitem', { name: 'Approve' }))
    await waitFor(() => expect(onActionError).toHaveBeenCalledWith(failure, action, reviews[0]))
  })

  it('should catch a non-destructive action that throws synchronously', async () => {
    const user = userEvent.setup()
    const onActionError = vi.fn()
    const action = {
      key: 'approve',
      label: 'Approve',
      onSelect: () => {
        throw new Error('Boom')
      },
    }
    renderTable({ rowActions: [action], onActionError })
    await openActions(user, 'Priya Nair')
    await user.click(await screen.findByRole('menuitem', { name: 'Approve' }))
    await waitFor(() => expect(onActionError).toHaveBeenCalledWith(expect.any(Error), action, reviews[0]))
  })

  it('should clear the selection after a bulk action succeeds and pass clearSelection', async () => {
    const user = userEvent.setup()
    const onApprove = vi.fn().mockResolvedValue(undefined)
    renderTable({ selectable: true, defaultSelectedIds: [1, 3], bulkActions: [{ key: 'approve', label: 'Approve', onSelect: onApprove }] })
    await user.click(screen.getByRole('button', { name: 'Approve' }))
    expect(onApprove).toHaveBeenCalledWith([1, 3], { clearSelection: expect.any(Function) })
    await waitFor(() => expect(screen.queryByRole('region', { name: 'Bulk actions' })).toBeNull())
  })

  it('should keep the selection after a bulk action with keepSelection', async () => {
    const user = userEvent.setup()
    renderTable({
      selectable: true,
      defaultSelectedIds: [1, 3],
      bulkActions: [{ key: 'export', label: 'Export', keepSelection: true, onSelect: () => {} }],
    })
    await user.click(screen.getByRole('button', { name: 'Export' }))
    expect(screen.getByRole('region', { name: 'Bulk actions' })).toHaveTextContent('2 selected')
  })

  it('should keep the selection when a bulk action fails', async () => {
    const user = userEvent.setup()
    const onActionError = vi.fn()
    renderTable({
      selectable: true,
      defaultSelectedIds: [1, 3],
      onActionError,
      bulkActions: [{ key: 'approve', label: 'Approve', onSelect: () => Promise.reject(new Error('Nope')) }],
    })
    await user.click(screen.getByRole('button', { name: 'Approve' }))
    await waitFor(() => expect(onActionError).toHaveBeenCalled())
    expect(screen.getByRole('region', { name: 'Bulk actions' })).toHaveTextContent('2 selected')
  })

  it('should drop selected ids whose rows are gone when rows change', () => {
    const onSelectionChange = vi.fn()
    const { rerender } = renderTable({ selectable: true, defaultSelectedIds: [1, 3], onSelectionChange })
    rerender(
      <MemoryRouter>
        <AdminDataTable caption="Reviews" columns={columns} rows={reviews.slice(0, 2)} selectable onSelectionChange={onSelectionChange} />
      </MemoryRouter>,
    )
    expect(onSelectionChange).toHaveBeenLastCalledWith([1])
    expect(screen.getByRole('region', { name: 'Bulk actions' })).toHaveTextContent('1 selected')
  })

  it('should keep selected ids that are off the current page with manual pagination', () => {
    const onSelectionChange = vi.fn()
    const pagination = { pageSize: 2, page: 1, manual: true, rowCount: 6, onPageChange: () => {} }
    const { rerender } = renderTable({ selectable: true, defaultSelectedIds: [1, 3], onSelectionChange, pagination })
    rerender(
      <MemoryRouter>
        <AdminDataTable caption="Reviews" columns={columns} rows={reviews.slice(0, 2)} selectable onSelectionChange={onSelectionChange} pagination={pagination} />
      </MemoryRouter>,
    )
    expect(onSelectionChange).not.toHaveBeenCalled()
    expect(screen.getByRole('region', { name: 'Bulk actions' })).toHaveTextContent('2 selected')
  })

  it('should fall back to "this list" in the error title when the caption is not a string', () => {
    renderTable({ rows: [], caption: <span>Reviews</span>, error: true })
    expect(screen.getByRole('alert')).toHaveTextContent("Couldn't load this list")
  })

  it('should keep the selection through a refetch that passes no rows while loading', () => {
    const onSelectionChange = vi.fn()
    const view = (props) => (
      <MemoryRouter>
        <AdminDataTable caption="Reviews" columns={columns} selectable defaultSelectedIds={[1]} onSelectionChange={onSelectionChange} {...props} />
      </MemoryRouter>
    )
    const { rerender } = render(view({ rows: reviews }))
    rerender(view({ rows: [], loading: true }))
    rerender(view({ rows: reviews }))
    expect(onSelectionChange).not.toHaveBeenCalled()
    expect(screen.getByRole('region', { name: 'Bulk actions' })).toHaveTextContent('1 selected')
  })
})
