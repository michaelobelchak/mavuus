import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { Button } from './Button'

describe('Button', () => {
  it('should call onClick when pressed', () => {
    const onClick = vi.fn()
    render(<Button onClick={onClick}>Save</Button>)
    const button = screen.getByRole('button', { name: 'Save' })
    expect(button).toHaveAttribute('type', 'button')
    fireEvent.click(button)
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('should not fire and should be disabled (aria-busy="true") when loading', () => {
    const onClick = vi.fn()
    render(
      <Button loading onClick={onClick}>
        Save
      </Button>,
    )
    const button = screen.getByRole('button', { name: 'Save' })
    expect(button).toBeDisabled()
    expect(button).toHaveAttribute('aria-busy', 'true')
    fireEvent.click(button)
    expect(onClick).not.toHaveBeenCalled()
  })

  it('should render a router link when given to', () => {
    render(
      <MemoryRouter>
        <Button to="/jobs">Browse jobs</Button>
      </MemoryRouter>,
    )
    const link = screen.getByRole('link', { name: 'Browse jobs' })
    expect(link).toHaveAttribute('href', '/jobs')
  })

  it('should render an anchor when given href', () => {
    render(<Button href="https://example.com/guide">Read the guide</Button>)
    const link = screen.getByRole('link', { name: 'Read the guide' })
    expect(link.tagName).toBe('A')
    expect(link).toHaveAttribute('href', 'https://example.com/guide')
  })

  it('should merge className and spread props when given extra props', () => {
    render(
      <Button className="px-ds-sm" data-testid="btn" variant="outline" size="sm">
        Edit
      </Button>,
    )
    const button = screen.getByTestId('btn')
    expect(button.className).toContain('px-ds-sm')
    expect(button.className).not.toContain('px-ds-md')
    expect(button.className).toContain('border-border-strong')
  })
})
