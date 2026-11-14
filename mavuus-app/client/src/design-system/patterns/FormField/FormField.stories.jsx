import { Checkbox, Input, RadioGroup, Select, Switch, Textarea } from '../../primitives'
import { FormField } from './FormField'

export default {
  title: 'Patterns/FormField',
  component: FormField,
  tags: ['autodocs'],
  args: { label: 'Work email', hint: 'We send session invites here.' },
  argTypes: { layout: { control: 'select', options: ['stacked', 'inline'] } },
  render: (args) => (
    <FormField {...args}>
      <Input type="email" placeholder="name@company.com" />
    </FormField>
  ),
}

export const Default = {}

export const Required = { args: { required: true } }

export const WithError = { args: { error: 'Enter an email like name@company.com.' } }

export const WithTextarea = {
  args: { label: 'Headline', hint: 'Up to 80 characters.' },
  render: (args) => (
    <FormField {...args}>
      <Textarea rows={3} />
    </FormField>
  ),
}

export const WithSelect = {
  args: { label: 'Work type', hint: undefined, error: 'Choose a work type.' },
  render: (args) => (
    <FormField {...args}>
      <Select
        placeholder="Select"
        items={[
          { value: 'remote', label: 'Remote' },
          { value: 'hybrid', label: 'Hybrid' },
        ]}
      />
    </FormField>
  ),
}

export const InlineCheckbox = {
  args: { label: 'I accept the community guidelines', layout: 'inline', hint: undefined, required: true },
  render: (args) => (
    <FormField {...args}>
      <Checkbox />
    </FormField>
  ),
}

export const InlineSwitch = {
  args: { label: 'Show my profile in the directory', layout: 'inline', hint: 'Members can find and message you.' },
  render: (args) => (
    <FormField {...args}>
      <Switch />
    </FormField>
  ),
}

export const RadioGroupField = {
  name: 'RadioGroup',
  args: { label: 'Seniority', group: true, hint: 'Your current level.' },
  render: (args) => (
    <FormField {...args}>
      <RadioGroup
        options={[
          { value: 'director', label: 'Director' },
          { value: 'vp', label: 'VP' },
          { value: 'cmo', label: 'CMO' },
        ]}
      />
    </FormField>
  ),
}
