import { useState } from 'react'
import { X } from 'lucide-react'
import { useControllableState } from '../../../hooks'
import { cn } from '../../../lib/cn'
import { Alert, DataTable, Dialog, DialogClose, FilterBar, SearchInput } from '../../../patterns'
import { Button, Text } from '../../../primitives'

const DEFAULT_CONFIRM_DESCRIPTION = "This can't be undone."
const NO_IDS = []

const callOrValue = (value, arg) => (typeof value === 'function' ? value(arg) : value)
const isHidden = (action, arg) => Boolean(callOrValue(action.hidden, arg))
const lowerFirst = (text) => (text ? text.charAt(0).toLowerCase() + text.slice(1) : text)
const rowsLabel = (count) => `${count} ${count === 1 ? 'row' : 'rows'}`

/**
 * Admin list: the DataTable pattern plus the toolbar, bulk bar, row action menu, confirm dialog
 * and error state the admin pages repeat. Data comes in through props; it never fetches.
 * - `search`: { label (required, visually hidden), placeholder, value, defaultValue, onSearch,
 *   debounce } for a SearchInput in the toolbar.
 * - `filters`: FilterBar config (select, chips or custom, each with a `key`). `onClearFilters(empty)`
 *   resets them in one call; `filtersActive` keeps Clear filters visible for state outside the
 *   filters (the search text). `toolbarActions`: buttons on the right (Export, New resource).
 * - `selectable`, `selectedIds` / `defaultSelectedIds`, `onSelectionChange(ids)`. While rows are
 *   selected a bar shows "3 selected", the `bulkActions` and Clear selection.
 * - `bulkActions`: [{ key, label, icon, onSelect(ids), destructive, confirm }].
 * - `rowActions`: an array, or `(row) => array`, of { key, label, icon, onSelect(row), to(row),
 *   disabled, hidden(row), destructive, confirm } or { type: 'separator' }. They open from the
 *   row's kebab menu.
 *   A `destructive` action shows in the danger tone and asks first in a Dialog: `confirm` is
 *   { title, description, confirmLabel }, each a string or a function of the row (or the ids for
 *   bulk actions). Defaults: "Delete Priya Nair?", "This can't be undone." and the action label.
 *   `onSelect` may return a promise; the confirm button shows a spinner until it settles.
 * - `error`: true or a message. With no rows the table is replaced by an error Alert, otherwise
 *   the Alert sits above the old rows. `onRetry` adds a Try again button.
 * - Everything else (`columns`, `rows`, `caption`, `pagination`, `loading`, `emptyState`, `sort`,
 *   `rowHref`, `onRowClick`, `density`, `mobileLayout`) goes to DataTable.
 * `className` goes to the root.
 */
