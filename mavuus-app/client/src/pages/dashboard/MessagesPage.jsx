import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { MessageCircle, SearchX, UserX } from 'lucide-react'
import { cn } from '@/design-system/lib/cn'
import { Alert, Card, EmptyState, SearchInput, useToast } from '@/design-system/patterns'
import { MessageThreadItem, MessageThreadItemSkeleton } from '@/design-system/organisms'
import { Button, Heading, Spinner } from '@/design-system/primitives'
import { useAuth } from '../../context/AuthContext'
import { announceMessagesRead } from '../../layouts/messagesRead'
import { ThreadView } from './messages/ThreadView'
import { listTime } from './messages/messageTime'
import { errorMessage } from './shared/errorMessage'
import { MEMBERS_PATH, MESSAGES_PATH } from './shared/paths'

const LIST_POLL_MS = 10_000
const THREAD_POLL_MS = 5_000
const SEND_ERROR = "Couldn't send your message. Try again."

const parseId = (value) => {
  const id = Number(value)
  return Number.isInteger(id) && id > 0 ? id : null
}

function Centered({ children }) {
  return <div className="flex grow flex-col items-center justify-center p-ds-md">{children}</div>
}

/**
 * Messages: the conversation list and the open thread side by side from 768px, one at a time on
 * phones. The open conversation lives in the URL (`?conversation=<id>`), so back works and links
 * from other pages open it. `?user=<id>` (the Message buttons on member pages) opens that
 * member's conversation, or a new one that starts with the first message sent.
 * The list polls every 10 seconds and the open thread every 5, both paused while the tab is hidden.
 */
