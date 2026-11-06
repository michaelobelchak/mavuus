import { MemoryRouter } from 'react-router-dom'
import { Heading, Text } from '../../primitives'
import { Card } from './Card'

export default {
  title: 'Patterns/Card',
  component: Card,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <MemoryRouter>
        <div className="max-w-sm">
          <Story />
        </div>
      </MemoryRouter>
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

export const AsLink = { args: { to: '/jobs/42' } }
