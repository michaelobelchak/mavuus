import { describe, it, expect, afterEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { mockIntersectionObserver } from '../../test/browserMocks'
import { CheckList } from './CheckList'

afterEach(() => vi.unstubAllGlobals())

const items = ['Monthly roundtables', 'Vetted vendor list', 'Private job board']

describe('CheckList', () => {
  it('should render a list with one item per entry and decorative check icons', () => {
    mockIntersectionObserver()
    const { container } = render(<CheckList items={items} />)
    expect(screen.getByRole('list')).toBeInTheDocument()
    expect(screen.getAllByRole('listitem')).toHaveLength(3)
    expect(container.querySelectorAll('li [aria-hidden="true"] svg')).toHaveLength(3)
  })

  it('should reveal items in sequence when reveal is on', () => {
    mockIntersectionObserver()
    render(<CheckList items={items} />)
    const steps = screen.getAllByRole('listitem').map((li) => li.getAttribute('data-reveal-step'))
    expect(steps).toEqual(['0', '1', '2'])
  })

  it('should render plain items without reveal when reveal is false', () => {
    render(<CheckList items={items} reveal={false} size="sm" />)
    const first = screen.getAllByRole('listitem')[0]
    expect(first).not.toHaveAttribute('data-reveal')
    expect(first).toHaveClass('text-body-sm')
  })
})
