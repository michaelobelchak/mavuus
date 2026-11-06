import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MapPin } from 'lucide-react'
import { Select } from './Select'

const items = [
  { value: 'remote', label: 'Remote' },
  { value: 'hybrid', label: 'Hybrid' },
  { value: 'onsite', label: 'On-site', disabled: true },
  { value: 'contract', label: 'Contract' },
]

function getTrigger() {
  return screen.getByRole('combobox', { name: 'Work type' })
}

async function openWith(user, key) {
  getTrigger().focus()
  await user.keyboard(key)
  await screen.findByRole('listbox')
}

describe('Select', () => {
  it('should show the placeholder when nothing is selected', () => {
    render(<Select aria-label="Work type" items={items} placeholder="Choose a work type" />)
    expect(getTrigger()).toHaveTextContent('Choose a work type')
  })

  it('should show the label of the selected value when given defaultValue', () => {
    render(<Select aria-label="Work type" items={items} defaultValue="hybrid" />)
    expect(getTrigger()).toHaveTextContent('Hybrid')
  })

  it.each(['{Enter}', ' ', '{ArrowDown}'])('should open the listbox when %j is pressed on the trigger', async (key) => {
    const user = userEvent.setup()
    render(<Select aria-label="Work type" items={items} />)
    await openWith(user, key)
    expect(getTrigger()).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getAllByRole('option')).toHaveLength(4)
  })

  it('should call onValueChange and close when an item is chosen with arrows and Enter', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(<Select aria-label="Work type" items={items} defaultValue="remote" onValueChange={onValueChange} />)
    await openWith(user, '{ArrowDown}')
    await waitFor(() => expect(screen.getByRole('option', { name: 'Remote' })).toHaveAttribute('data-highlighted'))
    await user.keyboard('{ArrowDown}')
    await waitFor(() => expect(screen.getByRole('option', { name: 'Hybrid' })).toHaveAttribute('data-highlighted'))
    await user.keyboard('{Enter}')
    await waitFor(() => expect(onValueChange).toHaveBeenCalledWith('hybrid', expect.anything()))
    await waitFor(() => expect(getTrigger()).toHaveTextContent('Hybrid'))
  })

  it('should mark the selected item with a check icon when open', async () => {
    const user = userEvent.setup()
    render(<Select aria-label="Work type" items={items} defaultValue="contract" />)
    await openWith(user, '{ArrowDown}')
    const selected = screen.getByRole('option', { name: 'Contract' })
    expect(selected).toHaveAttribute('aria-selected', 'true')
    expect(selected.querySelector('svg')).toHaveAttribute('aria-hidden', 'true')
  })

  it('should mark disabled items as disabled', async () => {
    const user = userEvent.setup()
    render(<Select aria-label="Work type" items={items} />)
    await openWith(user, '{ArrowDown}')
    expect(screen.getByRole('option', { name: 'On-site' })).toHaveAttribute('aria-disabled', 'true')
  })

  it('should set aria-invalid and the error border when invalid', () => {
    render(<Select aria-label="Work type" items={items} invalid />)
    expect(getTrigger()).toHaveAttribute('aria-invalid', 'true')
    expect(getTrigger()).toHaveClass('border-status-error')
  })

  it.each([
    ['sm', 'h-10'],
    ['md', 'h-12'],
    ['lg', 'h-14'],
  ])('should use the control height scale when size is %s', (size, height) => {
    render(<Select aria-label="Work type" items={items} size={size} />)
    expect(getTrigger()).toHaveClass(height)
  })

  it('should render a decorative leading icon when given leadingIcon', () => {
    render(<Select aria-label="Work type" items={items} leadingIcon={MapPin} />)
    const icons = getTrigger().querySelectorAll('svg')
    expect(icons.length).toBeGreaterThanOrEqual(2)
    for (const icon of icons) expect(icon).toHaveAttribute('aria-hidden', 'true')
  })

  it('should be labelled by an external label when given id and htmlFor', () => {
    render(
      <>
        <label htmlFor="work-type">Work type</label>
        <Select id="work-type" items={items} />
      </>,
    )
    expect(getTrigger()).toBeInTheDocument()
  })
})
