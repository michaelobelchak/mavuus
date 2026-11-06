import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Switch } from './Switch'

describe('Switch', () => {
  it('should be a switch with aria-checked that toggles when clicked', () => {
    const onCheckedChange = vi.fn()
    render(<Switch label="Email notifications" onCheckedChange={onCheckedChange} />)
    const toggle = screen.getByRole('switch', { name: 'Email notifications' })
    expect(toggle).toHaveAttribute('aria-checked', 'false')
    fireEvent.click(toggle)
    expect(toggle).toHaveAttribute('aria-checked', 'true')
    expect(onCheckedChange).toHaveBeenCalledWith(true, expect.anything())
  })

  it('should toggle when the label text is clicked', () => {
    render(<Switch label="Email notifications" defaultChecked />)
    fireEvent.click(screen.getByText('Email notifications'))
    expect(screen.getByRole('switch', { name: 'Email notifications' })).toHaveAttribute('aria-checked', 'false')
  })

  it('should follow the checked prop when controlled', () => {
    const { rerender } = render(<Switch aria-label="Public profile" checked={false} onCheckedChange={() => {}} />)
    const toggle = screen.getByRole('switch', { name: 'Public profile' })
    fireEvent.click(toggle)
    expect(toggle).toHaveAttribute('aria-checked', 'false')
    rerender(<Switch aria-label="Public profile" checked onCheckedChange={() => {}} />)
    expect(toggle).toHaveAttribute('aria-checked', 'true')
  })

  it('should not toggle when disabled', () => {
    render(<Switch label="Email notifications" disabled />)
    const toggle = screen.getByRole('switch', { name: 'Email notifications' })
    fireEvent.click(toggle)
    expect(toggle).toHaveAttribute('aria-checked', 'false')
  })

  it('should use a 44 by 24 track when rendered', () => {
    render(<Switch aria-label="Public profile" />)
    expect(screen.getByRole('switch', { name: 'Public profile' })).toHaveClass('w-11', 'h-6')
  })
})
