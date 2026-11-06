// Shared by TrendBadge and StatCard so the spoken trend reads the same everywhere.
const spoken = { up: 'up', down: 'down', flat: 'no change' }

// `direction` defaults to the sign of `value`.
export function resolveTrendDirection(value, direction) {
  return direction ?? (value > 0 ? 'up' : value < 0 ? 'down' : 'flat')
}

export function trendAmount(value) {
  return Math.abs(value).toFixed(2)
}

// "up 32.54 percent", "down 0.40 percent", "no change 0.00 percent".
export function trendSpoken(value, direction) {
  return `${spoken[resolveTrendDirection(value, direction)]} ${trendAmount(value)} percent`
}
