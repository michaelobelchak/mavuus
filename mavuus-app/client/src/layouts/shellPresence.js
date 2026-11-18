import { useLayoutEffect, useSyncExternalStore } from 'react'

// How many app shells are mounted. SiteSkipLink sits above the routes in App.jsx, so it can't read
// a context from ShellLayout below it; this tiny store tells it whether a shell (which brings its
// own skip link) is on the page.
let mounted = 0
const listeners = new Set()

function emit() {
  for (const listener of listeners) listener()
}

function subscribe(listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

/** Call in a layout that renders AppShell: marks the shell as on the page while it is mounted. */
export function useShellMounted() {
  // A layout effect, so the site skip link is gone before the first paint.
  useLayoutEffect(() => {
    mounted += 1
    emit()
    return () => {
      mounted -= 1
      emit()
    }
  }, [])
}

/** True while any layout that called useShellMounted is mounted. */
export function useIsShellMounted() {
  return useSyncExternalStore(
    subscribe,
    () => mounted > 0,
    () => false,
  )
}
