import { describe, it, expect, vi, afterEach } from 'vitest'
import { act, render, renderHook, screen, waitFor } from '@testing-library/react'
import { Toaster } from './Toaster'
import { toast, useToast } from './toast'

afterEach(() => {
  act(() => toast.dismiss())
  vi.unstubAllGlobals()
})

function stubSmallScreen(small) {
  vi.stubGlobal('matchMedia', (query) => ({
    matches: query.includes('max-width') ? small : false,
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
  }))
}

describe('Toast', () => {
  it('should announce a success toast in a polite live region when toast.success is called', async () => {
    render(<Toaster />)
    act(() => {
      toast.success('Profile saved')
    })
    const message = await screen.findByText('Profile saved')
    expect(message.closest('[aria-live="polite"]')).not.toBeNull()
    expect(message.closest('[data-sonner-toast]')).toHaveAttribute('data-type', 'success')
  })

  it('should show a close button labelled Dismiss', async () => {
    render(<Toaster />)
    act(() => {
      toast.info('Session starts in 10 minutes')
    })
    await screen.findByText('Session starts in 10 minutes')
    expect(screen.getByRole('button', { name: 'Dismiss' })).toBeInTheDocument()
  })

  it('should sit bottom right on wide screens and top center on small screens', async () => {
    stubSmallScreen(false)
    const { unmount } = render(<Toaster />)
    act(() => {
      toast('Saved')
    })
    await screen.findByText('Saved')
    expect(document.querySelector('[data-sonner-toaster]')).toHaveAttribute('data-y-position', 'bottom')
    expect(document.querySelector('[data-sonner-toaster]')).toHaveAttribute('data-x-position', 'right')
    unmount()
    stubSmallScreen(true)
    render(<Toaster />)
    act(() => {
      toast('Saved again')
    })
    await screen.findByText('Saved again')
    expect(document.querySelector('[data-sonner-toaster]')).toHaveAttribute('data-y-position', 'top')
    expect(document.querySelector('[data-sonner-toaster]')).toHaveAttribute('data-x-position', 'center')
  })

  it('should theme the toaster with role tokens', async () => {
    render(<Toaster />)
    act(() => {
      toast.error('Payment failed')
    })
    await screen.findByText('Payment failed')
    const toaster = document.querySelector('[data-sonner-toaster]')
    expect(toaster.style.getPropertyValue('--normal-bg')).toBe('var(--surface-overlay)')
    expect(toaster.style.getPropertyValue('--error-bg')).toBe('var(--status-error-subtle)')
  })

  it('should resolve a promise toast with the success message', async () => {
    render(<Toaster />)
    let resolve
    const promise = new Promise((done) => {
      resolve = done
    })
    act(() => {
      toast.promise(promise, { loading: 'Uploading', success: 'Uploaded', error: 'Upload failed' })
    })
    await screen.findByText('Uploading')
    await act(async () => {
      resolve()
      await promise
    })
    await waitFor(() => expect(screen.getByText('Uploaded')).toBeInTheDocument())
  })

  // Same method names as src/components/ui/Toast.jsx useToast(), so callers only change the import.
  it('should return the old useToast method names from useToast', async () => {
    const { result } = renderHook(() => useToast())
    for (const method of ['success', 'error', 'info']) {
      expect(result.current[method]).toBeTypeOf('function')
    }
    expect(result.current.warning).toBeTypeOf('function')
    expect(result.current.promise).toBeTypeOf('function')
    render(<Toaster />)
    act(() => {
      result.current.error('Could not send the message')
    })
    expect(await screen.findByText('Could not send the message')).toBeInTheDocument()
  })

  it('should return the same object on every render so it is safe in effect deps', () => {
    const { result, rerender } = renderHook(() => useToast())
    const first = result.current
    rerender()
    expect(result.current).toBe(first)
  })
})
