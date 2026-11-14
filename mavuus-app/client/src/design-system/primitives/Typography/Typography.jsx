import { cn } from '../../lib/cn'
import { resolveOption } from '../../lib/resolveOption'
import { warnOnce } from '../../lib/warnOnce'
import {
  captionVariants,
  DEFAULT_CAPTION_TONE,
  DEFAULT_EYEBROW_TONE,
  DEFAULT_HEADING_LEVEL,
  DEFAULT_TEXT_SIZE,
  DEFAULT_TEXT_TONE,
  EYEBROW_TONES,
  eyebrowVariants,
  HEADING_LEVELS,
  HEADING_SIZE_BY_LEVEL,
  HEADING_SIZES,
  headingVariants,
  TEXT_SIZES,
  TEXT_TONES,
  textVariants,
} from './typographyVariants'

function resolveLevel(level) {
  if (level === undefined || level === null) return DEFAULT_HEADING_LEVEL
  const number = Number(level)
  if (HEADING_LEVELS.includes(number)) return number
  const fallback = number > 4 && number <= 6 ? 4 : DEFAULT_HEADING_LEVEL
  warnOnce(
    `Heading:level:${level}`,
    `Heading: level "${level}" is not supported (use 1 to 4). Rendering an h${fallback}.`,
  )
  return fallback
}

/**
 * Section heading. `level` (1 to 4) picks the tag for the document outline; 5 and 6 warn and
 * render an h4. `size` (display, h1, h2, h3, h4) picks the look and defaults to the level's size.
 * `tone` takes the same values as Text.
 */
export function Heading({ level, size, tone, className, ref, ...props }) {
  const resolvedLevel = resolveLevel(level)
  const resolvedSize = resolveOption(size, HEADING_SIZES, HEADING_SIZE_BY_LEVEL[resolvedLevel], 'Heading', 'size')
  const resolvedTone = resolveOption(tone, TEXT_TONES, DEFAULT_TEXT_TONE, 'Heading', 'tone')
  const Tag = `h${resolvedLevel}`
  return <Tag ref={ref} className={cn(headingVariants({ size: resolvedSize, tone: resolvedTone }), className)} {...props} />
}

/**
 * Body copy. `size`: lead, body (default), body-sm or caption. `tone`: primary (default),
 * secondary, muted, brand, link, on-brand, success, warning, error or info. `as` sets the tag (default p).
 */
export function Text({ as: Tag = 'p', size, tone, className, ref, ...props }) {
  const resolvedSize = resolveOption(size, TEXT_SIZES, DEFAULT_TEXT_SIZE, 'Text', 'size')
  const resolvedTone = resolveOption(tone, TEXT_TONES, DEFAULT_TEXT_TONE, 'Text', 'tone')
  return <Tag ref={ref} className={cn(textVariants({ size: resolvedSize, tone: resolvedTone }), className)} {...props} />
}

/**
 * Small uppercase label above a heading, the public site's pink eyebrow.
 * The default `accent` tone is the light pink (text-brand, 2.85:1 on white, below the 4.5:1 AA
 * minimum), so it is decorative only: the heading it sits above must carry the meaning. Use
 * `tone="brand"` (5.74:1) or another shared tone when the eyebrow text has to be read on its own.
 */
export function Eyebrow({ as: Tag = 'p', tone, className, ref, ...props }) {
  const resolvedTone = resolveOption(tone, EYEBROW_TONES, DEFAULT_EYEBROW_TONE, 'Eyebrow', 'tone')
  return <Tag ref={ref} className={cn(eyebrowVariants({ tone: resolvedTone }), className)} {...props} />
}

/** Small text for metadata, timestamps and figure captions. Muted by default. `as` sets the tag (default span). */
export function Caption({ as: Tag = 'span', tone, className, ref, ...props }) {
  const resolvedTone = resolveOption(tone, TEXT_TONES, DEFAULT_CAPTION_TONE, 'Caption', 'tone')
  return <Tag ref={ref} className={cn(captionVariants({ tone: resolvedTone }), className)} {...props} />
}
