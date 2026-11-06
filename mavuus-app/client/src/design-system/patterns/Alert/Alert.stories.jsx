import { Button } from '../../primitives'
import { Alert } from './Alert'

export default {
  title: 'Patterns/Alert',
  component: Alert,
  tags: ['autodocs'],
  args: { title: 'Profile saved', description: 'Members can now see your updated headline.' },
  argTypes: { tone: { control: 'select', options: ['info', 'success', 'warning', 'error'] } },
}

export const Info = { args: { tone: 'info', title: 'New sessions every Tuesday' } }

export const Success = { args: { tone: 'success' } }

export const Warning = { args: { tone: 'warning', title: 'Your plan renews in 3 days' } }

export const ErrorTone = {
  name: 'Error',
  args: { tone: 'error', title: 'Payment failed', description: 'Update your card to keep your plan.' },
}

export const Dismissible = { args: { onDismiss: () => {} } }

export const WithActions = {
  args: { tone: 'warning', title: 'Your plan renews in 3 days', actions: <Button size="sm">Manage plan</Button> },
}
