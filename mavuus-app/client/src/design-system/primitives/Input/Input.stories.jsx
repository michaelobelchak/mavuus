import { Mail, Search, X } from 'lucide-react'
import { IconButton } from '../IconButton/IconButton'
import { Input } from './Input'

export default {
  title: 'Primitives/Input',
  component: Input,
  tags: ['autodocs'],
  args: { 'aria-label': 'Email', placeholder: 'you@company.com' },
  argTypes: { size: { control: 'select', options: ['sm', 'md', 'lg'] } },
}

export const Default = {}

export const Small = { args: { size: 'sm' } }

export const Large = { args: { size: 'lg' } }

export const Invalid = { args: { invalid: true, defaultValue: 'not-an-email' } }

export const Disabled = { args: { disabled: true, defaultValue: 'demo@mavuus.com' } }

export const WithLeadingIcon = { args: { leadingIcon: Mail } }

export const WithTrailingIcon = { args: { trailingIcon: Mail } }

export const WithTrailing = {
  args: {
    type: 'search',
    'aria-label': 'Search members',
    placeholder: 'Search members',
    leadingIcon: Search,
    defaultValue: 'growth',
    trailing: <IconButton icon={X} size="sm" aria-label="Clear search" />,
  },
}
