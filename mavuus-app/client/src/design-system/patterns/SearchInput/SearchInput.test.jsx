import { describe, it, expect, vi, afterEach } from 'vitest'
import { act, fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { SearchInput } from './SearchInput'

afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
})

describe('SearchInput', () => {
  it('should render a searchbox named Search with a search icon by default', () => {
    render(<SearchInput />)
    const input = screen.getByRole('searchbox', { name: 'Search' })
    expect(input.parentElement.querySelector('svg')).toHaveAttribute('aria-hidden', 'true')
  })

  it('should call onChange right away and onSearch once after the debounce', () => {
    vi.useFakeTimers()
    const onChange = vi.fn()
    const onSearch = vi.fn()
    render(<SearchInput onChange={onChange} onSearch={onSearch} />)
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
    render(<SearchInput debounce={500} onSearch={onSearch} />)
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'seo' } })
    act(() => vi.advanceTimersByTime(300))
    expect(onSearch).not.toHaveBeenCalled()
    act(() => vi.advanceTimersByTime(200))
    expect(onSearch).toHaveBeenCalledWith('seo')
  })

  it('should show a clear button only when there is text and clear on click', async () => {
    const user = userEvent.setup()
    const onSearch = vi.fn()
    render(<SearchInput onSearch={onSearch} />)
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
    render(<SearchInput />)
    const input = screen.getByRole('searchbox')
    await user.type(input, 'brand')
    await user.keyboard('{Escape}')
    expect(input).toHaveValue('')
  })

  it('should clear a controlled input through onChange', async () => {
    const user = userEvent.setup()
    function Controlled() {
      const [value, setValue] = useState('pricing')
      return <SearchInput value={value} onChange={(event) => setValue(event.target.value)} />
    }
    render(<Controlled />)
    await user.click(screen.getByRole('button', { name: 'Clear search' }))
    expect(screen.getByRole('searchbox')).toHaveValue('')
  })

  it('should not search after unmount', () => {
    vi.useFakeTimers()
    const onSearch = vi.fn()
    const { unmount } = render(<SearchInput onSearch={onSearch} />)
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
