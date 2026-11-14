import { Input } from '../Input'
import { Label } from './Label'

export default {
  title: 'Primitives/Label',
  component: Label,
  tags: ['autodocs'],
  args: { htmlFor: 'story-email', children: 'Work email' },
  render: (args) => (
    <div className="flex max-w-sm flex-col gap-ds-xs">
      <Label {...args} />
      <Input id="story-email" placeholder="you@company.com" />
    </div>
  ),
}

export const Default = {}

export const Required = { args: { required: true } }
