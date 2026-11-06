import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Copy } from 'lucide-react'
import { resetWarnings } from '../../lib/warnOnce'
import { Button, IconButton, Tooltip } from '../../primitives'
import { Dialog, DialogClose } from './Dialog'

afterEach(() => {
  vi.restoreAllMocks()
  resetWarnings()
})

function renderDialog(props) {
  return render(
    <Dialog
      trigger={<Button>Invite member</Button>}
      title="Invite a member"
      description="They get an email with a join link."
      footer={<DialogClose><Button variant="ghost">Cancel</Button></DialogClose>}
      {...props}
    >
      <label>
        Email
        <input type="email" />
      </label>
    </Dialog>,
  )
}

describe('Dialog', () => {
  it('should open when the trigger is clicked and move focus inside', async () => {
    const user = userEvent.setup()
    renderDialog()
    expect(screen.queryByRole('dialog')).toBeNull()
    await user.click(screen.getByRole('button', { name: 'Invite member' }))
    const dialog = await screen.findByRole('dialog')
    await waitFor(() => expect(dialog).toContainElement(document.activeElement))
  })

  it('should name the dialog with the title and describe it with the description', async () => {
    renderDialog({ defaultOpen: true })
    const dialog = await screen.findByRole('dialog')
    expect(dialog).toHaveAccessibleName('Invite a member')
    expect(dialog).toHaveAccessibleDescription('They get an email with a join link.')
    expect(screen.getByRole('heading', { name: 'Invite a member' })).toBeInTheDocument()
  })

  it('should close on Escape and return focus to the trigger', async () => {
    const user = userEvent.setup()
    renderDialog()
    const trigger = screen.getByRole('button', { name: 'Invite member' })
    await user.click(trigger)
    await screen.findByRole('dialog')
    await user.keyboard('{Escape}')
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
    await waitFor(() => expect(trigger).toHaveFocus())
  })

  it('should close with the labelled close button and with a DialogClose action', async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()
    renderDialog({ onOpenChange })
    await user.click(screen.getByRole('button', { name: 'Invite member' }))
    await user.click(await screen.findByRole('button', { name: 'Close' }))
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
    expect(onOpenChange).toHaveBeenLastCalledWith(false, expect.anything())
    await user.click(screen.getByRole('button', { name: 'Invite member' }))
    await user.click(await screen.findByRole('button', { name: 'Cancel' }))
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
  })

  it('should stay open on Escape when not dismissible', async () => {
    const user = userEvent.setup()
    renderDialog({ defaultOpen: true, dismissible: false })
    await screen.findByRole('dialog')
    await user.keyboard('{Escape}')
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('should follow the controlled open prop', async () => {
    const { rerender } = render(
      <Dialog open={false} title="Delete job">
        Body
      </Dialog>,
    )
    expect(screen.queryByRole('dialog')).toBeNull()
    rerender(
      <Dialog open title="Delete job">
        Body
      </Dialog>,
    )
    expect(await screen.findByRole('dialog', { name: 'Delete job' })).toBeInTheDocument()
  })

  it('should use the overlay surface and the size max width', async () => {
    renderDialog({ defaultOpen: true, size: 'lg', className: 'extra-class' })
    const dialog = await screen.findByRole('dialog')
    expect(dialog).toHaveClass('bg-surface-overlay', 'rounded-sheet', 'shadow-overlay', 'max-w-2xl', 'extra-class')
    expect(dialog).toHaveClass('motion-reduce:data-[starting-style]:scale-100')
  })

  it('should warn and fall back to md when the size is unknown', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})
    renderDialog({ defaultOpen: true, size: 'xl' })
    expect(await screen.findByRole('dialog')).toHaveClass('max-w-lg')
    expect(error).toHaveBeenCalledWith(expect.stringMatching(/Dialog: size "xl"/))
  })

  it('should warn in dev when the title is missing', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})
    render(<Dialog defaultOpen>Body</Dialog>)
    expect(error).toHaveBeenCalledWith(expect.stringMatching(/Dialog: .*title/))
  })

  // Base UI marks body children outside the dialog aria-hidden, including the Tooltip's hidden
  // description span. Accessible name rules still read content that aria-describedby points at
  // directly, so the trigger keeps its description.
  it('should keep a Tooltip description readable inside an open dialog', async () => {
    render(
      <Dialog defaultOpen title="Share">
        <Tooltip content="Copy the invite link">
          <IconButton icon={Copy} aria-label="Copy link" />
        </Tooltip>
      </Dialog>,
    )
    await screen.findByRole('dialog')
    expect(screen.getByRole('button', { name: 'Copy link' })).toHaveAccessibleDescription('Copy the invite link')
  })
})
