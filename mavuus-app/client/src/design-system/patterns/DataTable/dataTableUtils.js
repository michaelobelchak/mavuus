// Pure helpers for DataTable: sorting, paging and selection.

export const SORT_DIRECTIONS = ['asc', 'desc']

// Next sort for a click on `key`: a new column starts ascending, the same column flips.
export function nextSort(sort, key) {
  if (!sort || sort.key !== key) return { key, direction: 'asc' }
  return { key, direction: sort.direction === 'asc' ? 'desc' : 'asc' }
}

export function ariaSort(sort, key) {
  if (!sort || sort.key !== key) return 'none'
  return sort.direction === 'desc' ? 'descending' : 'ascending'
}

const isEmpty = (value) => value === null || value === undefined || value === ''

function compareValues(a, b) {
  if (typeof a === 'number' && typeof b === 'number') return a - b
  return String(a).localeCompare(String(b), 'en-US', { numeric: true, sensitivity: 'base' })
}

// Stable client-side sort. Empty values go last in both directions. A column's `sortValue(row)`
// wins over `row[key]`.
export function sortRows(rows, sort, columns) {
  if (!sort) return rows
  const column = columns.find((item) => item.key === sort.key)
  if (!column) return rows
  const valueOf = (row) => (column.sortValue ? column.sortValue(row) : row[column.key])
  const sign = sort.direction === 'desc' ? -1 : 1
  return rows
    .map((row, index) => ({ row, index, value: valueOf(row) }))
    .sort((a, b) => {
      if (isEmpty(a.value) !== isEmpty(b.value)) return isEmpty(a.value) ? 1 : -1
      if (isEmpty(a.value)) return a.index - b.index
      return sign * compareValues(a.value, b.value) || a.index - b.index
    })
    .map((item) => item.row)
}

export function clampPage(page, pageCount) {
  return Math.min(Math.max(1, page || 1), Math.max(1, pageCount || 1))
}

// "Showing 81-98 of 98": worked out from the page and page size, so a short last page reads right.
// Null when the total isn't known or is zero.
export function rangeText(page, pageSize, total) {
  if (total === undefined || total === null || total === 0 || !pageSize) return null
  const start = (page - 1) * pageSize + 1
  if (start > total) return null
  const end = Math.min(page * pageSize, total)
  return `Showing ${start}-${end} of ${total}`
}

// Options for the card layout's "Sort by" select: two per sortable column. Labels read
// "Reviews, low to high" for numbers and "Name, A to Z" otherwise; a column's
// `sortLabels: [ascending, descending]` overrides them.
export function sortOptions(columns, rows) {
  return columns
    .filter((column) => column.sortable)
    .flatMap((column) => {
      const sample = rows.map((row) => (column.sortValue ? column.sortValue(row) : row[column.key])).find((value) => !isEmpty(value))
      const [asc, desc] = column.sortLabels ?? (typeof sample === 'number' ? ['low to high', 'high to low'] : ['A to Z', 'Z to A'])
      return [
        { sort: { key: column.key, direction: 'asc' }, label: `${column.header}, ${asc}` },
        { sort: { key: column.key, direction: 'desc' }, label: `${column.header}, ${desc}` },
      ]
    })
}

// Selecting the page adds its ids after the ones already selected; unselecting removes only them.
export function togglePage(selected, pageIds, allSelected) {
  if (allSelected) {
    const page = new Set(pageIds)
    return selected.filter((id) => !page.has(id))
  }
  const current = new Set(selected)
  return [...selected, ...pageIds.filter((id) => !current.has(id))]
}

export function toggleRow(selected, id) {
  return selected.includes(id) ? selected.filter((item) => item !== id) : [...selected, id]
}

export const DEFAULT_PAGE_SIZE = 20

export const hideBelowClasses = {
  md: 'hidden md:table-cell',
  lg: 'hidden lg:table-cell',
}

const ABSOLUTE_URL = /^https?:\/\//i

// A rowHref value as link props: absolute http(s) URLs are anchors, anything else a router path.
export function hrefProps(href) {
  return ABSOLUTE_URL.test(href) ? { href } : { to: href }
}
