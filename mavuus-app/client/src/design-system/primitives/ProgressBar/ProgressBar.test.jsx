import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ProgressBar } from './ProgressBar'

describe('ProgressBar', () => {
  it('should be a named progressbar with aria-valuenow and aria-valuemax', () => {
    render(<ProgressBar label="Profile complete" value={60} />)
    const bar = screen.getByRole('progressbar', { name: 'Profile complete' })
    expect(bar).toHaveAttribute('aria-valuenow', '60')
    expect(bar).toHaveAttribute('aria-valuemax', '100')
  })

  it('should use the given max', () => {
    render(<ProgressBar label="Steps done" value={2} max={5} />)
    const bar = screen.getByRole('progressbar', { name: 'Steps done' })
    expect(bar).toHaveAttribute('aria-valuenow', '2')
    expect(bar).toHaveAttribute('aria-valuemax', '5')
  })

  it('should keep the label for screen readers only when hideLabel is set', () => {
    render(<ProgressBar label="Upload" hideLabel value={30} />)
    expect(screen.getByRole('progressbar', { name: 'Upload' })).toBeInTheDocument()
    expect(screen.getByText('Upload')).toHaveClass('sr-only')
  })

  it('should show the value when showValue is set', () => {
    render(<ProgressBar label="Profile complete" value={60} showValue />)
    expect(screen.getByText('60%')).toBeInTheDocument()
  })

  it.each([
    ['brand', 'bg-surface-brand-strong'],
    ['success', 'bg-status-success'],
    ['warning', 'bg-status-warning'],
    ['error', 'bg-status-error'],
  ])('should color the indicator when tone is %s', (tone, cls) => {
    const { container } = render(<ProgressBar label="Progress" value={50} tone={tone} />)
    expect(container.querySelector('[data-progress-indicator]')).toHaveClass(cls)
  })

  it.each([
    ['sm', 'h-1'],
    ['md', 'h-2'],
  ])('should size the track when size is %s', (size, cls) => {
    const { container } = render(<ProgressBar label="Progress" value={50} size={size} />)
    expect(container.querySelector('[data-progress-track]')).toHaveClass(cls)
  })
})
