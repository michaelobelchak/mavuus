import { useState } from 'react'
import { Checkbox } from './Checkbox'

export default {
  title: 'Primitives/Checkbox',
  component: Checkbox,
  tags: ['autodocs'],
  args: { label: 'Open to mentoring' },
}

export const Default = {}

export const Checked = { args: { defaultChecked: true } }

export const Indeterminate = { args: { label: 'Select all members', indeterminate: true } }

export const Disabled = { args: { disabled: true } }

export const DisabledChecked = { args: { disabled: true, defaultChecked: true } }

export const WithoutVisibleLabel = { args: { label: undefined, 'aria-label': 'Select row' } }

export const Controlled = {
  render: function ControlledCheckbox(args) {
    const [checked, setChecked] = useState(false)
    return <Checkbox {...args} checked={checked} onCheckedChange={setChecked} label={checked ? 'Subscribed' : 'Subscribe to the digest'} />
  },
}

export const Invalid = { args: { label: 'Accept the community guidelines', invalid: true } }

export const DisabledIndeterminate = { args: { label: 'Select all members', indeterminate: true, disabled: true } }
