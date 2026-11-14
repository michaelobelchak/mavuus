import { Text } from '../../primitives'
import { NumberedTabs } from './NumberedTabs'

const items = [
  { num: '01', title: 'Strategy', tag: 'Plan the year', body: 'Set goals with peers who have done it before.' },
  { num: '02', title: 'Execution', tag: 'Ship the plan', body: 'Get vetted vendors and playbooks to move fast.' },
  { num: '03', title: 'Leadership', tag: 'Grow the team', body: 'Hire, coach and lead with the community behind you.' },
]

export default {
  title: 'Patterns/NumberedTabs',
  component: NumberedTabs,
  tags: ['autodocs'],
  args: {
    label: 'Strategy to leadership',
    items,
    scaleStart: 'Strategy',
    scaleEnd: 'Leadership',
    renderPanel: (item) => <Text tone="secondary">{item.body}</Text>,
  },
}

export const Default = {}

export const StartOnSecond = { args: { initial: 1 } }
