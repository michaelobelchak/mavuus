import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Bell } from 'lucide-react'
import { IconButton } from './IconButton'

afterEach(() => {
  vi.restoreAllMocks()
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

  it('should be a 44px square when size is md', () => {
    render(<IconButton icon={Bell} aria-label="Notifications" />)
    const button = screen.getByRole('button', { name: 'Notifications' })
    expect(button.className).toContain('size-11')
    expect(button.className).not.toContain('h-12')
  })
})
