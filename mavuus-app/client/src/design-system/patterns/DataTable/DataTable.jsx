import { useState } from 'react'
import { ArrowDown, ArrowUp, ArrowUpDown, MoreHorizontal, SearchX } from 'lucide-react'
import { useMediaQuery } from '../../hooks/useMediaQuery'
import { cn } from '../../lib/cn'
import { linkProps } from '../../lib/linkProps'
import { resolveOption } from '../../lib/resolveOption'
import { warnOnce } from '../../lib/warnOnce'
import { Checkbox, Icon, IconButton, Select, Skeleton, Text } from '../../primitives'
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
  sortOptions,
  sortRows,
  togglePage,
  toggleRow,
} from './dataTableUtils'

const MOBILE_LAYOUTS = ['cards', 'scroll']
// Tailwind's md breakpoint. Below it, rows stack as cards unless mobileLayout is scroll.
const WIDE_QUERY = '(min-width: 48rem)'
const ABSOLUTE_URL = /^https?:\/\//i

// A row click is ignored when it started on one of these (they do their own thing).
const INTERACTIVE =
  'a, button, input, select, textarea, label, summary, [role="button"], [role="link"], [role="checkbox"], [role="menuitem"], [role="option"], [contenteditable="true"]'

// Follows the row's first-cell target (link or button) for a click anywhere else in the row.
// Skips clicks on controls, clicks that end a text selection, and clicks from portaled content
// (an open menu) that React bubbles through the row but that aren't inside it.
function handleRowClick(event) {
  const row = event.currentTarget
  if (!(event.target instanceof Element) || !row.contains(event.target)) return
  const control = event.target.closest(INTERACTIVE)
  if (control && row.contains(control)) return
  const selection = window.getSelection?.()
  if (selection && !selection.isCollapsed && selection.toString() !== '') return
  row.querySelector('[data-row-target]')?.click()
}

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

// The row's one primary target, in the first cell: a real link (rowHref) or button (onRowClick)
// named by the row. Keyboard and screen reader users reach the row through it; the row's own
// click handler forwards other clicks to it.
function RowTarget({ row, name, href, onRowClick, children }) {
  const className = 'cursor-pointer text-left font-semibold text-text-primary hover:underline'
  if (href !== undefined) {
    const link = linkProps(hrefProps(href))
    const { Component } = link
    return (
      <Component data-row-target="" aria-label={name} className={className} {...link.props}>
        {children}
      </Component>
    )
  }
  return (
    <button type="button" data-row-target="" aria-label={name} className={className} onClick={() => onRowClick(row)}>
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
 *   current page and you pass `pageCount`, `pageSize` (required, dev warns) and `rowCount` for
 *   "Showing 81-98 of 98". `page` / `defaultPage` (1-based), `onPageChange(page)`. A new sort
 *   goes back to page 1 (through onPageChange when the page is controlled).
 * - `loading`: skeleton rows (`loadingRows`, default 5), aria-busy and a "Loading {caption}" status.
 * - `emptyState`: shown when there are no rows. Default: "No results" with a hint.
 * - `selectable`: a checkbox column. `selectedIds` / `defaultSelectedIds`,
 *   `onSelectionChange(ids)`. Select all covers the current page and keeps other pages' picks.
 * - `rowActions(row)`: DropdownMenu items for a kebab button in a last column.
 * - `rowHref(row)`: the first column's content becomes a real link named by the row (the
 *   keyboard and screen reader target), and a click anywhere else on the row follows it, unless
 *   the click was on a control (button, link, input, label, checkbox, menu item) or ended a text
 *   selection. `onRowClick(row)` does the same with a button in the first cell.
 * - `toolbar`: a slot above the table (FilterBar, SearchInput, bulk actions).
 * - `mobileLayout`: cards (default, rows stack as labelled cards below md) or scroll (keep the
 *   table and scroll it sideways). Cards leave out `hideBelow` columns and get a "Sort by"
 *   select when any column is sortable (`sortLabels: [asc, desc]` names a column's options).
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
  if (manualPagination && pageSize === undefined) {
    warnOnce(
      'DataTable:pageSize',
      'DataTable: pass pageSize with manualPagination so the "Showing 1-20 of 98" range can be worked out.',
    )
  }
  const range = paged && pageSize !== undefined ? rangeText(page, pageSize, total) : null
  const mobileSortOptions = asCards ? sortOptions(columns, rows) : []

  const pageIds = pageRows.map(getRowId)
  const selectedOnPage = pageIds.filter((id) => selected.includes(id))
  const allSelected = pageIds.length > 0 && selectedOnPage.length === pageIds.length
  const someSelected = selectedOnPage.length > 0 && !allSelected
  const clickable = rowHref !== undefined || onRowClick !== undefined
  const columnCount = columns.length + (selectable ? 1 : 0) + (rowActions ? 1 : 0)
  const isEmpty = !loading && pageRows.length === 0

  // A new sort starts again at page 1, for controlled pages too (through onPageChange).
  function applySort(next) {
    if (!sortControlled) setSort(next)
    onSortChange?.(next)
    if (paged && page !== 1) changePage(1)
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

  const rowTarget = (row, name, content) =>
    clickable ? (
      <RowTarget row={row} name={name} href={rowHref?.(row)} onRowClick={onRowClick}>
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
      <TableBody>
        {loading &&
          Array.from({ length: loadingRows }, (_, index) => (
            <TableRow key={`loading-${index}`}>
              {selectable && (
                <TableCell>
                  <Skeleton shape="rect" className="size-5 rounded-tag" />
                </TableCell>
              )}
              {columns.map((column) => (
                <TableCell key={column.key} className={cn(column.hideBelow && hideBelowClasses[column.hideBelow])}>
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
        {!loading &&
          pageRows.map((row) => {
            const id = getRowId(row)
            const name = getRowName(row)
            const isSelected = selected.includes(id)
            return (
              <TableRow
                key={id}
                data-selected={isSelected ? '' : undefined}
                onClick={clickable ? handleRowClick : undefined}
                className={cn(clickable && 'cursor-pointer', 'data-[selected]:bg-surface-selected')}
              >
                {selectable && (
                  <TableCell>
                    <Checkbox
                      aria-label={`Select row ${name}`}
                      checked={isSelected}
                      onCheckedChange={() => changeSelection(toggleRow(selected, id))}
                    />
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
                      {index === 0 ? rowTarget(row, name, content) : content}
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

  const [primary, ...rest] = columns
  // Columns hidden below md or lg in the table stay out of the cards too.
  const details = rest.filter((column) => !column.hideBelow)
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
                  <div data-card-title="" className="min-w-0 grow text-body font-semibold text-text-primary">
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
      {mobileSortOptions.length > 0 && (
        <Select
          aria-label="Sort by"
          placeholder="Sort by"
          items={mobileSortOptions}
          value={sort ? `${sort.key}:${sort.direction}` : null}
          onValueChange={(value) => {
            if (!value) return
            const [key, direction] = value.split(':')
            applySort({ key, direction })
          }}
          className="w-full"
        />
      )}
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
