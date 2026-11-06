import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Checkbox } from './Checkbox'

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

  it('should toggle when Space is pressed', async () => {
    const user = userEvent.setup()
    render(<Checkbox label="Open to mentoring" />)
    const box = screen.getByRole('checkbox', { name: 'Open to mentoring' })
    await user.tab()
    expect(box).toHaveFocus()
    await user.keyboard(' ')
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

  it('should set aria-invalid and the error border when invalid', () => {
    render(<Checkbox label="Accept the terms" invalid />)
    const box = screen.getByRole('checkbox', { name: 'Accept the terms' })
    expect(box).toHaveAttribute('aria-invalid', 'true')
    expect(box).toHaveClass('border-status-error', 'data-[checked]:border-status-error')
    expect(box).not.toHaveClass('data-[checked]:border-surface-brand-strong')
  })

  it('should treat a truthy aria-invalid like invalid', () => {
    render(<Checkbox label="Accept the terms" aria-invalid="true" />)
    expect(screen.getByRole('checkbox', { name: 'Accept the terms' })).toHaveClass('border-status-error')
  })

  it('should use explicit disabled styles when disabled and indeterminate', () => {
    render(<Checkbox label="Select all" indeterminate disabled />)
    const box = screen.getByRole('checkbox', { name: 'Select all' })
    expect(box).toHaveAttribute('data-indeterminate')
    expect(box).toHaveAttribute('data-disabled')
    expect(box).toHaveClass(
      'data-[disabled]:data-[indeterminate]:bg-surface-sunken',
      'data-[disabled]:data-[indeterminate]:border-border-default',
      'data-[disabled]:data-[indeterminate]:text-text-disabled',
    )
    expect(box.querySelector('svg')).toHaveClass('lucide-minus')
  })
})
