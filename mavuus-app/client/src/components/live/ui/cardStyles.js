// Four card types for the whole public site. See mavuus-app/plans/PUBLIC-DESIGN-SYSTEM.md.

const BASE = 'rounded-2xl'

export const CARD_VARIANTS = {
  // Stats, offering cards, proof boxes, CTA strips. `rule` adds the pink brand rule on the left.
  feature: 'border border-black/[0.06] bg-white shadow-[var(--shadow-live-card)]',
  // Neutral containers: FAQ categories, sign-up boxes, sidebars, forms.
  surface: 'border border-live-hairline bg-white',
  // Tinted blocks that group a whole section: membership, CTA band.
  panel: 'rounded-3xl bg-live-blue-light',
  'panel-pink': 'rounded-3xl bg-live-pink-50',
}

const HOVER = {
  feature: 'transition-[transform,box-shadow] duration-300 ease-[var(--ease-live)] hover:-translate-y-1 hover:shadow-[var(--shadow-live-card-hover)] motion-reduce:hover:translate-y-0',
  surface: 'transition-[transform,box-shadow,border-color] duration-300 ease-[var(--ease-live)] hover:-translate-y-1 hover:border-transparent hover:shadow-[var(--shadow-live-card)] motion-reduce:hover:translate-y-0',
}

export function cardClass({ variant = 'feature', rule = false, interactive = false, className = '' } = {}) {
  return [
    BASE,
    CARD_VARIANTS[variant],
    rule ? 'border-l-4 border-l-brand-pink' : '',
    interactive ? HOVER[variant] ?? '' : '',
    className,
  ].join(' ')
}
