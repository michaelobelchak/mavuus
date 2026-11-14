import { afterEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { resetWarnings } from '../../../lib/warnOnce'
import { StatusBadge } from './StatusBadge'
import { resolveStatus, STATUS_BADGES } from './statusBadges'

afterEach(() => {
  vi.restoreAllMocks()
  resetWarnings()
})

// Every status string the admin pages, the dashboard pages and the server schema use.
const table = [
  ['active', 'success', 'Active'],
  ['banned', 'error', 'Banned'],
  ['deleted', 'neutral', 'Deleted'],
  ['draft', 'warning', 'Draft'],
  ['published', 'success', 'Published'],
  ['archived', 'neutral', 'Archived'],
  ['approved', 'success', 'Approved'],
  ['pending', 'warning', 'Pending'],
  ['suspended', 'error', 'Suspended'],
  ['flagged', 'warning', 'Flagged'],
  ['hidden', 'warning', 'Hidden'],
  ['removed', 'error', 'Removed'],
  ['open', 'success', 'Open'],
  ['in-progress', 'info', 'In progress'],
  ['completed', 'success', 'Completed'],
  ['closed', 'neutral', 'Closed'],
  ['accepted', 'success', 'Accepted'],
  ['declined', 'error', 'Declined'],
  ['applied', 'info', 'Applied'],
  ['reviewing', 'info', 'Reviewing'],
  ['interview', 'brand', 'Interview'],
  ['offer', 'success', 'Offer'],
  ['hired', 'success', 'Hired'],
  ['rejected', 'error', 'Rejected'],
  ['withdrawn', 'neutral', 'Withdrawn'],
  ['new', 'info', 'New'],
  ['handled', 'success', 'Handled'],
  ['featured', 'brand', 'Featured'],
]

describe('StatusBadge', () => {
  it.each(table)('should map %s to the %s tone and the label "%s"', (status, tone, label) => {
    expect(resolveStatus(status)).toEqual({ tone, label })
  })

  it('should cover every status in the mapping table', () => {
    expect(Object.keys(STATUS_BADGES).sort()).toEqual(table.map(([status]) => status).sort())
  })

  it('should render a Badge with the tone classes and the label when given a known status', () => {
    render(<StatusBadge status="banned" />)
    expect(screen.getByText('Banned')).toHaveClass('bg-status-error-subtle', 'text-status-error')
  })

  it('should match statuses regardless of case, spaces and underscores', () => {
    expect(resolveStatus('In_Progress')).toEqual({ tone: 'info', label: 'In progress' })
    expect(resolveStatus(' APPROVED ')).toEqual({ tone: 'success', label: 'Approved' })
  })

  it('should fall back to neutral with a readable label and warn once in dev when the status is unknown', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})
    render(
      <>
        <StatusBadge status="on-hold" />
        <StatusBadge status="on-hold" />
      </>,
    )
    const badges = screen.getAllByText('On hold')
    expect(badges[0]).toHaveClass('bg-surface-sunken', 'text-text-secondary')
    expect(error).toHaveBeenCalledTimes(1)
    expect(error).toHaveBeenCalledWith(expect.stringMatching(/StatusBadge: status "on-hold"/))
  })

  it('should show Unknown without a warning when the status is missing', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})
    render(<StatusBadge status={null} />)
    expect(screen.getByText('Unknown')).toHaveClass('bg-surface-sunken')
    expect(error).not.toHaveBeenCalled()
  })

  it('should use the label override and pass size and props to the Badge', () => {
    render(<StatusBadge status="pending" label="Awaiting review" size="sm" data-testid="badge" />)
    const badge = screen.getByTestId('badge')
    expect(badge).toHaveTextContent('Awaiting review')
    expect(badge).toHaveClass('h-6', 'bg-status-warning-subtle')
  })
})
