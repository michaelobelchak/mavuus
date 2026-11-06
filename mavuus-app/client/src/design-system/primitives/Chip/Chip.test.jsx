import { useState } from 'react'
import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Chip } from './Chip'

function ControlledChip() {
  const [selected, setSelected] = useState(false)
  return (
    <Chip selected={selected} onClick={() => setSelected((s) => !s)}>
      Remote
    </Chip>
  )
}

describe('Chip', () => {
  it('should toggle aria-pressed when clicked in a controlled parent', () => {
    render(<ControlledChip />)
    const chip = screen.getByRole('button', { name: 'Remote' })
    expect(chip).toHaveAttribute('aria-pressed', 'false')
    fireEvent.click(chip)
    expect(chip).toHaveAttribute('aria-pressed', 'true')
    expect(chip).toHaveClass('bg-surface-selected', 'border-border-brand')
    fireEvent.click(chip)
    expect(chip).toHaveAttribute('aria-pressed', 'false')
    expect(chip).not.toHaveClass('bg-surface-selected')
  })

  it('should be a pill button with type button when rendered', () => {
    render(<Chip>Design</Chip>)
    const chip = screen.getByRole('button', { name: 'Design' })
    expect(chip).toHaveAttribute('type', 'button')
    expect(chip).toHaveClass('rounded-chip')
  })

  it('should be at least 44px tall when size is md', () => {
    render(<Chip>Design</Chip>)
    expect(screen.getByRole('button', { name: 'Design' })).toHaveClass('h-11')
  })
})
