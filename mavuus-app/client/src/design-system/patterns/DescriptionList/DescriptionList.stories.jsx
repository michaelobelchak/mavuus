import { DescriptionList } from './DescriptionList'

export default {
  title: 'Patterns/DescriptionList',
  component: DescriptionList,
  tags: ['autodocs'],
  args: {
    items: [
      { key: 'type', label: 'Type', value: 'Live' },
      { key: 'category', label: 'Category', value: 'Content Strategy' },
      { key: 'duration', label: 'Duration', value: '60 min' },
    ],
  },
  decorators: [
    (Story) => (
      <div className="max-w-xs">
        <Story />
      </div>
    ),
  ],
}

export const Default = {}
