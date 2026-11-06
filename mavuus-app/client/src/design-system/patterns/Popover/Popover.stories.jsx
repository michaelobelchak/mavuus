import { Info } from 'lucide-react'
import { Button, IconButton, Text } from '../../primitives'
import { Popover } from './Popover'

export default {
  title: 'Patterns/Popover',
  component: Popover,
  tags: ['autodocs'],
  args: {
    trigger: <Button variant="outline">Plan details</Button>,
    title: 'Pro plan',
    popupClassName: 'w-72',
    children: <Text size="body-sm">Unlimited messages, job posts and session recordings.</Text>,
  },
  argTypes: {
    side: { control: 'select', options: ['top', 'bottom', 'left', 'right'] },
    align: { control: 'select', options: ['start', 'center', 'end'] },
  },
}

export const Default = {}

export const WithoutTitle = {
  args: {
    title: undefined,
    trigger: <IconButton icon={Info} aria-label="About ratings" />,
    children: <Text size="body-sm">Ratings come from members who hired this vendor.</Text>,
  },
}

export const WithAction = {
  args: {
    children: (
      <>
        <Text size="body-sm">Upgrade to post more than three jobs a month.</Text>
        <Button size="sm">Upgrade</Button>
      </>
    ),
  },
}
