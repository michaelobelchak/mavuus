import { SearchX } from 'lucide-react'
import { useMediaQuery } from '../../hooks/useMediaQuery'
import { cn } from '../../lib/cn'
import { resolveOption } from '../../lib/resolveOption'
import { warnOnce } from '../../lib/warnOnce'
import { Checkbox, Select, Skeleton, Text } from '../../primitives'
import { EmptyState } from '../EmptyState/EmptyState'
import { Pagination } from '../Pagination/Pagination'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '../Table/Table'
import { DataTableCards } from './DataTableCards'
import { RowActions, RowTarget, SortIcon } from './DataTableParts'
import { usePagination, useSelection, useSort } from './dataTableHooks'
import { ariaSort, hideBelowClasses, nextSort, sortOptions } from './dataTableUtils'
import { openRowLinkInNewTab, opensNewTab, shouldForward } from './rowClick'

const MOBILE_LAYOUTS = ['cards', 'scroll']
// Tailwind's md breakpoint. Below it, rows stack as cards unless mobileLayout is scroll.
const WIDE_QUERY = '(min-width: 48rem)'

const defaultRowId = (row) => row.id
const defaultRowName = (row) => String(row.name ?? row.title ?? row.id ?? '')
const cellContent = (column, row) => (column.cell ? column.cell(row) : row[column.key])
const hideClass = (column) => column.hideBelow && hideBelowClasses[column.hideBelow]
const staleClass = 'opacity-60 transition-opacity duration-150 motion-reduce:transition-none'

/**
 * Data table built on Table, for admin lists: sorting, paging, selection, row actions and a
 * stacked card layout on small screens.
 * - `columns`: [{ key, header, cell?: (row) => node, sortable?, sortValue?: (row) => value,
 *   sortLabels?: [asc, desc], align?: 'left' | 'right' | 'center', width? (a class),
 *   hideBelow?: 'md' | 'lg' }]. `header` should be text: it is also the label in the cards.
 *   Keep `columns` stable (a module constant or useMemo) so client sorting stays memoized.
 * - `rows`, `getRowId(row)` (default row.id), `getRowName(row)` (default row.name, row.title or
 *   the id; names the row's checkbox and actions button).
 * - `caption` (required): names the table. Visually hidden unless `showCaption`.
 * - Sorting: `sort` { key, direction: 'asc' | 'desc' } / `defaultSort`, `onSortChange(sort)`.
 *   Rows sort on the client unless `manualSorting` (the server sorts; pass the sorted rows).
 *   A new sort goes back to page 1.
 * - `pagination`: { pageSize, page / defaultPage (1-based), onPageChange(page), manual, rowCount }.
 *   Client paging slices `rows`; with `manual: true` the rows are the current page and
 *   `rowCount` is the server total (pageCount = ceil(rowCount / pageSize)). Shows
 *   "Showing 81-98 of 98" and the Pagination nav. A page past the end is written back once.
 *   Leave it out (or pass false) for no paging.
 * - `loading`: aria-busy and a "Loading {caption}" status. With no rows yet it shows skeleton
 *   rows (`loadingRows`, default 5); with rows (a page change) it keeps them, dimmed.
 * - `emptyState`: shown when there are no rows. Default: "No results" with a hint.
 * - `selectable`: a checkbox column. `selectedIds` / `defaultSelectedIds`,
 *   `onSelectionChange(ids)`. Select all covers the current page and keeps other pages' picks.
 *   Ids stay selected when filtering hides their rows, so bulk actions can include rows that
 *   aren't shown; clear or intersect the selection when the filters change if that matters.
 * - `rowActions(row)`: DropdownMenu items for a kebab button in a last column.
 * - `rowHref(row)`: the first cell's content becomes a real link (named by its visible text),
 *   and a click anywhere else on the row follows it, unless the click was on a control or ended
 *   a text selection. Ctrl, meta or shift clicks and middle clicks open it in a new tab.
 *   `onRowClick(row, event)` is the same with a button in the first cell; it gets the original
 *   event, so check `event.metaKey` and friends yourself. Pass one of the two, not both.
 * - `toolbar`: a slot above the table (FilterBar, SearchInput, bulk actions).
 * - `mobileLayout`: cards (default, rows stack as labelled cards below md) or scroll (keep the
 *   table and scroll it sideways). Cards leave out `hideBelow` columns and get a "Sort by"
 *   select when any column is sortable.
 * - `density`: passed to Table (comfortable or compact).
 * `ref`, `className` and other props go to the root.
 */
