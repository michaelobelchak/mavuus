import { Breadcrumbs } from './Breadcrumbs'

export default {
  title: 'Patterns/Breadcrumbs',
  component: Breadcrumbs,
  tags: ['autodocs'],
  args: {
    items: [
      { label: 'Home', to: '/dashboard' },
      { label: 'Jobs', to: '/dashboard/jobs' },
      { label: 'Head of Growth', to: '/dashboard/jobs/42' },
    ],
  },
}

export const Default = {}

export const LongLabel = {
  args: {
    items: [
      { label: 'Home', to: '/dashboard' },
      { label: 'Resources', to: '/dashboard/resources' },
      { label: 'How we rebuilt our demand generation engine in two quarters', to: '/dashboard/resources/7' },
    ],
  },
}
