import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Spinner } from './Spinner'

describe('Spinner', () => {
  it('should be a status named Loading by default', () => {
    render(<Spinner />)
    const status = screen.getByRole('status', { name: 'Loading' })
    expect(status.querySelector('svg')).toHaveAttribute('aria-hidden', 'true')
    expect(screen.getByText('Loading')).toHaveClass('sr-only')
  })

  it('should use the given label as its accessible name', () => {
    render(<Spinner label="Loading messages" />)
    expect(screen.getByRole('status', { name: 'Loading messages' })).toBeInTheDocument()
  })

  it('should spin unless the user prefers reduced motion', () => {
    render(<Spinner />)
    expect(screen.getByRole('status').querySelector('svg')).toHaveClass('animate-spin', 'motion-reduce:animate-none')
  })

  it.each([
    ['sm', 'size-4'],
    ['md', 'size-5'],
    ['lg', 'size-6'],
  ])('should use the icon size scale when size is %s', (size, cls) => {
    render(<Spinner size={size} />)
    expect(screen.getByRole('status').querySelector('svg')).toHaveClass(cls)
  })
})
