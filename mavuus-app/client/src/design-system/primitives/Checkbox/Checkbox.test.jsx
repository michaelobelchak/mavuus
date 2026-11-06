import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { Checkbox } from './Checkbox'

function pressSpace(element) {
  act(() => element.focus())
  fireEvent.keyDown(element, { key: ' ' })
  fireEvent.keyUp(element, { key: ' ' })
}

describe('Checkbox', () => {
  it('should toggle and call onCheckedChange when clicked', () => {
    const onCheckedChange = vi.fn()
    render(<Checkbox label="Open to mentoring" onCheckedChange={onCheckedChange} />)
    const box = screen.getByRole('checkbox', { name: 'Open to mentoring' })
    expect(box).toHaveAttribute('aria-checked', 'false')
    fireEvent.click(box)
    expect(box).toHaveAttribute('aria-checked', 'true')
    expect(onCheckedChange).toHaveBeenCalledWith(true, expect.anything())
  })

  it('should toggle when Space is pressed', () => {
    render(<Checkbox label="Open to mentoring" />)
    const box = screen.getByRole('checkbox', { name: 'Open to mentoring' })
    pressSpace(box)
    expect(box).toHaveAttribute('aria-checked', 'true')
  })

  it('should toggle when the label text is clicked', () => {
    render(<Checkbox label="Open to mentoring" />)
    fireEvent.click(screen.getByText('Open to mentoring'))
    expect(screen.getByRole('checkbox', { name: 'Open to mentoring' })).toHaveAttribute('aria-checked', 'true')
  })

  it('should follow the checked prop when controlled', () => {
    const { rerender } = render(<Checkbox label="Remote only" checked={false} onCheckedChange={() => {}} />)
    const box = screen.getByRole('checkbox', { name: 'Remote only' })
    fireEvent.click(box)
    expect(box).toHaveAttribute('aria-checked', 'false')
    rerender(<Checkbox label="Remote only" checked onCheckedChange={() => {}} />)
    expect(box).toHaveAttribute('aria-checked', 'true')
  })

  it('should report mixed when indeterminate', () => {
    render(<Checkbox label="Select all" indeterminate />)
    expect(screen.getByRole('checkbox', { name: 'Select all' })).toHaveAttribute('aria-checked', 'mixed')
  })

  it('should not toggle when disabled', () => {
    render(<Checkbox label="Open to mentoring" disabled />)
    const box = screen.getByRole('checkbox', { name: 'Open to mentoring' })
    fireEvent.click(box)
    expect(box).toHaveAttribute('aria-checked', 'false')
    expect(box).toHaveAttribute('aria-disabled', 'true')
  })

  it('should use the brand-strong fill and a 20px tag-radius box when rendered', () => {
    render(<Checkbox aria-label="Select row" defaultChecked />)
    const box = screen.getByRole('checkbox', { name: 'Select row' })
    expect(box).toHaveClass('size-5', 'rounded-tag', 'data-[checked]:bg-surface-brand-strong')
    expect(box).toHaveAttribute('data-checked')
  })
})
