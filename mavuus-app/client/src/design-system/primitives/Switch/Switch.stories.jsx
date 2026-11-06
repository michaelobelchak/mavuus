import { Switch } from './Switch'

export default {
  title: 'Primitives/Switch',
  component: Switch,
  tags: ['autodocs'],
  args: { label: 'Email notifications' },
}

export const Off = {}

export const On = { args: { defaultChecked: true } }

export const Disabled = { args: { disabled: true } }

export const DisabledOn = { args: { disabled: true, defaultChecked: true } }

export const WithoutVisibleLabel = { args: { label: undefined, 'aria-label': 'Public profile' } }
