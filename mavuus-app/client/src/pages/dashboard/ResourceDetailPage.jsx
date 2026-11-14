import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Bookmark, Clock, Download, User } from 'lucide-react'
import { Card, DescriptionList, MediaFrame, ScrollProgress, SectionHeader, ShareDialog, useToast } from '@/design-system/patterns'
import { CommentThread, MetaList, ResourceCard } from '@/design-system/organisms'
import { Badge, Button, Heading, Text } from '@/design-system/primitives'
import { isHttpUrl } from '@/design-system/lib/safeUrl'
import { useAuth } from '../../context/AuthContext'
import { useComments } from '../../hooks/useComments'
import { useDetailResource } from '../../hooks/useDetailResource'
import { RESOURCES_PATH, resourceCardProps } from './academy/cardProps'
import { DetailError, DetailLayout, DetailNotFound, DetailSkeleton, DetailTopBar } from './academy/DetailChrome'

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
  const { data: resource, loading, error, retry } = useDetailResource(`/api/resources/${id}`, token)
  const [shareOpen, setShareOpen] = useState(false)
  // Per-resource state is stored with the id it belongs to, so following a related card never
  // shows the previous resource's bookmark or related list.
  const [bookmark, setBookmark] = useState({ id: null, on: false })
  const [related, setRelated] = useState({ id: null, items: [] })
  const comments = useComments('resource', parseInt(id, 10))
  const bookmarked = bookmark.id === id && bookmark.on
  const relatedResources = related.id === id ? related.items : []
  const category = resource?.category

  useEffect(() => {
    if (!token) return
    const controller = new AbortController()
    fetch('/api/resources/bookmarked', { headers: { Authorization: `Bearer ${token}` }, signal: controller.signal })
      .then((r) => (r.ok ? r.json() : []))
      .then((bookmarks) => {
        if (controller.signal.aborted || !Array.isArray(bookmarks)) return
        setBookmark({ id, on: bookmarks.some((b) => b.id === parseInt(id, 10)) })
      })
      .catch(() => {})
    return () => controller.abort()
  }, [id, token])

  // Related resources from the same category, once the resource is known.
  useEffect(() => {
    if (!category) return
    const controller = new AbortController()
    fetch(`/api/resources?category=${encodeURIComponent(category)}&limit=4`, { signal: controller.signal })
      .then((r) => (r.ok ? r.json() : { data: [] }))
      .then((json) => {
        if (controller.signal.aborted) return
        const list = Array.isArray(json) ? json : Array.isArray(json?.data) ? json.data : []
        setRelated({ id, items: list.filter((r) => r.id !== parseInt(id, 10)).slice(0, 3) })
      })
      .catch(() => {})
    return () => controller.abort()
  }, [category, id])

  const toggleBookmark = async () => {
    try {
      const res = await fetch(`/api/resources/${id}/bookmark`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        setBookmark({ id, on: Boolean(data.bookmarked) })
      }
    } catch {
      toast.error("Couldn't update bookmark. Try again.")
    }
  }

  if (loading) return <DetailSkeleton label="Loading resource" />

  if (error) {
    return <DetailError title="We couldn't load this resource" onRetry={retry} backTo={RESOURCES_PATH} backLabel="Back to Resources" />
  }

  if (!resource) {
    return <DetailNotFound title="Resource not found" backTo={RESOURCES_PATH} backLabel="Back to Resources" />
  }

  // Templates with a file get Download; everything else (and a template without a file) gets Bookmark.
  const downloadHref = resource.type === 'template' && isHttpUrl(resource.url) ? resource.url : null

  return (
    <div className="flex flex-col gap-ds-lg">
      <ScrollProgress />
      <DetailTopBar backTo={RESOURCES_PATH} backLabel="Back to Resources" onShare={() => setShareOpen(true)} />

      <DetailLayout
        asideLabel="Resource info"
        asideWidth="lg:w-72"
        comments={<CommentThread {...comments} />}
        main={
          <>
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

          </>
        }
        aside={
          <>
          <Card padding="lg">
            {downloadHref ? (
              <Button block leadingIcon={Download} href={downloadHref} download>
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
          </>
        }
      />

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
