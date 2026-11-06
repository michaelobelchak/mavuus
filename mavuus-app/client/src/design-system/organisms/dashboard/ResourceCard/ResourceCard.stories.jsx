import { useState } from 'react'
import { Bookmark } from 'lucide-react'
import { IconButton } from '../../../primitives'
import { ResourceCard, ResourceCardSkeleton } from './ResourceCard'

const resources = [
  {
    id: 1,
    title: 'The 2026 B2B attribution playbook',
    category: 'Analytics',
    type: 'Guide',
    description: 'How six CMOs moved from last touch to blended attribution without losing the board.',
    author: 'Dilya Abushayeva',
    readTime: '8 min read',
  },
  {
    id: 2,
    title: 'Quarterly board deck template for marketing leaders',
    category: 'Leadership',
    type: 'Template',
    description: 'The twelve slides our members use to report pipeline, CAC and brand health.',
    author: 'Mavuus team',
    readTime: '5 min read',
  },
  {
    id: 3,
    title: 'Hiring your first demand gen lead',
    category: 'Hiring',
    description: 'Scorecard, interview loop and a take-home that shows real judgment.',
    author: 'Priya Nair',
    readTime: '6 min read',
  },
]

function SaveButton() {
  const [saved, setSaved] = useState(false)
  return (
    <IconButton
      icon={Bookmark}
      variant="ghost"
      size="sm"
      aria-label="Save resource"
      aria-pressed={saved}
      onClick={() => setSaved(!saved)}
      className={saved ? 'text-text-brand-strong [&>svg]:fill-current' : undefined}
    />
  )
}

export default {
  title: 'Organisms/Dashboard/ResourceCard',
  component: ResourceCard,
  tags: ['autodocs'],
  decorators: [(Story) => <div className="max-w-sm"><Story /></div>],
  args: { ...resources[0], to: '/dashboard/resources/1' },
}

export const Default = {}

export const External = { args: { to: undefined, href: 'https://hbr.org/topic/marketing' } }

export const WithSave = { args: { actions: <SaveButton /> } }

export const MissingFields = { args: { category: undefined, type: undefined, description: undefined, author: undefined, readTime: undefined } }

export const LongContent = {
  args: {
    title: 'Everything we learned running 40 customer advisory boards: agendas, invites, follow ups and what to do when the loudest customer is wrong',
    description:
      'A long read with the agenda templates, the invite emails, the follow up cadence and the scoring model we use to decide which feedback makes the roadmap and which goes in the parking lot.',
    author: 'Alexandra Montgomery-Fitzgerald, SVP Brand, Contoso',
  },
}

export const Loading = { render: () => <ResourceCardSkeleton /> }

export const Grid = {
  decorators: [(Story) => <div className="max-w-6xl"><Story /></div>],
  render: () => (
    <ul className="grid grid-cols-1 gap-ds-md md:grid-cols-2 lg:grid-cols-3">
      {resources.map((resource) => (
        <li key={resource.id}>
          <ResourceCard {...resource} to={`/dashboard/resources/${resource.id}`} actions={<SaveButton />} />
        </li>
      ))}
      <li>
        <ResourceCardSkeleton />
      </li>
    </ul>
  ),
}
