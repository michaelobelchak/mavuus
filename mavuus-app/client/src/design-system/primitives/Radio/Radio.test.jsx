import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Radio, RadioGroup } from './Radio'

const options = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'never', label: 'Never', disabled: true },
]

describe('RadioGroup', () => {
  it('should render a named radiogroup with one radio per option', () => {
    render(<RadioGroup aria-label="Digest frequency" options={options} defaultValue="weekly" />)
    const group = screen.getByRole('radiogroup', { name: 'Digest frequency' })
    expect(group).toBeInTheDocument()
    expect(screen.getAllByRole('radio')).toHaveLength(3)
    expect(screen.getByRole('radio', { name: 'Weekly' })).toHaveAttribute('aria-checked', 'true')
  })

  it('should select an option and call onValueChange when clicked', () => {
    const onValueChange = vi.fn()
    render(<RadioGroup aria-label="Digest frequency" options={options} onValueChange={onValueChange} />)
    fireEvent.click(screen.getByRole('radio', { name: 'Monthly' }))
    expect(screen.getByRole('radio', { name: 'Monthly' })).toHaveAttribute('aria-checked', 'true')
    expect(onValueChange).toHaveBeenCalledWith('monthly', expect.anything())
  })

  it('should move selection with arrow keys within the group', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(
      <RadioGroup aria-label="Digest frequency" defaultValue="weekly" onValueChange={onValueChange}>
        <Radio value="weekly" label="Weekly" />
        <Radio value="monthly" label="Monthly" />
        <Radio value="quarterly" label="Quarterly" />
      </RadioGroup>,
    )
    const weekly = screen.getByRole('radio', { name: 'Weekly' })
    await user.tab()
    expect(weekly).toHaveFocus()
    await user.keyboard('{ArrowDown}')
    await waitFor(() => expect(screen.getByRole('radio', { name: 'Monthly' })).toHaveAttribute('aria-checked', 'true'))
    expect(screen.getByRole('radio', { name: 'Monthly' })).toHaveFocus()
    expect(onValueChange).toHaveBeenLastCalledWith('monthly', expect.anything())
    await user.keyboard('{ArrowUp}')
    await waitFor(() => expect(weekly).toHaveAttribute('aria-checked', 'true'))
  })

  it('should lay out options in a row and set aria-orientation when orientation is horizontal', () => {
    render(<RadioGroup aria-label="Digest frequency" options={options} orientation="horizontal" />)
    const group = screen.getByRole('radiogroup', { name: 'Digest frequency' })
    expect(group).toHaveAttribute('aria-orientation', 'horizontal')
    expect(group).toHaveClass('flex-row')
  })

  it('should mark a disabled option as disabled', () => {
    render(<RadioGroup aria-label="Digest frequency" options={options} />)
    expect(screen.getByRole('radio', { name: 'Never' })).toHaveAttribute('aria-disabled', 'true')
  })

  it('should select the radio when its label text is clicked', () => {
    render(<RadioGroup aria-label="Digest frequency" options={options} />)
    fireEvent.click(screen.getByText('Monthly'))
    expect(screen.getByRole('radio', { name: 'Monthly' })).toHaveAttribute('aria-checked', 'true')
  })

  it('should set aria-invalid on the group and the error border on each radio when invalid', () => {
    render(
      <RadioGroup aria-label="Plan" invalid>
        <Radio value="free" label="Free" />
        <Radio value="pro" label="Pro" />
      </RadioGroup>,
    )
    expect(screen.getByRole('radiogroup', { name: 'Plan' })).toHaveAttribute('aria-invalid', 'true')
    for (const radio of screen.getAllByRole('radio')) expect(radio).toHaveClass('border-status-error')
  })

  it('should name the group with a visible label when given label', () => {
    render(<RadioGroup label="Digest frequency" options={options} />)
    expect(screen.getByRole('radiogroup', { name: 'Digest frequency' })).toBeInTheDocument()
    expect(screen.getByText('Digest frequency')).toBeVisible()
  })

  it('should set aria-required and add the required marker to the label when required', () => {
    render(<RadioGroup label="Plan" required options={options} />)
    const group = screen.getByRole('radiogroup', { name: 'Plan (required)' })
    expect(group).toHaveAttribute('aria-required', 'true')
    expect(screen.getByText('*')).toHaveAttribute('aria-hidden', 'true')
  })

  it('should use explicit disabled styles when a radio is disabled and checked', () => {
    render(
      <RadioGroup aria-label="Plan" defaultValue="free">
        <Radio value="free" label="Free" disabled />
      </RadioGroup>,
    )
    const radio = screen.getByRole('radio', { name: 'Free' })
    expect(radio).toHaveAttribute('data-checked')
    expect(radio).toHaveAttribute('data-disabled')
    expect(radio).toHaveClass(
      'data-[disabled]:data-[checked]:border-border-default',
      'data-[disabled]:data-[checked]:bg-surface-sunken',
    )
  })

  it('should keep the disabled border over the error border when a radio is disabled in an invalid group', () => {
    render(
      <RadioGroup aria-label="Plan" invalid defaultValue="pro">
        <Radio value="free" label="Free" disabled />
        <Radio value="pro" label="Pro" disabled />
      </RadioGroup>,
    )
    for (const radio of screen.getAllByRole('radio')) {
      expect(radio).toHaveClass(
        'data-[disabled]:border-border-default',
        'data-[disabled]:data-[checked]:border-border-default',
      )
      expect(radio).not.toHaveClass('data-[checked]:border-surface-brand-strong')
    }
  })
})

