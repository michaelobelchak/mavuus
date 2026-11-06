import { describe, it, expect, afterEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { mockViewport } from '../test/browserMocks'
import { useMediaQuery } from './useMediaQuery'

function Probe({ fallback }) {
  return <p>{useMediaQuery('(min-width: 48rem)', fallback) ? 'wide' : 'narrow'}</p>
}

afterEach(() => vi.unstubAllGlobals())

describe('useMediaQuery', () => {
  it('should match when the viewport meets the query', () => {
    mockViewport(1024)
    render(<Probe />)
    expect(screen.getByText('wide')).toBeInTheDocument()
  })

  it('should not match when the viewport is narrower', () => {
    mockViewport(375)
    render(<Probe />)
    expect(screen.getByText('narrow')).toBeInTheDocument()
  })

  it('should return the fallback when matchMedia is missing', () => {
    vi.stubGlobal('matchMedia', undefined)
    render(<Probe fallback />)
    expect(screen.getByText('wide')).toBeInTheDocument()
  })
})
