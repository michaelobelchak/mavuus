import { useEffect, useId, useRef, useState } from 'react'
import { Search, X } from 'lucide-react'
import { cn } from '../../lib/cn'
import { mergeRefs } from '../../lib/mergeRefs'
import { warnOnce } from '../../lib/warnOnce'
import { IconButton, Input } from '../../primitives'

const DEFAULT_DEBOUNCE = 300

// The clear button uses the control scale: 40px in an sm field, 48px in md and lg.
const clearButtonSizes = { sm: 'sm', md: 'md', lg: 'md' }

// Sets the value the way typing does, so React fires onChange with a real event. That keeps
// controlled and uncontrolled inputs in sync when the clear button or Escape empties the field.
function setNativeValue(input, value) {
  const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set
  setter.call(input, value)
  input.dispatchEvent(new Event('input', { bubbles: true }))
}

/**
 * Search field: an Input with a search icon and a "Clear search" button while it has text.
 * - `onChange(event)` fires on every keystroke. `onSearch(value)` fires once typing pauses for
 *   `debounce` ms (default 300), and right away with '' when the field is cleared.
 * - Escape clears a field that has text (and doesn't bubble, so a surrounding Dialog stays open).
 * - `value` / `defaultValue` work as on any input.
 * - Name it with `label` (rendered visually hidden), `aria-label`, `aria-labelledby`, or a
 *   <label for> such as FormField's. Without one it falls back to "Search" and warns in dev,
 *   because "Search members" tells people more than "Search".
 * `ref`, `className` and other props go to the <input>; `size` follows Input (sm, md, lg).
 */
export function SearchInput({
  value,
  defaultValue,
  onChange,
  onSearch,
  onKeyDown,
  debounce = DEFAULT_DEBOUNCE,
  size,
  label,
  className,
  ref,
  ...props
}) {
  const generatedId = useId()
  const id = props.id ?? generatedId
  const inputRef = useRef(null)
  const fallbackLabel = useRef(false)
  const ariaLabel = props['aria-label']
  const ariaLabelledBy = props['aria-labelledby']
  const timer = useRef(null)
  const onSearchRef = useRef(onSearch)
  const [innerValue, setInnerValue] = useState(defaultValue ?? '')
  const controlled = value !== undefined
  const current = controlled ? value : innerValue
  const hasText = String(current ?? '').length > 0

  useEffect(() => {
    onSearchRef.current = onSearch
  }, [onSearch])

  useEffect(() => () => clearTimeout(timer.current), [])

  // A <label for> elsewhere (FormField, Label htmlFor) can only be found in the DOM, so the
  // "Search" fallback name is set on the element here instead of in render.
  useEffect(() => {
    const input = inputRef.current
    if (!input) return
    const named = Boolean(ariaLabel || ariaLabelledBy || label || input.labels?.length)
    if (!named) {
      input.setAttribute('aria-label', 'Search')
      fallbackLabel.current = true
      warnOnce(
        'SearchInput:label',
        'SearchInput: give it a label, aria-label or aria-labelledby that says what it searches (for example "Search members"). Falling back to "Search".',
      )
    } else if (fallbackLabel.current && !ariaLabel) {
      input.removeAttribute('aria-label')
      fallbackLabel.current = false
    }
  }, [id, label, ariaLabel, ariaLabelledBy])

  function handleChange(event) {
    const next = event.target.value
    if (!controlled) setInnerValue(next)
    onChange?.(event)
    clearTimeout(timer.current)
    if (next === '') {
      onSearchRef.current?.('')
      return
    }
    timer.current = setTimeout(() => onSearchRef.current?.(next), debounce)
  }

  function clear() {
    const input = inputRef.current
    if (!input) return
    setNativeValue(input, '')
    input.focus()
  }

  function handleKeyDown(event) {
    onKeyDown?.(event)
    if (event.key === 'Escape' && hasText && !event.defaultPrevented) {
      event.preventDefault()
      event.stopPropagation()
      clear()
    }
  }

  const input = (
    <Input
      ref={mergeRefs(inputRef, ref)}
      type="search"
      size={size}
      leadingIcon={Search}
      // Hide the browser's own clear button; ours is labelled and keyboard reachable.
      className={cn('[&::-webkit-search-cancel-button]:appearance-none', className)}
      {...props}
      id={id}
      value={controlled ? value : innerValue}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      trailing={
        hasText && (
          <IconButton
            icon={X}
            aria-label="Clear search"
            size={clearButtonSizes[size] ?? clearButtonSizes.md}
            onClick={clear}
          />
        )
      }
    />
  )

  if (!label) return input

  return (
    <>
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      {input}
    </>
  )
}
