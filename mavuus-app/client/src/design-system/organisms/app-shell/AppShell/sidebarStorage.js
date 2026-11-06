export const SIDEBAR_STORAGE_KEY = 'mv.sidebar.collapsed'

// The saved rail preference: true, false, or null when nothing (or nothing readable) is saved.
export function readCollapsed() {
  try {
    const value = window.localStorage.getItem(SIDEBAR_STORAGE_KEY)
    if (value === 'true') return true
    if (value === 'false') return false
  } catch {
    // Private mode or blocked storage: fall back to the breakpoint default.
  }
  return null
}

export function writeCollapsed(value) {
  try {
    window.localStorage.setItem(SIDEBAR_STORAGE_KEY, String(value))
  } catch {
    // The choice still applies for this visit.
  }
}
