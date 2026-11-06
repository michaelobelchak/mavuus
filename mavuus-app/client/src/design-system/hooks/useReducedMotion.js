import { useSyncExternalStore } from 'react'

const QUERY = '(prefers-reduced-motion: reduce)'

function query() {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return null
  return window.matchMedia(QUERY)
}

function subscribe(onChange) {
  const media = query()
  if (!media) return () => {}
  media.addEventListener('change', onChange)
  return () => media.removeEventListener('change', onChange)
}

const getSnapshot = () => Boolean(query()?.matches)
// No motion before hydration: the server can't know the preference.
const getServerSnapshot = () => true

/** True when the user asks for reduced motion. Updates live when the setting changes. */
export function useReducedMotion() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
