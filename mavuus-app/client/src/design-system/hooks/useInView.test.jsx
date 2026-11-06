import { useRef } from 'react'
import { describe, it, expect, afterEach, vi } from 'vitest'
import { act, render, screen } from '@testing-library/react'
import { mockIntersectionObserver } from '../test/browserMocks'
import { useInView } from './useInView'

function Probe() {
  const ref = useRef(null)
  const inView = useInView(ref)
  return (
    <div ref={ref} data-testid="probe">
      {inView ? 'in view' : 'waiting'}
    </div>
  )
}

afterEach(() => vi.unstubAllGlobals())

describe('useInView', () => {
  it('should become true once the element intersects and stay true', () => {
    const io = mockIntersectionObserver()
    render(<Probe />)
    expect(screen.getByTestId('probe')).toHaveTextContent('waiting')
    act(() => io.intersect(screen.getByTestId('probe')))
    expect(screen.getByTestId('probe')).toHaveTextContent('in view')
    act(() => io.intersect(screen.getByTestId('probe'), false))
    expect(screen.getByTestId('probe')).toHaveTextContent('in view')
  })

  it('should be true right away when IntersectionObserver is missing', () => {
    vi.stubGlobal('IntersectionObserver', undefined)
    render(<Probe />)
    expect(screen.getByTestId('probe')).toHaveTextContent('in view')
  })
})
