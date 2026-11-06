import { useState } from 'react'
import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Check, X } from 'lucide-react'
import { resetWarnings } from '../../lib/warnOnce'
import { Chip } from './Chip'

afterEach(() => {
  vi.restoreAllMocks()
  resetWarnings()
})

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

  it.each([
    ['xs', 'h-8'],
    ['sm', 'h-10'],
    [undefined, 'h-10'],
    ['md', 'h-10'],
  ])('should use the control height scale when size is %s', (size, height) => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    render(<Chip size={size}>Design</Chip>)
    expect(screen.getByRole('button', { name: 'Design' })).toHaveClass(height)
  })

  it('should warn when size is md, which chips do not support', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})
    render(<Chip size="md">Design</Chip>)
    expect(error).toHaveBeenCalledWith(expect.stringMatching(/Chip.*"md"/))
  })

  it('should render decorative icons when given leadingIcon and trailingIcon', () => {
    render(
      <Chip selected leadingIcon={Check} trailingIcon={X}>
        Remote
      </Chip>,
    )
    const icons = screen.getByRole('button', { name: 'Remote' }).querySelectorAll('svg')
    expect(icons).toHaveLength(2)
    for (const icon of icons) expect(icon).toHaveAttribute('aria-hidden', 'true')
  })
})
