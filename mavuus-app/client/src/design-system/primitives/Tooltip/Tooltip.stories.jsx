import { Copy } from 'lucide-react'
import { Button } from '../Button'
import { IconButton } from '../IconButton'
import { Tooltip } from './Tooltip'

export default {
  title: 'Primitives/Tooltip',
  component: Tooltip,
  tags: ['autodocs'],
  args: { content: 'Copy the invite link' },
  argTypes: { side: { control: 'select', options: ['top', 'bottom', 'left', 'right'] } },
  decorators: [(Story) => <div className="p-ds-xxl">{Story()}</div>],
}

export const OnIconButton = {
  render: (args) => (
    <Tooltip {...args}>
      <IconButton icon={Copy} aria-label="Copy invite link" variant="outline" />
    </Tooltip>
  ),
}

export const OnButton = {
  args: { content: 'Members see this on your profile', side: 'bottom' },
  render: (args) => (
    <Tooltip {...args}>
      <Button variant="outline">Public profile</Button>
    </Tooltip>
  ),
}

export const NoDelay = { ...OnIconButton, args: { delay: 0 } }

export const Open = { ...OnIconButton, args: { defaultOpen: true } }
