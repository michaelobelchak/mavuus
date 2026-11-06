import { Accordion } from './Accordion'

const items = [
  { value: 'join', title: 'Who can join?', content: 'Marketing leaders at director level and above.' },
  { value: 'cost', title: 'What does it cost?', content: 'Plans start at $49 a month, billed yearly.' },
  { value: 'cancel', title: 'Can I cancel?', content: 'Any time, from your account settings.' },
  { value: 'refund', title: 'Do you offer refunds?', content: 'Within 14 days of your first payment.', disabled: true },
]

export default {
  title: 'Patterns/Accordion',
  component: Accordion,
  tags: ['autodocs'],
  args: { items },
  argTypes: { headingLevel: { control: 'select', options: [2, 3, 4, 5, 6] } },
}

export const Default = {}

export const OpenByDefault = { args: { defaultValue: 'cost' } }

export const Multiple = { args: { multiple: true, defaultValue: ['join', 'cost'] } }
