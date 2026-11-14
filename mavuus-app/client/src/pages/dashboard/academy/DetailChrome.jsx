import { ArrowLeft, SearchX, Share2 } from 'lucide-react'
import { Alert, Card, EmptyState } from '@/design-system/patterns'
import { Button, Icon, Link, Skeleton } from '@/design-system/primitives'

/** The row above a detail page: a back link to the list and, with `onShare`, a Share button. */
export function DetailTopBar({ backTo, backLabel, onShare }) {
  return (
    <div className="flex items-center justify-between gap-ds-md">
      <Link variant="standalone" to={backTo} className="inline-flex items-center gap-ds-xs">
        <Icon icon={ArrowLeft} size="sm" />
        {backLabel}
      </Link>
      {onShare && (
        <Button variant="ghost" size="sm" leadingIcon={Share2} onClick={onShare}>
          Share
        </Button>
      )}
    </div>
  )
}

/** Busy placeholder in the shape of a detail page: media, a content card and a sidebar card. */
export function DetailSkeleton({ label }) {
  return (
    <div aria-busy="true" className="flex flex-col gap-ds-lg">
      <span className="sr-only">{label}</span>
      <div aria-hidden="true" className="flex flex-col gap-ds-lg lg:flex-row">
        <div className="flex min-w-0 flex-1 flex-col gap-ds-lg">
          <Skeleton shape="rect" className="aspect-video h-auto rounded-card" />
          <Card padding="lg" className="flex flex-col gap-ds-sm">
            <Skeleton className="w-1/4" />
            <Skeleton className="h-8 w-3/4" />
            <Skeleton lines={4} />
          </Card>
        </div>
        <Card padding="lg" className="flex h-fit flex-col gap-ds-sm lg:w-80">
          <Skeleton className="h-12" />
          <Skeleton lines={3} />
        </Card>
      </div>
    </div>
  )
}

/** "Not found" for a detail page, with a link back to the list. */
export function DetailNotFound({ title, backTo, backLabel }) {
  return (
    <EmptyState
      icon={SearchX}
      title={title}
      headingLevel={2}
      actions={
        <Button to={backTo} variant="outline">
          {backLabel}
        </Button>
      }
    />
  )
}

/** A detail that failed to load (network or server error, not a 404): an error Alert with Try again and the back link. */
export function DetailError({ title, onRetry, backTo, backLabel }) {
  return (
    <div className="flex flex-col gap-ds-lg">
      <DetailTopBar backTo={backTo} backLabel={backLabel} />
      <Alert
        tone="error"
        title={title}
        description="Check your connection and try again."
        actions={
          <Button size="sm" variant="outline" onClick={onRetry}>
            Try again
          </Button>
        }
      />
    </div>
  )
}