export default function MessagesPage() {
  const { user, token } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()
  const conversationId = parseId(searchParams.get('conversation'))
  const userId = conversationId ? null : parseId(searchParams.get('user'))

  const [list, setList] = useState({ status: 'loading', rows: [] })
  const [query, setQuery] = useState('')
  // Stored with the id it belongs to, so another conversation reads as loading, never stale.
  const [thread, setThread] = useState({ id: null, status: 'loading', messages: [] })
  const [recipient, setRecipient] = useState({ id: null, status: 'loading', member: null })
  const [drafts, setDrafts] = useState({})
  const [sending, setSending] = useState(false)
  const [announcement, setAnnouncement] = useState('')
  const sendingRef = useRef(false)
  const composerRef = useRef(null)
  // The conversation on screen: a response for any other one is dropped.
  const activeRef = useRef(null)
  const knownRef = useRef({ id: null, ids: new Set() })
  const rowsRef = useRef([])
  const auth = useMemo(() => ({ Authorization: `Bearer ${token}` }), [token])
  const listHeadingId = useId()

  const loadList = useCallback(
    async ({ signal, quiet = false } = {}) => {
      try {
        const res = await fetch('/api/messages/conversations', { headers: auth, signal })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const body = await res.json()
        if (signal?.aborted) return
        const rows = Array.isArray(body) ? body : []
        rowsRef.current = rows
        setList({ status: 'ready', rows })
      } catch (err) {
        if (signal?.aborted || err?.name === 'AbortError') return
        // A failed poll keeps the list on screen; only a first load shows the error.
        if (!quiet) setList((prev) => (prev.status === 'ready' ? prev : { status: 'error', rows: [] }))
      }
    },
    [auth],
  )

  useEffect(() => {
    const controller = new AbortController()
    loadList({ signal: controller.signal })
    const timer = setInterval(() => {
      if (!document.hidden) loadList({ signal: controller.signal, quiet: true })
    }, LIST_POLL_MS)
    return () => {
      controller.abort()
      clearInterval(timer)
    }
  }, [loadList])

  const markRead = useCallback(
    async (id, tellShell) => {
      try {
        const res = await fetch(`/api/messages/conversations/${id}/read`, { method: 'PUT', headers: auth })
        if (res.ok && tellShell) announceMessagesRead()
      } catch {
        // The next load marks it again.
      }
    },
    [auth],
  )

  const loadThread = useCallback(
    async (id, { signal, poll = false } = {}) => {
      try {
        const res = await fetch(`/api/messages/conversations/${id}/messages`, { headers: auth, signal })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const body = await res.json()
        if (signal?.aborted || activeRef.current !== id) return
        const messages = Array.isArray(body) ? body : []
        const known = knownRef.current.id === id ? knownRef.current.ids : null
        const incoming = known ? messages.filter((m) => !known.has(m.id) && m.sender_id !== user?.id) : []
        knownRef.current = { id, ids: new Set(messages.map((m) => m.id)) }
        setThread({ id, status: 'ready', messages })
        const row = rowsRef.current.find((c) => c.id === id)
        if (incoming.length > 0) {
          const name = row?.other_user_name || 'this member'
          const last = incoming[incoming.length - 1]
          setAnnouncement(
            incoming.length === 1 ? `New message from ${name}: ${last.content}` : `${incoming.length} new messages from ${name}`,
          )
        }
        // Opening a thread marks it read, and so does a poll that brought new messages.
        if (!poll || incoming.length > 0) markRead(id, incoming.length > 0 || (row?.unread_count || 0) > 0)
      } catch (err) {
        if (signal?.aborted || err?.name === 'AbortError' || activeRef.current !== id) return
        if (!poll) setThread({ id, status: 'error', messages: [] })
      }
    },
    [auth, markRead, user?.id],
  )

  useEffect(() => {
    activeRef.current = conversationId
    if (!conversationId) return undefined
    const controller = new AbortController()
    loadThread(conversationId, { signal: controller.signal })
    const timer = setInterval(() => {
      if (!document.hidden) loadThread(conversationId, { signal: controller.signal, poll: true })
    }, THREAD_POLL_MS)
    return () => {
      controller.abort()
      clearInterval(timer)
    }
  }, [conversationId, loadThread])

  // ?user=<id>: open the conversation with that member when there is one.
  const existing = userId && list.status === 'ready' ? list.rows.find((c) => c.other_user_id === userId) : null
  const existingId = existing?.id
  useEffect(() => {
    if (!existingId) return
    setSearchParams(
      (prev) => {
        const params = new URLSearchParams(prev)
        params.delete('user')
        params.set('conversation', String(existingId))
        return params
      },
      { replace: true },
    )
  }, [existingId, setSearchParams])

  // ...or load the member for a new conversation.
  const needsRecipient = Boolean(userId && userId !== user?.id && list.status === 'ready' && !existing)
  useEffect(() => {
    if (!needsRecipient) return undefined
    const controller = new AbortController()
    ;(async () => {
      try {
        const res = await fetch(`/api/members/${userId}`, { headers: auth, signal: controller.signal })
        if (res.status === 404) {
          setRecipient({ id: userId, status: 'missing', member: null })
          return
        }
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const member = await res.json()
        setRecipient({ id: userId, status: 'ready', member })
      } catch (err) {
        if (controller.signal.aborted || err?.name === 'AbortError') return
        setRecipient({ id: userId, status: 'error', member: null })
      }
    })()
    return () => controller.abort()
  }, [needsRecipient, userId, auth])

  const draftKey = conversationId ? `c${conversationId}` : userId ? `u${userId}` : null
  const draft = (draftKey && drafts[draftKey]) || ''
  const setDraft = (key, value) => setDrafts((prev) => ({ ...prev, [key]: value }))

  const send = async () => {
    const text = draft.trim()
    if (!text || sendingRef.current || !draftKey) return
    sendingRef.current = true
    setSending(true)
    const key = draftKey
    try {
      const headers = { ...auth, 'Content-Type': 'application/json' }
      if (conversationId) {
        const res = await fetch(`/api/messages/conversations/${conversationId}/messages`, {
          method: 'POST',
          headers,
          body: JSON.stringify({ content: text }),
        })
        if (!res.ok) {
          toast.error(await errorMessage(res, SEND_ERROR))
          return
        }
        setDraft(key, '')
        setAnnouncement('Message sent')
        await Promise.all([loadThread(conversationId), loadList({ quiet: true })])
      } else {
        const res = await fetch('/api/messages/conversations', {
          method: 'POST',
          headers,
          body: JSON.stringify({ userId, message: text }),
        })
        if (!res.ok) {
          toast.error(await errorMessage(res, SEND_ERROR))
          return
        }
        const { conversationId: created } = await res.json()
        setDraft(key, '')
        setAnnouncement('Message sent')
        await loadList({ quiet: true })
        setSearchParams({ conversation: String(created) }, { replace: true })
      }
    } catch {
      toast.error(SEND_ERROR)
    } finally {
      sendingRef.current = false
      setSending(false)
      composerRef.current?.focus()
    }
  }

  // Phones: back to the list. After picking a thread from the list that's a history step back.
  const back = () => {
    if (location.state?.fromList) navigate(-1)
    else navigate(MESSAGES_PATH)
  }

  const open = Boolean(conversationId || userId)
  const selected = conversationId && list.status === 'ready' ? list.rows.find((c) => c.id === conversationId) : null
  const needle = query.trim().toLowerCase()
  const rows = needle ? list.rows.filter((c) => c.other_user_name?.toLowerCase().includes(needle)) : list.rows

  const retryList = () => {
    setList({ status: 'loading', rows: [] })
    loadList()
  }
  const listError = (
    <Alert
      tone="error"
      title="We couldn't load your conversations"
      description="Check your connection and try again."
      actions={
        <Button size="sm" variant="outline" onClick={retryList}>
          Try again
        </Button>
      }
    />
  )

  let listBody
  if (list.status === 'loading') {
    listBody = (
      <ul aria-busy="true" aria-label="Loading conversations">
        {[0, 1, 2, 3].map((i) => (
          <li key={i}>
            <MessageThreadItemSkeleton announce={false} />
          </li>
        ))}
      </ul>
    )
  } else if (list.status === 'error') {
    listBody = <div className="p-ds-md">{listError}</div>
  } else if (list.rows.length === 0) {
    listBody = (
      <EmptyState
        size="sm"
        headingLevel={3}
        icon={MessageCircle}
        title="No conversations yet"
        description="Start one from a member's profile with the Message button."
        actions={
          <Button size="sm" variant="outline" to={MEMBERS_PATH}>
            Browse members
          </Button>
        }
        className="p-ds-md"
      />
    )
  } else if (rows.length === 0) {
    listBody = (
      <EmptyState
        size="sm"
        headingLevel={3}
        icon={SearchX}
        title="No matching conversations"
        description={`No one named "${query.trim()}" in your messages.`}
        className="p-ds-md"
      />
    )
  } else {
    listBody = (
      <ul aria-label="Conversations">
        {rows.map((c) => {
          const isOpen = c.id === conversationId
          return (
            <li key={c.id}>
              <MessageThreadItem
                name={c.other_user_name}
                avatarSrc={c.other_user_avatar}
                preview={c.last_message}
                fromSelf={c.last_message_sender_id === user?.id}
                time={listTime(c.last_message_at)}
                // The open thread is being read, so a poll that still counts it shows no bubble.
                unreadCount={isOpen ? 0 : c.unread_count}
                selected={isOpen}
                to={`${MESSAGES_PATH}?conversation=${c.id}`}
                state={{ fromList: true }}
              />
            </li>
          )
        })}
      </ul>
    )
  }

  const threadProps = {
    selfId: user?.id,
    draft,
    onDraftChange: (value) => setDraft(draftKey, value),
    onSend: send,
    sending,
    composerRef,
    onBack: back,
    announcement,
  }
  const unavailable = (title, description) => (
    <Centered>
      <EmptyState
        size="sm"
        headingLevel={2}
        icon={UserX}
        title={title}
        description={description}
        actions={
          <Button size="sm" variant="outline" onClick={back}>
            Back to conversations
          </Button>
        }
      />
    </Centered>
  )
  const waiting = (
    <Centered>
      <Spinner size="lg" label="Loading conversation" />
    </Centered>
  )

  let threadBody
  if (!open) {
    threadBody = (
      <Centered>
        <EmptyState
          size="sm"
          headingLevel={2}
          icon={MessageCircle}
          title="Select a conversation"
          description="Pick one from the list, or start one from a member's profile."
        />
      </Centered>
    )
  } else if (list.status === 'error') {
    threadBody = <div className="p-ds-md">{listError}</div>
  } else if (list.status === 'loading') {
    threadBody = waiting
  } else if (conversationId) {
    const current = thread.id === conversationId ? thread : { status: 'loading', messages: [] }
    threadBody = selected ? (
      <ThreadView
        {...threadProps}
        person={{ name: selected.other_user_name, title: selected.other_user_title, avatar_url: selected.other_user_avatar }}
        messages={current.messages}
        status={current.status}
        onRetry={() => {
          setThread({ id: conversationId, status: 'loading', messages: [] })
          loadThread(conversationId)
        }}
      />
    ) : (
      unavailable('Conversation not found', "This conversation doesn't exist or you're not part of it.")
    )
  } else if (userId === user?.id) {
    threadBody = unavailable("You can't message yourself", "Pick a conversation, or start one from another member's profile.")
  } else if (existing) {
    threadBody = waiting
  } else {
    const current = recipient.id === userId ? recipient : { status: 'loading' }
    if (current.status === 'loading') threadBody = waiting
    else if (current.status === 'missing') threadBody = unavailable('Member not found', "This member isn't available to message.")
    else if (current.status === 'error') {
      threadBody = unavailable("We couldn't load this member", 'Check your connection and try again.')
    } else {
      threadBody = (
        <ThreadView
          {...threadProps}
          person={current.member}
          messages={[]}
          status="ready"
          emptyTitle="Start the conversation"
          emptyDescription={`Your first message to ${current.member.name} starts the thread.`}
        />
      )
    }
  }

  return (
    <Card padding="none" className="flex h-(--shell-fill-h) overflow-hidden">
      <section
        aria-labelledby={listHeadingId}
        className={cn('w-full flex-col border-border-subtle md:flex md:w-80 md:shrink-0 md:border-r lg:w-96', open ? 'hidden' : 'flex')}
      >
        <div className="flex flex-col gap-ds-sm border-b border-border-subtle p-ds-md">
          <Heading id={listHeadingId} level={2} size="h4">
            Conversations
          </Heading>
          <SearchInput
            label="Search conversations"
            placeholder="Search by name"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
        <div className="min-h-0 grow overflow-y-auto">{listBody}</div>
      </section>
      <div className={cn('min-w-0 grow flex-col md:flex', open ? 'flex' : 'hidden')}>{threadBody}</div>
    </Card>
  )
}
