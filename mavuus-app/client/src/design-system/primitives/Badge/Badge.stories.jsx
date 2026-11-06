import { Star } from 'lucide-react'
import { Badge } from './Badge'

export default {
  title: 'Primitives/Badge',
  component: Badge,
  tags: ['autodocs'],
  args: { children: 'Pro member' },
  argTypes: {
    tone: { control: 'select', options: ['neutral', 'brand', 'success', 'warning', 'error', 'info', 'inverse'] },
    size: { control: 'select', options: ['sm', 'md'] },
  },
}

export const Neutral = { args: { tone: 'neutral', children: 'Draft' } }

export const Brand = { args: { tone: 'brand' } }

export const Success = { args: { tone: 'success', children: 'Hired' } }

export const Warning = { args: { tone: 'warning', children: 'Pending review' } }

export const ErrorTone = { name: 'Error', args: { tone: 'error', children: 'Closed' } }

export const Info = { args: { tone: 'info', children: 'New' } }

export const Inverse = { args: { tone: 'inverse', size: 'sm', children: '3' } }

export const Sizes = {
  render: (args) => (
    <div className="flex items-center gap-ds-sm">
      <Badge {...args} size="sm" />
      <Badge {...args} size="md" />
    </div>
  ),
}

export const WithIcon = { args: { tone: 'brand', leadingIcon: Star, children: 'Featured' } }
