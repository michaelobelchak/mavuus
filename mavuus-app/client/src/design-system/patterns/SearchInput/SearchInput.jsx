import { use, useEffect, useId, useReducer, useRef, useState } from 'react'
import { Search, X } from 'lucide-react'
import { cn } from '../../lib/cn'
import { mergeRefs } from '../../lib/mergeRefs'
import { warnOnce } from '../../lib/warnOnce'
import { IconButton, Input } from '../../primitives'
import { FormFieldContext } from '../FormField/formFieldContext'

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
 *   `debounce` ms (default 300) with the text the field shows then (so a parent's trim or
 *   lowercase is kept), and right away with '' when the field is cleared. A value changed from
 *   outside before the pause ends drops the pending search.
 * - Escape clears a field that has text (and doesn't bubble, so a surrounding Dialog stays open).
 * - `value` / `defaultValue` work as on any input.
 * - Name it with `label` (rendered visually hidden), `aria-label`, `aria-labelledby`, or put it
 *   in a FormField as its direct child (FormField labels the control it clones; a SearchInput
 *   wrapped in another element doesn't pick up the label). Without one it falls back to
 *   aria-label "Search" and warns in dev, because "Search members" tells people more than
 *   "Search". A plain <Label htmlFor> outside FormField isn't detected, so pass `label` or
 *   `aria-label` there.
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
  const field = use(FormFieldContext)
  // True between our own change event and the render it causes, so a value that moves for any
  // other reason (a parent reset, a new value prop) can drop the pending search. Every change
  // event forces that render (`rerender`), even when a controlled parent keeps the same value
  // (it trimmed a trailing space), and the flag is cleared after every render.
  const ownChange = useRef(false)
  const [, rerender] = useReducer((count) => count + 1, 0)
  const ariaLabel = props['aria-label']
  const ariaLabelledBy = props['aria-labelledby']
  const named = Boolean(ariaLabel || ariaLabelledBy || label || (field?.labelled && field.controlId === id))
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

  useEffect(() => {
    if (!named) {
      warnOnce(
        'SearchInput:label',
        'SearchInput: give it a label, aria-label or aria-labelledby that says what it searches (for example "Search members"). Falling back to "Search".',
      )
    }
  }, [named])

  // A value that changes from outside (not through typing) drops the pending search.
  useEffect(() => {
    if (!ownChange.current) clearTimeout(timer.current)
  }, [current])

  // Runs after the effect above on every render, so the flag never outlives the render its
  // change event caused.
  useEffect(() => {
    ownChange.current = false
  })

  function handleChange(event) {
    const next = event.target.value
    if (!controlled) setInnerValue(next)
    rerender()
    onChange?.(event)
    clearTimeout(timer.current)
    if (next === '') {
      onSearchRef.current?.('')
      return
    }
    ownChange.current = true
    // Search with the text the field shows now, so a parent that trims or lowercases the value
    // still gets onSearch, with the transformed text.
    timer.current = setTimeout(() => {
      const shown = inputRef.current?.value ?? ''
      if (shown !== '') onSearchRef.current?.(shown)
    }, debounce)
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
      aria-label={named ? undefined : 'Search'}
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
