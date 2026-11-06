import { useState } from 'react'
import { Check } from 'lucide-react'
import { Chip } from './Chip'

export default {
  title: 'Primitives/Chip',
  component: Chip,
  tags: ['autodocs'],
  args: { children: 'Remote' },
  argTypes: { size: { control: 'select', options: ['xs', 'sm'] } },
}

export const Default = { args: { selected: false } }

export const Selected = { args: { selected: true } }

export const WithIcon = { args: { selected: true, leadingIcon: Check } }

export const Sizes = {
  render: (args) => (
    <div className="flex items-center gap-ds-sm">
      <Chip {...args} size="xs" />
      <Chip {...args} size="sm" />
    </div>
  ),
}

export const Disabled = { args: { disabled: true } }

function FilterGroup() {
  const options = ['Remote', 'Hybrid', 'On-site', 'Contract']
  const [active, setActive] = useState(['Remote'])
  const toggle = (option) =>
    setActive((current) => (current.includes(option) ? current.filter((o) => o !== option) : [...current, option]))
  return (
    <div className="flex flex-wrap gap-ds-xs">
      {options.map((option) => (
        <Chip key={option} selected={active.includes(option)} onClick={() => toggle(option)}>
          {option}
        </Chip>
      ))}
    </div>
  )
}

export const FilterGroupExample = { name: 'Filter group', render: () => <FilterGroup /> }
