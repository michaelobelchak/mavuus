import { withToaster } from '../../../../.storybook/decorators'
import { Button } from '../../primitives'
import { Toaster } from './Toaster'
import { toast } from './toast'

export default {
  title: 'Patterns/Toast',
  component: Toaster,
  tags: ['autodocs'],
  decorators: [withToaster],
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export const Statuses = {
  render: () => (
    <div className="flex flex-wrap gap-ds-sm">
      <Button onClick={() => toast.success('Profile saved')}>Success</Button>
      <Button variant="outline" onClick={() => toast.info('Session starts in 10 minutes')}>
        Info
      </Button>
      <Button variant="outline" onClick={() => toast.warning('Your plan renews in 3 days')}>
        Warning
      </Button>
      <Button variant="outline" onClick={() => toast.error('Payment failed', { description: 'Update your card.' })}>
        Error
      </Button>
    </div>
  ),
}

export const PromiseToast = {
  name: 'Promise',
  render: () => (
    <Button
      onClick={() => toast.promise(wait(1500), { loading: 'Uploading resume', success: 'Resume uploaded', error: 'Upload failed' })}
    >
      Upload
    </Button>
  ),
}
