import { useId, useLayoutEffect, useRef } from 'react'
import { ArrowLeft, Send } from 'lucide-react'
import { cn } from '@/design-system/lib/cn'
import { toDateTime } from '@/design-system/lib/formatDate'
import { Alert, EmptyState } from '@/design-system/patterns'
import { Avatar, Button, Caption, Heading, IconButton, Spinner, Text, Textarea } from '@/design-system/primitives'
import { dayLabel, isNewDay, messageTime } from './messageTime'

// Within this distance of the bottom, new messages scroll into view; further up, the reader is
// looking at older messages and stays put.
const NEAR_BOTTOM = 80

/** The thread's messages, oldest first, with a day label before each new day. */
function MessageList({ messages, selfId, otherName, label }) {
  return (
    <ol aria-label={label} className="flex flex-col gap-ds-sm">
      {messages.map((message, index) => {
        const mine = message.sender_id === selfId
        const newDay = isNewDay(message.created_at, messages[index - 1]?.created_at)
        return [
          newDay && (
            // A label between messages, not a list item of its own.
            <li key={`day-${message.id}`} role="presentation" className="flex justify-center py-ds-xs">
              <Caption className="rounded-chip bg-surface-sunken px-ds-sm py-ds-xxs">
                <time dateTime={toDateTime(message.created_at)}>{dayLabel(message.created_at)}</time>
              </Caption>
            </li>
          ),
          <li key={message.id} className={cn('flex max-w-3/4 flex-col', mine ? 'items-end self-end' : 'items-start self-start')}>
            <div
              className={cn(
                'flex flex-col gap-ds-xxs rounded-card px-ds-md py-ds-sm',
                mine ? 'rounded-br-tag bg-surface-brand-strong text-text-on-brand' : 'rounded-bl-tag bg-surface-sunken text-text-primary',
              )}
            >
              <span className="sr-only">{mine ? 'You said' : `${otherName} said`}</span>
              <Text size="body-sm" tone={mine ? 'on-brand' : 'primary'} className="whitespace-pre-wrap break-words">
                {message.content}
              </Text>
              <Caption tone={mine ? 'on-brand' : undefined} className={cn(mine && 'opacity-80')}>
                <time dateTime={toDateTime(message.created_at)}>{messageTime(message.created_at)}</time>
              </Caption>
            </div>
          </li>,
        ]
      })}
    </ol>
  )
}

/**
 * The open conversation: a header with the other member, the messages (or a loading, error or
 * empty state) and the composer. Enter sends, Shift+Enter adds a line.
 * - `person`: { name, title, avatar_url }. `messages`, `status` (loading, ready, error), `onRetry`.
 * - `draft`, `onDraftChange`, `onSend`, `sending`, `composerRef` (focus goes back to it after a send).
 * - `onBack`: the phone back button. `announcement`: polite live text for new messages.
 */
export function ThreadView({
  person,
  selfId,
  messages,
  status,
  onRetry,
  draft,
  onDraftChange,
  onSend,
  sending,
  composerRef,
  onBack,
  announcement,
  emptyTitle = 'No messages yet',
  emptyDescription,
}) {
  const headingId = useId()
  const hintId = useId()
  const scrollRef = useRef(null)
  const nearBottom = useRef(true)
  const lastCount = useRef(0)

  // Keep the newest message in view: always when the thread opens, and after that only while the
  // reader is near the bottom (or the newest message is their own).
  useLayoutEffect(() => {
    const element = scrollRef.current
    if (!element) return
    const grew = messages.length > lastCount.current
    const opened = lastCount.current === 0
    lastCount.current = messages.length
    const newest = messages[messages.length - 1]
    if (opened || (grew && (nearBottom.current || newest?.sender_id === selfId))) {
      element.scrollTop = element.scrollHeight
    }
  }, [messages, selfId])

  const onScroll = (event) => {
    const element = event.currentTarget
    nearBottom.current = element.scrollHeight - element.scrollTop - element.clientHeight < NEAR_BOTTOM
  }

  const submit = (event) => {
    event.preventDefault()
    onSend()
  }
  const onKeyDown = (event) => {
    // Enter sends; Shift+Enter is a new line; Enter while an IME is composing picks the word.
    if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault()
      onSend()
    }
  }

  let body
  if (status === 'loading') {
    body = (
      <div className="flex grow items-center justify-center">
        <Spinner size="lg" label="Loading messages" />
      </div>
    )
  } else if (status === 'error') {
    body = (
      <Alert
        tone="error"
        title="We couldn't load these messages"
        description="Check your connection and try again."
        actions={
          <Button size="sm" variant="outline" onClick={onRetry}>
            Try again
          </Button>
        }
      />
    )
  } else if (messages.length === 0) {
    body = <EmptyState size="sm" headingLevel={3} title={emptyTitle} description={emptyDescription} className="grow justify-center" />
  } else {
    body = <MessageList messages={messages} selfId={selfId} otherName={person.name} label={`Messages with ${person.name}`} />
  }

  return (
    <section aria-labelledby={headingId} className="flex min-h-0 grow flex-col">
      <header className="flex items-center gap-ds-sm border-b border-border-subtle px-ds-md py-ds-sm">
        <IconButton icon={ArrowLeft} aria-label="Back to conversations" onClick={onBack} className="md:hidden" />
        <Avatar name={person.name} src={person.avatar_url} size="md" />
        <div className="flex min-w-0 flex-col">
          <Heading id={headingId} level={2} size="h4" className="truncate">
            {person.name}
          </Heading>
          <Caption className="truncate">{person.title || 'Mavuus Member'}</Caption>
        </div>
      </header>

      <div ref={scrollRef} onScroll={onScroll} className="flex min-h-0 grow flex-col overflow-y-auto p-ds-md">
        {body}
      </div>
      <p role="status" className="sr-only">
        {announcement}
      </p>

      <form onSubmit={submit} className="flex items-end gap-ds-sm border-t border-border-subtle p-ds-md">
        <Textarea
          ref={composerRef}
          value={draft}
          onChange={(event) => onDraftChange(event.target.value)}
          onKeyDown={onKeyDown}
          rows={1}
          autoGrow
          maxRows={5}
          placeholder="Write a message"
          aria-label={`Message ${person.name}`}
          aria-describedby={hintId}
          className="grow"
        />
        <span id={hintId} className="sr-only">
          Press Enter to send and Shift+Enter for a new line.
        </span>
        <Button type="submit" leadingIcon={Send} loading={sending} disabled={!draft.trim()} aria-label="Send message">
          <span className="hidden sm:inline">Send</span>
        </Button>
      </form>
    </section>
  )
}