export function AdminDataTable({
  caption,
  rows = [],
  getRowId = (row) => row.id,
  getRowName,
  search,
  filters,
  onClearFilters,
  filtersActive = false,
  toolbarActions,
  selectable = false,
  selectedIds,
  defaultSelectedIds = NO_IDS,
  onSelectionChange,
  bulkActions = [],
  rowActions,
  error,
  onRetry,
  className,
  ref,
  ...tableProps
}) {
  const [selected, setSelected] = useControllableState(selectedIds, defaultSelectedIds, onSelectionChange)
  const [pending, setPending] = useState(null)
  const [busy, setBusy] = useState(false)
  const nameOf = (row) => String(getRowName ? getRowName(row) : (row.name ?? row.title ?? getRowId(row) ?? ''))

  function run(action, arg) {
    if (!action.destructive) {
      action.onSelect?.(arg)
      return
    }
    const isBulk = Array.isArray(arg)
    const target = isBulk ? rowsLabel(arg.length) : nameOf(arg)
    setPending({
      title: callOrValue(action.confirm?.title, arg) ?? `${action.label} ${target}?`,
      description: callOrValue(action.confirm?.description, arg) ?? DEFAULT_CONFIRM_DESCRIPTION,
      confirmLabel: callOrValue(action.confirm?.confirmLabel, arg) ?? action.label,
      onConfirm: () => action.onSelect?.(arg),
    })
  }

  async function confirm() {
    const result = pending.onConfirm()
    if (result && typeof result.then === 'function') {
      setBusy(true)
      try {
        await result
      } finally {
        setBusy(false)
      }
    }
    setPending(null)
  }

  const menuItems =
    rowActions &&
    ((row) =>
      (callOrValue(rowActions, row) ?? [])
        .filter((action) => action.type === 'separator' || !isHidden(action, row))
        .map((action) =>
          action.type === 'separator'
            ? action
            : {
                key: action.key,
                label: action.label,
                icon: action.icon,
                disabled: callOrValue(action.disabled, row),
                tone: action.destructive ? 'danger' : undefined,
                to: callOrValue(action.to, row),
                href: callOrValue(action.href, row),
                onSelect: action.onSelect || action.destructive ? () => run(action, row) : undefined,
              },
        ))

  const searchField = search && (
    <SearchInput
      label={search.label}
      placeholder={search.placeholder}
      value={search.value}
      defaultValue={search.defaultValue}
      debounce={search.debounce}
      onChange={search.onChange}
      onSearch={search.onSearch}
    />
  )
  const hasToolbar = Boolean(searchField || filters?.length || toolbarActions)
  const count = selectable ? selected.length : 0
  const visibleBulk = bulkActions.filter((action) => !isHidden(action, selected))
  const failed = Boolean(error)
  const errorText = typeof error === 'string' ? error : 'Check your connection and try again.'

  const errorAlert = failed && (
    <Alert
      tone="error"
      title={`Couldn't load ${lowerFirst(caption) ?? 'this list'}`}
      description={errorText}
      actions={
        onRetry && (
          <Button variant="outline" size="sm" onClick={onRetry}>
            Try again
          </Button>
        )
      }
    />
  )

  return (
    <div ref={ref} className={cn('flex flex-col gap-ds-md', className)}>
      {hasToolbar && (
        <FilterBar
          search={searchField}
          filters={filters}
          onClear={onClearFilters}
          active={filtersActive}
          actions={toolbarActions}
        />
      )}
      {count > 0 && (
        <div
          role="region"
          aria-label="Bulk actions"
          className="flex flex-wrap items-center gap-ds-sm rounded-card bg-surface-selected px-ds-md py-ds-sm"
        >
          <Text as="span" size="body-sm" className="font-semibold">
            {`${count} selected`}
          </Text>
          <div className="flex flex-wrap items-center gap-ds-xs">
            {visibleBulk.map((action) => (
              <Button
                key={action.key ?? action.label}
                size="sm"
                variant={action.destructive ? 'danger' : 'outline'}
                leadingIcon={action.icon}
                onClick={() => run(action, selected)}
              >
                {action.label}
              </Button>
            ))}
          </div>
          <Button size="sm" variant="ghost" leadingIcon={X} className="ml-auto" onClick={() => setSelected([])}>
            Clear selection
          </Button>
        </div>
      )}
      <span role="status" className="sr-only">
        {count > 0 ? `${count} selected` : ''}
      </span>
      {errorAlert}
      {!(failed && rows.length === 0) && (
        <DataTable
          caption={caption}
          rows={rows}
          getRowId={getRowId}
          getRowName={nameOf}
          selectable={selectable}
          selectedIds={selectable ? selected : undefined}
          onSelectionChange={selectable ? setSelected : undefined}
          rowActions={menuItems}
          {...tableProps}
        />
      )}
      <Dialog
        open={pending !== null}
        onOpenChange={(open) => {
          if (!open && !busy) setPending(null)
        }}
        size="sm"
        title={pending?.title ?? 'Confirm'}
        description={pending?.description}
        footer={
          <>
            <DialogClose>
              <Button variant="ghost" disabled={busy}>
                Cancel
              </Button>
            </DialogClose>
            <Button variant="danger" loading={busy} onClick={confirm}>
              {pending?.confirmLabel ?? 'Confirm'}
            </Button>
          </>
        }
      />
    </div>
  )
}
