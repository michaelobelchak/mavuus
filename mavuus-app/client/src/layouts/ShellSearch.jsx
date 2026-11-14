import { useEffect, useId, useRef, useState } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { Briefcase, FileText, Store, Users, Video } from 'lucide-react'
import { useMediaQuery } from '@/design-system/hooks'
import { cn } from '@/design-system/lib/cn'
import { SearchInput } from '@/design-system/patterns'
import { Caption, Text } from '@/design-system/primitives'

const MIN_CHARS = 2

const SECTIONS = [
  {
    key: 'sessions',
    label: 'Sessions',
    icon: Video,
    to: (item) => `/dashboard/${item.type === 'live' ? 'live-sessions' : 'on-demand'}/${item.id}`,
    name: (item) => item.title,
    sub: (item) => item.speaker_name,
  },
  {
    key: 'resources',
    label: 'Resources',
    icon: FileText,
    to: (item) => `/dashboard/resources/${item.id}`,
    name: (item) => item.title,
    sub: (item) => item.author,
  },
  {
    key: 'members',
    label: 'Members',
    icon: Users,
    to: (item) => `/dashboard/members/${item.id}`,
    name: (item) => item.name,
    sub: (item) => [item.title, item.company].filter(Boolean).join(' at '),
  },
  {
    key: 'vendors',
    label: 'Vendors',
    icon: Store,
    to: (item) => `/dashboard/vendors/${item.id}`,
    name: (item) => item.company_name,
    sub: () => null,
  },
  {
    key: 'jobs',
    label: 'Jobs',
    icon: Briefcase,
    to: (item) => `/dashboard/jobs/${item.id}`,
    name: (item) => item.title,
    sub: (item) => item.company,
  },
]

const countResults = (results) => SECTIONS.reduce((sum, { key }) => sum + (results?.[key]?.length ?? 0), 0)

/**
 * The top bar search: a SearchInput that queries /api/search once typing pauses (two characters
 * or more) and lists sessions, resources, members, vendors and jobs as links. From 768px the
 * results drop down under the field; below that they sit under it inside the top bar's popover.
 * Escape clears the field (or, on a result, closes the list and returns to the field); an outside
 * click or focus leaving the search hides the results (focus shows them again); picking a result
 * clears the search; a failed request says search is unavailable. Result groups are labeled
 * lists, not headings, so they stay out of the page outline. From 768px an empty field shows a `/` key hint. A polite status says how many results came back.
 */
