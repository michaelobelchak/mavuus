import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { resetWarnings } from '../../lib/warnOnce'
import { Button } from '../../primitives'
import { Popover } from './Popover'

afterEach(() => {
  vi.restoreAllMocks()
  resetWarnings()
})

function renderPopover(props) {
  return render(
    <Popover trigger={<Button variant="outline">Plan details</Button>} title="Pro plan" {...props}>
      <p>Unlimited messages and job posts.</p>
      <button type="button">Upgrade</button>
    </Popover>,
  )
}

describe('Popover', () => {
  it('should open on click and be labelled by its title', async () => {
    const user = userEvent.setup()
    renderPopover()
    expect(screen.queryByRole('dialog')).toBeNull()
    await user.click(screen.getByRole('button', { name: 'Plan details' }))
    const popup = await screen.findByRole('dialog', { name: 'Pro plan' })
    expect(popup).toHaveTextContent('Unlimited messages and job posts.')
  })

  it('should close on Escape and return focus to the trigger', async () => {
    const user = userEvent.setup()
    renderPopover()
    const trigger = screen.getByRole('button', { name: 'Plan details' })
    await user.click(trigger)
    await screen.findByRole('dialog')
    await user.keyboard('{Escape}')
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
    await waitFor(() => expect(trigger).toHaveFocus())
  })

  it('should use the overlay surface and take popupClassName', async () => {
    const user = userEvent.setup()
    renderPopover({ popupClassName: 'w-80' })
    await user.click(screen.getByRole('button', { name: 'Plan details' }))
    expect(await screen.findByRole('dialog')).toHaveClass('bg-surface-overlay', 'shadow-overlay', 'rounded-control', 'w-80')
  })

  it('should render without a title', async () => {
    const user = userEvent.setup()
    renderPopover({ title: undefined })
    await user.click(screen.getByRole('button', { name: 'Plan details' }))
    expect(await screen.findByRole('dialog')).not.toHaveAttribute('aria-labelledby')
  })

  it('should warn and fall back when side is unknown', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})
    renderPopover({ side: 'middle' })
    expect(error).toHaveBeenCalledWith(expect.stringMatching(/Popover: side "middle"/))
  })
})
