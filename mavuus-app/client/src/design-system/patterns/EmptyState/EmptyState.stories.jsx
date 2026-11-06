import { Inbox } from 'lucide-react'
import { Button } from '../../primitives'
import { EmptyState } from './EmptyState'

export default {
  title: 'Patterns/EmptyState',
  component: EmptyState,
  tags: ['autodocs'],
  args: {
    icon: Inbox,
    title: 'No messages yet',
    description: 'When members write to you, their messages show up here.',
    actions: <Button>Find members</Button>,
  },
  argTypes: { size: { control: 'select', options: ['sm', 'md'] } },
}

export const Default = {}

export const Small = { args: { size: 'sm' } }

export const WithoutActions = { args: { actions: undefined } }
