import { Banner } from './Banner'

export default {
  title: 'Patterns/Banner',
  component: Banner,
  tags: ['autodocs'],
  args: { title: 'Scheduled maintenance on Sunday from 2 to 4 AM ET' },
  argTypes: { tone: { control: 'select', options: ['info', 'success', 'warning', 'error'] } },
}

export const Info = {}

export const Warning = { args: { tone: 'warning' } }

export const Dismissible = { args: { title: 'New: on-demand sessions are live', onDismiss: () => {} } }
