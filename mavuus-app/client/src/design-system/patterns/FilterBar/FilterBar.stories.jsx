import { useState } from 'react'
import { Download } from 'lucide-react'
import { Button } from '../../primitives'
import { SearchInput } from '../SearchInput'
import { FilterBar } from './FilterBar'

export default {
  title: 'Patterns/FilterBar',
  component: FilterBar,
  tags: ['autodocs'],
}

function MemberFilters() {
  const [query, setQuery] = useState('')
  const [{ workType, roles }, setFilters] = useState({ workType: null, roles: [] })
  const set = (key) => (value) => setFilters((current) => ({ ...current, [key]: value }))
  return (
    <FilterBar
      aria-label="Member filters"
      search={
        <SearchInput
          aria-label="Search members"
          placeholder="Search members"
          size="sm"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      }
      filters={[
        {
          type: 'select',
          key: 'workType',
          label: 'Work type',
          placeholder: 'Any work type',
          items: [
            { value: 'remote', label: 'Remote' },
            { value: 'hybrid', label: 'Hybrid' },
            { value: 'onsite', label: 'On site' },
          ],
          value: workType,
          onChange: set('workType'),
        },
        {
          type: 'chips',
          key: 'roles',
          label: 'Roles',
          multiple: true,
          options: [
            { value: 'cmo', label: 'CMO' },
            { value: 'vp', label: 'VP' },
            { value: 'director', label: 'Director' },
          ],
          value: roles,
          onChange: set('roles'),
        },
      ]}
      active={query !== ''}
      onClear={(empty) => {
        setFilters((current) => ({ ...current, ...empty }))
        setQuery('')
      }}
      actions={
        <Button variant="outline" size="sm" leadingIcon={Download}>
          Export
        </Button>
      }
    />
  )
}

export const Default = { render: () => <MemberFilters /> }
