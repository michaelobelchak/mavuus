import { useCallback, useEffect, useState } from 'react'
import { SearchX } from 'lucide-react'
import { Alert, EmptyState, Pagination, SearchInput } from '@/design-system/patterns'
import { Button, Chip, Text } from '@/design-system/primitives'

const NO_PARAMS = {}
const GRID = 'grid grid-cols-1 gap-ds-md sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4'

/**
 * Loads one page of a catalog list (`/api/sessions?type=live`, `/api/resources`) with search, a
 * category filter (sent as `category`, left out for "All") and paging. Changing the search or the
 * filter goes back to page 1. Accepts `{ data, totalPages }` or a plain array.
 */
function useCatalog(endpoint, baseParams) {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [page, setPage] = useState(1)
  const [items, setItems] = useState([])
  const [totalPages, setTotalPages] = useState(1)
  const [error, setError] = useState(false)
  const [attempt, setAttempt] = useState(0)
  const queryKey = JSON.stringify([search, category, page, attempt])
  const [loadedKey, setLoadedKey] = useState(null)
  const loading = loadedKey !== queryKey
  const params = JSON.stringify(baseParams)

  useEffect(() => {
    let ignore = false
    const load = async () => {
      try {
        const query = new URLSearchParams({ ...JSON.parse(params), page, limit: 20 })
        if (search) query.set('search', search)
        if (category !== 'All') query.set('category', category)
        const res = await fetch(`${endpoint}?${query}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('mavuus_token')}` },
        })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const json = await res.json()
        if (ignore) return
        setItems(json.data || json)
        setTotalPages(json.totalPages || 1)
        setError(false)
      } catch (err) {
        console.error(`Failed to load ${endpoint}`, err)
        if (!ignore) setError(true)
      } finally {
        if (!ignore) setLoadedKey(queryKey)
      }
    }
    load()
    return () => {
      ignore = true
    }
  }, [endpoint, params, search, category, page, queryKey])

  const changeSearch = useCallback((value) => {
    setSearch(value.trim())
    setPage(1)
  }, [])
  const changeCategory = useCallback((value) => {
    setCategory(value)
    setPage(1)
  }, [])
  const retry = useCallback(() => setAttempt((n) => n + 1), [])

  return { items, loading, error, retry, page, setPage, totalPages, category, changeCategory, changeSearch }
}

/**
 * The shared body of the Live Sessions, On-Demand and Resources pages: an intro line, a search
 * field and category chips, then a grid of cards with skeletons, an empty state, an error with
 * Try again and pagination.
 * - `endpoint`, `params` (fixed query params, like { type: 'live' }), `categories` (the first is
 *   "All").
 * - `intro`, `searchLabel`, `searchPlaceholder`, `listLabel`, `emptyTitle`.
 * - `renderItem(item)` returns the card; `skeleton` is the card's Skeleton component.
 */
export function CatalogList({
  endpoint,
  params = NO_PARAMS,
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
  const { items, loading, error, retry, page, setPage, totalPages, category, changeCategory, changeSearch } = useCatalog(
    endpoint,
    params,
  )

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
        <Pagination page={page} pageCount={totalPages} onPageChange={setPage} className="self-center" />
      </>
    )
  }

  return (
    <div className="flex flex-col gap-ds-lg">
      <Text tone="secondary">{intro}</Text>
      <div className="flex flex-col gap-ds-md lg:flex-row lg:items-center">
        <div className="w-full lg:max-w-sm lg:shrink-0">
          <SearchInput label={searchLabel} placeholder={searchPlaceholder} onSearch={changeSearch} />
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
