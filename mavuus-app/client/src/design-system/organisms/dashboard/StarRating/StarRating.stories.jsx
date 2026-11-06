import { useState } from 'react'
import { StarRating } from './StarRating'

export default {
  title: 'Organisms/Dashboard/StarRating',
  component: StarRating,
  tags: ['autodocs'],
  args: { value: 4.5 },
  argTypes: { size: { control: 'select', options: ['sm', 'md', 'lg'] } },
}

export const ReadOnly = {}

export const Sizes = {
  render: (args) => (
    <div className="flex flex-col gap-ds-sm">
      <StarRating {...args} size="sm" />
      <StarRating {...args} size="md" />
      <StarRating {...args} size="lg" />
    </div>
  ),
}

export const Unrated = { args: { value: 0 } }

function InputStory(args) {
  const [value, setValue] = useState(args.value)
  return <StarRating {...args} value={value} onChange={setValue} />
}

export const Input = {
  args: { value: 3, label: 'Your rating', showLabel: true },
  render: (args) => <InputStory {...args} />,
}
