import { createRef, useState } from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Search } from 'lucide-react'
import { Input } from './Input'

describe('Input', () => {
  it('should set aria-invalid and the error border when invalid', () => {
    render(<Input aria-label="Email" invalid />)
    const input = screen.getByRole('textbox', { name: 'Email' })
    expect(input).toHaveAttribute('aria-invalid', 'true')
    expect(input).toHaveClass('border-status-error')
    expect(input).not.toHaveClass('border-border-default')
  })

  it('should not set aria-invalid when valid', () => {
    render(<Input aria-label="Email" />)
    expect(screen.getByRole('textbox', { name: 'Email' })).not.toHaveAttribute('aria-invalid')
  })

  it('should forward value and onChange when controlled', () => {
    const onChange = vi.fn()
    function Controlled() {
      const [value, setValue] = useState('Ana')
      return (
        <Input
          aria-label="Name"
          value={value}
          onChange={(event) => {
            onChange(event.target.value)
            setValue(event.target.value)
          }}
        />
      )
    }
    render(<Controlled />)
    const input = screen.getByRole('textbox', { name: 'Name' })
    expect(input).toHaveValue('Ana')
    fireEvent.change(input, { target: { value: 'Anna' } })
    expect(onChange).toHaveBeenCalledWith('Anna')
    expect(input).toHaveValue('Anna')
  })

  it('should forward ref to the input element when given ref', () => {
    const ref = createRef()
    render(<Input aria-label="Name" ref={ref} />)
    expect(ref.current).toBe(screen.getByRole('textbox', { name: 'Name' }))
  })

  it('should render the leading icon and trailing slot when given both', () => {
    render(<Input aria-label="Search" type="search" leadingIcon={Search} trailing={<span>Cmd K</span>} />)
    const input = screen.getByRole('searchbox', { name: 'Search' })
    expect(input).toHaveClass('pl-ds-xxl', 'pr-ds-xxl')
    expect(input.parentElement.querySelector('svg')).toHaveAttribute('aria-hidden', 'true')
    expect(screen.getByText('Cmd K')).toBeInTheDocument()
  })

  it('should be 40px tall when size is sm', () => {
    render(<Input aria-label="Name" size="sm" />)
    expect(screen.getByRole('textbox', { name: 'Name' })).toHaveClass('h-10')
  })
})
