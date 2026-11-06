import { createElement } from 'react'
import { Accordion as AccordionPrimitive } from '@base-ui/react/accordion'
import { ChevronDown } from 'lucide-react'
import { cn } from '../../lib/cn'
import { resolveHeadingLevel } from '../../lib/resolveOption'

const HEADING_LEVELS = [2, 3, 4, 5, 6]
const DEFAULT_HEADING_LEVEL = 3

function toArray(value) {
  if (value === undefined) return undefined
  return Array.isArray(value) ? value : [value]
}

/**
 * Accordion built on Base UI Accordion. Each title is a heading that wraps a button with aria-expanded.
 * - `items`: [{ value, title, content, disabled }].
 * - `multiple`: let several items stay open. Otherwise opening one closes the others.
 * - `defaultValue` / `value`: the open value or values. `onValueChange(values, details)`.
 * - `headingLevel`: 2 to 6 (default 3), so it fits the page outline.
 * Closed panels are unmounted, so their content is out of the tab order. The chevron turns when
 * open and switches instantly with reduced motion. `className` goes to the root.
 */
export function Accordion({
  items = [],
  multiple = false,
  defaultValue,
  value,
  onValueChange,
  headingLevel,
  className,
  ref,
  ...props
}) {
  const level = resolveHeadingLevel(headingLevel, HEADING_LEVELS, DEFAULT_HEADING_LEVEL, 'Accordion')

  return (
    <AccordionPrimitive.Root
      ref={ref}
      multiple={multiple}
      defaultValue={toArray(defaultValue)}
      value={toArray(value)}
      onValueChange={onValueChange}
      className={cn('flex flex-col border-y border-border-default', className)}
      {...props}
    >
      {items.map((item) => (
        <AccordionPrimitive.Item
          key={String(item.value)}
          value={item.value}
          disabled={item.disabled}
          className="border-b border-border-default last:border-b-0"
        >
          <AccordionPrimitive.Header render={createElement(`h${level}`)} className="m-ds-none">
            <AccordionPrimitive.Trigger
              className={cn(
                'group flex min-h-11 w-full cursor-pointer items-center justify-between gap-ds-md py-ds-md text-left',
                'text-h4 font-semibold text-text-primary hover:text-text-link',
                'data-[disabled]:cursor-not-allowed data-[disabled]:text-text-disabled',
              )}
            >
              {item.title}
              <ChevronDown
                aria-hidden="true"
                className="size-5 shrink-0 text-text-secondary transition-transform duration-200 ease-move group-data-[panel-open]:rotate-180 motion-reduce:transition-none"
              />
            </AccordionPrimitive.Trigger>
          </AccordionPrimitive.Header>
          <AccordionPrimitive.Panel className="pb-ds-md text-body text-text-secondary">{item.content}</AccordionPrimitive.Panel>
        </AccordionPrimitive.Item>
      ))}
    </AccordionPrimitive.Root>
  )
}
