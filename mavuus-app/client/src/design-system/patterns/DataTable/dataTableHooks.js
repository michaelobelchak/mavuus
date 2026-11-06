import { useEffect, useMemo, useRef } from 'react'
import { useControllableState } from '../../hooks/useControllableState'
import { warnOnce } from '../../lib/warnOnce'
import { clampPage, DEFAULT_PAGE_SIZE, rangeText, sortRows, togglePage, toggleRow } from './dataTableUtils'

/**
 * Sort state and the sorted rows. Rows are only re-sorted when rows, sort, columns or
 * manualSorting change, so pass a stable `columns` array (a module constant or useMemo).
 */
export function useSort({ rows, columns, sort, defaultSort, onSortChange, manualSorting }) {
  const [current, setSort] = useControllableState(sort, defaultSort, onSortChange)
  const sorted = useMemo(
    () => (manualSorting ? rows : sortRows(rows, current, columns)),
    [rows, current, columns, manualSorting],
  )
  return { sort: current, setSort, sorted }
}

/**
 * Paging from the `pagination` prop: { page, defaultPage, pageSize, rowCount, onPageChange,
 * manual }, or false / undefined for none. A page past the end is written back once (state when
 * uncontrolled, onPageChange when controlled), except while loading.
 */
export function usePagination({ pagination, rowsLength, loading }) {
  const enabled = Boolean(pagination)
  const config = enabled ? pagination : {}
  const manual = Boolean(config.manual)
  if (enabled && config.pageSize === undefined) {
    warnOnce('DataTable:pageSize', `DataTable: pass pagination.pageSize. Falling back to ${DEFAULT_PAGE_SIZE} rows a page.`)
  }
  if (manual && config.rowCount === undefined) {
    warnOnce('DataTable:rowCount', 'DataTable: pass pagination.rowCount with manual paging so the page count is known.')
  }
  const pageSize = config.pageSize ?? DEFAULT_PAGE_SIZE
  const total = manual ? config.rowCount : rowsLength
  const pageCount = enabled ? Math.max(1, Math.ceil((total ?? 0) / pageSize)) : 1
  const [requested, setPage] = useControllableState(config.page, config.defaultPage ?? 1, config.onPageChange)
  const page = clampPage(requested, pageCount)

  // Remembers the last clamp it asked for, so a parent that ignores onPageChange isn't asked
  // again on every render.
  const lastClamp = useRef(null)
  useEffect(() => {
    if (!enabled || loading || page === requested) {
      lastClamp.current = null
      return
    }
    const key = `${requested}->${page}`
    if (lastClamp.current === key) return
    lastClamp.current = key
    setPage(page)
  })

  return {
    enabled,
    manual,
    page,
    pageSize,
    pageCount,
    range: enabled ? rangeText(page, pageSize, total) : null,
    setPage,
    slice: (rows) => (enabled && !manual ? rows.slice((page - 1) * pageSize, page * pageSize) : rows),
  }
}

/** Selection by row id. Lookups go through a Set. Select all covers the ids of the current page. */
export function useSelection({ selectedIds, defaultSelectedIds, onSelectionChange, pageIds }) {
  const [selected, setSelected] = useControllableState(selectedIds, defaultSelectedIds, onSelectionChange)
  const selectedSet = useMemo(() => new Set(selected), [selected])
  const onPage = pageIds.filter((id) => selectedSet.has(id)).length
  const allSelected = pageIds.length > 0 && onPage === pageIds.length
  return {
    isSelected: (id) => selectedSet.has(id),
    allSelected,
    someSelected: onPage > 0 && !allSelected,
    toggleRow: (id) => setSelected(toggleRow(selected, id)),
    togglePage: () => setSelected(togglePage(selected, pageIds, allSelected)),
  }
}
