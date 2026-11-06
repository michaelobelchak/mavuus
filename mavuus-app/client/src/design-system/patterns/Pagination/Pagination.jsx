import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react'
import { IconButton } from '../../primitives'
import { getPaginationRange } from './paginationRange'

const pageClass = [
  'inline-flex size-12 cursor-pointer items-center justify-center rounded-control text-body font-semibold tabular-nums',
  'text-text-primary transition-colors duration-150 ease-enter hover:bg-surface-hover motion-reduce:transition-none',
  'aria-[current=page]:bg-surface-brand-strong aria-[current=page]:text-text-on-brand aria-[current=page]:hover:bg-surface-brand-strong',
].join(' ')

/**
 * Page navigation. `page` is 1-based; `onPageChange(page)` fires for a new page.
 * - `pageCount`: total pages. Renders nothing when there is one page or none.
 * - `siblings`: pages shown on each side of the current one (default 1). Gaps show an ellipsis.
 * Previous and next are labelled IconButtons, disabled at the ends. Every target is 48px.
 * `aria-label` names the nav (default "Pagination"); other props go to the nav.
 */
export function Pagination({
  page,
  pageCount,
  onPageChange,
  siblings = 1,
  'aria-label': ariaLabel = 'Pagination',
  className,
  ref,
  ...props
}) {
  const pages = getPaginationRange(page, pageCount, siblings)
  if (pages.length <= 1) return null
  const current = Math.min(Math.max(1, page), pageCount)
  const go = (next) => {
    if (next !== current && next >= 1 && next <= pageCount) onPageChange?.(next)
  }

  return (
    <nav ref={ref} aria-label={ariaLabel} className={className} {...props}>
      <ul className="m-ds-none flex list-none flex-wrap items-center gap-ds-xxs p-ds-none">
        <li>
          <IconButton icon={ChevronLeft} aria-label="Previous page" disabled={current === 1} onClick={() => go(current - 1)} />
        </li>
        {pages.map((item) =>
          typeof item === 'number' ? (
            <li key={item}>
              <button
                type="button"
                className={pageClass}
                aria-label={`Page ${item}`}
                aria-current={item === current ? 'page' : undefined}
                onClick={() => go(item)}
              >
                {item}
              </button>
            </li>
          ) : (
            <li key={item} data-pagination-ellipsis="" aria-hidden="true" className="inline-flex size-12 items-center justify-center text-text-muted">
              <MoreHorizontal className="size-5" />
            </li>
          ),
        )}
        <li>
          <IconButton
            icon={ChevronRight}
            aria-label="Next page"
            disabled={current === pageCount}
            onClick={() => go(current + 1)}
          />
        </li>
      </ul>
    </nav>
  )
}
