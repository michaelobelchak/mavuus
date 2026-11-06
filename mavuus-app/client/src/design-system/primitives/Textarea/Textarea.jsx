import { useCallback, useLayoutEffect, useMemo, useRef } from 'react'
import { cn } from '../../lib/cn'
import { fieldVariants, isInvalid } from '../../lib/field'
import { mergeRefs } from '../../lib/mergeRefs'

const px = (value) => Number.parseFloat(value) || 0

/**
 * Multi-line text field. `autoGrow` grows the height to fit the content instead of
 * scrolling; `maxRows` caps that growth and turns scrolling back on past the cap.
 */
export function Textarea({ size, invalid = false, autoGrow = false, maxRows, rows = 3, onInput, className, ref, ...props }) {
  const innerRef = useRef(null)
  const grown = useRef(false)
  const ariaInvalid = props['aria-invalid']
  const invalidState = isInvalid(invalid, ariaInvalid)

  const resize = useCallback(() => {
    const el = innerRef.current
    if (!el) return
    if (!autoGrow) {
      // Undo our inline sizing when autoGrow turns off; leave consumer styles alone otherwise.
      if (grown.current) {
        el.style.height = ''
        el.style.overflowY = ''
        grown.current = false
      }
      return
    }
    el.style.height = 'auto'
    let height = el.scrollHeight
    let overflowY = ''
    if (maxRows) {
      const cs = window.getComputedStyle(el)
      const max =
        px(cs.lineHeight) * maxRows +
        px(cs.paddingTop) +
        px(cs.paddingBottom) +
        px(cs.borderTopWidth) +
        px(cs.borderBottomWidth)
      if (max > 0 && height > max) {
        height = max
        overflowY = 'auto'
      }
    }
    el.style.height = `${height}px`
    el.style.overflowY = overflowY
    grown.current = true
  }, [autoGrow, maxRows])

  // Fit controlled values set from outside (initial value, reset) and autoGrow toggles.
  useLayoutEffect(() => {
    resize()
  }, [resize, props.value])

  const setRefs = useMemo(() => mergeRefs(innerRef, ref), [ref])

  return (
    <textarea
      ref={setRefs}
      rows={rows}
      onInput={(event) => {
        resize()
        onInput?.(event)
      }}
      className={cn(
        fieldVariants({ invalid: invalidState, size }),
        'block py-ds-sm',
        autoGrow ? 'resize-none overflow-hidden' : 'resize-y',
        className,
      )}
      {...props}
      aria-invalid={invalidState ? true : ariaInvalid}
    />
  )
}
