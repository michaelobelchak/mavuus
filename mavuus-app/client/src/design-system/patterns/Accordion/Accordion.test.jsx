import { describe, it, expect, vi, afterEach } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { resetWarnings } from '../../lib/warnOnce'
import { Accordion } from './Accordion'

const items = [
  { value: 'join', title: 'Who can join?', content: <a href="/apply">Apply to join</a> },
  { value: 'cost', title: 'What does it cost?', content: <p>Plans start at $49 a month.</p> },
  { value: 'cancel', title: 'Can I cancel?', content: <p>Any time.</p> },
]

afterEach(() => {
  vi.restoreAllMocks()
  resetWarnings()
})

describe('Accordion', () => {
  it('should render each title as an h3 with a collapsed button by default', () => {
    render(<Accordion items={items} />)
    const headings = screen.getAllByRole('heading', { level: 3 })
    expect(headings).toHaveLength(3)
    const button = screen.getByRole('button', { name: 'Who can join?' })
    expect(headings[0]).toContainElement(button)
    expect(button).toHaveAttribute('aria-expanded', 'false')
  })

  it('should use the heading level given by headingLevel', () => {
    render(<Accordion items={items} headingLevel={2} />)
    expect(screen.getAllByRole('heading', { level: 2 })).toHaveLength(3)
  })

  it('should toggle aria-expanded and show the content when the title is clicked', async () => {
    render(<Accordion items={items} />)
    const button = screen.getByRole('button', { name: 'What does it cost?' })
    fireEvent.click(button)
    await waitFor(() => expect(button).toHaveAttribute('aria-expanded', 'true'))
    expect(screen.getByText('Plans start at $49 a month.')).toBeVisible()
    fireEvent.click(button)
    await waitFor(() => expect(button).toHaveAttribute('aria-expanded', 'false'))
  })

  it('should close the open item when another opens unless multiple is set', async () => {
    const { rerender } = render(<Accordion items={items} defaultValue="join" />)
    fireEvent.click(screen.getByRole('button', { name: 'Can I cancel?' }))
    await waitFor(() => expect(screen.getByRole('button', { name: 'Who can join?' })).toHaveAttribute('aria-expanded', 'false'))
    rerender(<Accordion key="multi" items={items} defaultValue={['join']} multiple />)
    fireEvent.click(screen.getByRole('button', { name: 'Can I cancel?' }))
    await waitFor(() => expect(screen.getByRole('button', { name: 'Can I cancel?' })).toHaveAttribute('aria-expanded', 'true'))
    expect(screen.getByRole('button', { name: 'Who can join?' })).toHaveAttribute('aria-expanded', 'true')
  })

  it('should keep closed content out of the tab order', async () => {
    const user = userEvent.setup()
    render(<Accordion items={items} />)
    await user.tab()
    expect(screen.getByRole('button', { name: 'Who can join?' })).toHaveFocus()
    await user.tab()
    expect(screen.getByRole('button', { name: 'What does it cost?' })).toHaveFocus()
    expect(screen.queryByRole('link', { name: 'Apply to join' })).toBeNull()
  })

  it('should make open content reachable with Tab', async () => {
    const user = userEvent.setup()
    render(<Accordion items={items} defaultValue="join" />)
    await user.tab()
    await user.tab()
    expect(screen.getByRole('link', { name: 'Apply to join' })).toHaveFocus()
  })

  it('should call onValueChange with the open values', async () => {
    const onValueChange = vi.fn()
    render(<Accordion items={items} onValueChange={onValueChange} />)
    fireEvent.click(screen.getByRole('button', { name: 'Can I cancel?' }))
    await waitFor(() => expect(onValueChange).toHaveBeenCalledWith(['cancel'], expect.anything()))
  })

  it('should rotate the chevron when open with an instant change under reduced motion', () => {
    render(<Accordion items={items} />)
    const chevron = screen.getByRole('button', { name: 'Who can join?' }).querySelector('svg')
    expect(chevron).toHaveAttribute('aria-hidden', 'true')
    expect(chevron).toHaveClass('group-data-[panel-open]:rotate-180', 'motion-reduce:transition-none')
  })

  it('should warn and use h3 when the heading level is unsupported', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})
    render(<Accordion items={items} headingLevel={7} />)
    expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(3)
    expect(error).toHaveBeenCalledWith(expect.stringMatching(/Accordion: headingLevel "7"/))
  })

  it('should close every item when controlled with null and open the item given a single value', async () => {
    const onValueChange = vi.fn()
    const { rerender } = render(<Accordion items={items} value={null} onValueChange={onValueChange} />)
    for (const button of screen.getAllByRole('button')) expect(button).toHaveAttribute('aria-expanded', 'false')
    rerender(<Accordion items={items} value="cost" onValueChange={onValueChange} />)
    expect(screen.getByRole('button', { name: 'What does it cost?' })).toHaveAttribute('aria-expanded', 'true')
    fireEvent.click(screen.getByRole('button', { name: 'Can I cancel?' }))
    await waitFor(() => expect(onValueChange).toHaveBeenLastCalledWith(['cancel'], expect.anything()))
    expect(screen.getByRole('button', { name: 'What does it cost?' })).toHaveAttribute('aria-expanded', 'true')
    rerender(<Accordion items={items} value={null} onValueChange={onValueChange} />)
    expect(screen.getByRole('button', { name: 'What does it cost?' })).toHaveAttribute('aria-expanded', 'false')
  })

  it('should emit an empty array when the last open item closes', async () => {
    const onValueChange = vi.fn()
    render(<Accordion items={items} defaultValue="join" onValueChange={onValueChange} />)
    fireEvent.click(screen.getByRole('button', { name: 'Who can join?' }))
    await waitFor(() => expect(onValueChange).toHaveBeenLastCalledWith([], expect.anything()))
  })
})
