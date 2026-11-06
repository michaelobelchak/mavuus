import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
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

// jsdom doesn't turn Enter or Space on a <button> into a click the way browsers do,
// so press() sends the key and then the click the browser would send.
function press(element, key) {
  fireEvent.keyDown(element, { key })
  fireEvent.keyUp(element, { key })
  if (key === 'Enter' || key === ' ') fireEvent.click(element, { detail: 0 })
}

async function openWith(key) {
  const trigger = getTrigger()
  act(() => trigger.focus())
  press(trigger, key)
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

  it.each(['Enter', ' ', 'ArrowDown'])('should open the listbox when %j is pressed on the trigger', async (key) => {
    render(<Select aria-label="Work type" items={items} />)
    await openWith(key)
    expect(getTrigger()).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getAllByRole('option')).toHaveLength(4)
  })

  it('should call onValueChange and close when an item is chosen with arrows and Enter', async () => {
    const onValueChange = vi.fn()
    render(<Select aria-label="Work type" items={items} defaultValue="remote" onValueChange={onValueChange} />)
    await openWith('ArrowDown')
    const listbox = screen.getByRole('listbox')
    await waitFor(() => expect(screen.getByRole('option', { name: 'Remote' })).toHaveAttribute('data-highlighted'))
    fireEvent.keyDown(listbox, { key: 'ArrowDown' })
    await waitFor(() => expect(screen.getByRole('option', { name: 'Hybrid' })).toHaveAttribute('data-highlighted'))
    fireEvent.keyDown(screen.getByRole('option', { name: 'Hybrid' }), { key: 'Enter' })
    await waitFor(() => expect(onValueChange).toHaveBeenCalledWith('hybrid', expect.anything()))
    await waitFor(() => expect(getTrigger()).toHaveTextContent('Hybrid'))
  })

  it('should mark the selected item with a check icon when open', async () => {
    render(<Select aria-label="Work type" items={items} defaultValue="contract" />)
    await openWith('ArrowDown')
    const selected = screen.getByRole('option', { name: 'Contract' })
    expect(selected).toHaveAttribute('aria-selected', 'true')
    expect(selected.querySelector('svg')).toHaveAttribute('aria-hidden', 'true')
  })

  it('should mark disabled items as disabled', async () => {
    render(<Select aria-label="Work type" items={items} />)
    await openWith('ArrowDown')
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
