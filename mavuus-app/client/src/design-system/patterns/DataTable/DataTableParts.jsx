import { useLayoutEffect, useRef, useState } from 'react'
import { ArrowDown, ArrowUp, ArrowUpDown, MoreHorizontal } from 'lucide-react'
import { linkProps } from '../../lib/linkProps'
import { Icon, IconButton } from '../../primitives'
import { DropdownMenu } from '../DropdownMenu/DropdownMenu'
import { hrefProps } from './dataTableUtils'

export function SortIcon({ direction }) {
  const icon = direction === 'ascending' ? ArrowUp : direction === 'descending' ? ArrowDown : ArrowUpDown
  return <Icon icon={icon} size="sm" className={direction === 'none' && 'text-text-faint'} />
}

/**
 * The row's primary target in its first cell: a real link (rowHref) or button (onRowClick) that
 * wraps the cell's visible content, so its name is that text (WCAG 2.5.3). When the cell renders
 * no text (an avatar only), the row name is added for screen readers.
 */
export function RowTarget({ row, name, href, onRowClick, children }) {
  const ref = useRef(null)
  const [needsName, setNeedsName] = useState(false)
  useLayoutEffect(() => {
    const element = ref.current
    if (!element) return
    const own = [...element.childNodes].filter((node) => !(node instanceof Element && node.hasAttribute('data-row-name')))
    setNeedsName(own.every((node) => node.textContent.trim() === ''))
  }, [children])
  const className = 'cursor-pointer text-left font-semibold text-text-primary hover:underline'
  const content = (
    <>
      {children}
      {needsName && (
        <span data-row-name="" className="sr-only">
          {name}
        </span>
      )}
    </>
  )
  if (href !== undefined) {
    const link = linkProps(hrefProps(href))
    const { Component } = link
    return (
      <Component ref={ref} data-row-target="" className={className} {...link.props}>
        {content}
      </Component>
    )
  }
  return (
    <button ref={ref} type="button" data-row-target="" className={className} onClick={(event) => onRowClick(row, event)}>
      {content}
    </button>
  )
}

export function RowActions({ items, name }) {
  return (
    <DropdownMenu
      align="end"
      items={items}
      trigger={<IconButton icon={MoreHorizontal} size="sm" aria-label={`Actions for ${name}`} />}
    />
  )
}
