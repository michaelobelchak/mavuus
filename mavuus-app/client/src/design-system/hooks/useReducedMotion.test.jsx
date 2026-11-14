import { describe, it, expect, afterEach, vi } from 'vitest'
import { act, render, screen } from '@testing-library/react'
import { mockReducedMotion } from '../test/browserMocks'
import { useReducedMotion } from './useReducedMotion'

function Probe() {
  return <p>{useReducedMotion() ? 'reduced' : 'full'}</p>
}

afterEach(() => vi.unstubAllGlobals())

describe('useReducedMotion', () => {
  it('should be true when the user prefers reduced motion', () => {
    mockReducedMotion(true)
    render(<Probe />)
    expect(screen.getByText('reduced')).toBeInTheDocument()
  })

  it('should be false when the user has no preference', () => {
    mockReducedMotion(false)
    render(<Probe />)
    expect(screen.getByText('full')).toBeInTheDocument()
  })

  it('should be false when matchMedia is missing', () => {
    vi.stubGlobal('matchMedia', undefined)
    render(<Probe />)
    expect(screen.getByText('full')).toBeInTheDocument()
  })

  it('should update when the reduced motion setting changes', () => {
    const media = mockReducedMotion(false)
    render(<Probe />)
    expect(screen.getByText('full')).toBeInTheDocument()
    act(() => media.setReduced(true))
    expect(screen.getByText('reduced')).toBeInTheDocument()
    act(() => media.setReduced(false))
    expect(screen.getByText('full')).toBeInTheDocument()
  })
})
