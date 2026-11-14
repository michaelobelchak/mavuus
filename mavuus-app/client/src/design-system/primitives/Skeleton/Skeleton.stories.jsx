import { Skeleton } from './Skeleton'

export default {
  title: 'Primitives/Skeleton',
  component: Skeleton,
  tags: ['autodocs'],
  argTypes: { shape: { control: 'select', options: ['text', 'circle', 'rect'] } },
}

export const Text = { args: { shape: 'text', lines: 3, className: 'max-w-md' } }

export const Circle = { args: { shape: 'circle', className: 'size-12' } }

export const Rect = { args: { shape: 'rect', className: 'h-40 max-w-md' } }

export const MemberCard = {
  render: () => (
    <div className="flex max-w-md items-start gap-ds-md rounded-card bg-surface-raised p-ds-lg shadow-card">
      <Skeleton shape="circle" className="size-12" />
      <Skeleton shape="text" lines={3} />
    </div>
  ),
}
