import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { RequiredMark } from './RequiredMark'

describe('RequiredMark', () => {
  it('should render a hidden asterisk and sr-only required text when rendered', () => {
    render(
      <label htmlFor="email">
        Email
        <RequiredMark />
        <input id="email" />
      </label>,
    )
    expect(screen.getByText('*')).toHaveAttribute('aria-hidden', 'true')
    expect(screen.getByText('*')).toHaveClass('text-status-error')
    expect(screen.getByText('(required)')).toHaveClass('sr-only')
    expect(screen.getByRole('textbox', { name: 'Email (required)' })).toBeInTheDocument()
  })
})
