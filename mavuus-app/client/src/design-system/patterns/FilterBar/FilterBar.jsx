import { Fragment } from 'react'
import { X } from 'lucide-react'
import { cn } from '../../lib/cn'
import { resolveControlSize } from '../../lib/controlSizes'
import { warnOnce } from '../../lib/warnOnce'
import { Button, Chip, Select } from '../../primitives'

const FILTER_TYPES = ['select', 'chips', 'custom']
const SIZES = ['sm', 'md']
const DEFAULT_SIZE = 'md'

// Chips stop at 40px (sm). The ::after extends the hit area 4px above and below, so a chip is a
// 48px touch target in the md bar and still at least 44px in the dense sm bar.
const chipHitArea = "relative after:absolute after:inset-x-0 after:-inset-y-1 after:content-['']"

// The value a filter goes back to on "Clear filters": no selection. Custom filters only reset
// when they give an `emptyValue`.
function emptyValue(filter) {
  if (filter.emptyValue !== undefined) return filter.emptyValue
  if (filter.type === 'custom') return undefined
  return filter.type === 'chips' && filter.multiple ? [] : null
}

function sameValue(a, b) {
  if (Array.isArray(a) && Array.isArray(b)) return a.length === b.length && a.every((item, i) => item === b[i])
  return a === b
}

function isActive(filter) {
  if (filter.type === 'custom') return Boolean(filter.active)
  const { value } = filter
  if (value === undefined || value === null || value === '') return false
  if (Array.isArray(value) && value.length === 0) return false
  return !sameValue(value, emptyValue(filter))
}

function ChipsFilter({ filter }) {
  const selected = filter.multiple ? (filter.value ?? []) : filter.value

  function toggle(optionValue) {
    if (filter.multiple) {
      const next = selected.includes(optionValue)
        ? selected.filter((value) => value !== optionValue)
        : [...selected, optionValue]
      filter.onChange?.(next)
    } else {
      filter.onChange?.(selected === optionValue ? emptyValue(filter) : optionValue)
    }
  }

  return (
    <div role="group" aria-label={filter.label} className="flex flex-wrap items-center gap-ds-xs">
      {filter.options.map((option) => (
        <Chip
          key={String(option.value)}
          size="sm"
          className={chipHitArea}
          selected={filter.multiple ? selected.includes(option.value) : selected === option.value}
          disabled={option.disabled}
          onClick={() => toggle(option.value)}
        >
          {option.label}
        </Chip>
      ))}
    </div>
  )
}

/**
 * Row of list controls above a table or grid. Wraps onto more lines on small screens.
 * - `search`: a slot, usually a SearchInput. `actions`: a slot on the right (export, view toggles).
 * - `filters`: [{ type: 'select', key, label, items, value, onChange(value), placeholder }]
 *   or [{ type: 'chips', key, label, options: [{ value, label, disabled }], multiple, value,
 *   onChange(value) }], or [{ type: 'custom', key, render: ({ size }) => node, active, emptyValue }]
 *   for anything else (a range, a date picker). `key` is required: it names the filter in the
 *   reset. `label` names the select or the chip group. Multiple chips use an array value; single
 *   chips toggle off on a second click. A custom filter counts as active when `active` is true.
 * - `size`: md (default, 48px selects and button, touch friendly) or sm (40px, dense desktop
 *   toolbars only). Chips are always 40px with a hit area that reaches 48px.
 * - "Clear filters" shows while any filter has a value (or `active` is true, for state kept
 *   outside the filters such as the search text). It calls `onClear(emptyValues)` once, with
 *   `{ [key]: emptyValue }` for every filter (null, [] for multiple chips, or the filter's
 *   `emptyValue`; custom filters only when they give one). It doesn't call the filters' onChange,
 *   so apply the reset in one setState: `onClear={(empty) => setFilters((f) => ({ ...f, ...empty }))}`.
 * `className` and other props go to the root.
 */
export function FilterBar({
  search,
  filters = [],
  actions,
  active = false,
  onClear,
  clearLabel = 'Clear filters',
  size,
  className,
  ref,
  ...props
}) {
  const resolvedSize = resolveControlSize(size, SIZES, DEFAULT_SIZE, 'FilterBar')
  const known = filters.filter((filter) => {
    if (filter.key === undefined || filter.key === null) {
      warnOnce('FilterBar:key', 'FilterBar: every filter needs a key. It names the filter in the onClear reset.')
    }
    if (FILTER_TYPES.includes(filter.type)) return true
    warnOnce(
      `FilterBar:type:${filter.type}`,
      `FilterBar: filter type "${filter.type}" is not supported (use ${FILTER_TYPES.join(', ')}). The filter is skipped.`,
    )
    return false
  })
  const activeFilters = known.filter(isActive)
  const showClear = active || activeFilters.length > 0

  function clearAll() {
    const empty = {}
    for (const filter of known) {
      const value = emptyValue(filter)
      if (value !== undefined && filter.key != null) empty[filter.key] = value
    }
    onClear?.(empty)
  }

  return (
    <div ref={ref} className={cn('flex flex-wrap items-center gap-ds-sm', className)} {...props}>
      {search && <div className="w-full sm:w-auto sm:max-w-sm sm:grow">{search}</div>}
      {known.map((filter, index) => {
        const key = filter.key ?? index
        if (filter.type === 'custom') return <Fragment key={key}>{filter.render?.({ size: resolvedSize })}</Fragment>
        if (filter.type === 'chips') return <ChipsFilter key={key} filter={filter} />
        return (
          <Select
            key={key}
            aria-label={filter.label}
            size={resolvedSize}
            items={filter.items}
            placeholder={filter.placeholder}
            value={filter.value ?? null}
            onValueChange={(value) => filter.onChange?.(value)}
            className="w-auto min-w-40"
          />
        )
      })}
      {showClear && (
        <Button variant="ghost" size={resolvedSize} leadingIcon={X} onClick={clearAll}>
          {clearLabel}
        </Button>
      )}
      {actions && <div className="ml-auto flex items-center gap-ds-xs">{actions}</div>}
    </div>
  )
}
