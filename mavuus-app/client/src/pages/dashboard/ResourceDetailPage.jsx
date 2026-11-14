import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Bookmark, Clock, Download, User } from 'lucide-react'
import { Card, DescriptionList, MediaFrame, ScrollProgress, SectionHeader, ShareDialog, useToast } from '@/design-system/patterns'
import { CommentThread, MetaList, ResourceCard } from '@/design-system/organisms'
import { Badge, Button, Heading, Text } from '@/design-system/primitives'
import { useAuth } from '../../context/AuthContext'
import { useComments } from '../../hooks/useComments'
import { RESOURCES_PATH, resourceCardProps } from './academy/cardProps'
import { DetailError, DetailNotFound, DetailSkeleton, DetailTopBar } from './academy/DetailChrome'

// **bold** spans inside a line of resource content.
function inline(text) {
  return text.split(/\*\*(.*?)\*\*/).map((part, k) =>
    k % 2 === 1 ? (
      <strong key={k} className="font-semibold text-text-primary">
        {part}
      </strong>
    ) : (
      part
    ),
  )
}

// The light markdown the seed content uses: ## and ### headings (h3 and h4 here, under the
// title's h2), "- " and "1. " lists, **bold** and paragraphs split by blank lines.
function renderContent(text) {
  if (!text) return null
  return text.split('\n\n').map((block, i) => {
    const trimmed = block.trim()
    if (!trimmed) return null
    const heading = /^(#{2,3}) (.*)$/m.exec(trimmed.split('\n')[0])
    if (heading) {
      // A heading line can carry its paragraph in the same block ("### 1. Title\nBody").
      const rest = trimmed.split('\n').slice(1).join(' ').trim()
      return (
        <div key={i} className="mt-ds-xs flex flex-col gap-ds-xs">
          <Heading level={heading[1].length + 1} size="h4">
            {heading[2]}
          </Heading>
          {rest && (
            <Text size="body-sm" tone="secondary">
              {inline(rest)}
            </Text>
          )}
        </div>
      )
    }
    if (trimmed.startsWith('- ')) {
      const items = trimmed.split('\n').filter((l) => l.trim().startsWith('- '))
      return (
        <ul key={i} className="flex list-disc flex-col gap-ds-xxs pl-ds-lg text-body-sm text-text-secondary">
          {items.map((item, j) => (
            <li key={j}>{inline(item.trim().slice(2))}</li>
          ))}
        </ul>
      )
    }
    if (/^\d+\.\s/.test(trimmed)) {
      const items = trimmed.split('\n').filter((l) => /^\d+\.\s/.test(l.trim()))
      return (
        <ol key={i} className="flex list-decimal flex-col gap-ds-xxs pl-ds-lg text-body-sm text-text-secondary">
          {items.map((item, j) => (
            <li key={j}>{inline(item.trim().replace(/^\d+\.\s/, ''))}</li>
          ))}
        </ol>
      )
    }
    return (
      <Text key={i} size="body-sm" tone="secondary">
        {inline(trimmed)}
      </Text>
    )
  })
}

export default function ResourceDetailPage() {
  const { id } = useParams()
  const { token } = useAuth()
  const toast = useToast()
  const [resource, setResource] = useState(null)
  const [loading, setLoading] = useState(true)
  // A failed request (network or server error) can be retried; a 404 means not found.
  const [loadError, setLoadError] = useState(false)
  const [attempt, setAttempt] = useState(0)
  const [shareOpen, setShareOpen] = useState(false)
  const [bookmarked, setBookmarked] = useState(false)
  const [relatedResources, setRelatedResources] = useState([])
  const comments = useComments('resource', parseInt(id))

  useEffect(() => {
    let ignore = false
    const fetchResource = async () => {
      try {
        const res = await fetch(`/api/resources/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (ignore) return
        if (res.ok) setResource(await res.json())
        else if (res.status !== 404) setLoadError(true)
      } catch (err) {
        console.error('Failed to load resource', err)
        if (!ignore) setLoadError(true)
      } finally {
        if (!ignore) setLoading(false)
      }
    }
    fetchResource()
    return () => {
      ignore = true
    }
  }, [id, token, attempt])

  useEffect(() => {
    // Check bookmark status
    if (token) {
      fetch('/api/resources/bookmarked', { headers: { Authorization: `Bearer ${token}` } })
        .then((r) => (r.ok ? r.json() : []))
        .then((bookmarks) => setBookmarked(bookmarks.some((b) => b.id === parseInt(id))))
        .catch(() => {})
    }
  }, [id, token])

  const retry = () => {
    setLoadError(false)
    setLoading(true)
    setAttempt((n) => n + 1)
  }

  // Fetch related resources once we have the resource
  useEffect(() => {
    if (!resource) return
    fetch(`/api/resources?category=${encodeURIComponent(resource.category)}&limit=4`)
      .then((r) => (r.ok ? r.json() : { data: [] }))
      .then((json) => {
        const items = (json.data || json).filter((r) => r.id !== parseInt(id)).slice(0, 3)
        setRelatedResources(items)
      })
      .catch(() => {})
  }, [resource, id])

  const toggleBookmark = async () => {
    try {
      const res = await fetch(`/api/resources/${id}/bookmark`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        setBookmarked(data.bookmarked)
      }
    } catch {
      toast.error("Couldn't update bookmark. Try again.")
    }
  }

  if (loading) return <DetailSkeleton label="Loading resource" />

  if (loadError) {
    return <DetailError title="We couldn't load this resource" onRetry={retry} backTo={RESOURCES_PATH} backLabel="Back to Resources" />
  }

  if (!resource) {
    return <DetailNotFound title="Resource not found" backTo={RESOURCES_PATH} backLabel="Back to Resources" />
  }

  const isDownloadable = resource.type === 'template'

  return (
    <div className="flex flex-col gap-ds-lg">
      <ScrollProgress />
      <DetailTopBar backTo={RESOURCES_PATH} backLabel="Back to Resources" onShare={() => setShareOpen(true)} />

      {/* Below lg one column in reading order: content, the action and info cards, then comments.
          From lg a two-column grid: content and comments on the left, the cards beside them. */}
      <div className="flex flex-col gap-ds-lg lg:grid lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
        <div className="flex min-w-0 flex-1 flex-col gap-ds-lg">
          {resource.thumbnail_url && <MediaFrame src={resource.thumbnail_url} alt={resource.title} ratio="16/9" eager />}

          <Card as="article" aria-labelledby="resource-title" padding="lg" className="flex flex-col gap-ds-md">
            <div className="flex flex-wrap items-center gap-ds-xs">
              <Badge size="sm">{resource.category}</Badge>
              <Badge size="sm" tone="info" className="capitalize">
                {resource.type}
              </Badge>
            </div>
            <Heading id="resource-title" level={2} size="h3">
              {resource.title}
            </Heading>
            <MetaList
              className="border-b border-border-subtle pb-ds-md"
              items={[
                { key: 'author', icon: User, label: resource.author },
                { key: 'time', icon: Clock, label: resource.read_time },
              ]}
            />
            <div className="flex flex-col gap-ds-sm">
              {resource.content ? (
                renderContent(resource.content)
              ) : (
                <Text size="body-sm" tone="secondary">
                  {resource.description}
                </Text>
              )}
            </div>
          </Card>

        </div>

        <aside aria-label="Resource info" className="flex w-full flex-col gap-ds-md lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:w-72">
          <Card padding="lg">
            {isDownloadable ? (
              <Button block leadingIcon={Download}>
                Download Template
              </Button>
            ) : (
              <Button
                block
                variant={bookmarked ? 'outline' : 'primary'}
                leadingIcon={Bookmark}
                aria-pressed={bookmarked}
                onClick={toggleBookmark}
                className={bookmarked ? '[&>svg]:fill-current' : undefined}
              >
                {bookmarked ? 'Bookmarked' : 'Bookmark'}
              </Button>
            )}
          </Card>

          <Card as="section" aria-labelledby="resource-details-title" padding="lg" className="flex flex-col gap-ds-sm">
            <Heading id="resource-details-title" level={2} size="h4">
              Details
            </Heading>
            <DescriptionList
              items={[
                { key: 'author', label: 'Author', value: resource.author },
                { key: 'type', label: 'Type', value: <span className="capitalize">{resource.type}</span> },
                { key: 'category', label: 'Category', value: resource.category },
                { key: 'time', label: 'Read Time', value: resource.read_time },
              ]}
            />
          </Card>
        </aside>

        <CommentThread {...comments} className="lg:col-start-1" />
      </div>

      {relatedResources.length > 0 && (
        <section className="flex flex-col gap-ds-md">
          <SectionHeader size="h3" title="Related Resources" />
          <ul aria-label="Related resources" className="grid grid-cols-1 gap-ds-md sm:grid-cols-2 xl:grid-cols-3">
            {relatedResources.map((r) => (
              <li key={r.id}>
                <ResourceCard {...resourceCardProps(r)} />
              </li>
            ))}
          </ul>
        </section>
      )}

      <ShareDialog open={shareOpen} onOpenChange={setShareOpen} title={`Share ${resource.title}`} shareTitle={resource.title} />
    </div>
  )
}
