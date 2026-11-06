import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react'
import { Copy } from 'lucide-react'
import { resetWarnings } from '../../lib/warnOnce'
import { Button } from '../Button'
import { IconButton } from '../IconButton'
import { Tooltip } from './Tooltip'

function renderTooltip(props) {
  return render(
    <Tooltip content="Copy the invite link" {...props}>
      <Button variant="outline">Copy link</Button>
    </Tooltip>,
  )
}

afterEach(() => {
  vi.restoreAllMocks()
  resetWarnings()
})

describe('Tooltip', () => {
  it('should render the child as the trigger without wrapping it in another button', () => {
    renderTooltip()
    const trigger = screen.getByRole('button', { name: 'Copy link' })
    expect(trigger.parentElement.tagName).not.toBe('BUTTON')
    expect(trigger.querySelector('button')).toBeNull()
  })

  it('should describe the trigger with the content even while closed', () => {
    renderTooltip()
    expect(screen.getByRole('button', { name: 'Copy link' })).toHaveAccessibleDescription('Copy the invite link')
  })

  it('should keep an existing aria-describedby on the trigger', () => {
    render(
      <>
        <span id="hint">Shared with members</span>
        <Tooltip content="Copy the invite link">
          <Button aria-describedby="hint">Copy link</Button>
        </Tooltip>
      </>,
    )
    expect(screen.getByRole('button', { name: 'Copy link' })).toHaveAccessibleDescription(
      'Shared with members Copy the invite link',
    )
  })

  it('should hide the visual popup from assistive tech so the hint is announced once', async () => {
    renderTooltip({ delay: 0 })
    fireEvent.keyDown(document.body, { key: 'Tab' })
    act(() => screen.getByRole('button', { name: 'Copy link' }).focus())
    await waitFor(() => expect(document.querySelector('[data-tooltip-popup]')).not.toBeNull())
    expect(document.querySelector('[data-tooltip-popup]')).toHaveAttribute('aria-hidden', 'true')
  })

  it('should warn when the trigger has no accessible name', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})
    render(
      <Tooltip content="Copy">
        <IconButton icon={Copy} aria-label="" />
      </Tooltip>,
    )
    expect(error).toHaveBeenCalledWith(expect.stringMatching(/Tooltip.*accessible name/))
  })

  it('should not warn when the trigger is named by aria-label', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})
    render(
      <Tooltip content="Copy">
        <IconButton icon={Copy} aria-label="Copy link" />
      </Tooltip>,
    )
    expect(error).not.toHaveBeenCalled()
  })

  it('should pass props to the trigger and popupClassName to the popup', async () => {
    renderTooltip({ delay: 0, 'data-testid': 'trigger', popupClassName: 'max-w-sm' })
    const trigger = screen.getByTestId('trigger')
    expect(trigger).toHaveAccessibleName('Copy link')
    fireEvent.keyDown(document.body, { key: 'Tab' })
    act(() => trigger.focus())
    await waitFor(() => expect(document.querySelector('[data-tooltip-popup]')).toHaveClass('max-w-sm'))
  })

  it('should show the content when the trigger gets keyboard focus', async () => {
    renderTooltip({ delay: 0 })
    const trigger = screen.getByRole('button', { name: 'Copy link' })
    fireEvent.keyDown(document.body, { key: 'Tab' })
    act(() => trigger.focus())
    await waitFor(() => expect(document.querySelector('[data-tooltip-popup]')).toHaveTextContent('Copy the invite link'))
  })

  it('should hide the content when Escape is pressed', async () => {
    renderTooltip({ delay: 0 })
    const trigger = screen.getByRole('button', { name: 'Copy link' })
    fireEvent.keyDown(document.body, { key: 'Tab' })
    act(() => trigger.focus())
    await waitFor(() => expect(document.querySelector('[data-tooltip-popup]')).not.toBeNull())
    fireEvent.keyDown(trigger, { key: 'Escape' })
    await waitFor(() => expect(document.querySelector('[data-tooltip-popup]')).toBeNull())
  })

  it('should use the inverse surface with on-brand caption text when open', async () => {
    renderTooltip({ delay: 0 })
    fireEvent.keyDown(document.body, { key: 'Tab' })
    act(() => screen.getByRole('button', { name: 'Copy link' }).focus())
    await waitFor(() => expect(document.querySelector('[data-tooltip-popup]')).not.toBeNull())
    const popup = document.querySelector('[data-tooltip-popup]')
    expect(popup).toHaveClass('bg-surface-inverse', 'text-text-on-brand', 'rounded-tag', 'text-caption')
  })

  it('should not add siblings next to the trigger when rendered in a list', () => {
    render(
      <ul data-testid="list">
        <li>
          <Tooltip content="Copy the invite link">
            <Button>Copy link</Button>
          </Tooltip>
        </li>
      </ul>,
    )
    const item = screen.getByTestId('list').firstElementChild
    expect(item.children).toHaveLength(1)
    expect(item.firstElementChild).toBe(screen.getByRole('button', { name: 'Copy link' }))
    expect(screen.getByRole('button', { name: 'Copy link' })).toHaveAccessibleDescription('Copy the invite link')
  })

  it('should check the name again when the trigger is renamed', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})
    const { rerender } = render(
      <Tooltip content="Copy">
        <IconButton icon={Copy} aria-label="Copy link" />
      </Tooltip>,
    )
    expect(error).not.toHaveBeenCalled()
    rerender(
      <Tooltip content="Copy">
        <IconButton icon={Copy} aria-label="" />
      </Tooltip>,
    )
    expect(error).toHaveBeenCalledWith(expect.stringMatching(/Tooltip.*accessible name/))
  })
})
