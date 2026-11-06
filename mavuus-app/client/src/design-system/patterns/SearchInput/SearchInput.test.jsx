import { describe, it, expect, vi, afterEach } from 'vitest'
import { act, fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { resetWarnings } from '../../lib/warnOnce'
import { FormField } from '../FormField'
import { SearchInput } from './SearchInput'

afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
  resetWarnings()
})

describe('SearchInput', () => {
  it('should fall back to the name Search and warn in dev when it has no label', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})
    render(<SearchInput />)
    const input = screen.getByRole('searchbox', { name: 'Search' })
    expect(input.parentElement.querySelector('svg')).toHaveAttribute('aria-hidden', 'true')
    expect(error).toHaveBeenCalledWith(expect.stringMatching(/SearchInput: .*label/))
  })

  it('should not count an id alone as a label', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})
    render(<SearchInput id="member-search" />)
    expect(screen.getByRole('searchbox', { name: 'Search' })).toBeInTheDocument()
    expect(error).toHaveBeenCalledWith(expect.stringMatching(/SearchInput: .*label/))
  })

  it('should render a visually hidden label from the label prop', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})
    render(<SearchInput label="Search members" />)
    const input = screen.getByRole('searchbox', { name: 'Search members' })
    expect(screen.getByText('Search members')).toHaveClass('sr-only')
    expect(input).not.toHaveAttribute('aria-label')
    expect(error).not.toHaveBeenCalled()
  })

  it('should take its name from aria-labelledby without warning', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})
    render(
      <>
        <h2 id="jobs-heading">Jobs</h2>
        <SearchInput aria-labelledby="jobs-heading" />
      </>,
    )
    expect(screen.getByRole('searchbox', { name: 'Jobs' })).not.toHaveAttribute('aria-label')
    expect(error).not.toHaveBeenCalled()
  })

  it('should take its name from a FormField label without warning', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})
    render(
      <FormField label="Find a vendor">
        <SearchInput />
      </FormField>,
    )
    expect(screen.getByRole('searchbox', { name: 'Find a vendor' })).not.toHaveAttribute('aria-label')
    expect(error).not.toHaveBeenCalled()
  })

  it('should size the clear button from the control scale to match the input', () => {
    const { rerender } = render(<SearchInput aria-label="Search" defaultValue="seo" />)
    expect(screen.getByRole('button', { name: 'Clear search' })).toHaveClass('size-12')
    rerender(<SearchInput aria-label="Search" defaultValue="seo" size="sm" />)
    expect(screen.getByRole('button', { name: 'Clear search' })).toHaveClass('size-10')
    expect(screen.getByRole('button', { name: 'Clear search' })).not.toHaveClass('size-8')
  })

  it('should call onChange right away and onSearch once after the debounce', () => {
    vi.useFakeTimers()
    const onChange = vi.fn()
    const onSearch = vi.fn()
    render(<SearchInput aria-label="Search" onChange={onChange} onSearch={onSearch} />)
    const input = screen.getByRole('searchbox')
    fireEvent.change(input, { target: { value: 'gr' } })
    fireEvent.change(input, { target: { value: 'growth' } })
    expect(onChange).toHaveBeenCalledTimes(2)
    act(() => vi.advanceTimersByTime(299))
    expect(onSearch).not.toHaveBeenCalled()
    act(() => vi.advanceTimersByTime(1))
    expect(onSearch).toHaveBeenCalledTimes(1)
    expect(onSearch).toHaveBeenCalledWith('growth')
  })

  it('should use the debounce prop', () => {
    vi.useFakeTimers()
    const onSearch = vi.fn()
    render(<SearchInput aria-label="Search" debounce={500} onSearch={onSearch} />)
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'seo' } })
    act(() => vi.advanceTimersByTime(300))
    expect(onSearch).not.toHaveBeenCalled()
    act(() => vi.advanceTimersByTime(200))
    expect(onSearch).toHaveBeenCalledWith('seo')
  })

  it('should show a clear button only when there is text and clear on click', async () => {
    const user = userEvent.setup()
    const onSearch = vi.fn()
    render(<SearchInput aria-label="Search" onSearch={onSearch} />)
    expect(screen.queryByRole('button', { name: 'Clear search' })).toBeNull()
    const input = screen.getByRole('searchbox')
    await user.type(input, 'brand')
    await user.click(screen.getByRole('button', { name: 'Clear search' }))
    expect(input).toHaveValue('')
    expect(input).toHaveFocus()
    expect(onSearch).toHaveBeenLastCalledWith('')
    expect(screen.queryByRole('button', { name: 'Clear search' })).toBeNull()
  })

  it('should clear on Escape', async () => {
    const user = userEvent.setup()
    render(<SearchInput aria-label="Search" />)
    const input = screen.getByRole('searchbox')
    await user.type(input, 'brand')
    await user.keyboard('{Escape}')
    expect(input).toHaveValue('')
  })

  it('should clear a controlled input through onChange', async () => {
    const user = userEvent.setup()
    function Controlled() {
      const [value, setValue] = useState('pricing')
      return <SearchInput aria-label="Search" value={value} onChange={(event) => setValue(event.target.value)} />
    }
    render(<Controlled />)
    await user.click(screen.getByRole('button', { name: 'Clear search' }))
    expect(screen.getByRole('searchbox')).toHaveValue('')
  })

  it('should drop a pending search when a controlled value is cleared from outside', () => {
    vi.useFakeTimers()
    const onSearch = vi.fn()
    function Controlled() {
      const [value, setValue] = useState('')
      return (
        <>
          <SearchInput aria-label="Search" value={value} onChange={(event) => setValue(event.target.value)} onSearch={onSearch} />
          <button type="button" onClick={() => setValue('')}>
            Reset
          </button>
        </>
      )
    }
    render(<Controlled />)
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'seo' } })
    fireEvent.click(screen.getByRole('button', { name: 'Reset' }))
    expect(screen.getByRole('searchbox')).toHaveValue('')
    act(() => vi.advanceTimersByTime(300))
    expect(onSearch).not.toHaveBeenCalledWith('seo')
  })

  it('should search with the latest value when a controlled value changes before the debounce fires', () => {
    vi.useFakeTimers()
    const onSearch = vi.fn()
    const { rerender } = render(<SearchInput aria-label="Search" value="" onChange={() => {}} onSearch={onSearch} />)
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'se' } })
    rerender(<SearchInput aria-label="Search" value="growth" onChange={() => {}} onSearch={onSearch} />)
    act(() => vi.advanceTimersByTime(300))
    expect(onSearch).not.toHaveBeenCalledWith('se')
  })

  it('should search with the text the field shows when a controlled parent transforms it', () => {
    vi.useFakeTimers()
    const onSearch = vi.fn()
    function Lowercase() {
      const [value, setValue] = useState('')
      return <SearchInput aria-label="Search" value={value} onChange={(event) => setValue(event.target.value.trim().toLowerCase())} onSearch={onSearch} />
    }
    render(<Lowercase />)
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'SEO ' } })
    expect(screen.getByRole('searchbox')).toHaveValue('seo')
    act(() => vi.advanceTimersByTime(300))
    expect(onSearch).toHaveBeenCalledTimes(1)
    expect(onSearch).toHaveBeenCalledWith('seo')
  })

  it('should not search after unmount', () => {
    vi.useFakeTimers()
    const onSearch = vi.fn()
    const { unmount } = render(<SearchInput aria-label="Search" onSearch={onSearch} />)
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'seo' } })
    unmount()
    act(() => vi.advanceTimersByTime(300))
    expect(onSearch).not.toHaveBeenCalled()
  })

  it('should take a custom label and pass props to the input', () => {
    render(<SearchInput aria-label="Search members" placeholder="Name or company" className="w-64" />)
    const input = screen.getByRole('searchbox', { name: 'Search members' })
    expect(input).toHaveAttribute('placeholder', 'Name or company')
    expect(input).toHaveClass('w-64')
  })
})
