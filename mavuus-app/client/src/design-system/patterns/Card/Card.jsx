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

/**
 * Card container.
 * - `variant`: feature (default, white with hairline border and card shadow), surface (white, default
 *   border, no shadow), panel (tinted, panel radius), panel-pink, media (image on top, no root padding).
 * - `rule`: the 4px pink left rule, the brand signature. `interactive`: hover lift (none with reduced motion).
 * - `padding`: none, sm, md or lg (default). On a media card it pads the body below `media`.
 * - `as`: div (default), article, section or li.
 *
 * Clickable cards use the stretched-link pattern: put a <CardLink> in the title. Its overlay covers the
 * whole card (the card is always `position: relative`), the link is named by the title only, and the
 * focus ring is drawn on the card. Wrap buttons or other links in <CardAction> so they sit above the
 * overlay. `className` and other props go to the card element.
 */
export function Card({ as, variant, padding, rule = false, interactive = false, media, className, children, ref, ...props }) {
  const resolvedVariant = resolveOption(variant, CARD_VARIANTS, DEFAULT_CARD_VARIANT, 'Card', 'variant')
  const resolvedPadding = resolveOption(padding, CARD_PADDINGS, DEFAULT_CARD_PADDING, 'Card', 'padding')
  const Tag = cardTags[resolveOption(as, CARD_TAGS, 'div', 'Card', 'as')]
  const isMedia = resolvedVariant === 'media'
  // Link props would land on a div, so they are dropped. The card links through <CardLink>.
  const { to, href, target, rel, ...rest } = props

  if ([to, href, target, rel].some((value) => value !== undefined)) {
    warnOnce(
      'Card:link-props',
      'Card: to, href, target and rel are not supported. Put a <CardLink> in the card title instead.',
    )
  }

  return (
    <Tag
      ref={ref}
      className={cn(
        cardVariants({ variant: resolvedVariant, padding: isMedia ? 'none' : resolvedPadding, rule, interactive }),
        className,
      )}
      {...rest}
    >
      {isMedia ? (
        <>
          {media && <div>{media}</div>}
          <div className={cardPaddings[resolvedPadding]}>{children}</div>
        </>
      ) : (
        children
      )}
    </Tag>
  )
}

/**
 * The one link of a clickable Card. Put it in the title (`<Heading><CardLink to="/jobs/42">Head of
 * Growth</CardLink></Heading>`). Its ::after overlay stretches over the card, so the whole card is
 * clickable while the link's accessible name stays the title. Takes `to` or `href` (lib/linkProps).
 * The card shows the focus ring instead of the small link text.
 *
 * The overlay is positioned against the nearest positioned ancestor, which must be the card. Don't
 * put a CardLink inside another positioned element (a `relative` wrapper, a CardAction) within the
 * card, or the overlay only covers that element.
 */
export function CardLink({ to, href, target, rel, className, children, ref, ...props }) {
  const innerRef = useRef(null)
  const link = linkProps({ to, href, target, rel })
  const { Component } = link

  useEffect(() => {
    if (!import.meta.env.DEV) return
    if (innerRef.current?.parentElement?.closest('a[href]')) {
      warnOnce('CardLink:nested-link', 'CardLink: this card link is inside another link. Nested links are invalid HTML; drop the outer link.')
    }
  }, [])

  return (
    <Component
      ref={mergeRefs(innerRef, ref)}
      data-card-link=""
      className={cn(
        "text-inherit after:absolute after:inset-0 after:rounded-card after:content-['']",
        // The card draws the ring (has-[[data-card-link]:focus-visible] in cardVariants), so the
        // global ring on the small link text is turned off here.
        'focus-visible:outline-none!',
        className,
      )}
      {...link.props}
      {...props}
    >
      {children}
      {link.opensNewTab && <ExternalHint />}
    </Component>
  )
}

/** Wraps buttons and links inside a clickable Card so they sit above the CardLink overlay. */
export function CardAction({ className, ref, ...props }) {
  return <div ref={ref} className={cn('relative z-(--ds-z-raised)', className)} {...props} />
}
