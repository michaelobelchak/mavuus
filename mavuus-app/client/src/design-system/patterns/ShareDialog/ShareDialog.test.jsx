import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { toast } from 'sonner'
import { ShareDialog } from './ShareDialog'

afterEach(() => vi.restoreAllMocks())

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
})
