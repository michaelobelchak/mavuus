import { useCallback, useSyncExternalStore } from 'react'

function media(query) {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return null
  return window.matchMedia(query)
}

/**
 * True while `query` matches (for example '(min-width: 48rem)', Tailwind's md). Updates live.
 * Returns `fallback` (default false) when matchMedia is missing: on the server and in jsdom.
 */
export function useMediaQuery(query, fallback = false) {
  const subscribe = useCallback(
    (onChange) => {
      const list = media(query)
      if (!list) return () => {}
      list.addEventListener('change', onChange)
      return () => list.removeEventListener('change', onChange)
    },
    [query],
  )
  const getSnapshot = () => {
    const list = media(query)
    return list ? list.matches : fallback
  }
  return useSyncExternalStore(subscribe, getSnapshot, () => fallback)
}
