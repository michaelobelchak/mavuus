import { ArrowDown, ArrowUp, Minus } from 'lucide-react'
import { Badge } from '../Badge/Badge'

const icons = { up: ArrowUp, down: ArrowDown, flat: Minus }
const spoken = { up: 'up', down: 'down', flat: 'no change' }

function toneFor(direction, goodWhen) {
  if (direction === 'flat') return 'neutral'
  return direction === goodWhen ? 'success' : 'error'
}

/**
 * Percent change badge. Green when the change goes the good way (`goodWhen`), red when it
 * goes the other way, neutral when flat. `direction` defaults to the sign of `value`.
 */
export function TrendBadge({ value, direction, goodWhen = 'up', size, ...props }) {
  const resolved = direction ?? (value > 0 ? 'up' : value < 0 ? 'down' : 'flat')
  const amount = Math.abs(value).toFixed(2)

  return (
    <Badge tone={toneFor(resolved, goodWhen)} size={size} icon={icons[resolved]} {...props}>
      <span aria-hidden="true">{amount}%</span>
      <span className="sr-only">{`${spoken[resolved]} ${amount} percent`}</span>
    </Badge>
  )
}