export function DataTable({
  columns = [],
  rows = [],
  getRowId = defaultRowId,
  getRowName = defaultRowName,
  caption,
  showCaption = false,
  sort: sortProp,
  defaultSort = null,
  onSortChange,
  manualSorting = false,
  pagination,
  loading = false,
  loadingRows = 5,
  emptyState,
  selectable = false,
  selectedIds,
  defaultSelectedIds = [],
  onSelectionChange,
  rowActions,
  rowHref,
  onRowClick,
  toolbar,
  mobileLayout,
  density,
  className,
  ref,
  ...props
}) {
  const layout = resolveOption(mobileLayout, MOBILE_LAYOUTS, 'cards', 'DataTable', 'mobileLayout')
  const wide = useMediaQuery(WIDE_QUERY, true)
  const asCards = layout === 'cards' && !wide

  if (!caption) {
    warnOnce('DataTable:caption', 'DataTable: pass a caption. It names the table for screen readers.')
  }
  if (rowHref !== undefined && onRowClick !== undefined) {
    warnOnce('DataTable:row-target', 'DataTable: pass rowHref or onRowClick, not both. rowHref wins.')
  }

  const { sort, setSort, sorted } = useSort({ rows, columns, sort: sortProp, defaultSort, onSortChange, manualSorting })
  const paging = usePagination({ pagination, rowsLength: sorted.length, loading })
  const pageRows = paging.slice(sorted)
  const items = pageRows.map((row) => ({
    row,
    id: getRowId(row),
    name: getRowName(row),
    href: rowHref?.(row),
  }))
  const selection = useSelection({
    selectedIds,
    defaultSelectedIds,
    onSelectionChange,
    pageIds: items.map((item) => item.id),
  })

  const linked = rowHref !== undefined
  const rowClick = linked ? undefined : onRowClick
  const clickable = linked || rowClick !== undefined
  const columnCount = columns.length + (selectable ? 1 : 0) + (rowActions ? 1 : 0)
  const isEmpty = !loading && items.length === 0
  const stale = loading && items.length > 0
  const mobileSortOptions = asCards ? sortOptions(columns, rows) : []
  const mobileSortIndex = sort
    ? mobileSortOptions.findIndex((option) => option.sort.key === sort.key && option.sort.direction === sort.direction)
    : -1

  function applySort(next) {
    setSort(next)
    if (paging.enabled && paging.page !== 1) paging.setPage(1)
  }

  function handleRowClick(event, row) {
    if (!shouldForward(event)) return
    if (rowClick) {
      rowClick(row, event)
      return
    }
    if (opensNewTab(event)) {
      openRowLinkInNewTab(event.currentTarget)
      return
    }
    event.currentTarget.querySelector('[data-row-target]')?.click()
  }

  function handleRowAuxClick(event) {
    if (event.button !== 1 || !shouldForward(event)) return
    event.preventDefault()
    openRowLinkInNewTab(event.currentTarget)
  }

  const empty = emptyState ?? (
    <EmptyState
      size="sm"
      icon={SearchX}
      title="No results"
      description="Try a different search or clear the filters."
    />
  )

  const tableView = (
    <Table density={density} aria-busy={loading || undefined}>
      {caption && <TableCaption visuallyHidden={!showCaption}>{caption}</TableCaption>}
      <TableHeader>
        <TableRow>
          {selectable && (
            <TableHead className="w-12">
              <Checkbox
                aria-label="Select all rows on this page"
                checked={selection.allSelected}
                indeterminate={selection.someSelected}
                disabled={loading || items.length === 0}
                onCheckedChange={selection.togglePage}
              />
            </TableHead>
          )}
          {columns.map((column) => {
            const align = column.align ?? 'left'
            const direction = column.sortable ? ariaSort(sort, column.key) : undefined
            return (
              <TableHead key={column.key} align={align} aria-sort={direction} className={cn(column.width, hideClass(column))}>
                {column.sortable ? (
                  <button
                    type="button"
                    className={cn(
                      'inline-flex cursor-pointer items-center gap-ds-xxs uppercase hover:text-text-primary',
                      align === 'right' && 'flex-row-reverse',
                    )}
                    onClick={() => applySort(nextSort(sort, column.key))}
                  >
                    {column.header}
                    <SortIcon direction={direction} />
                  </button>
                ) : (
                  column.header
                )}
              </TableHead>
            )
          })}
          {rowActions && (
            <TableHead align="right" className="w-16">
              <span className="sr-only">Actions</span>
            </TableHead>
          )}
        </TableRow>
      </TableHeader>
      <TableBody className={cn(stale && staleClass)}>
        {loading &&
          items.length === 0 &&
          Array.from({ length: loadingRows }, (_, index) => (
            <TableRow key={`loading-${index}`}>
              {selectable && (
                <TableCell>
                  <Skeleton shape="rect" className="size-5 rounded-tag" />
                </TableCell>
              )}
              {columns.map((column) => (
                <TableCell key={column.key} className={hideClass(column)}>
                  <Skeleton className="w-3/4" />
                </TableCell>
              ))}
              {rowActions && (
                <TableCell>
                  <Skeleton className="w-3/4" />
                </TableCell>
              )}
            </TableRow>
          ))}
        {isEmpty && (
          <TableRow>
            <TableCell colSpan={columnCount}>{empty}</TableCell>
          </TableRow>
        )}
        {items.map(({ row, id, name, href }) => {
          const isSelected = selection.isSelected(id)
          return (
            <TableRow
              key={id}
              data-selected={isSelected ? '' : undefined}
              onClick={clickable ? (event) => handleRowClick(event, row) : undefined}
              onAuxClick={linked ? handleRowAuxClick : undefined}
              className={cn(clickable && 'cursor-pointer', 'data-[selected]:bg-surface-selected')}
            >
              {selectable && (
                <TableCell>
                  <Checkbox aria-label={`Select row ${name}`} checked={isSelected} onCheckedChange={() => selection.toggleRow(id)} />
                </TableCell>
              )}
              {columns.map((column, index) => {
                const content = cellContent(column, row)
                return (
                  <TableCell key={column.key} align={column.align} className={hideClass(column)}>
                    {index === 0 && clickable ? (
                      <RowTarget row={row} name={name} href={href} onRowClick={rowClick}>
                        {content}
                      </RowTarget>
                    ) : (
                      content
                    )}
                  </TableCell>
                )
              })}
              {rowActions && (
                <TableCell align="right">
                  <RowActions items={rowActions(row)} name={name} />
                </TableCell>
              )}
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )

  return (
    <div ref={ref} className={cn('flex flex-col gap-ds-md', className)} {...props}>
      {toolbar}
      {mobileSortOptions.length > 0 && (
        <Select
          aria-label="Sort by"
          placeholder="Sort by"
          items={mobileSortOptions.map((option, index) => ({ value: String(index), label: option.label }))}
          value={mobileSortIndex >= 0 ? String(mobileSortIndex) : null}
          onValueChange={(value) => {
            const option = value === null ? undefined : mobileSortOptions[Number(value)]
            if (option) applySort(option.sort)
          }}
          className="w-full"
        />
      )}
      {asCards ? (
        isEmpty ? (
          empty
        ) : (
          <DataTableCards
            caption={caption}
            columns={columns}
            items={items}
            loading={loading}
            loadingRows={loadingRows}
            selectable={selectable}
            selection={selection}
            rowActions={rowActions}
            onRowClick={rowClick}
          />
        )
      ) : (
        tableView
      )}
      <span role="status" className="sr-only">
        {loading ? `Loading ${caption ?? 'rows'}` : ''}
      </span>
      {paging.enabled && (paging.range || paging.pageCount > 1) && (
        <div className="flex flex-wrap items-center justify-between gap-ds-sm">
          {paging.range ? (
            <Text size="body-sm" tone="secondary">
              {paging.range}
            </Text>
          ) : (
            <span />
          )}
          <Pagination
            page={paging.page}
            pageCount={paging.pageCount}
            onPageChange={paging.setPage}
            aria-label={caption ? `${caption} pages` : undefined}
          />
        </div>
      )}
    </div>
  )
}