export function ShellSearch({ className }) {
  const wide = useMediaQuery('(min-width: 48rem)')
  const [query, setQuery] = useState('')
  const [results, setResults] = useState(null)
  const [searched, setSearched] = useState('')
  const [open, setOpen] = useState(false)
  const rootRef = useRef(null)
  const requestRef = useRef(null)
  const inputRef = useRef(null)
  // Set while Escape hands focus back to the field, so that focus doesn't reopen the list.
  const returningFocusRef = useRef(false)
  const headingId = useId()

  useEffect(() => () => requestRef.current?.abort(), [])

  useEffect(() => {
    if (!open) return undefined
    const onPointerDown = (event) => {
      if (rootRef.current && !rootRef.current.contains(event.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onPointerDown)
    return () => document.removeEventListener('mousedown', onPointerDown)
  }, [open])

  function reset() {
    requestRef.current?.abort()
    setResults(null)
    setOpen(false)
  }

  async function search(value) {
    const term = value.trim()
    if (term.length < MIN_CHARS) {
      reset()
      return
    }
    requestRef.current?.abort()
    const controller = new AbortController()
    requestRef.current = controller
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(term)}`, { signal: controller.signal })
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      const data = await response.json()
      setResults(data)
      setSearched(term)
      setOpen(true)
    } catch (error) {
      if (error.name === 'AbortError') return
      // Old results would answer a different question, so show the failure instead.
      setResults({ failed: true })
      setSearched(term)
      setOpen(true)
    }
  }

  function pick() {
    setQuery('')
    reset()
  }

  const total = countResults(results)
  const showPanel = open && results

  return (
    <div
      ref={rootRef}
      className={cn('relative w-full', className)}
      onBlur={(event) => {
        // Tabbing (or clicking) out of the field and its results hides them.
        if (!rootRef.current?.contains(event.relatedTarget)) setOpen(false)
      }}
      onKeyDown={(event) => {
        // Escape on a result closes the list and puts the person back in the field. In the field
        // itself, SearchInput clears the text first (and stops the event).
        if (event.key !== 'Escape' || !open) return
        event.preventDefault()
        event.stopPropagation()
        setOpen(false)
        returningFocusRef.current = true
        inputRef.current?.focus()
        returningFocusRef.current = false
      }}
    >
      <SearchInput
        ref={inputRef}
        label="Search sessions, resources, members"
        placeholder="Search sessions, resources, members"
        value={query}
        onChange={(event) => {
          setQuery(event.target.value)
          if (event.target.value.trim().length < MIN_CHARS) reset()
        }}
        onSearch={search}
        onFocus={() => {
          if (results && !returningFocusRef.current) setOpen(true)
        }}
      />
      {wide && !query && (
        <kbd
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 right-ds-sm flex h-6 min-w-6 -translate-y-1/2 items-center justify-center rounded-tag border border-border-default bg-surface-raised px-ds-xxs text-caption font-semibold text-text-muted"
        >
          /
        </kbd>
      )}
      <p role="status" className="sr-only">
        {showPanel && !results.failed ? (total === 1 ? '1 result' : `${total} results`) : ''}
      </p>
      {showPanel && (
        <div
          role="region"
          aria-label="Search results"
          // Keeps focus in the field while a result is clicked. Safari doesn't focus links on
          // click, so focus would leave the search and close this panel before the click lands.
          onMouseDown={(event) => event.preventDefault()}
          className={cn(
            'flex max-h-96 flex-col gap-ds-xs overflow-y-auto bg-surface-raised py-ds-xs',
            wide
              ? 'absolute top-full right-ds-none left-ds-none z-(--ds-z-popover) mt-ds-xs rounded-card border border-border-subtle shadow-float'
              : 'mt-ds-xs',
          )}
        >
          {results.failed ? (
            <Text size="body-sm" tone="secondary" className="m-ds-none px-ds-md py-ds-sm text-center">
              Search isn't available right now. Try again in a moment.
            </Text>
          ) : total === 0 ? (
            <Text size="body-sm" tone="secondary" className="m-ds-none px-ds-md py-ds-sm text-center">
              {`No results for "${searched}"`}
            </Text>
          ) : (
            SECTIONS.filter(({ key }) => results[key]?.length > 0).map(({ key, label, icon: Icon, to, name, sub }) => (
              <div key={key} role="group" aria-labelledby={`${headingId}-${key}`} className="flex flex-col">
                <span
                  id={`${headingId}-${key}`}
                  className="flex items-center gap-ds-xs px-ds-md py-ds-xxs text-caption font-semibold tracking-wide text-text-muted uppercase"
                >
                  <Icon aria-hidden="true" className="size-3" />
                  {label}
                </span>
                <ul className="m-ds-none list-none p-ds-none">
                  {results[key].map((item) => (
                    <li key={item.id}>
                      <RouterLink
                        to={to(item)}
                        onClick={pick}
                        className="flex flex-col px-ds-md py-ds-xs text-text-primary no-underline transition-colors duration-150 ease-enter hover:bg-surface-hover motion-reduce:transition-none"
                      >
                        <span className="truncate text-body-sm font-medium">{name(item)}</span>
                        {sub(item) && (
                          <Caption tone="secondary" className="truncate">
                            {sub(item)}
                          </Caption>
                        )}
                      </RouterLink>
                    </li>
                  ))}
                </ul>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
