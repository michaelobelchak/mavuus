import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { Pencil, Trash2 } from 'lucide-react'
import { resetWarnings } from '../../lib/warnOnce'
import { Button } from '../../primitives'
import { DropdownMenu } from './DropdownMenu'

afterEach(() => {
  vi.restoreAllMocks()
  resetWarnings()
})

function renderMenu(overrides = {}) {
  const onEdit = vi.fn()
  const onDuplicate = vi.fn()
  const onDelete = vi.fn()
  const items = overrides.items ?? [
    { type: 'label', label: 'Job post' },
    { label: 'Edit', icon: Pencil, onSelect: onEdit, shortcut: 'E' },
    { label: 'Duplicate', onSelect: onDuplicate },
    { label: 'Archive', disabled: true },
    { label: 'View applicants', to: '/jobs/42/applicants' },
    { type: 'separator' },
    { label: 'Delete', icon: Trash2, tone: 'danger', onSelect: onDelete },
  ]
  render(
    <MemoryRouter>
      <DropdownMenu trigger={<Button variant="outline">Actions</Button>} items={items} {...overrides.props} />
    </MemoryRouter>,
  )
  return { onEdit, onDuplicate, onDelete, trigger: screen.getByRole('button', { name: 'Actions' }) }
}

describe('DropdownMenu', () => {
  it('should open with Enter and highlight the first item', async () => {
    const user = userEvent.setup()
    const { trigger } = renderMenu()
    await user.tab()
    expect(trigger).toHaveFocus()
    await user.keyboard('{Enter}')
    expect(await screen.findByRole('menu')).toBeInTheDocument()
    await waitFor(() => expect(screen.getByRole('menuitem', { name: /Edit/ })).toHaveFocus())
  })

  it('should open with ArrowDown, move with arrows and call onSelect on Enter', async () => {
    const user = userEvent.setup()
    const { onDuplicate, trigger } = renderMenu()
    trigger.focus()
    await user.keyboard('{ArrowDown}')
    await screen.findByRole('menu')
    await waitFor(() => expect(screen.getByRole('menuitem', { name: /Edit/ })).toHaveFocus())
    await user.keyboard('{ArrowDown}')
    expect(screen.getByRole('menuitem', { name: 'Duplicate' })).toHaveFocus()
    await user.keyboard('{Enter}')
    expect(onDuplicate).toHaveBeenCalledTimes(1)
    await waitFor(() => expect(screen.queryByRole('menu')).toBeNull())
  })

  it('should close on Escape and return focus to the trigger', async () => {
    const user = userEvent.setup()
    const { trigger } = renderMenu()
    await user.click(trigger)
    await screen.findByRole('menu')
    await user.keyboard('{Escape}')
    await waitFor(() => expect(screen.queryByRole('menu')).toBeNull())
    await waitFor(() => expect(trigger).toHaveFocus())
  })

  it('should render link items as anchors', async () => {
    const user = userEvent.setup()
    renderMenu()
    await user.click(screen.getByRole('button', { name: 'Actions' }))
    const link = await screen.findByRole('menuitem', { name: 'View applicants' })
    expect(link.tagName).toBe('A')
    expect(link).toHaveAttribute('href', '/jobs/42/applicants')
  })

  it('should open absolute links in a new tab with the hint', async () => {
    const user = userEvent.setup()
    renderMenu({ items: [{ label: 'Help center', href: 'https://help.mavuus.com' }] })
    await user.click(screen.getByRole('button', { name: 'Actions' }))
    const link = await screen.findByRole('menuitem', { name: 'Help center (opens in a new tab)' })
    expect(link).toHaveAttribute('target', '_blank')
  })

  it('should mark disabled items and not call their handler', async () => {
    const user = userEvent.setup()
    const onArchive = vi.fn()
    renderMenu({ items: [{ label: 'Archive', disabled: true, onSelect: onArchive }] })
    await user.click(screen.getByRole('button', { name: 'Actions' }))
    const item = await screen.findByRole('menuitem', { name: 'Archive' })
    expect(item).toHaveAttribute('aria-disabled', 'true')
    await user.click(item)
    expect(onArchive).not.toHaveBeenCalled()
  })

  it('should group items under a label, draw separators and style danger items', async () => {
    const user = userEvent.setup()
    renderMenu()
    await user.click(screen.getByRole('button', { name: 'Actions' }))
    await screen.findByRole('menu')
    expect(screen.getByRole('group', { name: 'Job post' })).toContainElement(screen.getByRole('menuitem', { name: 'Duplicate' }))
    expect(screen.getByRole('separator')).toBeInTheDocument()
    const remove = screen.getByRole('menuitem', { name: 'Delete' })
    expect(remove).toHaveClass('text-status-error')
    expect(remove).toHaveClass('min-h-10', 'data-[highlighted]:bg-surface-selected', 'data-[highlighted]:border-border-focus')
  })

  it('should show the shortcut and style the popup with the overlay surface', async () => {
    const user = userEvent.setup()
    renderMenu({ props: { popupClassName: 'min-w-64' } })
    await user.click(screen.getByRole('button', { name: 'Actions' }))
    const menu = await screen.findByRole('menu')
    expect(menu).toHaveClass('bg-surface-overlay', 'shadow-overlay', 'rounded-control', 'min-w-64')
    expect(screen.getByRole('menuitem', { name: /Edit/ })).toHaveTextContent('E')
  })
})
