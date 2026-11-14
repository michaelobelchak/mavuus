// Splits "~$2.1M" into prefix "~$", target 2.1 (one decimal) and suffix "M". Null when there's no number.
export function parseCount(value) {
  const match = String(value ?? '').match(/^(\D*)([\d.,]+)(.*)$/)
  if (!match) return null
  const [, prefix, raw, suffix] = match
  const target = Number(raw.replace(/,/g, ''))
  if (Number.isNaN(target)) return null
  const decimals = raw.includes('.') ? raw.split('.')[1].length : 0
  return { prefix, suffix, target, decimals, grouped: raw.includes(',') }
}

export function formatCount({ prefix, suffix, decimals, grouped }, n) {
  const shown = grouped
    ? n.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
    : n.toFixed(decimals)
  return `${prefix}${shown}${suffix}`
}

// True when the value has a number CountUp can animate ("430", "1,100+", "$2.1M").
export function isCountable(value) {
  return parseCount(value) !== null
}
