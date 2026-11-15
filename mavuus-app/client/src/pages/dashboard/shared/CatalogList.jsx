import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { SearchX } from 'lucide-react'
import { Alert, EmptyState, Pagination, SearchInput } from '@/design-system/patterns'
import { Button, Chip, Text } from '@/design-system/primitives'

const NO_PARAMS = {}
const GRID = 'grid grid-cols-1 gap-ds-md sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4'
const DEFAULT_EMPTY = 'Try adjusting your search or filters.'

// A filter option is "All" (the default, no filter) or { value, label }; a plain string is both.
const optionOf = (option) => (typeof option === 'string' ? { value: option, label: option } : option)
// Copy that may depend on the filter: a string, or a function of the filter value.
const forFilter = (copy, value) => (typeof copy === 'function' ? copy(value) : copy)

/**
 * Loads one page of a catalog list (`/api/sessions?type=live`, `/api/resources`) with search, a
 * filter and paging, all kept in the page URL (`?q=`, `?<filterParam>=`, `?page=`) so back,
 * forward and shared links restore them. The filter goes to the API as `filterParam` (left out
 * for "All"), or as the params `filterQuery(value)` returns when the API names it differently.
 * Changing the search or the filter goes back to page 1; typing replaces the history entry
 * instead of adding one. Without `paged`, no page or limit goes to the API. Accepts `{ data, totalPages }` or a plain
 * array; anything else is an empty list. A new query aborts the request before it.
 */
function useCatalog(endpoint, baseParams, filterParam, { paged, filterQuery, filterValues }) {
  const [searchParams, setSearchParams] = useSearchParams()
  const search = searchParams.get('q') || ''
  // A value the chips don't offer (an old or edited link) counts as All.
  const requested = searchParams.get(filterParam) || 'All'
  const category = filterValues.includes(requested) ? requested : 'All'
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1)
  const [result, setResult] = useState({ key: null, items: [], totalPages: 1, error: false })
  const [attempt, setAttempt] = useState(0)
  const params = JSON.stringify(baseParams)
  // The filter as API params, as a string so a new filterQuery function doesn't refetch.
  const apiFilter = JSON.stringify(
    category === 'All' ? {} : typeof filterQuery === 'function' ? filterQuery(category) : { [filterParam]: category },
  )
  const apiPage = paged ? page : 1
  const queryKey = JSON.stringify([endpoint, params, apiFilter, search, apiPage, paged, attempt])
  const loading = result.key !== queryKey

  useEffect(() => {
    const controller = new AbortController()
    const query = new URLSearchParams({
      ...JSON.parse(params),
      ...(paged ? { page: apiPage, limit: 20 } : {}),
      ...JSON.parse(apiFilter),
    })
    if (search) query.set('search', search)
    const qs = query.toString()
    fetch(qs ? `${endpoint}?${qs}` : endpoint, {
      headers: { Authorization: `Bearer ${localStorage.getItem('mavuus_token')}` },
      signal: controller.signal,
    })
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const json = await res.json()
        const list = Array.isArray(json) ? json : Array.isArray(json?.data) ? json.data : []
        if (!controller.signal.aborted) setResult({ key: queryKey, items: list, totalPages: json?.totalPages || 1, error: false })
      })
      .catch((err) => {
        if (controller.signal.aborted || err?.name === 'AbortError') return
        console.error(`Failed to load ${endpoint}`, err)
        setResult({ key: queryKey, items: [], totalPages: 1, error: true })
      })
    return () => controller.abort()
  }, [endpoint, params, apiFilter, search, apiPage, paged, queryKey])

  // Query strings this list navigated to that haven't rendered yet, oldest first. The router
  // renders a URL change in a transition and hands setSearchParams the rendered params, so a
  // second change made before the first one renders (a chip right after a search fired) would
  // start from the old URL and drop the first change. A rendered URL we didn't ask for (back,
  // forward, a link) clears the list.
  const pending = useRef([])
  const rendered = searchParams.toString()
  useLayoutEffect(() => {
    const at = pending.current.indexOf(rendered)
    pending.current = at === -1 ? [] : pending.current.slice(at + 1)
  }, [rendered])
  const update = useCallback(
    (changes, options) =>
      setSearchParams((prev) => {
        const queue = pending.current
        const next = new URLSearchParams(queue.length > 0 ? queue[queue.length - 1] : prev)
        for (const [key, value] of Object.entries(changes)) {
          if (value === null || value === '') next.delete(key)
          else next.set(key, value)
        }
        pending.current = [...queue, next.toString()]
        return next
      }, options),
    [setSearchParams],
  )
  const changeSearch = useCallback((value) => update({ q: value.trim(), page: null }, { replace: true }), [update])
  const changeCategory = useCallback((value) => update({ [filterParam]: value === 'All' ? null : value, page: null }), [update, filterParam])
  const setPage = useCallback((next) => update({ page: next > 1 ? String(next) : null }), [update])
  const retry = () => setAttempt((n) => n + 1)

  return { ...result, loading, retry, page, setPage, search, category, changeCategory, changeSearch }
}

