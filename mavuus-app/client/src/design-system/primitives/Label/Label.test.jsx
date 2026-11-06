import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Input } from '../Input'
import { Label } from './Label'

describe('Label', () => {
  it('should name the input it points at when given htmlFor', () => {
    render(
      <>
        <Label htmlFor="email">Email</Label>
        <Input id="email" />
      </>,
    )
    expect(screen.getByRole('textbox', { name: 'Email' })).toBeInTheDocument()
  })

  it('should show a hidden asterisk and sr-only required text when required', () => {
    render(
      <>
        <Label htmlFor="email" required>
          Email
        </Label>
        <Input id="email" />
      </>,
    )
    expect(screen.getByText('*')).toHaveAttribute('aria-hidden', 'true')
    expect(screen.getByText('(required)')).toHaveClass('sr-only')
    expect(screen.getByRole('textbox', { name: 'Email (required)' })).toBeInTheDocument()
  })

  it('should not add required text when not required', () => {
    render(<Label htmlFor="email">Email</Label>)
    expect(screen.queryByText('(required)')).toBeNull()
  })

  it('should use body-sm semibold primary text and merge className', () => {
    render(
      <Label htmlFor="email" className="mb-ds-xs">
        Email
      </Label>,
    )
    expect(screen.getByText('Email')).toHaveClass('text-body-sm', 'font-semibold', 'text-text-primary', 'mb-ds-xs')
  })
})
