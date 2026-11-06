import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { ArrowRight, Plus } from 'lucide-react'
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

  it('should not fire and should be aria-disabled (aria-busy="true") when loading', () => {
    const onClick = vi.fn()
    render(
      <Button loading onClick={onClick}>
        Save
      </Button>,
    )
    const button = screen.getByRole('button', { name: /Save/ })
    expect(button).not.toBeDisabled()
    expect(button).toHaveAttribute('aria-disabled', 'true')
    expect(button).toHaveAttribute('aria-busy', 'true')
    fireEvent.click(button)
    expect(onClick).not.toHaveBeenCalled()
  })

  it('should announce Loading with sr-only text when loading', () => {
    render(<Button loading>Save</Button>)
    expect(screen.getByText('Loading')).toHaveClass('sr-only')
    expect(screen.getByRole('button', { name: 'Loading Save' })).toBeInTheDocument()
  })

  it('should keep focus on the button when loading flips to true', () => {
    const { rerender } = render(<Button>Save</Button>)
    const button = screen.getByRole('button', { name: 'Save' })
    button.focus()
    expect(button).toHaveFocus()
    rerender(<Button loading>Save</Button>)
    expect(button).toHaveFocus()
  })

  it('should not submit the form when a loading submit button is clicked', () => {
    const onSubmit = vi.fn((event) => event.preventDefault())
    render(
      <form onSubmit={onSubmit}>
        <Button type="submit" loading>
          Send
        </Button>
      </form>,
    )
    fireEvent.click(screen.getByRole('button', { name: /Send/ }))
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('should be natively disabled when given disabled', () => {
    const onClick = vi.fn()
    render(
      <Button disabled onClick={onClick}>
        Save
      </Button>,
    )
    const button = screen.getByRole('button', { name: 'Save' })
    expect(button).toBeDisabled()
    fireEvent.click(button)
    expect(onClick).not.toHaveBeenCalled()
  })

  it('should render a router link when given to', () => {
    render(
      <MemoryRouter>
        <Button to="/jobs">Browse jobs</Button>
      </MemoryRouter>,
    )
    expect(screen.getByRole('link', { name: 'Browse jobs' })).toHaveAttribute('href', '/jobs')
  })

  it('should render an anchor when given href', () => {
    render(<Button href="/guide">Read the guide</Button>)
    const link = screen.getByRole('link', { name: 'Read the guide' })
    expect(link.tagName).toBe('A')
    expect(link).toHaveAttribute('href', '/guide')
    expect(link).not.toHaveAttribute('target')
  })

  it('should open in a new tab with rel and screen reader text when href is external, like Link', () => {
    render(<Button href="https://mavuus.com/events">See events</Button>)
    const link = screen.getByRole('link', { name: 'See events (opens in a new tab)' })
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('should set aria-disabled, leave the tab order and block navigation when a link is disabled', () => {
    const onClick = vi.fn()
    render(
      <Button href="/jobs" disabled onClick={onClick}>
        Browse jobs
      </Button>,
    )
    const link = screen.getByRole('link', { name: 'Browse jobs' })
    expect(link).toHaveAttribute('aria-disabled', 'true')
    expect(link).toHaveAttribute('tabindex', '-1')
    const event = fireEvent.click(link)
    expect(event).toBe(false)
    expect(onClick).not.toHaveBeenCalled()
  })

  it('should render leading and trailing icons as decorative when given leadingIcon and trailingIcon', () => {
    render(
      <Button leadingIcon={Plus} trailingIcon={ArrowRight}>
        Post a job
      </Button>,
    )
    const icons = screen.getByRole('button', { name: 'Post a job' }).querySelectorAll('svg')
    expect(icons).toHaveLength(2)
    for (const icon of icons) {
      expect(icon).toHaveAttribute('aria-hidden', 'true')
      expect(icon).toHaveClass('size-5')
    }
  })

  it('should replace the leading icon with the spinner when loading', () => {
    render(
      <Button leadingIcon={Plus} loading>
        Post a job
      </Button>,
    )
    const icons = screen.getByRole('button', { name: /Post a job/ }).querySelectorAll('svg')
    expect(icons).toHaveLength(1)
    expect(icons[0]).toHaveClass('animate-spin')
  })

  it('should use the control height scale and fall back to md when size is unknown', () => {
    render(
      <>
        <Button size="sm">Small</Button>
        <Button size="huge">Fallback</Button>
      </>,
    )
    expect(screen.getByRole('button', { name: 'Small' })).toHaveClass('h-10')
    expect(screen.getByRole('button', { name: 'Fallback' })).toHaveClass('h-12')
  })

  it('should merge className and spread props when given extra props', () => {
    render(
      <Button className="px-ds-sm" data-testid="btn" variant="outline" size="sm">
        Edit
      </Button>,
    )
    const button = screen.getByTestId('btn')
    expect(button).toHaveClass('px-ds-sm', 'border-border-strong')
    expect(button).not.toHaveClass('px-ds-md')
  })
})
