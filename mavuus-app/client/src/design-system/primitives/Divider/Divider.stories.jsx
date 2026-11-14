import { Divider } from './Divider'

export default {
  title: 'Primitives/Divider',
  component: Divider,
  tags: ['autodocs'],
  decorators: [(Story) => <div className="max-w-md">{Story()}</div>],
}

export const Horizontal = {}

export const WithLabel = { args: { label: 'or' } }

export const Vertical = {
  render: () => (
    <div className="flex h-10 items-center gap-ds-md text-body-sm text-text-secondary">
      <span>Jobs</span>
      <Divider orientation="vertical" />
      <span>Vendors</span>
    </div>
  ),
}
