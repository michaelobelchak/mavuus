import { cn } from '../../lib/cn'
import { eyebrowVariants, headingVariants, textVariants } from './typographyVariants'

const HEADING_LEVELS = [1, 2, 3, 4]
const DEFAULT_LEVEL = 2

/**
 * Section heading. `level` (1 to 4) picks the tag for the document outline; `size`
 * (display, h1, h2, h3, h4) picks the look and defaults to match the level.
 * `tone` takes the same values as Text.
 */
export function Heading({ level = DEFAULT_LEVEL, size, tone, className, ref, ...props }) {
  const resolvedLevel = HEADING_LEVELS.includes(Number(level)) ? Number(level) : DEFAULT_LEVEL
  const Tag = `h${resolvedLevel}`
  return <Tag ref={ref} className={cn(headingVariants({ size: size ?? `h${resolvedLevel}`, tone }), className)} {...props} />
}

/**
 * Body copy. `size`: lead, body (default), body-sm or caption. `tone`: primary (default),
 * secondary, muted, brand, link, on-brand, success, warning, error or info. `as` sets the tag (default p).
 */
export function Text({ as: Tag = 'p', size, tone, className, ref, ...props }) {
  return <Tag ref={ref} className={cn(textVariants({ size, tone }), className)} {...props} />
}

/**
 * Small uppercase label above a heading, the public site's pink eyebrow.
 * The default pink (text-brand) is 2.85:1 on white, below the 4.5:1 AA minimum, so it is a
 * brand accent only: the heading it sits above must carry the meaning. Use `tone="brand-strong"`
 * (5.74:1) when the eyebrow is the only place the text appears.
 */
export function Eyebrow({ as: Tag = 'p', tone, className, ref, ...props }) {
  return <Tag ref={ref} className={cn(eyebrowVariants({ tone }), className)} {...props} />
}

/** Small muted text for metadata, timestamps and figure captions. `as` sets the tag (default span). */
export function Caption({ as: Tag = 'span', tone = 'muted', className, ref, ...props }) {
  return <Tag ref={ref} className={cn(textVariants({ size: 'caption', tone }), className)} {...props} />
}
