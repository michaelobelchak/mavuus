import { cn } from '../../lib/cn'
import { Checkbox, Skeleton } from '../../primitives'
import { Card, CardAction, CardLink } from '../Card/Card'
import { RowActions } from './DataTableParts'
import { hrefProps } from './dataTableUtils'

const cellContent = (column, row) => (column.cell ? column.cell(row) : row[column.key])

/**
 * DataTable's small-screen layout: one labelled card per row. The first column is the card
 * title (a CardLink or stretched button when the row is clickable); columns with `hideBelow`
 * are left out. Skeleton cards show only while loading with no rows yet.
 */
export function DataTableCards({
  caption,
  columns,
  items,
  loading,
  loadingRows,
  selectable,
  selection,
  rowActions,
  onRowClick,
}) {
  const [primary, ...rest] = columns
  const details = rest.filter((column) => !column.hideBelow)
  const stale = loading && items.length > 0

  return (
    <ul
      role="list"
      aria-label={caption}
      aria-busy={loading || undefined}
      className={cn(
        'm-ds-none flex list-none flex-col gap-ds-sm p-ds-none',
        stale && 'opacity-60 transition-opacity duration-150 motion-reduce:transition-none',
      )}
    >
      {items.length === 0
        ? Array.from({ length: loadingRows }, (_, index) => (
            <Card key={`loading-${index}`} as="li" variant="surface" padding="md">
              <Skeleton lines={3} />
            </Card>
          ))
        : items.map(({ row, id, name, href }) => {
            const title = primary ? cellContent(primary, row) : name
            return (
              <Card key={id} as="li" variant="surface" padding="md" className="flex flex-col gap-ds-sm">
                <div className="flex items-start gap-ds-sm">
                  {selectable && (
                    <CardAction>
                      <Checkbox
                        aria-label={`Select row ${name}`}
                        checked={selection.isSelected(id)}
                        onCheckedChange={() => selection.toggleRow(id)}
                      />
                    </CardAction>
                  )}
                  <div data-card-title="" className="min-w-0 grow text-body font-semibold text-text-primary">
                    {href !== undefined ? (
                      <CardLink {...hrefProps(href)}>{title}</CardLink>
                    ) : onRowClick ? (
                      <button
                        type="button"
                        data-card-link=""
                        className="cursor-pointer text-left after:absolute after:inset-0 after:rounded-card after:content-[''] focus-visible:outline-none!"
                        onClick={(event) => onRowClick(row, event)}
                      >
                        {title}
                      </button>
                    ) : (
                      title
                    )}
                  </div>
                  {rowActions && (
                    <CardAction>
                      <RowActions items={rowActions(row)} name={name} />
                    </CardAction>
                  )}
                </div>
                {details.length > 0 && (
                  <dl className="m-ds-none flex flex-col gap-ds-xs">
                    {details.map((column) => (
                      <div key={column.key} className="flex items-baseline justify-between gap-ds-md">
                        <dt className="text-caption font-semibold tracking-wide text-text-muted uppercase">{column.header}</dt>
                        <dd className="m-ds-none text-right text-body-sm text-text-primary">{cellContent(column, row)}</dd>
                      </div>
                    ))}
                  </dl>
                )}
              </Card>
            )
          })}
    </ul>
  )
}
