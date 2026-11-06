// Row click handling for DataTable rows with rowHref or onRowClick.

// A row click is ignored when it started on one of these (they do their own thing).
const INTERACTIVE =
  'a, button, input, select, textarea, label, summary, [role="button"], [role="link"], [role="checkbox"], [role="menuitem"], [role="option"], [contenteditable="true"]'

/**
 * True when a click on the row should go to its first-cell target: it happened inside the row
 * (not in portaled content, like an open menu, that React bubbles through it), not on a control,
 * and didn't end a text selection.
 */
export function shouldForward(event) {
  const row = event.currentTarget
  if (!(event.target instanceof Element) || !row.contains(event.target)) return false
  const control = event.target.closest(INTERACTIVE)
  if (control && row.contains(control)) return false
  const selection = window.getSelection?.()
  return !(selection && !selection.isCollapsed && selection.toString() !== '')
}

export function opensNewTab(event) {
  return event.metaKey || event.ctrlKey || event.shiftKey || event.button === 1
}

/**
 * Opens the row's link in a new tab. A dispatched click carrying the modifier keys is an
 * untrusted event, and browsers don't reliably honor modifiers on those (some open in the same
 * tab, some treat it as a popup). window.open runs inside the user's click, so it has user
 * activation and opens a tab everywhere. noopener matches what a real ctrl-click gives.
 */
export function openRowLinkInNewTab(row) {
  const link = row.querySelector('a[data-row-target]')
  if (link) window.open(link.href, '_blank', 'noopener,noreferrer')
}