/**
 * The shared body of the dashboard lists (Live Sessions, On-Demand, Resources, Speakers, Members,
 * Vendors): an intro line, a search field and filter chips, then a grid of cards with skeletons,
 * an empty state, an error with Try again and pagination.
 * - `endpoint`, `params` (fixed query params, like { type: 'live' }), `filterParam` (the query
 *   param the filter goes in, in the page URL and the API, default `category`).
 * - `categories`: the filter chips, strings or { value, label }; "All" is the no-filter default.
 *   None (or one) hides the chips. `filterLabel` names the chip group (default "Category").
 * - `filterQuery(value)`: the API params for a filter value when they differ from
 *   `filterParam=value` (Members: `connections` becomes `connections=1`). Not called for "All".
 * - `paged` (default true): send page and limit and show Pagination. False for unpaged APIs.
 * - `intro`, `searchLabel`, `searchPlaceholder`, `listLabel`, `errorTitle`; `emptyTitle` and
 *   `emptyDescription` may be functions of the filter value.
 * - `children`: shown between the intro and the search (a pending requests list).
 * - `gridClassName` replaces the grid columns (a page with a side panel needs fewer).
 * - `renderItem(item)` returns the card; `skeleton` is the card's Skeleton component.
 */
export function CatalogList({
  endpoint,
  params = NO_PARAMS,
  filterParam = 'category',
  categories,
  intro,
  searchLabel,
  searchPlaceholder,
  listLabel,
  emptyTitle,
  emptyDescription = DEFAULT_EMPTY,
  errorTitle,
  filterLabel = 'Category',
  filterQuery,
  paged = true,
  gridClassName = GRID,
  children,
  renderItem,
  skeleton: Skeleton,
}) {
  const options = (categories || []).map(optionOf)
  const { items, loading, error, retry, page, setPage, totalPages, search, category, changeCategory, changeSearch } = useCatalog(
    endpoint,
    params,
    filterParam,
    { paged, filterQuery, filterValues: options.map((option) => option.value) },
  )
  // The field follows the URL (back, forward, a shared link) and the member's typing.
  const [text, setText] = useState(search)
  const [shownSearch, setShownSearch] = useState(search)
  // The search this field last sent. The router renders a URL change in a transition, so the URL
  // for "ab" can land after the member has typed "abm"; that echo of our own search must leave
  // the field alone (overwriting it would also drop the pending "abm" search).
  const [sentSearch, setSentSearch] = useState(search)
  if (search !== shownSearch) {
    setShownSearch(search)
    if (search !== sentSearch) {
      // The URL moved for another reason (back, forward, a link). Keep a trailing space someone
      // just typed when the trimmed text already matches.
      setSentSearch(search)
      if (search !== text.trim()) setText(search)
    }
  }
  const sendSearch = (value) => {
    setSentSearch(value.trim())
    changeSearch(value)
  }
  // A new page scrolls back to the top of the list (below the sticky top bar).
  const topRef = useRef(null)
  const goToPage = (next) => {
    setPage(next)
    topRef.current?.scrollIntoView?.({ block: 'start' })
  }

  let body
  if (loading) {
    body = (
      <ul aria-busy="true" aria-label={listLabel} className={gridClassName}>
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <li key={i}>
            <Skeleton announce={false} />
          </li>
        ))}
      </ul>
    )
  } else if (error) {
    body = (
      <Alert
        tone="error"
        title={errorTitle}
        description="Check your connection and try again."
        actions={
          <Button size="sm" variant="outline" onClick={retry}>
            Try again
          </Button>
        }
      />
    )
  } else if (items.length === 0) {
    body = (
      <EmptyState
        icon={SearchX}
        title={forFilter(emptyTitle, category)}
        description={forFilter(emptyDescription, category)}
        headingLevel={2}
      />
    )
  } else {
    body = (
      <>
        <ul aria-label={listLabel} className={gridClassName}>
          {items.map((item) => (
            <li key={item.id}>{renderItem(item)}</li>
          ))}
        </ul>
        {paged && <Pagination page={page} pageCount={totalPages} onPageChange={goToPage} className="self-center" />}
      </>
    )
  }

  return (
    <div ref={topRef} className="flex flex-col gap-ds-lg">
      <Text tone="secondary">{intro}</Text>
      {children}
      <div className="flex flex-col gap-ds-md lg:flex-row lg:items-center">
        <div className="w-full lg:max-w-sm lg:shrink-0">
          <SearchInput
            label={searchLabel}
            placeholder={searchPlaceholder}
            value={text}
            onChange={(event) => setText(event.target.value)}
            onSearch={sendSearch}
          />
        </div>
        {options.length > 1 && (
          <div role="group" aria-label={filterLabel} className="flex flex-wrap gap-ds-xs">
            {options.map(({ value, label }) => (
              <Chip key={value} selected={category === value} onClick={() => changeCategory(value)}>
                {label}
              </Chip>
            ))}
          </div>
        )}
      </div>
      {body}
    </div>
  )
}
