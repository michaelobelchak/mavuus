import { useCallback, useEffect, useMemo, useState } from 'react'
import { toDateTime } from '@/design-system/lib/formatDate'
import { useToast } from '@/design-system/patterns'
import { useAuth } from '../context/AuthContext'
import { timeAgo } from '../layouts/timeAgo'

function toThreadItem(comment, userId) {
  return {
    id: comment.id,
    authorName: comment.user_name,
    authorAvatarSrc: comment.user_avatar,
    content: comment.content,
    timeLabel: timeAgo(comment.created_at),
    dateTime: toDateTime(comment.created_at),
    own: userId != null && comment.user_id === userId,
    replies: (comment.replies || []).map((reply) => toThreadItem(reply, userId)),
  }
}

// The server's `error` text for a refused request, or `fallback`.
async function refusal(res, fallback) {
  const body = await res.json().catch(() => null)
  return typeof body?.error === 'string' && body.error ? body.error : fallback
}

/**
 * Loads and saves the comments on one item (`entityType` session, resource, job...) through
 * /api/comments, and returns the props for the CommentThread organism: spread them on it.
 * Failures to post, reply or delete show an error toast: the server's `error` text when it refuses,
 * a fallback otherwise. Another item starts from an empty list while its comments load.
 */
export function useComments(entityType, entityId) {
  const { user, token } = useAuth()
  const toast = useToast()
  const key = `${entityType}:${entityId}`
  // The rows are stored with the item they belong to, so another item never shows them.
  const [store, setStore] = useState({ key: null, rows: [] })
  const raw = useMemo(() => (store.key === key ? store.rows : []), [store, key])
  const setRaw = useCallback((update) => setStore((s) => ({ key: s.key, rows: update(s.rows) })), [])

  useEffect(() => {
    let ignore = false
    fetch(`/api/comments?entity_type=${entityType}&entity_id=${entityId}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!ignore) setStore({ key, rows: Array.isArray(data) ? data : [] })
      })
      .catch((err) => {
        console.error('Failed to load comments', err)
        if (!ignore) setStore({ key, rows: [] })
      })
    return () => {
      ignore = true
    }
  }, [entityType, entityId, key])

  const send = useCallback(
    (content, parentId) =>
      fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          entity_type: entityType,
          entity_id: entityId,
          content,
          ...(parentId ? { parent_id: parentId } : {}),
        }),
      }),
    [entityType, entityId, token],
  )

  const onPost = useCallback(
    async (content) => {
      if (!token) return false
      try {
        const res = await send(content)
        if (!res.ok) {
          toast.error(await refusal(res, "Couldn't post your comment. Try again."))
          return false
        }
        const comment = await res.json()
        setRaw((prev) => [{ ...comment, replies: [] }, ...prev])
        return true
      } catch {
        toast.error("Couldn't post your comment. Try again.")
        return false
      }
    },
    [send, setRaw, token, toast],
  )

  const onReply = useCallback(
    async (parentId, content) => {
      try {
        const res = await send(content, parentId)
        if (!res.ok) {
          toast.error(await refusal(res, "Couldn't post your reply. Try again."))
          return false
        }
        const reply = await res.json()
        setRaw((prev) => prev.map((c) => (c.id === parentId ? { ...c, replies: [...(c.replies || []), reply] } : c)))
        return true
      } catch {
        toast.error("Couldn't post your reply. Try again.")
        return false
      }
    },
    [send, setRaw, toast],
  )

  const onDelete = useCallback(
    async (id) => {
      try {
        const res = await fetch(`/api/comments/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } })
        if (!res.ok) {
          toast.error(await refusal(res, "Couldn't delete the comment. Try again."))
          return false
        }
        setRaw((prev) =>
          prev.filter((c) => c.id !== id).map((c) => ({ ...c, replies: (c.replies || []).filter((r) => r.id !== id) })),
        )
        return true
      } catch {
        toast.error("Couldn't delete the comment. Try again.")
        return false
      }
    },
    [setRaw, token, toast],
  )

  const comments = useMemo(() => raw.map((c) => toThreadItem(c, user?.id)), [raw, user?.id])
  const currentUser = token && user ? { name: user.name, avatarSrc: user.avatar_url } : null

  return { comments, loading: store.key !== key, currentUser, onPost, onReply, onDelete }
}
