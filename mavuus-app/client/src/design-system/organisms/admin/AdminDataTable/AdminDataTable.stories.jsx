import { useState } from 'react'
import { CheckCircle, Download, EyeOff, ShieldAlert, Trash2 } from 'lucide-react'
import { userEvent, within } from 'storybook/test'
import { Avatar, Button, Text } from '../../../primitives'
import { StatusBadge } from '../StatusBadge'
import { AdminDataTable } from './AdminDataTable'

const reviews = [
  [1, 'Priya Nair', 'VP Marketing, Contoso', 'Northwind Growth', 5, 'Ran our ABM program end to end and doubled pipeline in two quarters.', 'approved', 'Oct 28, 2026'],
  [2, 'Marcus Lee', 'CMO, Fabrikam', 'Brightpath Media', 2, 'Missed two launch dates and the paid social reporting never matched our numbers.', 'flagged', 'Oct 26, 2026'],
  [3, 'Ana Souza', 'Head of Brand, Tailspin', 'Lumen Creative', 4, 'Strong brand refresh, a little slow on revisions.', 'approved', 'Oct 22, 2026'],
  [4, 'Tom Becker', 'Growth Lead, Litware', 'Signal Path SEO', 1, 'Spam link building. We had to disavow half of it.', 'hidden', 'Oct 19, 2026'],
  [5, 'Hana Kim', 'Director of Demand Gen, Adatum', 'Northwind Growth', 5, 'Best HubSpot partner we have worked with.', 'approved', 'Oct 15, 2026'],
  [6, 'Sam Carter', 'Fractional CMO', 'Brightpath Media', 3, 'Good creative, average strategy.', 'pending', 'Oct 11, 2026'],
].map(([id, name, title, vendor, rating, text, status, date]) => ({ id, name, title, vendor, rating, text, status, date }))

const columns = [
  {
    key: 'name',
    header: 'Reviewer',
    cell: (row) => (
      <span className="inline-flex items-center gap-ds-sm">
        <Avatar name={row.name} size="sm" />
        <span className="flex flex-col">
          {row.name}
          <span className="text-caption font-normal text-text-muted">{row.title}</span>
        </span>
      </span>
    ),
  },
  { key: 'vendor', header: 'Vendor', hideBelow: 'lg' },
  {
    key: 'text',
    header: 'Review',
    cell: (row) => (
      <Text as="span" size="body-sm" tone="secondary" className="line-clamp-2 max-w-md">
        {row.text}
      </Text>
    ),
  },
  { key: 'rating', header: 'Rating', align: 'right', sortable: true, cell: (row) => `${row.rating} / 5` },
  { key: 'status', header: 'Status', cell: (row) => <StatusBadge status={row.status} /> },
  { key: 'date', header: 'Date', hideBelow: 'md' },
]

const rowActions = (row) => [
  { key: 'approve', label: 'Approve', icon: CheckCircle, hidden: row.status === 'approved', onSelect: () => {} },
  { key: 'flag', label: 'Flag', icon: ShieldAlert, hidden: row.status === 'flagged', onSelect: () => {} },
  { key: 'hide', label: 'Hide', icon: EyeOff, hidden: row.status === 'hidden', onSelect: () => {} },
  { type: 'separator' },
  {
    key: 'delete',
    label: 'Delete',
    icon: Trash2,
    destructive: true,
    confirm: {
      title: `Delete ${row.name}'s review?`,
      description: `The ${row.vendor} rating is recalculated. This can't be undone.`,
      confirmLabel: 'Delete review',
    },
    onSelect: () => {},
  },
]

const bulkActions = [
  { key: 'approve', label: 'Approve', icon: CheckCircle, onSelect: () => {} },
  { key: 'hide', label: 'Hide', icon: EyeOff, onSelect: () => {} },
  { key: 'delete', label: 'Delete', icon: Trash2, destructive: true, onSelect: () => {} },
]

function Toolbar(args) {
  const [status, setStatus] = useState(null)
  const rows = status ? args.rows.filter((row) => row.status === status) : args.rows
  return (
    <AdminDataTable
      {...args}
      rows={rows}
      filters={[
        {
          type: 'select',
          key: 'status',
          label: 'Moderation status',
          placeholder: 'All statuses',
          items: [
            { value: 'approved', label: 'Approved' },
            { value: 'flagged', label: 'Flagged' },
            { value: 'hidden', label: 'Hidden' },
            { value: 'pending', label: 'Pending' },
          ],
          value: status,
          onChange: setStatus,
        },
      ]}
      onClearFilters={() => setStatus(null)}
    />
  )
}

export default {
  title: 'Organisms/Admin/AdminDataTable',
  component: AdminDataTable,
  tags: ['autodocs'],
  decorators: [(Story) => <div className="w-7xl max-w-full"><Story /></div>],
  args: {
    caption: 'Reviews',
    columns,
    rows: reviews,
    rowActions,
    selectable: true,
    bulkActions,
    search: { label: 'Search reviews', placeholder: 'Search reviews' },
    toolbarActions: (
      <Button variant="outline" size="sm" leadingIcon={Download}>
        Export CSV
      </Button>
    ),
    pagination: { pageSize: 5 },
  },
  render: (args) => <Toolbar {...args} />,
}

export const Default = {}

export const WithSelection = { args: { defaultSelectedIds: [2, 4] } }

export const Loading = { args: { rows: [], loading: true } }

export const Empty = {
  args: { rows: [], search: { label: 'Search reviews', placeholder: 'Search reviews', defaultValue: 'Acme' } },
}

export const LoadError = {
  args: { rows: [], error: 'The reviews service did not respond. Your filters are kept.', onRetry: () => {} },
}

export const RefreshError = { args: { error: true, onRetry: () => {} } }

export const DestructiveConfirm = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const body = within(canvasElement.ownerDocument.body)
    await userEvent.click(canvas.getByRole('button', { name: 'Actions for Marcus Lee' }))
    await userEvent.click(await body.findByRole('menuitem', { name: 'Delete' }))
    await body.findByRole('dialog')
  },
}

export const BulkDestructiveConfirm = {
  args: { defaultSelectedIds: [2, 4] },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const body = within(canvasElement.ownerDocument.body)
    const region = canvas.getByRole('region', { name: 'Bulk actions' })
    await userEvent.click(within(region).getByRole('button', { name: 'Delete' }))
    await body.findByRole('dialog')
  },
}
