import { useState } from 'react'
import { StatusBadge } from '../../admin'
import { JobCard, JobCardSkeleton } from './JobCard'

const jobs = [
  {
    id: 42,
    title: 'VP of Demand Generation',
    company: 'Northwind Growth',
    description: 'Own pipeline targets across paid, partner and field programs for a Series C B2B SaaS team selling to finance leaders.',
    location: 'Remote, US',
    type: 'Full time',
    salary: '$190k - $230k',
    category: 'Demand Gen',
    seniority: 'Lead',
    postedLabel: '2d ago',
  },
  {
    id: 43,
    title: 'Fractional CMO',
    company: 'Lumen Creative',
    description: 'Two days a week. Build the first marketing plan, hire a content lead and set up reporting the board trusts.',
    location: 'New York, NY',
    type: 'Contract',
    salary: '$12k a month',
    category: 'Leadership',
    seniority: 'Senior',
    postedLabel: 'Yesterday',
  },
  {
    id: 44,
    title: 'Senior Content Strategist',
    company: 'TechFlow',
    description: 'Run the editorial calendar for a developer tools brand and turn customer interviews into stories that rank.',
    location: 'Austin, TX',
    type: 'Full time',
    category: 'Content',
    seniority: 'Mid',
    postedLabel: '1w ago',
  },
]

function SaveableJob(args) {
  const [saved, setSaved] = useState(args.saved ?? false)
  return <JobCard {...args} saved={saved} onSavedChange={setSaved} />
}

export default {
  title: 'Organisms/Dashboard/JobCard',
  component: JobCard,
  tags: ['autodocs'],
  decorators: [(Story, { parameters }) => <div className={parameters.wide ? 'w-4xl max-w-full' : 'w-3xl max-w-full'}><Story /></div>],
  args: { ...jobs[0], to: '/dashboard/jobs/42' },
  render: (args) => <SaveableJob {...args} />,
}

export const Default = {}

export const Saved = { args: { saved: true } }

export const Application = {
  args: {
    description: undefined,
    category: undefined,
    seniority: undefined,
    salary: undefined,
    status: <StatusBadge status="interview" size="sm" />,
    postedLabel: 'Applied Oct 3',
  },
  render: (args) => <JobCard {...args} />,
}

export const SavedListItem = {
  args: { description: undefined, category: undefined, seniority: undefined, postedLabel: undefined, onRemove: () => {} },
  render: (args) => <JobCard {...args} />,
}

export const MyPosting = {
  args: {
    description: undefined,
    type: undefined,
    salary: undefined,
    category: undefined,
    seniority: undefined,
    applicantCount: 12,
    status: <StatusBadge status="open" size="sm" />,
    postedLabel: 'Posted Oct 21',
  },
  render: (args) => <JobCard {...args} />,
}

export const MissingFields = {
  args: { title: 'Marketing Operations Manager', company: undefined, description: undefined, location: undefined, type: undefined, salary: undefined, category: undefined, seniority: undefined, postedLabel: undefined, to: undefined },
  render: (args) => <JobCard {...args} />,
}

export const LongContent = {
  args: {
    title: 'Global Head of Integrated Marketing, Brand, Communications and Customer Advocacy for EMEA and North America',
    company: 'Contoso Enterprise Software International Holdings',
    description:
      'Lead a team of 40 across brand, content, PR, analyst relations, events and customer marketing. You will own the global narrative, the analyst program and the customer advisory board, and partner with sales leadership on a 900 million dollar pipeline target while you rebuild the agency roster from the ground up.',
    location: 'London, UK or Boston, MA, hybrid three days a week',
  },
}

export const Loading = { render: () => <JobCardSkeleton /> }

export const List = {
  parameters: { wide: true },
  render: () => (
    <ul className="flex flex-col gap-ds-sm">
      {jobs.map((job) => (
        <li key={job.id}>
          <SaveableJob {...job} to={`/dashboard/jobs/${job.id}`} />
        </li>
      ))}
      <li>
        <JobCardSkeleton />
      </li>
    </ul>
  ),
}
