import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useControllableState } from './useControllableState'

function Counter({ value, defaultValue = 0, onChange }) {
  const [count, setCount, controlled] = useControllableState(value, defaultValue, onChange)
  return (
    <button type="button" data-controlled={String(controlled)} onClick={() => setCount(count + 1)}>
      {count}
    </button>
  )
}

describe('useControllableState', () => {
  it('should keep its own state and report changes when uncontrolled', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<Counter defaultValue={2} onChange={onChange} />)
    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('data-controlled', 'false')
    await user.click(button)
    expect(button).toHaveTextContent('3')
    expect(onChange).toHaveBeenCalledWith(3)
  })

  it('should follow the value and only report changes when controlled', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<Counter value={5} onChange={onChange} />)
    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('data-controlled', 'true')
    await user.click(button)
    expect(button).toHaveTextContent('5')
    expect(onChange).toHaveBeenCalledWith(6)
  })
})
