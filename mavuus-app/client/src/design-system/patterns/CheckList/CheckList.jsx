import { Check } from 'lucide-react'
import { cn } from '../../lib/cn'
import { resolveOption } from '../../lib/resolveOption'
import { Reveal } from '../Reveal/Reveal'

const textSizes = { sm: 'text-body-sm', md: 'text-body' }
const SIZES = Object.keys(textSizes)

/**
 * Checklist with a brand check before each item.
 * - `items`: strings or nodes. `size`: sm or md (default).
 * - `reveal` (default true): items rise into view in sequence.
 * Keeps list semantics (role="list" because list-none drops them in Safari).
 */
export function CheckList({ items = [], size, reveal = true, className, ref, ...props }) {
  const resolvedSize = resolveOption(size, SIZES, 'md', 'CheckList', 'size')
  const itemClass = cn('flex items-start gap-ds-sm text-text-primary', textSizes[resolvedSize])

  return (
    <ul ref={ref} role="list" className={cn('m-ds-none flex list-none flex-col gap-ds-sm p-ds-none', className)} {...props}>
      {items.map((item, index) => {
        const key = typeof item === 'string' ? item : index
        const content = (
          <>
            <span
              aria-hidden="true"
              className="mt-ds-xxs flex size-5 shrink-0 items-center justify-center rounded-chip bg-surface-brand-strong text-text-on-brand"
            >
              <Check className="size-3" strokeWidth={3} />
            </span>
            <span>{item}</span>
          </>
        )
        return reveal ? (
          <Reveal as="li" key={key} index={index} className={itemClass}>
            {content}
          </Reveal>
        ) : (
          <li key={key} className={itemClass}>
            {content}
          </li>
        )
      })}
    </ul>
  )
}
