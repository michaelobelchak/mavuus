import { vi } from 'vitest'

/**
 * Test helpers for browser APIs jsdom lacks. Call inside a test; undo with vi.unstubAllGlobals()
 * (and vi.restoreAllMocks() for the helpers that spy on Element.prototype).
 */

// Installs a fake IntersectionObserver. `intersect(element)` fires the callback for that element.
export function mockIntersectionObserver() {
  const observers = []
  class FakeIntersectionObserver {
    constructor(callback, options) {
      this.callback = callback
      this.options = options
      this.elements = new Set()
      observers.push(this)
    }
    observe(element) {
      this.elements.add(element)
    }
    unobserve(element) {
      this.elements.delete(element)
    }
    disconnect() {
      this.elements.clear()
    }
  }
  vi.stubGlobal('IntersectionObserver', FakeIntersectionObserver)
  return {
    observers,
    intersect(element, isIntersecting = true) {
      for (const observer of observers) {
        if (observer.elements.has(element)) observer.callback([{ target: element, isIntersecting }], observer)
      }
    },
  }
}

// Installs matchMedia that reports `reduced` for prefers-reduced-motion and false for anything else.
// `setReduced(value)` flips the setting and fires the change listeners, like the OS toggle.
export function mockReducedMotion(initial) {
  let reduced = initial
  const listeners = new Set()
  const matchMedia = (query) => ({
    get matches() {
      return query.includes('prefers-reduced-motion: reduce') ? reduced : false
    },
    media: query,
    addEventListener: (_type, listener) => listeners.add(listener),
    removeEventListener: (_type, listener) => listeners.delete(listener),
    addListener: (listener) => listeners.add(listener),
    removeListener: (listener) => listeners.delete(listener),
  })
  vi.stubGlobal('matchMedia', matchMedia)
  return {
    listeners,
    setReduced(value) {
      reduced = value
      for (const listener of listeners) listener({ matches: value })
    },
  }
}

// Installs a ResizeObserver that reports `size` for every observed element right away, and makes
// getBoundingClientRect return that size. Charts (recharts ResponsiveContainer) need both to
// render in jsdom. Undo with vi.unstubAllGlobals() and vi.restoreAllMocks().
export function mockResizeObserver({ width = 600, height = 320 } = {}) {
  class FakeResizeObserver {
    constructor(callback) {
      this.callback = callback
    }
    observe(element) {
      this.callback([{ target: element, contentRect: { width, height } }], this)
    }
    unobserve() {}
    disconnect() {}
  }
  vi.stubGlobal('ResizeObserver', FakeResizeObserver)
  vi.spyOn(Element.prototype, 'getBoundingClientRect').mockReturnValue({
    width,
    height,
    top: 0,
    left: 0,
    right: width,
    bottom: height,
    x: 0,
    y: 0,
    toJSON: () => ({}),
  })
}

// Makes every element report `scrollWidth` and `clientWidth`, so overflow checks see a table
// wider than its container. Also installs a ResizeObserver stub. Undo with vi.restoreAllMocks()
// and vi.unstubAllGlobals().
export function mockOverflow({ scrollWidth = 900, clientWidth = 320 } = {}) {
  vi.spyOn(Element.prototype, 'scrollWidth', 'get').mockReturnValue(scrollWidth)
  vi.spyOn(Element.prototype, 'clientWidth', 'get').mockReturnValue(clientWidth)
  class FakeResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  vi.stubGlobal('ResizeObserver', FakeResizeObserver)
}

// Installs matchMedia for a viewport `width` px wide: min-width and max-width queries (px or rem,
// 16px each) match against it, prefers-reduced-motion reports `reducedMotion`, anything else
// false. Use it to render the small-screen layout of responsive patterns.
export function mockViewport(width, { reducedMotion = false } = {}) {
  const toPx = (value, unit) => (unit === 'rem' || unit === 'em' ? value * 16 : value)
  const matches = (query) => {
    if (query.includes('prefers-reduced-motion: reduce')) return reducedMotion
    const conditions = [...query.matchAll(/\((min|max)-width:\s*([\d.]+)(px|rem|em)\)/g)]
    if (conditions.length === 0) return false
    return conditions.every(([, kind, value, unit]) => {
      const px = toPx(Number(value), unit)
      return kind === 'min' ? width >= px : width <= px
    })
  }
  vi.stubGlobal('matchMedia', (query) => ({
    matches: matches(query),
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
  }))
}
