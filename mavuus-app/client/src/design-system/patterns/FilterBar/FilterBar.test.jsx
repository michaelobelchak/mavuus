import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
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

  it('should clear every filter in one onClear call with the empty values and not call onChange', async () => {
    const user = userEvent.setup()
    const onWorkType = vi.fn()
    const onRoles = vi.fn()
    const onClear = vi.fn()
    render(<FilterBar filters={filters({ workType: 'remote', roles: ['vp'], onWorkType, onRoles })} onClear={onClear} />)
    await user.click(screen.getByRole('button', { name: 'Clear filters' }))
    expect(onClear).toHaveBeenCalledTimes(1)
    expect(onClear).toHaveBeenCalledWith({ workType: null, roles: [] })
    expect(onWorkType).not.toHaveBeenCalled()
    expect(onRoles).not.toHaveBeenCalled()
  })

  it('should reset a shared state object in one update', async () => {
    const user = userEvent.setup()
    function Harness() {
      const [state, setState] = useState({ workType: 'remote', roles: ['vp', 'cmo'], when: 'week' })
      const set = (key) => (value) => setState((current) => ({ ...current, [key]: value }))
      return (
        <FilterBar
          filters={[
            ...filters({ workType: state.workType, roles: state.roles, onWorkType: set('workType'), onRoles: set('roles') }),
            {
              type: 'chips',
              key: 'when',
              label: 'When',
              options: [{ value: 'week', label: 'This week' }],
              value: state.when,
              onChange: set('when'),
            },
          ]}
          onClear={(empty) => setState((current) => ({ ...current, ...empty }))}
        />
      )
    }
    render(<Harness />)
    await user.click(screen.getByRole('button', { name: 'Clear filters' }))
    expect(screen.getByRole('combobox', { name: 'Work type' })).toHaveTextContent('Any work type')
    for (const name of ['CMO', 'VP', 'This week']) {
      expect(screen.getByRole('button', { name })).toHaveAttribute('aria-pressed', 'false')
    }
    expect(screen.queryByRole('button', { name: 'Clear filters' })).toBeNull()
  })

  it('should treat an array value equal to its empty value as inactive', () => {
    const custom = [{ ...filters()[1], value: ['all'], emptyValue: ['all'] }]
    render(<FilterBar filters={custom} />)
    expect(screen.queryByRole('button', { name: 'Clear filters' })).toBeNull()
  })

  it('should render a custom filter with the bar size and include it in clear-all', async () => {
    const user = userEvent.setup()
    const onClear = vi.fn()
    const render_ = vi.fn(({ size }) => <button type="button">Salary {size}</button>)
    render(
      <FilterBar
        size="sm"
        filters={[{ type: 'custom', key: 'salary', render: render_, active: true, emptyValue: [0, 500] }]}
        onClear={onClear}
      />,
    )
    expect(screen.getByRole('button', { name: 'Salary sm' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Clear filters' }))
    expect(onClear).toHaveBeenCalledWith({ salary: [0, 500] })
  })

  it('should leave a custom filter without an emptyValue out of the reset and inactive by default', () => {
    render(<FilterBar filters={[{ type: 'custom', key: 'sort', render: () => <span>Sort</span> }]} />)
    expect(screen.getByText('Sort')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Clear filters' })).toBeNull()
  })

  it('should warn in dev when a filter has no key', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})
    render(<FilterBar filters={[{ ...filters()[0], key: undefined }]} />)
    expect(error).toHaveBeenCalledWith(expect.stringMatching(/FilterBar: .*key/))
  })

  it('should count a filter as active when active is set, for search text kept outside the filters', () => {
    const onClear = vi.fn()
    render(<FilterBar filters={filters()} active onClear={onClear} />)
    expect(screen.getByRole('button', { name: 'Clear filters' })).toBeInTheDocument()
  })

  it('should size selects, chips and Clear filters for touch by default', () => {
    render(<FilterBar filters={filters({ workType: 'remote' })} />)
    expect(screen.getByRole('combobox', { name: 'Work type' })).toHaveClass('h-12')
    expect(screen.getByRole('button', { name: 'Clear filters' })).toHaveClass('h-12')
    const chip = screen.getByRole('button', { name: 'CMO' })
    expect(chip).toHaveClass('h-10', 'relative', 'after:absolute', 'after:-inset-y-1')
  })

  it('should pass the dense sm size to its controls when size is sm', () => {
    render(<FilterBar size="sm" filters={filters({ workType: 'remote' })} />)
    expect(screen.getByRole('combobox', { name: 'Work type' })).toHaveClass('h-10')
    expect(screen.getByRole('button', { name: 'Clear filters' })).toHaveClass('h-10')
    expect(screen.getByRole('button', { name: 'CMO' })).toHaveClass('h-10', 'after:-inset-y-1')
  })

  it('should warn and fall back to md when the size is unknown', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})
    render(<FilterBar size="xl" filters={filters()} />)
    expect(screen.getByRole('combobox', { name: 'Work type' })).toHaveClass('h-12')
    expect(error).toHaveBeenCalledWith(expect.stringMatching(/FilterBar: size "xl"/))
  })

  it('should warn and skip a filter with an unknown type', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})
    render(<FilterBar filters={[{ type: 'range', key: 'salary', label: 'Salary' }]} />)
    expect(error).toHaveBeenCalledWith(expect.stringMatching(/FilterBar: .*type "range"/))
  })
})
