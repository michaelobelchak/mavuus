import { createRef, useState } from 'react'
import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Mail, Search } from 'lucide-react'
import { resetWarnings } from '../../lib/warnOnce'
import { Input } from './Input'

afterEach(() => {
  vi.restoreAllMocks()
  resetWarnings()
})

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

  it('should pass aria-invalid="false" through and keep the default border when given it', () => {
    render(<Input aria-label="Email" aria-invalid="false" />)
    const input = screen.getByRole('textbox', { name: 'Email' })
    expect(input).toHaveAttribute('aria-invalid', 'false')
    expect(input).toHaveClass('border-border-default')
  })

  it('should treat a truthy aria-invalid like invalid when given it without invalid', () => {
    render(<Input aria-label="Email" aria-invalid="true" />)
    expect(screen.getByRole('textbox', { name: 'Email' })).toHaveClass('border-status-error')
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

  it('should render a decorative trailingIcon when given one', () => {
    render(<Input aria-label="Email" trailingIcon={Mail} />)
    const input = screen.getByRole('textbox', { name: 'Email' })
    expect(input).toHaveClass('pr-ds-xxl')
    const icon = input.parentElement.querySelector('svg')
    expect(icon).toHaveAttribute('aria-hidden', 'true')
    expect(icon).toHaveClass('size-5')
  })

  it('should apply wrapperClassName to the wrapper only when a slot renders', () => {
    const { container, rerender } = render(<Input aria-label="Search" leadingIcon={Search} wrapperClassName="max-w-sm" />)
    const input = screen.getByRole('textbox', { name: 'Search' })
    expect(input.parentElement).toHaveClass('relative', 'max-w-sm')
    expect(input).not.toHaveClass('max-w-sm')
    rerender(<Input aria-label="Search" wrapperClassName="max-w-sm" />)
    expect(container.querySelector('.max-w-sm')).toBeNull()
  })

  it.each([
    ['sm', 'h-10'],
    ['md', 'h-12'],
    ['lg', 'h-14'],
    ['huge', 'h-12'],
  ])('should use the control height scale when size is %s', (size, height) => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    render(<Input aria-label="Name" size={size} />)
    expect(screen.getByRole('textbox', { name: 'Name' })).toHaveClass(height)
  })
})
