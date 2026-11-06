import { useState } from 'react'
import { ArrowDown, ArrowUp, ArrowUpDown, MoreHorizontal, SearchX } from 'lucide-react'
import { useMediaQuery } from '../../hooks/useMediaQuery'
import { cn } from '../../lib/cn'
import { linkProps } from '../../lib/linkProps'
import { resolveOption } from '../../lib/resolveOption'
import { warnOnce } from '../../lib/warnOnce'
import { Checkbox, Icon, IconButton, Skeleton, Text } from '../../primitives'
import { Card, CardAction, CardLink } from '../Card/Card'
import { DropdownMenu } from '../DropdownMenu/DropdownMenu'
import { EmptyState } from '../EmptyState/EmptyState'
import { Pagination } from '../Pagination/Pagination'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '../Table/Table'
import {
  ariaSort,
  clampPage,
  hideBelowClasses,
  nextSort,
  rangeText,
  sortRows,
  togglePage,
  toggleRow,
} from './dataTableUtils'

const MOBILE_LAYOUTS = ['cards', 'scroll']
// Tailwind's md breakpoint. Below it, rows stack as cards unless mobileLayout is scroll.
const WIDE_QUERY = '(min-width: 48rem)'
const ABSOLUTE_URL = /^https?:\/\//i

// Keeps checkboxes, menus and other controls above a row's stretched link.
const raised = 'relative z-(--ds-z-raised)'

const defaultRowId = (row) => row.id
const defaultRowName = (row) => String(row.name ?? row.title ?? row.id ?? '')

function useControllable(value, defaultValue) {
  const [inner, setInner] = useState(defaultValue)
  const controlled = value !== undefined
  return [controlled ? value : inner, setInner, controlled]
}

function cellContent(column, row) {
  return column.cell ? column.cell(row) : row[column.key]
}

function hrefProps(href) {
  return ABSOLUTE_URL.test(href) ? { href } : { to: href }
}

function SortIcon({ direction }) {
  const icon = direction === 'ascending' ? ArrowUp : direction === 'descending' ? ArrowDown : ArrowUpDown
  return <Icon icon={icon} size="sm" className={direction === 'none' && 'text-text-faint'} />
}

// The row's one primary target. Its ::after covers the row (the row is relative), so a click
// anywhere on the row follows it, while its name stays the first cell's text.
function RowTarget({ row, href, onRowClick, children }) {
  const stretched = "after:absolute after:inset-0 after:content-['']"
  if (href !== undefined) {
    const link = linkProps(hrefProps(href))
    const { Component } = link
    return (
      <Component className={cn('font-semibold text-text-primary hover:underline', stretched)} {...link.props}>
        {children}
      </Component>
    )
  }
  return (
    <button
      type="button"
      className={cn('cursor-pointer text-left font-semibold text-text-primary hover:underline', stretched)}
      onClick={() => onRowClick(row)}
    >
      {children}
    </button>
  )
}

function RowActions({ items, name }) {
  return (
    <DropdownMenu
      align="end"
      items={items}
      trigger={<IconButton icon={MoreHorizontal} size="sm" aria-label={`Actions for ${name}`} />}
    />
  )
}

