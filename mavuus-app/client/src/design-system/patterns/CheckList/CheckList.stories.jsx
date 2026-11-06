import { CheckList } from './CheckList'

export default {
  title: 'Patterns/CheckList',
  component: CheckList,
  tags: ['autodocs'],
  args: { items: ['Monthly roundtables with peers', 'A vetted vendor list', 'A private job board'] },
  argTypes: { size: { control: 'select', options: ['sm', 'md'] } },
}

export const Default = {}

export const Small = { args: { size: 'sm' } }

export const WithoutReveal = { args: { reveal: false } }
