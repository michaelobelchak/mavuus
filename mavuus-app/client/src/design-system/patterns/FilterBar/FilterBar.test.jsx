import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { resetWarnings } from '../../lib/warnOnce'
import { Button } from '../../primitives'
import { SearchInput } from '../SearchInput'
import { FilterBar } from './FilterBar'

afterEach(() => {
  vi.restoreAllMocks()
  resetWarnings()
})

function filters({ workType = null, roles = [], onWorkType = vi.fn(), onRoles = vi.fn() } = {}) {
  return [
    {
      type: 'select',
      key: 'workType',
      label: 'Work type',
      placeholder: 'Any work type',
      items: [
        { value: 'remote', label: 'Remote' },
        { value: 'hybrid', label: 'Hybrid' },
      ],
      value: workType,
      onChange: onWorkType,
    },
    {
      type: 'chips',
      key: 'roles',
      label: 'Roles',
      multiple: true,
      options: [
        { value: 'cmo', label: 'CMO' },
        { value: 'vp', label: 'VP' },
      ],
      value: roles,
      onChange: onRoles,
    },
  ]
}

describe('FilterBar', () => {
  it('should render the search slot, each configured filter and the actions slot', () => {
    render(
      <FilterBar
        aria-label="Member filters"
        search={<SearchInput aria-label="Search members" />}
        filters={filters()}
        actions={<Button size="sm">Export</Button>}
      />,
    )
    expect(screen.getByRole('searchbox', { name: 'Search members' })).toBeInTheDocument()
    expect(screen.getByRole('combobox', { name: 'Work type' })).toBeInTheDocument()
    const roles = screen.getByRole('group', { name: 'Roles' })
    expect(roles).toContainElement(screen.getByRole('button', { name: 'CMO' }))
    expect(screen.getByRole('button', { name: 'Export' })).toBeInTheDocument()
  })

  it('should wrap on small screens', () => {
    render(<FilterBar data-testid="bar" filters={filters()} />)
    expect(screen.getByTestId('bar')).toHaveClass('flex', 'flex-wrap')
  })

  it('should toggle chips through onChange', async () => {
    const user = userEvent.setup()
    const onRoles = vi.fn()
    render(<FilterBar filters={filters({ roles: ['cmo'], onRoles })} />)
    expect(screen.getByRole('button', { name: 'CMO' })).toHaveAttribute('aria-pressed', 'true')
    await user.click(screen.getByRole('button', { name: 'VP' }))
    expect(onRoles).toHaveBeenLastCalledWith(['cmo', 'vp'])
    await user.click(screen.getByRole('button', { name: 'CMO' }))
    expect(onRoles).toHaveBeenLastCalledWith([])
  })

  it('should select one chip at a time and deselect it on a second click when not multiple', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    const single = [
      { type: 'chips', key: 'when', label: 'When', options: [{ value: 'week', label: 'This week' }], value: 'week', onChange },
    ]
    render(<FilterBar filters={single} />)
    await user.click(screen.getByRole('button', { name: 'This week' }))
    expect(onChange).toHaveBeenLastCalledWith(null)
  })

  it('should call the select onChange with the picked value', async () => {
    const user = userEvent.setup()
    const onWorkType = vi.fn()
    render(<FilterBar filters={filters({ onWorkType })} />)
    await user.click(screen.getByRole('combobox', { name: 'Work type' }))
    await user.click(await screen.findByRole('option', { name: 'Hybrid' }))
    await waitFor(() => expect(onWorkType).toHaveBeenLastCalledWith('hybrid'))
  })

  it('should hide Clear filters when nothing is active', () => {
    render(<FilterBar filters={filters()} />)
    expect(screen.queryByRole('button', { name: 'Clear filters' })).toBeNull()
  })

  it('should reset every active filter through its onChange when Clear filters is clicked', async () => {
    const user = userEvent.setup()
    const onWorkType = vi.fn()
    const onRoles = vi.fn()
    const onClear = vi.fn()
    render(<FilterBar filters={filters({ workType: 'remote', roles: ['vp'], onWorkType, onRoles })} onClear={onClear} />)
    await user.click(screen.getByRole('button', { name: 'Clear filters' }))
    expect(onWorkType).toHaveBeenCalledWith(null)
    expect(onRoles).toHaveBeenCalledWith([])
    expect(onClear).toHaveBeenCalledTimes(1)
  })

  it('should count a filter as active when active is set, for search text kept outside the filters', () => {
    render(<FilterBar filters={filters()} active onClear={() => {}} />)
    expect(screen.getByRole('button', { name: 'Clear filters' })).toBeInTheDocument()
  })

  it('should warn and skip a filter with an unknown type', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})
    render(<FilterBar filters={[{ type: 'range', key: 'salary', label: 'Salary' }]} />)
    expect(error).toHaveBeenCalledWith(expect.stringMatching(/FilterBar: .*type "range"/))
  })
})
