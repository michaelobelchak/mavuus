import { useCallback, useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { SearchX } from 'lucide-react'
import { Alert, EmptyState, Pagination, SearchInput } from '@/design-system/patterns'
import { Button, Chip, Text } from '@/design-system/primitives'

const NO_PARAMS = {}
const GRID = 'grid grid-cols-1 gap-ds-md sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4'

/**
 * Loads one page of a catalog list (`/api/sessions?type=live`, `/api/resources`) with search, a
 * filter and paging, all kept in the page URL (`?q=`, `?<filterParam>=`, `?page=`) so back,
 * forward and shared links restore them. The filter goes to the API as `filterParam` (left out
 * for "All"). Changing the search or the filter goes back to page 1; typing replaces the history
 * entry instead of adding one. Accepts `{ data, totalPages }` or a plain array; anything else is
 * an empty list. A new query aborts the request before it.
 */
function useCatalog(endpoint, baseParams, filterParam) {
  const [searchParams, setSearchParams] = useSearchParams()
  const search = searchParams.get('q') || ''
  const category = searchParams.get(filterParam) || 'All'
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1)
  const [result, setResult] = useState({ key: null, items: [], totalPages: 1, error: false })
  const [attempt, setAttempt] = useState(0)
  const params = JSON.stringify(baseParams)
  const queryKey = JSON.stringify([endpoint, params, filterParam, search, category, page, attempt])
  const loading = result.key !== queryKey

  useEffect(() => {
    const controller = new AbortController()
    const query = new URLSearchParams({ ...JSON.parse(params), page, limit: 20 })
    if (search) query.set('search', search)
    if (category !== 'All') query.set(filterParam, category)
    fetch(`${endpoint}?${query}`, {
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
  }, [endpoint, params, filterParam, search, category, page, queryKey])

  const update = useCallback(
    (changes, options) =>
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev)
        for (const [key, value] of Object.entries(changes)) {
          if (value === null || value === '') next.delete(key)
          else next.set(key, value)
        }
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
 * The shared body of the Live Sessions, On-Demand and Resources pages: an intro line, a search
 * field and category chips, then a grid of cards with skeletons, an empty state, an error with
 * Try again and pagination.
 * - `endpoint`, `params` (fixed query params, like { type: 'live' }), `categories` (the first is
 *   "All"), `filterParam` (the query param the filter goes in, default `category`).
 * - `intro`, `searchLabel`, `searchPlaceholder`, `listLabel`, `emptyTitle`.
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
  errorTitle,
  renderItem,
  skeleton: Skeleton,
}) {
  const { items, loading, error, retry, page, setPage, totalPages, search, category, changeCategory, changeSearch } = useCatalog(
    endpoint,
    params,
    filterParam,
  )
  // The field follows the URL (back, forward, a shared link) and the member's typing.
  const [text, setText] = useState(search)
  const [shownSearch, setShownSearch] = useState(search)
  if (search !== shownSearch) {
    setShownSearch(search)
    // Only when the URL says something else than the field (back, forward, a link), so the
    // trailing space someone just typed survives the trimmed search.
    if (search !== text.trim()) setText(search)
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
      <ul aria-busy="true" aria-label={listLabel} className={GRID}>
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
    body = <EmptyState icon={SearchX} title={emptyTitle} description="Try adjusting your search or filters." headingLevel={2} />
  } else {
    body = (
      <>
        <ul aria-label={listLabel} className={GRID}>
          {items.map((item) => (
            <li key={item.id}>{renderItem(item)}</li>
          ))}
        </ul>
        <Pagination page={page} pageCount={totalPages} onPageChange={goToPage} className="self-center" />
      </>
    )
  }

  return (
    <div ref={topRef} className="flex flex-col gap-ds-lg">
      <Text tone="secondary">{intro}</Text>
      <div className="flex flex-col gap-ds-md lg:flex-row lg:items-center">
        <div className="w-full lg:max-w-sm lg:shrink-0">
          <SearchInput
            label={searchLabel}
            placeholder={searchPlaceholder}
            value={text}
            onChange={(event) => setText(event.target.value)}
            onSearch={changeSearch}
          />
        </div>
        <div role="group" aria-label="Category" className="flex flex-wrap gap-ds-xs">
          {categories.map((name) => (
            <Chip key={name} selected={category === name} onClick={() => changeCategory(name)}>
              {name}
            </Chip>
          ))}
        </div>
      </div>
      {body}
    </div>
  )
}
