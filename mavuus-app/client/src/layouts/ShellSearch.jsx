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
 * Escape clears the field, an outside click hides the results (focus shows them again) and
 * picking a result clears the search. A polite status says how many results came back.
 */
export function ShellSearch({ className }) {
  const wide = useMediaQuery('(min-width: 48rem)')
  const [query, setQuery] = useState('')
  const [results, setResults] = useState(null)
  const [searched, setSearched] = useState('')
  const [open, setOpen] = useState(false)
  const rootRef = useRef(null)
  const requestRef = useRef(null)
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
      if (!response.ok) return
      const data = await response.json()
      setResults(data)
      setSearched(term)
      setOpen(true)
    } catch (error) {
      if (error.name !== 'AbortError') console.error('Search failed', error)
    }
  }

  function pick() {
    setQuery('')
    reset()
  }

  const total = countResults(results)
  const showPanel = open && results

  return (
    <div ref={rootRef} className={cn('relative w-full', className)}>
      <SearchInput
        label="Search sessions, resources, members"
        placeholder="Search sessions, resources, members"
        value={query}
        onChange={(event) => {
          setQuery(event.target.value)
          if (event.target.value.trim().length < MIN_CHARS) reset()
        }}
        onSearch={search}
        onFocus={() => {
          if (results) setOpen(true)
        }}
      />
      <p role="status" className="sr-only">
        {showPanel ? (total === 1 ? '1 result' : `${total} results`) : ''}
      </p>
      {showPanel && (
        <div
          role="region"
          aria-label="Search results"
          className={cn(
            'flex max-h-96 flex-col gap-ds-xs overflow-y-auto bg-surface-raised py-ds-xs',
            wide
              ? 'absolute top-full right-ds-none left-ds-none z-(--ds-z-popover) mt-ds-xs rounded-card border border-border-subtle shadow-float'
              : 'mt-ds-xs',
          )}
        >
          {total === 0 ? (
            <Text size="body-sm" tone="secondary" className="m-ds-none px-ds-md py-ds-sm text-center">
              {`No results for "${searched}"`}
            </Text>
          ) : (
            SECTIONS.filter(({ key }) => results[key]?.length > 0).map(({ key, label, icon: Icon, to, name, sub }) => (
              <section key={key} aria-labelledby={`${headingId}-${key}`} className="flex flex-col">
                <h2
                  id={`${headingId}-${key}`}
                  className="m-ds-none flex items-center gap-ds-xs px-ds-md py-ds-xxs text-caption font-semibold tracking-wide text-text-muted uppercase"
                >
                  <Icon aria-hidden="true" className="size-3" />
                  {label}
                </h2>
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
              </section>
            ))
          )}
        </div>
      )}
    </div>
  )
}
