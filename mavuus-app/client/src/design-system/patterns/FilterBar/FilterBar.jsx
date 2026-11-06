import { X } from 'lucide-react'
import { cn } from '../../lib/cn'
import { warnOnce } from '../../lib/warnOnce'
import { Button, Chip, Select } from '../../primitives'

const FILTER_TYPES = ['select', 'chips']

// The value a filter goes back to on "Clear filters": no selection.
function emptyValue(filter) {
  if (filter.emptyValue !== undefined) return filter.emptyValue
  return filter.type === 'chips' && filter.multiple ? [] : null
}

function isActive(filter) {
  const { value } = filter
  if (Array.isArray(value)) return value.length > 0
  return value !== undefined && value !== null && value !== '' && value !== emptyValue(filter)
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
          size={filter.size}
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
 * - `filters`: [{ type: 'select', key, label, items, value, onChange(value), placeholder, size }]
 *   or [{ type: 'chips', key, label, options: [{ value, label, disabled }], multiple, value,
 *   onChange(value), size }]. `label` names the select or the chip group. Multiple chips use an
 *   array value; single chips toggle off on a second click. Selects and chips default to the sm
 *   (40px) toolbar size.
 * - "Clear filters" shows while any filter has a value (or `active` is true, for state kept
 *   outside the filters such as the search text). It calls each active filter's onChange with its
 *   empty value (null, or [] for multiple chips, or the filter's `emptyValue`), then `onClear()`.
 * `className` and other props go to the root.
 */
export function FilterBar({
  search,
  filters = [],
  actions,
  active = false,
  onClear,
  clearLabel = 'Clear filters',
  className,
  ref,
  ...props
}) {
  const known = filters.filter((filter) => {
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
    for (const filter of activeFilters) filter.onChange?.(emptyValue(filter))
    onClear?.()
  }

  return (
    <div ref={ref} className={cn('flex flex-wrap items-center gap-ds-sm', className)} {...props}>
      {search && <div className="w-full sm:w-auto sm:max-w-sm sm:grow">{search}</div>}
      {known.map((filter) =>
        filter.type === 'select' ? (
          <Select
            key={filter.key}
            aria-label={filter.label}
            size={filter.size ?? 'sm'}
            items={filter.items}
            placeholder={filter.placeholder}
            value={filter.value ?? null}
            onValueChange={(value) => filter.onChange?.(value)}
            className="w-auto min-w-40"
          />
        ) : (
          <ChipsFilter key={filter.key} filter={filter} />
        ),
      )}
      {showClear && (
        <Button variant="ghost" size="sm" leadingIcon={X} onClick={clearAll}>
          {clearLabel}
        </Button>
      )}
      {actions && <div className="ml-auto flex items-center gap-ds-xs">{actions}</div>}
    </div>
  )
}
