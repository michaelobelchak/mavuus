import { describe, it, expect, vi, afterEach } from 'vitest'
import { copyText } from './copyText'

const clipboardDescriptor = Object.getOwnPropertyDescriptor(navigator, 'clipboard')
const originalExecCommand = document.execCommand

afterEach(() => {
  if (clipboardDescriptor) Object.defineProperty(navigator, 'clipboard', clipboardDescriptor)
  else delete navigator.clipboard
  document.execCommand = originalExecCommand
  document.body.innerHTML = ''
})

const setClipboard = (value) => Object.defineProperty(navigator, 'clipboard', { configurable: true, value })
const field = (value) => {
  const input = document.createElement('input')
  input.readOnly = true
  input.value = value
  document.body.append(input)
  return input
}

describe('copyText', () => {
  it('should use the Clipboard API when it works', async () => {
    const writeText = vi.fn().mockResolvedValue()
    setClipboard({ writeText })
    document.execCommand = vi.fn()
    await expect(copyText('hello', field('hello'))).resolves.toBe(true)
    expect(writeText).toHaveBeenCalledWith('hello')
    expect(document.execCommand).not.toHaveBeenCalled()
  })

  it('should select the field and use execCommand when the Clipboard API refuses', async () => {
    setClipboard({ writeText: vi.fn().mockRejectedValue(new Error('denied')) })
    document.execCommand = vi.fn(() => true)
    const input = field('hello')
    await expect(copyText('hello', input)).resolves.toBe(true)
    expect(document.activeElement).toBe(input)
    expect(document.execCommand).toHaveBeenCalledWith('copy')
  })

  it('should resolve false when nothing could copy', async () => {
    setClipboard(undefined)
    document.execCommand = vi.fn(() => false)
    await expect(copyText('hello', field('hello'))).resolves.toBe(false)
    await expect(copyText('hello')).resolves.toBe(false)
  })
})
