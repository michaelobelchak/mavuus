import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react'
import { Button } from '../Button'
import { Tooltip } from './Tooltip'

function renderTooltip(props) {
  return render(
    <Tooltip content="Copy the invite link" {...props}>
      <Button variant="outline">Copy link</Button>
    </Tooltip>,
  )
}

describe('Tooltip', () => {
  it('should render the child as the trigger without wrapping it in another button', () => {
    renderTooltip()
    const trigger = screen.getByRole('button', { name: 'Copy link' })
    expect(trigger.parentElement.tagName).not.toBe('BUTTON')
    expect(trigger.querySelector('button')).toBeNull()
    expect(screen.queryByRole('tooltip')).toBeNull()
  })

  it('should show the content when the trigger gets keyboard focus', async () => {
    renderTooltip({ delay: 0 })
    const trigger = screen.getByRole('button', { name: 'Copy link' })
    fireEvent.keyDown(document.body, { key: 'Tab' })
    act(() => trigger.focus())
    expect(await screen.findByText('Copy the invite link')).toBeInTheDocument()
  })

  it('should hide the content when Escape is pressed', async () => {
    renderTooltip({ delay: 0 })
    const trigger = screen.getByRole('button', { name: 'Copy link' })
    fireEvent.keyDown(document.body, { key: 'Tab' })
    act(() => trigger.focus())
    await screen.findByText('Copy the invite link')
    fireEvent.keyDown(trigger, { key: 'Escape' })
    await waitFor(() => expect(screen.queryByText('Copy the invite link')).toBeNull())
  })

  it('should use the inverse surface with on-brand caption text when open', async () => {
    renderTooltip({ delay: 0 })
    fireEvent.keyDown(document.body, { key: 'Tab' })
    act(() => screen.getByRole('button', { name: 'Copy link' }).focus())
    const text = await screen.findByText('Copy the invite link')
    const popup = text.closest('[data-side]')
    expect(popup).toHaveClass('bg-surface-inverse', 'text-text-on-brand', 'rounded-tag', 'text-caption')
  })
})
