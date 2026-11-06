// Combines refs into one callback ref. Supports React 19 callback refs that return a cleanup.
export function mergeRefs(...refs) {
  return (node) => {
    const cleanups = refs.map((ref) => {
      if (typeof ref === 'function') {
        const cleanup = ref(node)
        return typeof cleanup === 'function' ? cleanup : () => ref(null)
      }
      if (ref) {
        ref.current = node
        return () => {
          ref.current = null
        }
      }
      return null
    })
    return () => {
      for (const cleanup of cleanups) cleanup?.()
    }
  }
}
