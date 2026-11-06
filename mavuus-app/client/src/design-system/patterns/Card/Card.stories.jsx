import { Bookmark } from 'lucide-react'
import { Heading, IconButton, Text } from '../../primitives'
import { Card, CardAction, CardLink } from './Card'

export default {
  title: 'Patterns/Card',
  component: Card,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="max-w-sm">
        <Story />
      </div>
    ),
  ],
  args: {
    children: (
      <>
        <Heading level={3} size="h4">
          Fractional CMO roles
        </Heading>
        <Text tone="secondary">Short engagements with growth-stage teams.</Text>
      </>
    ),
  },
  argTypes: {
    variant: { control: 'select', options: ['feature', 'surface', 'panel', 'panel-pink', 'media'] },
    padding: { control: 'select', options: ['none', 'sm', 'md', 'lg'] },
    as: { control: 'select', options: ['div', 'article', 'section', 'li'] },
  },
}

export const Feature = {}

export const Surface = { args: { variant: 'surface' } }

export const Panel = { args: { variant: 'panel' } }

export const PanelPink = { args: { variant: 'panel-pink' } }

export const Media = {
  args: {
    variant: 'media',
    media: <div className="aspect-video bg-surface-sunken" role="img" aria-label="Session recap" />,
  },
}

export const WithRule = { args: { rule: true } }

export const Interactive = { args: { interactive: true } }

export const Clickable = {
  args: {
    interactive: true,
    children: (
      <div className="flex flex-col gap-ds-xs">
        <Heading level={3} size="h4">
          <CardLink to="/jobs/42">Head of Growth</CardLink>
        </Heading>
        <Text tone="secondary">Remote, full time</Text>
        <CardAction className="self-end">
          <IconButton icon={Bookmark} aria-label="Save job" />
        </CardAction>
      </div>
    ),
  },
}
