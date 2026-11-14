import { Bell, Star } from 'lucide-react'
import { Icon } from './Icon'

export default {
  title: 'Primitives/Icon',
  component: Icon,
  tags: ['autodocs'],
  args: { icon: Star },
  argTypes: { size: { control: 'select', options: ['sm', 'md', 'lg'] }, icon: { control: false } },
}

export const Decorative = {}

export const Labeled = { args: { label: 'Top rated', className: 'text-text-brand-strong' } }

export const Sizes = {
  render: () => (
    <div className="flex items-center gap-ds-md text-text-primary">
      <Icon icon={Bell} size="sm" />
      <Icon icon={Bell} size="md" />
      <Icon icon={Bell} size="lg" />
    </div>
  ),
}
