import { ChevronRight } from 'lucide-react'
import { cn } from '../../lib/cn'
import { ExternalHint } from '../../lib/ExternalHint'
import { linkProps } from '../../lib/linkProps'

const labelClass = 'block max-w-40 truncate sm:max-w-60'

function Crumb({ item, current }) {
  const title = typeof item.label === 'string' ? item.label : undefined
  if (current || (item.to === undefined && item.href === undefined)) {
    return (
      <span aria-current={current ? 'page' : undefined} title={title} className={cn(labelClass, 'font-semibold text-text-primary')}>
        {item.label}
      </span>
    )
  }
  const link = linkProps({ to: item.to, href: item.href })
  const { Component } = link
  return (
    <Component
      {...link.props}
      title={title}
      className={cn(labelClass, 'text-text-secondary underline-offset-4 hover:text-text-link hover:underline')}
    >
      {item.label}
      {link.opensNewTab && <ExternalHint />}
    </Component>
  )
}

/**
 * Breadcrumb trail. `items`: [{ label, to | href }], from the top level down; the last item is the
 * current page (plain text with aria-current="page"). Separators are hidden from screen readers and
 * long labels truncate with the full label as a title. `aria-label` names the nav (default "Breadcrumb").
 */
export function Breadcrumbs({ items = [], 'aria-label': ariaLabel = 'Breadcrumb', className, ref, ...props }) {
  return (
    <nav ref={ref} aria-label={ariaLabel} className={className} {...props}>
      <ol className="m-ds-none flex list-none flex-wrap items-center gap-ds-xs p-ds-none text-body-sm">
        {items.map((item, index) => {
          const last = index === items.length - 1
          return (
            <li key={`${index}-${item.to ?? item.href ?? ''}`} className="flex min-w-0 items-center gap-ds-xs">
              <Crumb item={item} current={last} />
              {!last && (
                <ChevronRight data-breadcrumb-separator="" aria-hidden="true" className="size-4 shrink-0 text-text-muted" />
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
