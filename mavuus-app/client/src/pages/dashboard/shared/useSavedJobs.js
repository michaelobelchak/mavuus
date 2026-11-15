import { useCallback, useEffect, useRef, useState } from 'react'
import { useToast } from '@/design-system/patterns'

/**
 * The member's saved jobs as a set of ids, from /api/jobs/saved, and `setSaved(id, next)` to save
 * or unsave one (POST or DELETE /api/jobs/:id/save) with a toast. A job already being saved or
 * unsaved ignores more clicks until the request ends. A refused request leaves the job as it was.
 */
export function useSavedJobs(token) {
  const toast = useToast()
  const [savedIds, setSavedIds] = useState(() => new Set())
  const busy = useRef(new Set())

  useEffect(() => {
    if (!token) return
    const controller = new AbortController()
    fetch('/api/jobs/saved', { headers: { Authorization: `Bearer ${token}` }, signal: controller.signal })
      .then((res) => (res.ok ? res.json() : []))
      .then((rows) => {
        if (!controller.signal.aborted && Array.isArray(rows)) setSavedIds(new Set(rows.map((row) => row.id)))
      })
      .catch(() => {})
    return () => controller.abort()
  }, [token])

  const setSaved = useCallback(
    async (id, next) => {
      if (busy.current.has(id)) return
      busy.current.add(id)
      try {
        const res = await fetch(`/api/jobs/${id}/save`, {
          method: next ? 'POST' : 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        })
        // 409: it was saved already, which is what the member wanted.
        if (!res.ok && !(next && res.status === 409)) throw new Error(`HTTP ${res.status}`)
        setSavedIds((prev) => {
          const copy = new Set(prev)
          if (next) copy.add(id)
          else copy.delete(id)
          return copy
        })
        if (next) toast.success('Job saved!')
        else toast.info('Job removed from saved')
      } catch {
        toast.error("Couldn't update your saved jobs. Try again.")
      } finally {
        busy.current.delete(id)
      }
    },
    [token, toast],
  )

  return { savedIds, setSaved }
}
