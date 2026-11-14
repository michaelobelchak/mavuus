import { Radio, RadioGroup } from './Radio'

const frequencies = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'never', label: 'Never', disabled: true },
]

export default {
  title: 'Primitives/Radio',
  component: RadioGroup,
  subcomponents: { Radio },
  tags: ['autodocs'],
  args: { 'aria-label': 'Digest frequency', options: frequencies, defaultValue: 'weekly' },
  argTypes: { orientation: { control: 'inline-radio', options: ['vertical', 'horizontal'] } },
}

export const Vertical = {}

export const Horizontal = { args: { orientation: 'horizontal' } }

export const WithChildren = {
  args: { options: undefined, defaultValue: 'remote', 'aria-label': 'Work type' },
  render: (args) => (
    <RadioGroup {...args}>
      <Radio value="remote" label="Remote" />
      <Radio value="hybrid" label="Hybrid" />
      <Radio value="onsite" label="On-site" />
    </RadioGroup>
  ),
}

export const Disabled = { args: { disabled: true } }

export const WithLabel = { args: { 'aria-label': undefined, label: 'Digest frequency' } }

export const Required = { args: { 'aria-label': undefined, label: 'Plan', required: true, defaultValue: undefined } }

export const Invalid = { args: { 'aria-label': undefined, label: 'Plan', required: true, invalid: true, defaultValue: undefined } }
