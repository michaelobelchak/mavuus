const range = (start, end) => Array.from({ length: end - start + 1 }, (_, index) => start + index)

/**
 * The page list for Pagination: numbers plus 'ellipsis-start' / 'ellipsis-end' markers.
 * Always shows the first and last page and `siblings` pages on each side of the current one,
 * so the list keeps the same length (siblings * 2 + 5) once there are enough pages.
 */
export function getPaginationRange(page, pageCount, siblings = 1) {
  const total = Math.max(0, Math.floor(pageCount))
  if (total === 0) return []
  const current = Math.min(Math.max(1, Math.floor(page)), total)
  const windowSize = siblings * 2 + 3
  if (total <= windowSize + 2) return range(1, total)

  const left = Math.max(current - siblings, 1)
  const right = Math.min(current + siblings, total)
  const showStartEllipsis = left > 2
  const showEndEllipsis = right < total - 1

  if (!showStartEllipsis && showEndEllipsis) return [...range(1, windowSize), 'ellipsis-end', total]
  if (showStartEllipsis && !showEndEllipsis) return [1, 'ellipsis-start', ...range(total - windowSize + 1, total)]
  return [1, 'ellipsis-start', ...range(left, right), 'ellipsis-end', total]
}
