import { describe, it, expect, vi, afterEach } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { resetWarnings } from '../../lib/warnOnce'
import { Alert } from './Alert'
import { Banner } from './Banner'

afterEach(() => {
  vi.restoreAllMocks()
  resetWarnings()
})

describe('Alert', () => {
  it.each([
    ['info', 'status'],
    ['success', 'status'],
    ['warning', 'alert'],
    ['error', 'alert'],
  ])('should use role %s -> %s', (tone, role) => {
    render(<Alert tone={tone} title="Heads up" />)
    expect(screen.getByRole(role)).toHaveTextContent('Heads up')
  })

  it('should default to the info tone with a status role', () => {
    render(<Alert title="Profile saved" />)
    expect(screen.getByRole('status')).toHaveClass('bg-status-info-subtle')
  })

  it('should render the title, description and a decorative tone icon', () => {
    render(<Alert tone="error" title="Payment failed" description="Update your card to keep your plan." />)
    const alert = screen.getByRole('alert')
    expect(alert).toHaveTextContent('Payment failed')
    expect(alert).toHaveTextContent('Update your card to keep your plan.')
    expect(alert.querySelector('svg')).toHaveAttribute('aria-hidden', 'true')
    expect(alert).toHaveClass('bg-status-error-subtle', 'rounded-card')
  })

  it('should call onDismiss when the dismiss button is clicked', () => {
    const onDismiss = vi.fn()
    render(<Alert title="Saved" onDismiss={onDismiss} />)
    fireEvent.click(screen.getByRole('button', { name: 'Dismiss' }))
    expect(onDismiss).toHaveBeenCalledTimes(1)
  })

  it('should not render a dismiss button without onDismiss', () => {
    render(<Alert title="Saved" />)
    expect(screen.queryByRole('button')).toBeNull()
  })

  it('should take a custom dismiss label', () => {
    render(<Alert title="Saved" onDismiss={() => {}} dismissLabel="Close notice" />)
    expect(screen.getByRole('button', { name: 'Close notice' })).toBeInTheDocument()
  })

  it('should warn and fall back to info when the tone is unknown', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})
    render(<Alert tone="pink" title="Saved" />)
    expect(screen.getByRole('status')).toHaveClass('bg-status-info-subtle')
    expect(error).toHaveBeenCalledWith(expect.stringMatching(/Alert: tone "pink"/))
  })
})

describe('Banner', () => {
  it('should render a full-width banner with a polite status role even for warnings', () => {
    render(<Banner tone="warning" title="Scheduled maintenance on Sunday" />)
    expect(screen.queryByRole('alert')).toBeNull()
    const banner = screen.getByRole('status')
    expect(banner).toHaveClass('w-full', 'bg-status-warning-subtle')
    expect(banner).not.toHaveClass('rounded-card')
  })

  it('should call onDismiss when dismissed', () => {
    const onDismiss = vi.fn()
    render(<Banner title="New: on-demand sessions" onDismiss={onDismiss} />)
    fireEvent.click(screen.getByRole('button', { name: 'Dismiss' }))
    expect(onDismiss).toHaveBeenCalled()
  })

  it('should warn and fall back to inline when the Alert layout is unknown', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})
    render(<Alert title="Saved" layout="toast" />)
    expect(screen.getByRole('status')).toHaveClass('rounded-card')
    expect(error).toHaveBeenCalledWith(expect.stringMatching(/Alert: layout "toast"/))
  })
})