/**
 * Data table built on Table, for admin lists: sorting, paging, selection, row actions and a
 * stacked card layout on small screens.
 * - `columns`: [{ key, header, cell?: (row) => node, sortable?, sortValue?: (row) => value,
 *   align?: 'left' | 'right' | 'center', width? (a class), hideBelow?: 'md' | 'lg' }].
 *   `header` should be text: it is also the label in the card layout.
 * - `rows`, `getRowId(row)` (default row.id), `getRowName(row)` (default row.name, row.title or
 *   the id; names the row's checkbox and actions button).
 * - `caption` (required): names the table. Visually hidden unless `showCaption`.
 * - Sorting: `sort` { key, direction: 'asc' | 'desc' } / `defaultSort`, `onSortChange(sort)`.
 *   Rows sort on the client unless `manualSorting` (the server sorts; pass the sorted rows).
 * - Paging: `pageSize` pages the rows on the client. With `manualPagination` the rows are the
 *   current page and you pass `pageCount` (and `rowCount` for "Showing 1-20 of 98").
 *   `page` / `defaultPage` (1-based), `onPageChange(page)`. A client sort goes back to page 1
 *   when the page is uncontrolled.
 * - `loading`: skeleton rows (`loadingRows`, default 5), aria-busy and a "Loading {caption}" status.
 * - `emptyState`: shown when there are no rows. Default: "No results" with a hint.
 * - `selectable`: a checkbox column. `selectedIds` / `defaultSelectedIds`,
 *   `onSelectionChange(ids)`. Select all covers the current page and keeps other pages' picks.
 * - `rowActions(row)`: DropdownMenu items for a kebab button in a last column.
 * - `rowHref(row)`: the first column's content becomes a link that covers the row (stretched
 *   link, like CardLink), so the row is clickable and keyboard reachable without nesting
 *   controls. `onRowClick(row)` does the same with a button. Wrap any other link or button in a
 *   cell in CardAction so it stays above the overlay.
 * - `toolbar`: a slot above the table (FilterBar, SearchInput, bulk actions).
 * - `mobileLayout`: cards (default, rows stack as labelled cards below md) or scroll (keep the
 *   table and scroll it sideways). Sorting is only available in the table layout.
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
  page: pageProp,
  defaultPage = 1,
  pageSize,
  pageCount: pageCountProp,
  rowCount,
  onPageChange,
  manualPagination = false,
  loading = false,
  loadingRows = 5,
  emptyState,
  selectable = false,
  selectedIds: selectedProp,
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
  const [sort, setSort, sortControlled] = useControllable(sortProp, defaultSort)
  const [pageState, setPage, pageControlled] = useControllable(pageProp, defaultPage)
  const [selected, setSelected] = useControllable(selectedProp, defaultSelectedIds)

  if (!caption) {
    warnOnce('DataTable:caption', 'DataTable: pass a caption. It names the table for screen readers.')
  }

  const sorted = manualSorting ? rows : sortRows(rows, sort, columns)
  const paged = manualPagination || pageSize !== undefined
  const pageCount = manualPagination
    ? (pageCountProp ?? 1)
    : pageSize
      ? Math.max(1, Math.ceil(sorted.length / pageSize))
      : 1
  const page = clampPage(pageState, pageCount)
  const pageRows = manualPagination || !pageSize ? sorted : sorted.slice((page - 1) * pageSize, page * pageSize)
  const total = manualPagination ? rowCount : sorted.length
  const range = paged ? rangeText(page, pageSize ?? pageRows.length, pageRows.length, total) : null

  const pageIds = pageRows.map(getRowId)
  const selectedOnPage = pageIds.filter((id) => selected.includes(id))
  const allSelected = pageIds.length > 0 && selectedOnPage.length === pageIds.length
  const someSelected = selectedOnPage.length > 0 && !allSelected
  const clickable = rowHref !== undefined || onRowClick !== undefined
  const columnCount = columns.length + (selectable ? 1 : 0) + (rowActions ? 1 : 0)
  const isEmpty = !loading && pageRows.length === 0

  function changeSort(key) {
    const next = nextSort(sort, key)
    if (!sortControlled) setSort(next)
    if (!manualSorting && !pageControlled) setPage(1)
    onSortChange?.(next)
  }

  function changePage(next) {
    if (!pageControlled) setPage(next)
    onPageChange?.(next)
  }

  function changeSelection(next) {
    if (selectedProp === undefined) setSelected(next)
    onSelectionChange?.(next)
  }

  const empty = emptyState ?? (
    <EmptyState
      size="sm"
      icon={SearchX}
      title="No results"
      description="Try a different search or clear the filters."
    />
  )

  const rowTarget = (row, content) =>
    clickable ? (
      <RowTarget row={row} href={rowHref?.(row)} onRowClick={onRowClick}>
        {content}
      </RowTarget>
    ) : (
      content
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
                checked={allSelected}
                indeterminate={someSelected}
                disabled={loading || pageIds.length === 0}
                onCheckedChange={() => changeSelection(togglePage(selected, pageIds, allSelected))}
              />
            </TableHead>
          )}
          {columns.map((column) => {
            const align = column.align ?? 'left'
            const direction = column.sortable ? ariaSort(sort, column.key) : undefined
            return (
              <TableHead
                key={column.key}
                align={align}
                aria-sort={direction}
                className={cn(column.width, column.hideBelow && hideBelowClasses[column.hideBelow])}
              >
                {column.sortable ? (
                  <button
                    type="button"
                    className={cn(
                      'inline-flex cursor-pointer items-center gap-ds-xxs uppercase hover:text-text-primary',
                      align === 'right' && 'flex-row-reverse',
                    )}
                    onClick={() => changeSort(column.key)}
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
      <TableBody>
        {loading &&
          Array.from({ length: loadingRows }, (_, index) => (
            <TableRow key={`loading-${index}`}>
              {Array.from({ length: columnCount }, (__, cell) => (
                <TableCell key={cell}>
                  <Skeleton className="w-3/4" />
                </TableCell>
              ))}
            </TableRow>
          ))}
        {isEmpty && (
          <TableRow>
            <TableCell colSpan={columnCount}>{empty}</TableCell>
          </TableRow>
        )}
        {!loading &&
          pageRows.map((row) => {
            const id = getRowId(row)
            const name = getRowName(row)
            const isSelected = selected.includes(id)
            return (
              <TableRow
                key={id}
                data-selected={isSelected ? '' : undefined}
                className={cn(clickable && 'relative', 'data-[selected]:bg-surface-selected')}
              >
                {selectable && (
                  <TableCell>
                    <div className={raised}>
                      <Checkbox
                        aria-label={`Select row ${name}`}
                        checked={isSelected}
                        onCheckedChange={() => changeSelection(toggleRow(selected, id))}
                      />
                    </div>
                  </TableCell>
                )}
                {columns.map((column, index) => {
                  const content = cellContent(column, row)
                  return (
                    <TableCell
                      key={column.key}
                      align={column.align}
                      className={cn(column.hideBelow && hideBelowClasses[column.hideBelow])}
                    >
                      {index === 0 ? rowTarget(row, content) : content}
                    </TableCell>
                  )
                })}
                {rowActions && (
                  <TableCell align="right">
                    <div className={cn(raised, 'inline-flex')}>
                      <RowActions items={rowActions(row)} name={name} />
                    </div>
                  </TableCell>
                )}
              </TableRow>
            )
          })}
      </TableBody>
    </Table>
  )

  const [primary, ...details] = columns
  const cardsView = isEmpty ? (
    empty
  ) : (
    <ul role="list" aria-label={caption} aria-busy={loading || undefined} className="m-ds-none flex list-none flex-col gap-ds-sm p-ds-none">
      {loading
        ? Array.from({ length: loadingRows }, (_, index) => (
            <Card key={`loading-${index}`} as="li" variant="surface" padding="md">
              <Skeleton lines={3} />
            </Card>
          ))
        : pageRows.map((row) => {
            const id = getRowId(row)
            const name = getRowName(row)
            const href = rowHref?.(row)
            const title = primary ? cellContent(primary, row) : name
            return (
              <Card key={id} as="li" variant="surface" padding="md" className="flex flex-col gap-ds-sm">
                <div className="flex items-start gap-ds-sm">
                  {selectable && (
                    <CardAction>
                      <Checkbox
                        aria-label={`Select row ${name}`}
                        checked={selected.includes(id)}
                        onCheckedChange={() => changeSelection(toggleRow(selected, id))}
                      />
                    </CardAction>
                  )}
                  <div className="min-w-0 grow text-body font-semibold text-text-primary">
                    {href !== undefined ? (
                      <CardLink {...hrefProps(href)}>{title}</CardLink>
                    ) : onRowClick ? (
                      <button
                        type="button"
                        data-card-link=""
                        className="cursor-pointer text-left after:absolute after:inset-0 after:rounded-card after:content-[''] focus-visible:outline-none!"
                        onClick={() => onRowClick(row)}
                      >
                        {title}
                      </button>
                    ) : (
                      title
                    )}
                  </div>
                  {rowActions && (
                    <CardAction>
                      <RowActions items={rowActions(row)} name={name} />
                    </CardAction>
                  )}
                </div>
                {details.length > 0 && (
                  <dl className="m-ds-none flex flex-col gap-ds-xs">
                    {details.map((column) => (
                      <div key={column.key} className="flex items-baseline justify-between gap-ds-md">
                        <dt className="text-caption font-semibold tracking-wide text-text-muted uppercase">{column.header}</dt>
                        <dd className="m-ds-none text-right text-body-sm text-text-primary">{cellContent(column, row)}</dd>
                      </div>
                    ))}
                  </dl>
                )}
              </Card>
            )
          })}
    </ul>
  )

  return (
    <div ref={ref} className={cn('flex flex-col gap-ds-md', className)} {...props}>
      {toolbar}
      {asCards ? cardsView : tableView}
      <span role="status" className="sr-only">
        {loading ? `Loading ${caption ?? 'rows'}` : ''}
      </span>
      {paged && (range || pageCount > 1) && (
        <div className="flex flex-wrap items-center justify-between gap-ds-sm">
          {range ? (
            <Text size="body-sm" tone="secondary">
              {range}
            </Text>
          ) : (
            <span />
          )}
          <Pagination
            page={page}
            pageCount={pageCount}
            onPageChange={changePage}
            aria-label={caption ? `${caption} pages` : undefined}
          />
        </div>
      )}
    </div>
  )
}
