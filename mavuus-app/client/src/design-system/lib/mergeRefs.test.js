import { createRef } from 'react'
import { describe, it, expect, vi } from 'vitest'
import { mergeRefs } from './mergeRefs'

describe('mergeRefs', () => {
  it('should set object refs and call callback refs when attached', () => {
    const objectRef = createRef()
    const callbackRef = vi.fn()
    const node = {}
    mergeRefs(objectRef, callbackRef, null, undefined)(node)
    expect(objectRef.current).toBe(node)
    expect(callbackRef).toHaveBeenCalledWith(node)
  })

  it('should clear object refs and null callback refs when the cleanup runs', () => {
    const objectRef = createRef()
    const callbackRef = vi.fn()
    const cleanup = mergeRefs(objectRef, callbackRef)({})
    cleanup()
    expect(objectRef.current).toBeNull()
    expect(callbackRef).toHaveBeenLastCalledWith(null)
  })

  it('should run a callback ref cleanup instead of calling it with null when it returns one', () => {
    const inner = vi.fn()
    const callbackRef = vi.fn(() => inner)
    const cleanup = mergeRefs(callbackRef)({})
    cleanup()
    expect(inner).toHaveBeenCalledTimes(1)
    expect(callbackRef).toHaveBeenCalledTimes(1)
  })
})
