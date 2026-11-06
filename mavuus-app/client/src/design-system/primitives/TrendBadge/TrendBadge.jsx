import { ArrowDown, ArrowUp, Minus } from 'lucide-react'
import { Badge } from '../Badge/Badge'
import { resolveTrendDirection, trendAmount, trendSpoken } from './trendText'

const icons = { up: ArrowUp, down: ArrowDown, flat: Minus }

function toneFor(direction, goodWhen) {
  if (direction === 'flat') return 'neutral'
  return direction === goodWhen ? 'success' : 'error'
}

/**
 * Percent change badge. Green when the change goes the good way (`goodWhen`), red when it
 * goes the other way, neutral when flat. `direction` defaults to the sign of `value`.
 */
export function TrendBadge({ value, direction, goodWhen = 'up', size, ...props }) {
  const resolved = resolveTrendDirection(value, direction)
  const amount = trendAmount(value)

  return (
    <Badge tone={toneFor(resolved, goodWhen)} size={size} leadingIcon={icons[resolved]} {...props}>
      <span aria-hidden="true">{amount}%</span>
      <span className="sr-only">{trendSpoken(value, resolved)}</span>
    </Badge>
  )
}
