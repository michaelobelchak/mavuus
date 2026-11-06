import { TrendBadge } from './TrendBadge'

export default {
  title: 'Primitives/TrendBadge',
  component: TrendBadge,
  tags: ['autodocs'],
  args: { value: 32.54, direction: 'up', goodWhen: 'up' },
  argTypes: {
    direction: { control: 'select', options: ['up', 'down', 'flat'] },
    goodWhen: { control: 'select', options: ['up', 'down'] },
    size: { control: 'select', options: ['sm', 'md'] },
  },
}

export const UpIsGood = {}

export const DownIsBad = { args: { value: -12.4, direction: 'down' } }

export const DownIsGood = { args: { value: -8.1, direction: 'down', goodWhen: 'down' } }

export const UpIsBad = { args: { value: 5.75, direction: 'up', goodWhen: 'down' } }

export const Flat = { args: { value: 0, direction: 'flat' } }
