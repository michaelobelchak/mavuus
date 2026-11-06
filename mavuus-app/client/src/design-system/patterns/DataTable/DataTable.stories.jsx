import { useState } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { Avatar, Badge, Button } from '../../primitives'
import { FilterBar } from '../FilterBar/FilterBar'
import { SearchInput } from '../SearchInput/SearchInput'
import { DataTable } from './DataTable'

const people = [
  ['Dilya Abushayeva', 'dilya@mavuus.com', 'admin', 'pro', false, '2025-09-14'],
  ['Elmira Abushayeva', 'elmira@mavuus.com', 'admin', 'pro', false, '2025-09-14'],
  ['Sam Carter', 'sam@northwind.com', 'member', 'free', false, '2026-02-03'],
  ['Priya Nair', 'priya@contoso.com', 'member', 'pro', false, '2026-03-11'],
  ['Marcus Lee', 'marcus@fabrikam.com', 'member', 'free', true, '2026-04-27'],
  ['Ana Souza', 'ana@tailspin.com', 'member', 'pro', false, '2026-05-02'],
  ['Tom Becker', 'tom@litware.com', 'member', 'free', false, '2026-06-19'],
  ['Hana Kim', 'hana@adatum.com', 'member', 'pro', false, '2026-07-08'],
]
const users = people.map(([name, email, role, tier, banned, joined], index) => ({
  id: index + 1,
  name,
  email,
  role,
  tier,
  banned,
  joined,
}))

const columns = [
  {
    key: 'name',
    header: 'User',
    sortable: true,
    cell: (row) => (
      <span className="inline-flex items-center gap-ds-sm">
        <Avatar name={row.name} size="sm" />
        <span className="flex flex-col">
          {row.name}
          <span className="text-caption font-normal text-text-muted">{row.email}</span>
        </span>
      </span>
    ),
  },
  { key: 'role', header: 'Role', cell: (row) => <Badge tone={row.role === 'admin' ? 'info' : undefined}>{row.role}</Badge> },
  { key: 'tier', header: 'Tier', hideBelow: 'lg' },
  {
    key: 'banned',
    header: 'Status',
    cell: (row) => <Badge tone={row.banned ? 'error' : 'success'}>{row.banned ? 'Banned' : 'Active'}</Badge>,
  },
  { key: 'joined', header: 'Joined', sortable: true, align: 'right', hideBelow: 'md' },
]

const rowActions = (row) => [
  { label: 'View profile', to: `/admin/users/${row.id}` },
  { type: 'separator' },
  { label: row.banned ? 'Unban' : 'Ban', tone: row.banned ? undefined : 'danger', onSelect: () => {} },
]

export default {
  title: 'Patterns/DataTable',
  component: DataTable,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <MemoryRouter>
        <Story />
      </MemoryRouter>
    ),
  ],
  args: { caption: 'Members', columns, rows: users, pagination: { pageSize: 5 }, rowActions, rowHref: (row) => `/admin/users/${row.id}` },
}

export const Default = {}

export const Compact = { args: { density: 'compact' } }

function SelectableStory(args) {
  const [selected, setSelected] = useState([])
  return (
    <DataTable
      {...args}
      selectable
      selectedIds={selected}
      onSelectionChange={setSelected}
      toolbar={
        selected.length > 0 && (
          <div className="flex items-center gap-ds-sm">
            <span className="text-body-sm text-text-secondary">{selected.length} selected</span>
            <Button variant="outline" size="sm">
              Export selected
            </Button>
          </div>
        )
      }
    />
  )
}

export const Selectable = { render: (args) => <SelectableStory {...args} /> }

function WithToolbarStory(args) {
  const [search, setSearch] = useState('')
  const [role, setRole] = useState(null)
  const rows = args.rows.filter(
    (row) => (!role || row.role === role) && row.name.toLowerCase().includes(search.toLowerCase()),
  )
  return (
    <DataTable
      {...args}
      rows={rows}
      toolbar={
        <FilterBar
          search={<SearchInput label="Search members" value={search} onChange={(event) => setSearch(event.target.value)} />}
          filters={[
            {
              type: 'select',
              key: 'role',
              label: 'Role',
              placeholder: 'Any role',
              items: [
                { value: 'admin', label: 'Admin' },
                { value: 'member', label: 'Member' },
              ],
              value: role,
              onChange: setRole,
            },
          ]}
          active={search !== ''}
          onClear={() => {
            setRole(null)
            setSearch('')
          }}
        />
      }
    />
  )
}

export const WithToolbar = { render: (args) => <WithToolbarStory {...args} /> }

// Server-side paging and sorting: the rows are the current page, the API gives the total.
function ServerSideStory(args) {
  const [page, setPage] = useState(2)
  const [sort, setSort] = useState({ key: 'joined', direction: 'desc' })
  return (
    <DataTable
      {...args}
      rows={args.rows.slice(0, 5)}
      pagination={{ manual: true, page, pageSize: 20, rowCount: 134, onPageChange: setPage }}
      manualSorting
      sort={sort}
      onSortChange={setSort}
    />
  )
}

export const ServerSide = { render: (args) => <ServerSideStory {...args} /> }

export const Loading = { args: { loading: true, rows: [] } }

// A page change on the server: the old rows stay, dimmed and aria-busy, until the new page lands.
export const LoadingNextPage = {
  render: (args) => <ServerSideStory {...args} loading />,
}

export const Empty = { args: { rows: [] } }

// Below md the rows stack as cards by default; scroll keeps the table and scrolls it sideways.
export const MobileScroll = { args: { mobileLayout: 'scroll' } }
