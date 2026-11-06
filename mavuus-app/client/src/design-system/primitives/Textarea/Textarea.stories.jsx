import { Textarea } from './Textarea'

export default {
  title: 'Primitives/Textarea',
  component: Textarea,
  tags: ['autodocs'],
  args: { 'aria-label': 'Bio', placeholder: 'Tell members what you work on' },
  argTypes: { size: { control: 'select', options: ['sm', 'md'] } },
}

export const Default = {}

export const AutoGrow = {
  args: {
    autoGrow: true,
    rows: 2,
    defaultValue: 'Head of growth at a B2B SaaS company. I run demand gen and lifecycle.',
  },
}

export const Invalid = { args: { invalid: true, defaultValue: 'Too short' } }

export const Disabled = { args: { disabled: true, defaultValue: 'You can edit this after you verify your email.' } }
