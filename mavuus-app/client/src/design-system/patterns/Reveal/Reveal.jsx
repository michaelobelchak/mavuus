import { useRef } from 'react'
import { useInView } from '../../hooks/useInView'
import { mergeRefs } from '../../lib/mergeRefs'
import { resolveOption } from '../../lib/resolveOption'
import { DEFAULT_REVEAL_VARIANT, MAX_REVEAL_STEP, REVEAL_VARIANTS } from './revealOptions'

/**
 * Shows its content when it scrolls into view. Styles live in styles/motion.css under [data-reveal].
 * - `variant`: rise (default, text and cards), fade (subtle) or clip (images: the frame opens up).
 * - `index`: position in a list, for a stagger of 70ms per step, capped at 6 steps (420ms).
 * - `as`: the tag (default div).
 * Content is only hidden once the component has mounted, and reduced motion turns it into a short fade.
 */
export function Reveal({ as: Tag = 'div', variant, index = 0, className, children, ref, ...props }) {
  const innerRef = useRef(null)
  const inView = useInView(innerRef)
  const resolvedVariant = resolveOption(variant, REVEAL_VARIANTS, DEFAULT_REVEAL_VARIANT, 'Reveal', 'variant')
  const step = Math.min(Math.max(0, Math.floor(index)), MAX_REVEAL_STEP)

  return (
    <Tag
      ref={mergeRefs(innerRef, ref)}
      data-reveal={resolvedVariant}
      data-reveal-step={step}
      data-armed=""
      data-in={inView ? '' : undefined}
      className={className}
      {...props}
    >
      {children}
    </Tag>
  )
}
