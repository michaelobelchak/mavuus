import { useState } from 'react'
import { MapPin } from 'lucide-react'
import { Select } from './Select'

const workTypes = [
  { value: 'remote', label: 'Remote' },
  { value: 'hybrid', label: 'Hybrid' },
  { value: 'onsite', label: 'On-site', disabled: true },
  { value: 'contract', label: 'Contract' },
]

export default {
  title: 'Primitives/Select',
  component: Select,
  tags: ['autodocs'],
  args: { 'aria-label': 'Work type', items: workTypes, placeholder: 'Choose a work type', className: 'w-72' },
  argTypes: { size: { control: 'select', options: ['sm', 'md', 'lg'] } },
}

export const Default = {}

export const WithValue = { args: { defaultValue: 'hybrid' } }

export const Small = { args: { size: 'sm' } }

export const Large = { args: { size: 'lg' } }

export const WithLeadingIcon = { args: { leadingIcon: MapPin } }

export const Invalid = { args: { invalid: true } }

export const Disabled = { args: { disabled: true, defaultValue: 'remote' } }

export const Controlled = {
  render: function ControlledSelect(args) {
    const [value, setValue] = useState('remote')
    return (
      <div className="flex flex-col gap-ds-xs">
        <Select {...args} value={value} onValueChange={setValue} />
        <p className="text-body-sm text-text-secondary">Selected: {value}</p>
      </div>
    )
  },
}
