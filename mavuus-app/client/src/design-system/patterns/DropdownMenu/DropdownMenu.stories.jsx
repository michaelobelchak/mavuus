import { Copy, MoreHorizontal, Pencil, Trash2, Users } from 'lucide-react'
import { Button, IconButton } from '../../primitives'
import { DropdownMenu } from './DropdownMenu'

const items = [
  { type: 'label', label: 'Job post' },
  { label: 'Edit', icon: Pencil, onSelect: () => {}, shortcut: 'E' },
  { label: 'Duplicate', icon: Copy, onSelect: () => {} },
  { label: 'View applicants', icon: Users, href: '#applicants' },
  { label: 'Archive', disabled: true },
  { type: 'separator' },
  { label: 'Delete', icon: Trash2, tone: 'danger', onSelect: () => {} },
]

export default {
  title: 'Patterns/DropdownMenu',
  component: DropdownMenu,
  tags: ['autodocs'],
  args: { trigger: <Button variant="outline">Actions</Button>, items },
  argTypes: {
    side: { control: 'select', options: ['top', 'bottom', 'left', 'right'] },
    align: { control: 'select', options: ['start', 'center', 'end'] },
  },
}

export const Default = {}

export const IconTrigger = {
  args: { trigger: <IconButton icon={MoreHorizontal} aria-label="More actions" />, align: 'end' },
}

export const WithExternalLink = {
  args: { items: [{ label: 'Help center', href: 'https://mavuus.com' }, ...items.slice(1)] },
}
