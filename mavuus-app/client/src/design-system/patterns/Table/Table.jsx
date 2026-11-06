import { use, useEffect, useId, useMemo, useRef, useState } from 'react'
import { cn } from '../../lib/cn'
import { resolveOption } from '../../lib/resolveOption'
import { TableContext, TableSectionContext } from './tableContext'
import {
  DEFAULT_TABLE_ALIGN,
  DEFAULT_TABLE_DENSITY,
  TABLE_ALIGNS,
  TABLE_DENSITIES,
  tableCellVariants,
} from './tableVariants'

// True while the element's content is wider than the element.
function useOverflowing(ref) {
  const [overflowing, setOverflowing] = useState(false)
  useEffect(() => {
    const element = ref.current
    if (!element) return undefined
    const check = () => setOverflowing(element.scrollWidth > element.clientWidth)
    check()
    if (typeof ResizeObserver === 'undefined') return undefined
    const observer = new ResizeObserver(check)
    observer.observe(element)
    if (element.firstElementChild) observer.observe(element.firstElementChild)
    return () => observer.disconnect()
  }, [ref])
  return overflowing
}

/**
 * Semantic table for simple data. Compose it from TableCaption, TableHeader, TableBody, TableRow,
 * TableHead and TableCell. For sorting, paging and selection use DataTable.
 * - `density`: comfortable (default) or compact. Every cell in the table follows it.
 * - Name it with a TableCaption (`visuallyHidden` keeps it for screen readers only) or `aria-label`.
 * - The table sits in a horizontal scroll container. When it overflows, the container becomes a
 *   focusable region (tabIndex 0) named by the caption, so keyboard users can scroll it.
 * `ref`, `className` and other props go to the <table>; `containerClassName` to the scroll
 * container.
 */
export function Table({ density, containerClassName, className, children, ref, ...props }) {
  const resolvedDensity = resolveOption(density, TABLE_DENSITIES, DEFAULT_TABLE_DENSITY, 'Table', 'density')
  const containerRef = useRef(null)
  const overflowing = useOverflowing(containerRef)
  const captionId = useId()
  const [hasCaption, setHasCaption] = useState(false)
  const context = useMemo(() => ({ density: resolvedDensity, captionId, setHasCaption }), [resolvedDensity, captionId])
  const regionProps = overflowing
    ? {
        role: 'region',
        tabIndex: 0,
        'aria-labelledby': hasCaption ? captionId : undefined,
        'aria-label': hasCaption ? undefined : props['aria-label'],
      }
    : {}

  return (
    <TableContext value={context}>
      <div ref={containerRef} className={cn('w-full overflow-x-auto', containerClassName)} {...regionProps}>
        <table ref={ref} className={cn('w-full border-collapse text-left', className)} {...props}>
          {children}
        </table>
      </div>
    </TableContext>
  )
}

/** The table's name. `visuallyHidden` keeps it for screen readers only. Other props go to <caption>. */
export function TableCaption({ visuallyHidden = false, className, ref, ...props }) {
  const { captionId, setHasCaption } = use(TableContext)
  useEffect(() => {
    setHasCaption(true)
    return () => setHasCaption(false)
  }, [setHasCaption])
  return (
    <caption
      ref={ref}
      id={captionId}
      className={cn(
        visuallyHidden ? 'sr-only' : 'caption-top pb-ds-sm text-left text-body-sm text-text-secondary',
        className,
      )}
      {...props}
    />
  )
}

/** <thead> with the sunken header band. */
export function TableHeader({ className, ref, ...props }) {
  return (
    <TableSectionContext value="head">
      <thead ref={ref} className={cn('bg-surface-sunken', className)} {...props} />
    </TableSectionContext>
  )
}

/** <tbody>. Its rows get the hover tint. */
export function TableBody({ className, ref, ...props }) {
  return (
    <TableSectionContext value="body">
      <tbody ref={ref} className={className} {...props} />
    </TableSectionContext>
  )
}

/** <tr> with a subtle bottom border; body rows tint on hover. */
export function TableRow({ className, ref, ...props }) {
  const section = use(TableSectionContext)
  return (
    <tr
      ref={ref}
      className={cn(
        'border-b border-border-subtle',
        section === 'body' && 'transition-colors duration-150 ease-enter hover:bg-surface-hover motion-reduce:transition-none',
        className,
      )}
      {...props}
    />
  )
}

/**
 * Header cell (<th>, scope col by default; pass scope="row" for a row header).
 * `align`: left (default), right (numbers) or center.
 */
export function TableHead({ align, scope = 'col', className, ref, ...props }) {
  const { density } = use(TableContext)
  const resolvedAlign = resolveOption(align, TABLE_ALIGNS, DEFAULT_TABLE_ALIGN, 'TableHead', 'align')
  return (
    <th
      ref={ref}
      scope={scope}
      className={cn(tableCellVariants({ part: 'head', density, align: resolvedAlign }), className)}
      {...props}
    />
  )
}

/** Body cell (<td>). `align`: left (default), right (numbers) or center. */
export function TableCell({ align, className, ref, ...props }) {
  const { density } = use(TableContext)
  const resolvedAlign = resolveOption(align, TABLE_ALIGNS, DEFAULT_TABLE_ALIGN, 'TableCell', 'align')
  return (
    <td
      ref={ref}
      className={cn(tableCellVariants({ part: 'cell', density, align: resolvedAlign }), className)}
      {...props}
    />
  )
}
