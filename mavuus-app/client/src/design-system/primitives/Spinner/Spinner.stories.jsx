import { Spinner } from './Spinner'

export default {
  title: 'Primitives/Spinner',
  component: Spinner,
  tags: ['autodocs'],
  argTypes: { size: { control: 'select', options: ['sm', 'md', 'lg'] } },
}

export const Default = {}

export const Sizes = {
  render: () => (
    <div className="flex items-center gap-ds-md text-text-brand-strong">
      <Spinner size="sm" />
      <Spinner size="md" />
      <Spinner size="lg" />
    </div>
  ),
}

export const CustomLabel = { args: { label: 'Loading messages', size: 'lg' } }
