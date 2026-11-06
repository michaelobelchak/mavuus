import { Button } from '../../primitives'
import { SectionHeader } from './SectionHeader'

export default {
  title: 'Patterns/SectionHeader',
  component: SectionHeader,
  tags: ['autodocs'],
  args: { title: 'Upcoming sessions', description: 'Join live or watch the recording later.' },
  argTypes: { level: { control: 'select', options: [1, 2, 3, 4] } },
}

export const Default = {}

export const WithEyebrowAndActions = {
  args: { eyebrow: 'Live', actions: <Button variant="outline">See all</Button> },
}

export const Level3 = { args: { level: 3, title: 'This week' } }
