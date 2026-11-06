import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { resetWarnings } from '../../lib/warnOnce'
import { Button } from '../../primitives'
import { Sheet, SheetClose } from './Sheet'

afterEach(() => {
  vi.restoreAllMocks()
  resetWarnings()
})

function renderSheet(props) {
  return render(
    <Sheet
      trigger={<Button>Filters</Button>}
      title="Filter members"
      description="Narrow the directory by role and location."
      footer={
        <SheetClose>
          <Button>Apply</Button>
        </SheetClose>
      }
      {...props}
    >
      <label>
        City
        <input />
      </label>
    </Sheet>,
  )
}

describe('Sheet', () => {
  it('should open from the trigger, name itself with the title and move focus inside', async () => {
    const user = userEvent.setup()
    renderSheet()
    await user.click(screen.getByRole('button', { name: 'Filters' }))
    const sheet = await screen.findByRole('dialog', { name: 'Filter members' })
    expect(sheet).toHaveAccessibleDescription('Narrow the directory by role and location.')
    await waitFor(() => expect(sheet).toContainElement(document.activeElement))
  })

  it('should close on Escape and return focus to the trigger', async () => {
    const user = userEvent.setup()
    renderSheet()
    const trigger = screen.getByRole('button', { name: 'Filters' })
    await user.click(trigger)
    await screen.findByRole('dialog')
    await user.keyboard('{Escape}')
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
    await waitFor(() => expect(trigger).toHaveFocus())
  })

  it('should close from a SheetClose action', async () => {
    const user = userEvent.setup()
    renderSheet()
    await user.click(screen.getByRole('button', { name: 'Filters' }))
    await user.click(await screen.findByRole('button', { name: 'Apply' }))
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
  })

  it('should sit on the right at full height with the inner edge rounded by default', async () => {
    renderSheet({ defaultOpen: true })
    const sheet = await screen.findByRole('dialog')
    expect(sheet).toHaveClass('right-0', 'h-full', 'w-100', 'rounded-l-sheet', 'bg-surface-overlay', 'shadow-overlay')
    expect(sheet).toHaveClass('data-[starting-style]:translate-x-full', 'motion-reduce:data-[starting-style]:translate-x-0')
  })

  it('should slide from the left with the right edge rounded when side is left', async () => {
    renderSheet({ defaultOpen: true, side: 'left', size: 'sm' })
    const sheet = await screen.findByRole('dialog')
    expect(sheet).toHaveClass('left-0', 'w-80', 'rounded-r-sheet', 'data-[starting-style]:-translate-x-full')
  })

  it('should use the large width when size is lg', async () => {
    renderSheet({ defaultOpen: true, size: 'lg' })
    expect(await screen.findByRole('dialog')).toHaveClass('w-140')
  })

  it('should warn and fall back when side or size is unknown', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})
    renderSheet({ defaultOpen: true, side: 'top', size: 'xl' })
    const sheet = await screen.findByRole('dialog')
    expect(sheet).toHaveClass('right-0', 'w-100')
    expect(error).toHaveBeenCalledWith(expect.stringMatching(/Sheet: side "top"/))
    expect(error).toHaveBeenCalledWith(expect.stringMatching(/Sheet: size "xl"/))
  })

  it('should warn in dev when the title is missing', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})
    render(<Sheet defaultOpen>Body</Sheet>)
    expect(error).toHaveBeenCalledWith(expect.stringMatching(/Sheet: .*title/))
  })
})
