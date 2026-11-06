import { Bell, Pencil, Trash2 } from 'lucide-react'
import { IconButton } from './IconButton'

export default {
  title: 'Primitives/IconButton',
  component: IconButton,
  tags: ['autodocs'],
  args: { icon: Bell, 'aria-label': 'Notifications' },
  argTypes: {
    variant: { control: 'select', options: ['primary', 'secondary', 'outline', 'ghost', 'danger'] },
    size: { control: 'select', options: ['sm', 'md'] },
  },
}

export const Ghost = { args: { variant: 'ghost' } }

export const Primary = { args: { variant: 'primary', icon: Pencil, 'aria-label': 'Edit profile' } }

export const Outline = { args: { variant: 'outline' } }

export const Danger = { args: { variant: 'danger', icon: Trash2, 'aria-label': 'Delete job' } }

export const Sizes = {
  render: (args) => (
    <div className="flex items-center gap-ds-md">
      <IconButton {...args} size="sm" />
      <IconButton {...args} size="md" />
    </div>
  ),
}

export const Disabled = { args: { disabled: true } }
