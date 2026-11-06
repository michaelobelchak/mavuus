import { useEffect, useRef } from 'react'
import { cn } from '../../lib/cn'
import { ExternalHint } from '../../lib/ExternalHint'
import { linkProps } from '../../lib/linkProps'
import { mergeRefs } from '../../lib/mergeRefs'
import { resolveOption } from '../../lib/resolveOption'
import { warnOnce } from '../../lib/warnOnce'
import {
  CARD_PADDINGS,
  CARD_TAGS,
  CARD_VARIANTS,
  cardPaddings,
  cardVariants,
  DEFAULT_CARD_PADDING,
  DEFAULT_CARD_VARIANT,
} from './cardVariants'

// Static lookup so the rendered tag is never a component created during render.
const cardTags = Object.fromEntries(CARD_TAGS.map((name) => [name, name]))

const NESTED_INTERACTIVE =
  'a[href], button, input, select, textarea, [role="button"], [role="link"], [tabindex]:not([tabindex="-1"])'

/**
 * Card container.
 * - `variant`: feature (default, white with hairline border and card shadow), surface (white, default
 *   border, no shadow), panel (tinted, panel radius), panel-pink, media (image on top, no root padding).
 * - `rule`: the 4px pink left rule, the brand signature. `interactive`: hover lift (none with reduced motion).
 * - `padding`: none, sm, md or lg (default). On a media card it pads the body below `media`.
 * - `as`: div (default), article, section or li.
 * - `to` / `href`: the whole card becomes one link (through lib/linkProps), named by its content.
 *   Link cards lift on hover unless `interactive={false}`. Don't put buttons or links inside a link
 *   card; it warns in dev when you do. With `as`, the tag wraps the link (li > a).
 * `className` and other props go to the card element (the link for link cards).
 */
export function Card({
  as,
  variant,
  padding,
  rule = false,
  interactive,
  media,
  to,
  href,
  target,
  rel,
  className,
  children,
  ref,
  ...props
}) {
  const resolvedVariant = resolveOption(variant, CARD_VARIANTS, DEFAULT_CARD_VARIANT, 'Card', 'variant')
  const resolvedPadding = resolveOption(padding, CARD_PADDINGS, DEFAULT_CARD_PADDING, 'Card', 'padding')
  const tag = resolveOption(as, CARD_TAGS, 'div', 'Card', 'as')
  const Tag = cardTags[tag]
  const isLink = to !== undefined || href !== undefined
  const isMedia = resolvedVariant === 'media'
  const linkRef = useRef(null)

  useEffect(() => {
    if (isLink && linkRef.current?.querySelector(NESTED_INTERACTIVE)) {
      warnOnce(
        'Card:nested-interactive',
        'Card: a link card contains another interactive element (button, link or input). Screen readers and clicks get confused; move it out of the card or drop to/href.',
      )
    }
  })

  const classes = cn(
    cardVariants({
      variant: resolvedVariant,
      padding: isMedia ? 'none' : resolvedPadding,
      rule,
      interactive: interactive ?? isLink,
    }),
    className,
  )

  const content = isMedia ? (
    <>
      {media && <div>{media}</div>}
      <div className={cardPaddings[resolvedPadding]}>{children}</div>
    </>
  ) : (
    children
  )

  if (!isLink) {
    return (
      <Tag ref={ref} className={classes} {...props}>
        {content}
      </Tag>
    )
  }

  const link = linkProps({ to, href, target, rel })
  const { Component } = link
  const card = (
    <Component ref={mergeRefs(linkRef, tag === 'div' ? ref : undefined)} className={classes} {...link.props} {...props}>
      {content}
      {link.opensNewTab && <ExternalHint />}
    </Component>
  )
  if (tag === 'div') return card
  return (
    <Tag ref={ref} className="list-none">
      {card}
    </Tag>
  )
}
