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

  it('should render a disabled link entry as a disabled item that keeps the menu open', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    renderMenu({ items: [{ label: 'Billing', to: '/billing', disabled: true, onSelect }, { label: 'Profile', to: '/profile' }] })
    await user.click(screen.getByRole('button', { name: 'Actions' }))
    const item = await screen.findByRole('menuitem', { name: 'Billing' })
    expect(item.tagName).not.toBe('A')
    expect(item).not.toHaveAttribute('href')
    expect(item).toHaveAttribute('aria-disabled', 'true')
    await user.click(item)
    expect(onSelect).not.toHaveBeenCalled()
    expect(screen.getByRole('menu')).toBeInTheDocument()
    // Base UI still marks a hovered disabled item highlighted, so the highlight styles are undone.
    expect(item).toHaveClass('data-[disabled]:data-[highlighted]:bg-transparent', 'data-[disabled]:data-[highlighted]:border-transparent')
  })

  // Base UI Menu keeps disabled items in arrow key order (disabledIndices is empty), as the ARIA
  // menu pattern recommends, so they stay discoverable. Enter on one does nothing.
  it('should keep a disabled link entry reachable by arrow keys but inert on Enter', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    const { trigger } = renderMenu({
      items: [{ label: 'Profile', to: '/profile' }, { label: 'Billing', to: '/billing', disabled: true, onSelect }],
    })
    trigger.focus()
    await user.keyboard('{ArrowDown}')
    await waitFor(() => expect(screen.getByRole('menuitem', { name: 'Profile' })).toHaveFocus())
    await user.keyboard('{ArrowDown}')
    expect(screen.getByRole('menuitem', { name: 'Billing' })).toHaveFocus()
    await user.keyboard('{Enter}')
    expect(onSelect).not.toHaveBeenCalled()
    expect(screen.getByRole('menu')).toBeInTheDocument()
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
