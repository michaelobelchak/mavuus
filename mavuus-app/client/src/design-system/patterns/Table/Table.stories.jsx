import { Badge } from '../../primitives'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from './Table'

const jobs = [
  { id: 1, title: 'Head of Growth', company: 'Northwind', status: 'Open', applicants: 12 },
  { id: 2, title: 'Brand Director', company: 'Contoso', status: 'Paused', applicants: 4 },
  { id: 3, title: 'Fractional CMO', company: 'Fabrikam', status: 'Open', applicants: 27 },
]

function JobsTable({ density, hideCaption = false }) {
  return (
    <Table density={density}>
      <TableCaption visuallyHidden={hideCaption}>Open jobs posted this month</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Title</TableHead>
          <TableHead>Company</TableHead>
          <TableHead>Status</TableHead>
          <TableHead align="right">Applicants</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {jobs.map((job) => (
          <TableRow key={job.id}>
            <TableCell className="font-semibold">{job.title}</TableCell>
            <TableCell>{job.company}</TableCell>
            <TableCell>
              <Badge tone={job.status === 'Open' ? 'success' : 'warning'}>{job.status}</Badge>
            </TableCell>
            <TableCell align="right" className="tabular-nums">
              {job.applicants}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

export default {
  title: 'Patterns/Table',
  component: Table,
  tags: ['autodocs'],
}

export const Default = { render: () => <JobsTable /> }

export const Compact = { render: () => <JobsTable density="compact" /> }

export const HiddenCaption = { render: () => <JobsTable hideCaption /> }

export const Overflowing = {
  render: () => (
    <div className="max-w-xs">
      <JobsTable />
    </div>
  ),
}
