/**
 * Accessibility props for a card skeleton. A single skeleton is busy and says what is loading
 * (`label`). In a grid of skeletons, set aria-busy on the list and pass `announce={false}` so each
 * placeholder is hidden instead of being read six times.
 */
export function skeletonA11y(announce) {
  return announce ? { 'aria-busy': 'true' } : { 'aria-hidden': 'true' }
}
