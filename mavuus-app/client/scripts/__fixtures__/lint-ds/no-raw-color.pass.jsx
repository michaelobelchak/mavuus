import { cva } from 'class-variance-authority'

const card = cva('bg-surface-raised text-text-primary', { variants: { tone: { brand: 'bg-surface-selected' } } })
// A hex value outside any class or style context is data, not styling.
const BRAND_HEX = '#F26D92'

export function Swatch() {
  return <div className={card({ tone: 'brand' })} data-color={BRAND_HEX} style={{ backgroundColor: 'var(--surface-raised)' }} />
}
