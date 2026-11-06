import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Divider } from './Divider'

describe('Divider', () => {
  it('should be a horizontal separator by default', () => {
    render(<Divider />)
    const separator = screen.getByRole('separator')
    expect(separator.tagName).toBe('HR')
    expect(separator).not.toHaveAttribute('aria-orientation')
  })

  it('should set aria-orientation when vertical', () => {
    render(<Divider orientation="vertical" />)
    const separator = screen.getByRole('separator')
    expect(separator).toHaveAttribute('aria-orientation', 'vertical')
    expect(separator).toHaveClass('self-stretch')
  })

  it('should show the label in the middle and name the separator when given label', () => {
    render(<Divider label="or" />)
    const separator = screen.getByRole('separator', { name: 'or' })
    expect(separator).toHaveTextContent('or')
  })

  it('should merge className when given one', () => {
    render(<Divider className="my-ds-lg" />)
    expect(screen.getByRole('separator')).toHaveClass('my-ds-lg', 'border-border-default')
  })
})
