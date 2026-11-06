import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { useControllableState } from '../../../hooks'
import { cn } from '../../../lib/cn'
import { Alert, DataTable, Dialog, DialogClose, FilterBar, SearchInput } from '../../../patterns'
import { Button, Text } from '../../../primitives'

const DEFAULT_CONFIRM_DESCRIPTION = "This can't be undone."
const DEFAULT_ACTION_ERROR = 'Something went wrong. Try again.'
const NO_IDS = []

const callOrValue = (value, arg) => (typeof value === 'function' ? value(arg) : value)
const isHidden = (action, arg) => Boolean(callOrValue(action.hidden, arg))
const lowerFirst = (text) => (typeof text === 'string' && text ? text.charAt(0).toLowerCase() + text.slice(1) : null)
const errorMessage = (error) => (typeof error?.message === 'string' && error.message ? error.message : DEFAULT_ACTION_ERROR)
const rowsLabel = (count) => `${count} ${count === 1 ? 'row' : 'rows'}`

/**
 * Admin list: the DataTable pattern plus the toolbar, bulk bar, row action menu, confirm dialog
 * and error state the admin pages repeat. Data comes in through props; it never fetches.
 * - `search`: { label (required, visually hidden), placeholder, value, defaultValue,
 *   onChange(event) (every keystroke, for a controlled `value`), onSearch(text) (debounced),
 *   debounce } for a SearchInput in the toolbar.
 * - `filters`: FilterBar config (select, chips or custom, each with a `key`). `onClearFilters(empty)`
 *   resets them in one call; `filtersActive` keeps Clear filters visible for state outside the
 *   filters (the search text). `toolbarActions`: buttons on the right (Export, New resource).
 * - `selectable`, `selectedIds` / `defaultSelectedIds`, `onSelectionChange(ids)`. While rows are
 *   selected a bar shows "3 selected", the `bulkActions` and Clear selection. When `rows` change,
 *   selected ids missing from `rows` are dropped, unless `pagination.manual` (then `rows` is only
 *   the current page and ids on other pages stay selected).
 * - `bulkActions`: [{ key, label, icon, onSelect(ids, { clearSelection }), destructive, confirm,
 *   keepSelection, hidden(ids) }]. The selection clears once onSelect succeeds (resolves or returns),
 *   unless `keepSelection`; a failed action keeps it.
 * - `rowActions`: an array, or `(row) => array`, of { key, label, icon, onSelect(row), to(row),
 *   href(row) (a plain or external link item; absolute http(s) opens in a new tab), disabled(row),
 *   hidden(row), destructive, confirm } or { type: 'separator' }. They open from the row's kebab
 *   menu.
 *   A `destructive` action shows in the danger tone. Destructive actions and actions with
 *   `confirm` ask first in a Dialog: `confirm` is { title, description, confirmLabel }, each a
 *   string or a function of the row (or the ids for bulk actions). Defaults: "Delete Priya
 *   Nair?", "This can't be undone." and the action label. `onSelect` may return a promise; the
 *   confirm button shows a spinner until it settles. A rejection keeps the dialog open with an
 *   error Alert (the error's message, or "Something went wrong. Try again."); it closes only on
 *   success.
 * - `onActionError(error, action, rowOrIds)`: called when an action without a confirm dialog
 *   throws or rejects (show a toast). Errors never escape as unhandled rejections; without this
 *   prop they are logged in dev.
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
  onActionError,
  className,
  ref,
  ...tableProps
}) {
  const [selected, setSelected] = useControllableState(selectedIds, defaultSelectedIds, onSelectionChange)
  const [pending, setPending] = useState(null)
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [dialogError, setDialogError] = useState(null)
  const nameOf = (row) => String(getRowName ? getRowName(row) : (row.name ?? row.title ?? getRowId(row) ?? ''))
  const manual = Boolean(tableProps.pagination?.manual)

  // Drop selected ids whose rows are gone. With manual paging `rows` is one page, so keep them.
  useEffect(() => {
    if (!selectable || manual) return
    const present = new Set(rows.map((row) => getRowId(row)))
    const kept = selected.filter((id) => present.has(id))
    if (kept.length !== selected.length) setSelected(kept)
    // Only a new rows array should prune; selection changes are handled where they happen.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows])

  const clearSelection = () => setSelected([])

  // Runs an action and resolves once it is done; throws when onSelect throws or rejects.
  async function execute(action, arg, bulk) {
    await (bulk ? action.onSelect?.(arg, { clearSelection }) : action.onSelect?.(arg))
    if (bulk && !action.keepSelection) clearSelection()
  }

  function reportError(error, action, arg) {
    if (onActionError) onActionError(error, action, arg)
    else if (import.meta.env.DEV) console.error('AdminDataTable: action failed', error)
  }

  function run(action, arg) {
    const bulk = Array.isArray(arg)
    if (!action.destructive && !action.confirm) {
      execute(action, arg, bulk).catch((error) => reportError(error, action, arg))
      return
    }
    const target = bulk ? rowsLabel(arg.length) : nameOf(arg)
    setPending({
      title: callOrValue(action.confirm?.title, arg) ?? `${action.label} ${target}?`,
      description: callOrValue(action.confirm?.description, arg) ?? DEFAULT_CONFIRM_DESCRIPTION,
      confirmLabel: callOrValue(action.confirm?.confirmLabel, arg) ?? action.label,
      destructive: Boolean(action.destructive),
      run: () => execute(action, arg, bulk),
    })
    setDialogError(null)
    setOpen(true)
  }

  async function confirm() {
    setBusy(true)
    setDialogError(null)
    try {
      await pending.run()
      setOpen(false)
    } catch (failure) {
      setDialogError(errorMessage(failure))
    } finally {
      setBusy(false)
    }
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
                onSelect: action.onSelect ? () => run(action, row) : undefined,
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
          <Text as="span" size="body-sm" className="order-1 font-semibold">
            {`${count} selected`}
          </Text>
          <div className="order-3 flex w-full flex-wrap items-center gap-ds-xs sm:order-2 sm:w-auto">
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
          <Button size="sm" variant="ghost" leadingIcon={X} className="order-2 ml-auto sm:order-3" onClick={() => setSelected([])}>
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
      {/* The last pending content stays while the dialog closes, so it doesn't flash a default. */}
      <Dialog
        open={open}
        onOpenChange={(next) => {
          if (!next && !busy) setOpen(false)
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
            <Button variant={pending?.destructive ? 'danger' : 'primary'} loading={busy} onClick={confirm}>
              {pending?.confirmLabel ?? 'Confirm'}
            </Button>
          </>
        }
      >
        {dialogError && <Alert tone="error" title="That didn't work" description={dialogError} />}
      </Dialog>
    </div>
  )
}
