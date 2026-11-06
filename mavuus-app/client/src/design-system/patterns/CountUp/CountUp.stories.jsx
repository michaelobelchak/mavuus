import { CountUp } from './CountUp'

export default {
  title: 'Patterns/CountUp',
  component: CountUp,
  tags: ['autodocs'],
  args: { value: '1,100+', className: 'text-h1 font-bold text-text-primary' },
}

export const Grouped = {}

export const Currency = { args: { value: '~$2.1M' } }

export const PlainNumber = { args: { value: 430 } }

export const NotANumber = { args: { value: 'Soon' } }
