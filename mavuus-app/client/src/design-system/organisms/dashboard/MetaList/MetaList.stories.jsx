import { Clock, DollarSign, MapPin, Users } from 'lucide-react'
import { MetaList } from './MetaList'

export default {
  title: 'Organisms/Dashboard/MetaList',
  component: MetaList,
  tags: ['autodocs'],
  args: {
    items: [
      { key: 'location', icon: MapPin, label: 'Remote, US' },
      { key: 'type', icon: Clock, label: 'Full time' },
      { key: 'salary', icon: DollarSign, label: '$180k - $220k' },
    ],
  },
}

export const Default = {}

export const MissingFields = {
  args: {
    items: [
      { key: 'location', icon: MapPin, label: 'New York, NY' },
      { key: 'type', icon: Clock, label: null },
      { key: 'applicants', icon: Users, label: '12 applicants' },
    ],
  },
}

export const NarrowWrap = {
  decorators: [(Story) => <div className="w-56 max-w-full"><Story /></div>],
  args: {
    items: [
      { key: 'location', icon: MapPin, label: 'San Francisco Bay Area, hybrid' },
      { key: 'type', icon: Clock, label: 'Contract, 6 months' },
      { key: 'salary', icon: DollarSign, label: '$140 - $180 an hour' },
    ],
  },
}
