import { Copy } from 'lucide-react'
import { Button, IconButton, Input, Label, Text, Tooltip } from '../../primitives'
import { Dialog, DialogClose } from './Dialog'

export default {
  title: 'Patterns/Dialog',
  component: Dialog,
  tags: ['autodocs'],
  args: {
    trigger: <Button>Invite member</Button>,
    title: 'Invite a member',
    description: 'They get an email with a link to join your workspace.',
    children: (
      <div className="flex flex-col gap-ds-xs">
        <Label htmlFor="invite-email">Email</Label>
        <Input id="invite-email" type="email" placeholder="name@company.com" />
      </div>
    ),
    footer: (
      <>
        <DialogClose>
          <Button variant="ghost">Cancel</Button>
        </DialogClose>
        <Button>Send invite</Button>
      </>
    ),
  },
  argTypes: { size: { control: 'select', options: ['sm', 'md', 'lg'] } },
}

export const Default = {}

export const Small = { args: { size: 'sm' } }

export const Large = {
  args: {
    size: 'lg',
    children: <Text>Session recordings stay available to members for 12 months after the event.</Text>,
  },
}

export const NotDismissible = {
  args: {
    dismissible: false,
    title: 'Delete this job post?',
    description: 'Applicants lose access to it right away.',
    children: undefined,
    footer: (
      <>
        <DialogClose>
          <Button variant="ghost">Keep it</Button>
        </DialogClose>
        <DialogClose>
          <Button>Delete</Button>
        </DialogClose>
      </>
    ),
  },
}

export const WithTooltip = {
  args: {
    title: 'Share the session',
    description: undefined,
    children: (
      <Tooltip content="Copy the invite link">
        <IconButton icon={Copy} aria-label="Copy link" variant="outline" />
      </Tooltip>
    ),
    footer: undefined,
  },
}
