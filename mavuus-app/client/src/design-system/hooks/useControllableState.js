import { useState } from 'react'

/**
 * State that a parent can control. `value` undefined means uncontrolled: the hook keeps its own
 * state, starting at `defaultValue`. `setValue(next)` updates that state when uncontrolled and
 * always calls `onChange(next)`. Returns [value, setValue, controlled].
 */
export function useControllableState(value, defaultValue, onChange) {
  const [inner, setInner] = useState(defaultValue)
  const controlled = value !== undefined
  function setValue(next) {
    if (!controlled) setInner(next)
    onChange?.(next)
  }
  return [controlled ? value : inner, setValue, controlled]
}
