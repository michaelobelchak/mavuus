import { ProgressBar } from './ProgressBar'

export default {
  title: 'Primitives/ProgressBar',
  component: ProgressBar,
  tags: ['autodocs'],
  args: { label: 'Profile complete', value: 60, showValue: true },
  argTypes: {
    tone: { control: 'select', options: ['brand', 'success', 'warning', 'error'] },
    size: { control: 'inline-radio', options: ['sm', 'md'] },
  },
  decorators: [(Story) => <div className="max-w-md">{Story()}</div>],
}

export const Default = {}

export const Small = { args: { size: 'sm' } }

export const HiddenLabel = { args: { hideLabel: true, showValue: false } }

export const Tones = {
  render: (args) => (
    <div className="flex flex-col gap-ds-md">
      <ProgressBar {...args} label="Brand" tone="brand" />
      <ProgressBar {...args} label="Success" tone="success" value={100} />
      <ProgressBar {...args} label="Warning" tone="warning" value={80} />
      <ProgressBar {...args} label="Error" tone="error" value={95} />
    </div>
  ),
}

export const Steps = { args: { label: 'Onboarding steps', value: 2, max: 5 } }
