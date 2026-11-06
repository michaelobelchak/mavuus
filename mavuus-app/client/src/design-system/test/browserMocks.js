import { vi } from 'vitest'

/**
 * Test helpers for browser APIs jsdom lacks. Call inside a test; undo with vi.unstubAllGlobals().
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
export function mockReducedMotion(reduced) {
  const listeners = new Set()
  const matchMedia = (query) => ({
    matches: query.includes('prefers-reduced-motion: reduce') ? reduced : false,
    media: query,
    addEventListener: (_type, listener) => listeners.add(listener),
    removeEventListener: (_type, listener) => listeners.delete(listener),
    addListener: (listener) => listeners.add(listener),
    removeListener: (listener) => listeners.delete(listener),
  })
  vi.stubGlobal('matchMedia', matchMedia)
  return { listeners }
}
