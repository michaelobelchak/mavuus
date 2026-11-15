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

/** A referral link: the email invite starts with `inviteMessage` instead of the default line. */
export const Invite = {
  args: {
    defaultOpen: true,
    title: 'Share your invite link',
    url: 'https://mavuus.com/register?ref=MAVUUS2026',
    shareTitle: 'Join me on Mavuus',
    inviteMessage: "I'd like you to join me on Mavuus, a community for marketing leaders:",
  },
}
