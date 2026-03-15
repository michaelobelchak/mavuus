import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../../context/AuthContext'
import Avatar from './Avatar'
import { MessageSquare, Reply, Trash2, Send } from 'lucide-react'

function timeAgo(dateStr) {
  const now = new Date()
  const date = new Date(dateStr)
  const diffMs = now - date
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)
  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function CommentItem({ comment, onReply, onDelete, userId }) {
  const [showReplyForm, setShowReplyForm] = useState(false)
  const [replyText, setReplyText] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleReply = async () => {
    if (!replyText.trim()) return
    setSubmitting(true)
    await onReply(comment.id, replyText)
    setReplyText('')
    setShowReplyForm(false)
    setSubmitting(false)
  }

  return (
    <div className="border-b border-neutral-50 last:border-0 py-4">
      <div className="flex gap-3">
        <Avatar name={comment.user_name} src={comment.user_avatar} size="sm" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-semibold text-dark-blue">{comment.user_name}</span>
            <span className="text-xs text-neutral-400">{timeAgo(comment.created_at)}</span>
          </div>
          <p className="text-sm text-neutral-600 leading-relaxed">{comment.content}</p>
          <div className="flex items-center gap-3 mt-2">
            <button onClick={() => setShowReplyForm(!showReplyForm)}
              className="text-xs text-neutral-400 hover:text-brand-pink flex items-center gap-1 cursor-pointer">
              <Reply size={12} /> Reply
            </button>
            {userId === comment.user_id && (
              <button onClick={() => onDelete(comment.id)}
                className="text-xs text-neutral-400 hover:text-red-500 flex items-center gap-1 cursor-pointer">
                <Trash2 size={12} /> Delete
              </button>
            )}
          </div>

          {showReplyForm && (
            <div className="flex gap-2 mt-3">
              <input type="text" value={replyText} onChange={e => setReplyText(e.target.value)}
                placeholder="Write a reply..."
                className="flex-1 px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-pink/30"
                onKeyDown={e => { if (e.key === 'Enter') handleReply() }} />
              <button onClick={handleReply} disabled={submitting || !replyText.trim()}
                className="px-3 py-2 bg-brand-pink text-white rounded-lg text-sm disabled:opacity-50 cursor-pointer">
                <Send size={14} />
              </button>
            </div>
          )}

          {/* Replies */}
          {comment.replies?.length > 0 && (
            <div className="ml-4 mt-3 pl-4 border-l-2 border-neutral-100 space-y-3">
              {comment.replies.map(reply => (
                <div key={reply.id} className="flex gap-2">
                  <Avatar name={reply.user_name} src={reply.user_avatar} size="xs" />
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-xs font-semibold text-dark-blue">{reply.user_name}</span>
                      <span className="text-xs text-neutral-400">{timeAgo(reply.created_at)}</span>
                    </div>
                    <p className="text-xs text-neutral-600">{reply.content}</p>
                    {userId === reply.user_id && (
                      <button onClick={() => onDelete(reply.id)}
                        className="text-xs text-neutral-400 hover:text-red-500 flex items-center gap-1 mt-1 cursor-pointer">
                        <Trash2 size={10} /> Delete
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function CommentSection({ entityType, entityId }) {
  const { user, token } = useAuth()
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [newComment, setNewComment] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const fetchComments = useCallback(async () => {
    try {
      const res = await fetch(`/api/comments?entity_type=${entityType}&entity_id=${entityId}`)
      if (res.ok) setComments(await res.json())
    } catch {}
    setLoading(false)
  }, [entityType, entityId])

  useEffect(() => { fetchComments() }, [fetchComments])

  const handleSubmit = async () => {
    if (!newComment.trim() || !token) return
    setSubmitting(true)
    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ entity_type: entityType, entity_id: entityId, content: newComment }),
      })
      if (res.ok) {
        const comment = await res.json()
        setComments(prev => [{ ...comment, replies: [] }, ...prev])
        setNewComment('')
      }
    } catch {}
    setSubmitting(false)
  }

  const handleReply = async (parentId, content) => {
    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ entity_type: entityType, entity_id: entityId, content, parent_id: parentId }),
      })
      if (res.ok) {
        const reply = await res.json()
        setComments(prev => prev.map(c =>
          c.id === parentId ? { ...c, replies: [...(c.replies || []), reply] } : c
        ))
      }
    } catch {}
  }

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`/api/comments/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        setComments(prev => prev
          .filter(c => c.id !== id)
          .map(c => ({ ...c, replies: (c.replies || []).filter(r => r.id !== id) }))
        )
      }
    } catch {}
  }

  return (
    <div className="bg-white rounded-2xl border border-neutral-100 p-6">
      <h3 className="text-lg font-semibold text-dark-blue mb-4 flex items-center gap-2">
        <MessageSquare size={18} /> Comments ({comments.length})
      </h3>

      {/* New comment form */}
      {token ? (
        <div className="flex gap-3 mb-6">
          <Avatar name={user?.name} src={user?.avatar_url} size="sm" />
          <div className="flex-1 flex gap-2">
            <input type="text" value={newComment} onChange={e => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="flex-1 px-3 py-2.5 text-sm border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-pink/20 focus:border-brand-pink"
              onKeyDown={e => { if (e.key === 'Enter') handleSubmit() }} />
            <button onClick={handleSubmit} disabled={submitting || !newComment.trim()}
              className="px-4 py-2.5 bg-brand-pink text-white rounded-xl text-sm font-medium disabled:opacity-50 cursor-pointer hover:bg-brand-pink/90 transition-colors">
              Post
            </button>
          </div>
        </div>
      ) : (
        <p className="text-sm text-neutral-500 mb-4">Log in to leave a comment.</p>
      )}

      {/* Comments list */}
      {loading ? (
        <div className="text-center py-8 text-neutral-400 text-sm">Loading comments...</div>
      ) : comments.length === 0 ? (
        <div className="text-center py-8 text-neutral-400">
          <MessageSquare size={24} className="mx-auto mb-2 opacity-30" />
          <p className="text-sm">No comments yet. Be the first!</p>
        </div>
      ) : (
        <div>{comments.map(c => (
          <CommentItem key={c.id} comment={c} onReply={handleReply} onDelete={handleDelete} userId={user?.id} />
        ))}</div>
      )}
    </div>
  )
}
