import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Bell } from 'lucide-react'
import { resetWarnings } from '../../lib/warnOnce'
import { IconButton } from './IconButton'

afterEach(() => {
  vi.restoreAllMocks()
  resetWarnings()
})

describe('IconButton', () => {
  it('should render a button with an accessible name when given aria-label', () => {
    const onClick = vi.fn()
    render(<IconButton icon={Bell} aria-label="Notifications" onClick={onClick} />)
    const button = screen.getByRole('button', { name: 'Notifications' })
    expect(button).toHaveAttribute('type', 'button')
    expect(button.querySelector('svg')).toHaveAttribute('aria-hidden', 'true')
    fireEvent.click(button)
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('should log a console.error warning when aria-label is missing', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})
    render(<IconButton icon={Bell} />)
    expect(error).toHaveBeenCalledWith(expect.stringContaining('aria-label'))
  })

  it('should not warn when aria-label is given', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})
    render(<IconButton icon={Bell} aria-label="Notifications" />)
    expect(error).not.toHaveBeenCalled()
  })

  it('should not warn when aria-labelledby is given instead of aria-label', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})
    render(
      <>
        <span id="bell-label">Notifications</span>
        <IconButton icon={Bell} aria-labelledby="bell-label" />
      </>,
    )
    expect(error).not.toHaveBeenCalled()
    expect(screen.getByRole('button', { name: 'Notifications' })).toBeInTheDocument()
  })

  it.each([
    ['sm', 'size-10'],
    ['md', 'size-12'],
    ['lg', 'size-14'],
    ['huge', 'size-12'],
    ['xs', 'size-10'],
  ])('should be a square on the control scale when size is %s', (size, square) => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    render(<IconButton icon={Bell} aria-label="Notifications" size={size} />)
    const button = screen.getByRole('button', { name: 'Notifications' })
    expect(button).toHaveClass(square)
    expect(button.className).not.toMatch(/\bh-\d/)
  })
})
