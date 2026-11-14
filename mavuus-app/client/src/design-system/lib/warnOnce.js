// Dev-only console.error that fires once per key, so a list of 50 bad rows logs one line.
const warned = new Set()

export function warnOnce(key, message) {
  if (!import.meta.env.DEV || warned.has(key)) return
  warned.add(key)
  console.error(message)
}

// Tests only.
export function resetWarnings() {
  warned.clear()
}
