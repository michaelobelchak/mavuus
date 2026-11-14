import { ArrowRight, Plus } from 'lucide-react'
import { Button } from './Button'

export default {
  title: 'Primitives/Button',
  component: Button,
  tags: ['autodocs'],
  args: { children: 'Join the community' },
  argTypes: {
    variant: { control: 'select', options: ['primary', 'secondary', 'outline', 'ghost', 'danger'] },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
  },
}

export const Primary = { args: { variant: 'primary' } }

export const Secondary = { args: { variant: 'secondary' } }

export const Outline = { args: { variant: 'outline' } }

export const Ghost = { args: { variant: 'ghost' } }

export const Danger = { args: { variant: 'danger', children: 'Delete job' } }

export const Sizes = {
  render: (args) => (
    <div className="flex items-center gap-ds-md">
      <Button {...args} size="sm">
        Small
      </Button>
      <Button {...args} size="md">
        Medium
      </Button>
      <Button {...args} size="lg">
        Large
      </Button>
    </div>
  ),
}

export const WithIcon = { args: { leadingIcon: Plus, children: 'Post a job' } }

export const TrailingIcon = { args: { variant: 'outline', trailingIcon: ArrowRight, children: 'View all' } }

export const Loading = { args: { loading: true, leadingIcon: Plus, children: 'Saving' } }

export const Disabled = { args: { disabled: true } }

export const AsLink = {
  render: (args) => (
    <div className="flex items-center gap-ds-md">
      <Button {...args} to="/jobs" trailingIcon={ArrowRight}>
        Browse jobs
      </Button>
      <Button {...args} variant="outline" href="https://mavuus.com">
        Visit mavuus.com
      </Button>
    </div>
  ),
}
