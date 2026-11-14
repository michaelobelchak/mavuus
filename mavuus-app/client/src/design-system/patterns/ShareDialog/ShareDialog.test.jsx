import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { toast } from 'sonner'
import { ShareDialog } from './ShareDialog'

// Tests replace the clipboard and execCommand; put the originals back so nothing leaks.
const clipboardDescriptor = Object.getOwnPropertyDescriptor(navigator, 'clipboard')
const originalExecCommand = document.execCommand

afterEach(() => {
  vi.restoreAllMocks()
  if (clipboardDescriptor) Object.defineProperty(navigator, 'clipboard', clipboardDescriptor)
  else delete navigator.clipboard
  document.execCommand = originalExecCommand
})

describe('ShareDialog', () => {
  it('should link each network with the encoded URL and title when open', () => {
    render(<ShareDialog open onOpenChange={() => {}} title="Share this session" url="https://mavuus.com/s/1" shareTitle="Growth talk" />)
    expect(screen.getByRole('dialog', { name: 'Share this session' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Share on LinkedIn/ })).toHaveAttribute(
      'href',
      'https://www.linkedin.com/sharing/share-offsite/?url=https%3A%2F%2Fmavuus.com%2Fs%2F1',
    )
    expect(screen.getByRole('link', { name: /Share on Twitter/ }).getAttribute('href')).toContain('text=Growth%20talk')
    expect(screen.getByLabelText('Or copy link')).toHaveValue('https://mavuus.com/s/1')
  })

  it('should open every network link in a new tab, safely, and say so', () => {
    render(<ShareDialog open onOpenChange={() => {}} url="https://mavuus.com/s/1" />)
    const links = screen.getAllByRole('link', { name: /^Share on / })
    expect(links).toHaveLength(5)
    for (const link of links) {
      expect(link).toHaveAttribute('target', '_blank')
      expect(link).toHaveAttribute('rel', 'noopener noreferrer')
      expect(link).toHaveAccessibleName(/\(opens in a new tab\)$/)
    }
  })

  it('should copy the link and confirm with a toast when Copy is pressed', async () => {
    const user = userEvent.setup()
    const writeText = vi.fn().mockResolvedValue()
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } })
    const success = vi.spyOn(toast, 'success').mockImplementation(() => {})
    render(<ShareDialog open onOpenChange={() => {}} url="https://mavuus.com/r/2" />)
    await user.click(screen.getByRole('button', { name: 'Copy' }))
    expect(writeText).toHaveBeenCalledWith('https://mavuus.com/r/2')
    expect(success).toHaveBeenCalledWith('Link copied to clipboard', undefined)
  })

  it('should not close when the invite email is empty', async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()
    render(<ShareDialog open onOpenChange={onOpenChange} url="https://mavuus.com/r/2" />)
    await user.click(screen.getByRole('button', { name: 'Submit' }))
    expect(onOpenChange).not.toHaveBeenCalled()
  })

  it('should fall back to selecting the field and execCommand when there is no clipboard API', async () => {
    const user = userEvent.setup()
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: undefined })
    document.execCommand = vi.fn(() => true)
    const success = vi.spyOn(toast, 'success').mockImplementation(() => {})
    render(<ShareDialog open onOpenChange={() => {}} url="https://mavuus.com/r/2" />)
    await user.click(screen.getByRole('button', { name: 'Copy' }))
    expect(document.execCommand).toHaveBeenCalledWith('copy')
    expect(screen.getByLabelText('Or copy link')).toHaveFocus()
    expect(success).toHaveBeenCalledWith('Link copied to clipboard', undefined)
  })

  it('should ask to copy by hand, without claiming success, when copying fails', async () => {
    const user = userEvent.setup()
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: vi.fn().mockRejectedValue(new Error('denied')) } })
    document.execCommand = vi.fn(() => false)
    const success = vi.spyOn(toast, 'success').mockImplementation(() => {})
    const error = vi.spyOn(toast, 'error').mockImplementation(() => {})
    render(<ShareDialog open onOpenChange={() => {}} url="https://mavuus.com/r/2" />)
    await user.click(screen.getByRole('button', { name: 'Copy' }))
    expect(success).not.toHaveBeenCalled()
    expect(error).toHaveBeenCalledWith("Couldn't copy the link. Select it and copy it instead.", undefined)
  })
})
