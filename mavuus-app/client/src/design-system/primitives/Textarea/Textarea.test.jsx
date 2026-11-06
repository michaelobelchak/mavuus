import { createRef } from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Textarea } from './Textarea'

describe('Textarea', () => {
  it('should set aria-invalid and the error border when invalid', () => {
    render(<Textarea aria-label="Bio" invalid />)
    const textarea = screen.getByRole('textbox', { name: 'Bio' })
    expect(textarea).toHaveAttribute('aria-invalid', 'true')
    expect(textarea).toHaveClass('border-status-error')
  })

  it('should update style height to the content height on input when autoGrow is on', () => {
    const onInput = vi.fn()
    render(<Textarea aria-label="Bio" autoGrow onInput={onInput} />)
    const textarea = screen.getByRole('textbox', { name: 'Bio' })
    Object.defineProperty(textarea, 'scrollHeight', { configurable: true, value: 180 })
    fireEvent.input(textarea, { target: { value: 'Line one\nLine two\nLine three\nLine four' } })
    expect(textarea.style.height).toBe('180px')
    expect(onInput).toHaveBeenCalledTimes(1)
  })

  it('should leave style height alone when autoGrow is off', () => {
    render(<Textarea aria-label="Bio" />)
    const textarea = screen.getByRole('textbox', { name: 'Bio' })
    Object.defineProperty(textarea, 'scrollHeight', { configurable: true, value: 180 })
    fireEvent.input(textarea, { target: { value: 'More text' } })
    expect(textarea.style.height).toBe('')
  })

  it('should forward ref to the textarea when autoGrow is on', () => {
    const ref = createRef()
    render(<Textarea aria-label="Bio" autoGrow ref={ref} />)
    expect(ref.current).toBe(screen.getByRole('textbox', { name: 'Bio' }))
  })

  it('should call onChange with the new value when typed into', () => {
    const onChange = vi.fn()
    render(<Textarea aria-label="Bio" onChange={(event) => onChange(event.target.value)} />)
    fireEvent.change(screen.getByRole('textbox', { name: 'Bio' }), { target: { value: 'Hello' } })
    expect(onChange).toHaveBeenCalledWith('Hello')
  })
})
