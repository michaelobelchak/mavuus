import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { resetWarnings } from '../../lib/warnOnce'
import { Divider } from './Divider'

afterEach(() => {
  vi.restoreAllMocks()
  resetWarnings()
})

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

  it('should warn when label is passed with a vertical divider', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})
    render(<Divider orientation="vertical" label="or" />)
    expect(error).toHaveBeenCalledWith(expect.stringMatching(/Divider.*label.*vertical/))
  })
})
