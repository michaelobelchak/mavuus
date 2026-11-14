import { Share2 } from 'lucide-react'
import { withToaster } from '../../../../.storybook/decorators'
import { Button } from '../../primitives'
import { ShareDialog } from './ShareDialog'

export default {
  title: 'Patterns/ShareDialog',
  component: ShareDialog,
  tags: ['autodocs'],
  decorators: [withToaster],
  args: {
    trigger: (
      <Button variant="outline" leadingIcon={Share2}>
        Share
      </Button>
    ),
    title: 'Share Event With Your Friends',
    url: 'https://mavuus.com/events/1',
    shareTitle: 'Building a Content Engine That Scales',
  },
}

export const Default = {}

export const Open = { args: { defaultOpen: true } }
