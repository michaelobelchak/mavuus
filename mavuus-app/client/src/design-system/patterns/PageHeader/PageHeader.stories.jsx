import { MemoryRouter } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { Button } from '../../primitives'
import { PageHeader } from './PageHeader'

export default {
  title: 'Patterns/PageHeader',
  component: PageHeader,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <MemoryRouter>
        <Story />
      </MemoryRouter>
    ),
  ],
  args: { title: 'Jobs', description: 'Roles shared by members and partners.' },
}

export const Default = {}

export const WithActions = {
  args: {
    actions: (
      <>
        <Button variant="outline">My jobs</Button>
        <Button leadingIcon={Plus}>Post a job</Button>
      </>
    ),
  },
}

export const WithBreadcrumbs = {
  args: {
    eyebrow: 'Community',
    breadcrumbs: [
      { label: 'Home', to: '/dashboard' },
      { label: 'Jobs', to: '/dashboard/jobs' },
    ],
  },
}
