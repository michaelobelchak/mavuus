import { Button } from '../../primitives'
import { SectionHeader } from './SectionHeader'

export default {
  title: 'Patterns/SectionHeader',
  component: SectionHeader,
  tags: ['autodocs'],
  args: { title: 'Upcoming sessions', description: 'Join live or watch the recording later.' },
  argTypes: { headingLevel: { control: 'select', options: [1, 2, 3, 4] } },
}

export const Default = {}

export const WithEyebrowAndActions = {
  args: { eyebrow: 'Live', actions: <Button variant="outline">See all</Button> },
}

export const Level3 = { args: { headingLevel: 3, title: 'This week' } }

/** App pages: an h2 at the h3 size, so sections don't outsize the top bar's title. */
export const AppSection = { args: { size: 'h3', title: 'Upcoming Live Sessions' } }
