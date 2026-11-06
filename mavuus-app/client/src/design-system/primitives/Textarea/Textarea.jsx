import { useCallback, useLayoutEffect, useRef } from 'react'
import { cn } from '../../lib/cn'
import { fieldVariants } from '../Input/fieldVariants'

function assignRef(ref, value) {
  if (typeof ref === 'function') ref(value)
  else if (ref) ref.current = value
}

/** Multi-line text field. `autoGrow` grows the height to fit the content instead of scrolling. */
export function Textarea({ size = 'md', invalid = false, autoGrow = false, rows = 3, onInput, className, ref, ...props }) {
  const innerRef = useRef(null)
  const ariaInvalid = props['aria-invalid']
  const isInvalid = Boolean(invalid) || (Boolean(ariaInvalid) && ariaInvalid !== 'false')

  const resize = useCallback(() => {
    const el = innerRef.current
    if (!autoGrow || !el) return
    el.style.height = 'auto'
    el.style.height = `${el.scrollHeight}px`
  }, [autoGrow])

  // Fit controlled values set from outside (initial value, reset).
  useLayoutEffect(() => {
    resize()
  }, [resize, props.value])

  const setRefs = useCallback(
    (node) => {
      innerRef.current = node
      assignRef(ref, node)
    },
    [ref],
  )

  return (
    <textarea
      ref={setRefs}
      rows={rows}
      onInput={(event) => {
        resize()
        onInput?.(event)
      }}
      className={cn(fieldVariants({ invalid: isInvalid, size }), 'block py-ds-sm', autoGrow ? 'resize-none overflow-hidden' : 'resize-y', className)}
      {...props}
      aria-invalid={isInvalid || undefined}
    />
  )
}
