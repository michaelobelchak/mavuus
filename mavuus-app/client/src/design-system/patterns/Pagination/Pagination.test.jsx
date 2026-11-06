import { describe, it, expect, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { getPaginationRange } from './paginationRange'
import { Pagination } from './Pagination'

describe('getPaginationRange', () => {
  it('should return one page when there is one page', () => {
    expect(getPaginationRange(1, 1)).toEqual([1])
  })

  it('should return both pages when there are two pages', () => {
    expect(getPaginationRange(2, 2)).toEqual([1, 2])
  })

  it('should list every page when they fit without ellipses', () => {
    expect(getPaginationRange(4, 7)).toEqual([1, 2, 3, 4, 5, 6, 7])
  })

  it('should put an ellipsis on the end side when the page is near the start', () => {
    expect(getPaginationRange(1, 20)).toEqual([1, 2, 3, 4, 5, 'ellipsis-end', 20])
    expect(getPaginationRange(3, 20)).toEqual([1, 2, 3, 4, 5, 'ellipsis-end', 20])
  })

  it('should put an ellipsis on the start side when the page is near the end', () => {
    expect(getPaginationRange(20, 20)).toEqual([1, 'ellipsis-start', 16, 17, 18, 19, 20])
  })

  it('should put ellipses on both sides when the page is in the middle', () => {
    expect(getPaginationRange(10, 20)).toEqual([1, 'ellipsis-start', 9, 10, 11, 'ellipsis-end', 20])
  })

  it('should widen the window when siblings is larger', () => {
    expect(getPaginationRange(10, 20, 2)).toEqual([1, 'ellipsis-start', 8, 9, 10, 11, 12, 'ellipsis-end', 20])
  })

  it('should clamp a page outside the range', () => {
    expect(getPaginationRange(99, 3)).toEqual([1, 2, 3])
    expect(getPaginationRange(0, 0)).toEqual([])
  })
})

describe('Pagination', () => {
  it('should render a named nav with the current page marked', () => {
    render(<Pagination page={3} pageCount={10} onPageChange={() => {}} />)
    expect(screen.getByRole('navigation', { name: 'Pagination' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Page 3' })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('button', { name: 'Page 4' })).not.toHaveAttribute('aria-current')
  })

  it('should call onPageChange with the page when a page is clicked', () => {
    const onPageChange = vi.fn()
    render(<Pagination page={3} pageCount={10} onPageChange={onPageChange} />)
    fireEvent.click(screen.getByRole('button', { name: 'Page 4' }))
    expect(onPageChange).toHaveBeenCalledWith(4)
  })

  it('should not call onPageChange when the current page is clicked', () => {
    const onPageChange = vi.fn()
    render(<Pagination page={3} pageCount={10} onPageChange={onPageChange} />)
    fireEvent.click(screen.getByRole('button', { name: 'Page 3' }))
    expect(onPageChange).not.toHaveBeenCalled()
  })

  it('should move one page with the labelled previous and next buttons', () => {
    const onPageChange = vi.fn()
    render(<Pagination page={3} pageCount={10} onPageChange={onPageChange} />)
    fireEvent.click(screen.getByRole('button', { name: 'Previous page' }))
    fireEvent.click(screen.getByRole('button', { name: 'Next page' }))
    expect(onPageChange.mock.calls).toEqual([[2], [4]])
  })

  it('should disable previous on the first page and next on the last page', () => {
    const { rerender } = render(<Pagination page={1} pageCount={5} onPageChange={() => {}} />)
    expect(screen.getByRole('button', { name: 'Previous page' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Next page' })).toBeEnabled()
    rerender(<Pagination page={5} pageCount={5} onPageChange={() => {}} />)
    expect(screen.getByRole('button', { name: 'Next page' })).toBeDisabled()
  })

  it('should show hidden ellipses between page windows', () => {
    const { container } = render(<Pagination page={10} pageCount={20} onPageChange={() => {}} />)
    const ellipses = container.querySelectorAll('[data-pagination-ellipsis]')
    expect(ellipses).toHaveLength(2)
    for (const ellipsis of ellipses) expect(ellipsis).toHaveAttribute('aria-hidden', 'true')
  })

  it('should render nothing when there is only one page', () => {
    const { container } = render(<Pagination page={1} pageCount={1} onPageChange={() => {}} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('should give every control at least a 44px target', () => {
    render(<Pagination page={2} pageCount={2} onPageChange={() => {}} />)
    for (const button of screen.getAllByRole('button')) expect(button).toHaveClass('size-12')
  })
})
