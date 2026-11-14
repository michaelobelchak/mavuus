import { useId, useState } from 'react'
import { MessageSquare, Reply, Trash2 } from 'lucide-react'
import { cn } from '../../../lib/cn'
import { resolveHeadingLevel } from '../../../lib/resolveOption'
import { Card, EmptyState } from '../../../patterns'
import { Avatar, Button, Caption, Heading, Icon, Input, Skeleton, Text } from '../../../primitives'

function CommentForm({ label, placeholder, submitLabel, size, onSubmit, autoFocus }) {
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)
  const submit = async (event) => {
    event.preventDefault()
    const content = text.trim()
    if (!content || busy) return
    setBusy(true)
    try {
      const ok = await onSubmit(content)
      if (ok !== false) setText('')
    } finally {
      setBusy(false)
    }
  }
  return (
    <form onSubmit={submit} className="flex min-w-0 flex-1 gap-ds-xs">
      <Input
        aria-label={label}
        value={text}
        onChange={(event) => setText(event.target.value)}
        placeholder={placeholder}
        size={size}
        className="min-w-0 flex-1"
        // A reply field opens because someone asked for it, so it takes focus.
        autoFocus={autoFocus}
      />
      <Button type="submit" size={size} loading={busy} disabled={!text.trim()}>
        {submitLabel}
      </Button>
    </form>
  )
}

function CommentMeta({ comment, small }) {
  return (
    <div className="flex flex-wrap items-baseline gap-x-ds-xs">
      <Text as="span" size={small ? 'caption' : 'body-sm'} className="font-semibold">
        {comment.authorName}
      </Text>
      {comment.timeLabel && (
        <Caption as="time" dateTime={comment.dateTime}>
          {comment.timeLabel}
        </Caption>
      )}
    </div>
  )
}

function DeleteButton({ comment, onDelete }) {
  return (
    <Button
      variant="ghost"
      size="sm"
      leadingIcon={Trash2}
      onClick={() => onDelete(comment.id)}
      aria-label={`Delete comment by ${comment.authorName}`}
      className="text-text-muted"
    >
      Delete
    </Button>
  )
}

function CommentItem({ comment, canReply, onReply, onDelete }) {
  const [replying, setReplying] = useState(false)
  return (
    <li className="flex gap-ds-sm border-b border-border-subtle py-ds-md last:border-b-0">
      <Avatar name={comment.authorName} src={comment.authorAvatarSrc} size="sm" />
      <div className="flex min-w-0 flex-1 flex-col gap-ds-xxs">
        <CommentMeta comment={comment} />
        <Text size="body-sm" tone="secondary" className="break-words">
          {comment.content}
        </Text>
        {(canReply || comment.own) && (
          <div className="flex flex-wrap items-center gap-ds-xxs">
            {canReply && (
              <Button
                variant="ghost"
                size="sm"
                leadingIcon={Reply}
                aria-expanded={replying}
                onClick={() => setReplying((open) => !open)}
                className="text-text-muted"
              >
                Reply
              </Button>
            )}
            {comment.own && <DeleteButton comment={comment} onDelete={onDelete} />}
          </div>
        )}
        {replying && (
          <CommentForm
            label={`Reply to ${comment.authorName}`}
            placeholder="Write a reply..."
            submitLabel="Reply"
            size="sm"
            autoFocus
            onSubmit={async (content) => {
              const ok = await onReply(comment.id, content)
              if (ok !== false) setReplying(false)
              return ok
            }}
          />
        )}
        {comment.replies?.length > 0 && (
          <ul className="mt-ds-xs flex flex-col gap-ds-sm border-l-2 border-border-subtle pl-ds-md">
            {comment.replies.map((reply) => (
              <li key={reply.id} className="flex gap-ds-xs">
                <Avatar name={reply.authorName} src={reply.authorAvatarSrc} size="sm" />
                <div className="flex min-w-0 flex-1 flex-col gap-ds-xxs">
                  <CommentMeta comment={reply} small />
                  <Text size="body-sm" tone="secondary" className="break-words">
                    {reply.content}
                  </Text>
                  {reply.own && (
                    <div>
                      <DeleteButton comment={reply} onDelete={onDelete} />
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </li>
  )
}

/**
 * Comments on a session, resource, job or other item, with one level of replies.
 * - `comments`: [{ id, authorName, authorAvatarSrc, content, timeLabel, dateTime, own,
 *   replies: [same shape] }], newest first. `own` shows Delete. `timeLabel` is preformatted
 *   ("3h ago"); `dateTime` goes on the <time>.
 * - `currentUser`: { name, avatarSrc } shows the comment form; without it the thread says
 *   "Log in to leave a comment." and has no Reply buttons.
 * - `onPost(content)`, `onReply(parentId, content)`: may return a promise; resolve to false to
 *   keep the text (the post failed). `onDelete(id)`.
 * - `loading`: skeleton rows with aria-busy. `headingLevel` (default 2) for the "Comments (n)" title.
 * Organisms never fetch: the page loads and saves the comments. Other props go to the Card.
 */
export function CommentThread({
  comments = [],
  currentUser,
  loading = false,
  onPost,
  onReply,
  onDelete,
  headingLevel,
  className,
  ...props
}) {
  const level = resolveHeadingLevel(headingLevel, [2, 3, 4], 2, 'CommentThread')
  const titleId = useId()
  const signedIn = Boolean(currentUser)

  return (
    <Card as="section" aria-labelledby={titleId} padding="lg" className={cn('flex flex-col gap-ds-md', className)} {...props}>
      <Heading id={titleId} level={level} size="h4" className="flex items-center gap-ds-xs">
        <Icon icon={MessageSquare} size="md" />
        Comments ({comments.length})
      </Heading>
      {signedIn ? (
        <div className="flex items-center gap-ds-sm">
          <Avatar name={currentUser.name} src={currentUser.avatarSrc} size="sm" />
          <CommentForm label="Add a comment" placeholder="Add a comment..." submitLabel="Post" onSubmit={onPost} />
        </div>
      ) : (
        <Text size="body-sm" tone="secondary">
          Log in to leave a comment.
        </Text>
      )}
      {loading ? (
        <div aria-busy="true" className="flex flex-col gap-ds-md">
          <span className="sr-only">Loading comments</span>
          {[0, 1].map((row) => (
            <div key={row} aria-hidden="true" className="flex gap-ds-sm">
              <Skeleton shape="circle" className="size-8" />
              <Skeleton lines={2} className="flex-1" />
            </div>
          ))}
        </div>
      ) : comments.length === 0 ? (
        <EmptyState size="sm" icon={MessageSquare} title="No comments yet" description="Be the first!" headingLevel={Math.min(level + 1, 4)} />
      ) : (
        <ul>
          {comments.map((comment) => (
            <CommentItem key={comment.id} comment={comment} canReply={signedIn && Boolean(onReply)} onReply={onReply} onDelete={onDelete} />
          ))}
        </ul>
      )}
    </Card>
  )
}
