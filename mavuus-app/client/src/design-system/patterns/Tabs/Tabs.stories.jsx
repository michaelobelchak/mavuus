import { Briefcase, Settings, Users } from 'lucide-react'
import { Text } from '../../primitives'
import { Tab, TabList, TabPanel, Tabs } from './Tabs'

const items = [
  { value: 'overview', label: 'Overview', icon: Briefcase, content: <Text>Workspace stats and activity.</Text> },
  { value: 'members', label: 'Members', icon: Users, content: <Text>Everyone in the workspace.</Text> },
  { value: 'billing', label: 'Billing', disabled: true, content: <Text>Plan and invoices.</Text> },
  { value: 'settings', label: 'Settings', icon: Settings, content: <Text>Preferences.</Text> },
]

export default {
  title: 'Patterns/Tabs',
  component: Tabs,
  tags: ['autodocs'],
  args: { items, 'aria-label': 'Workspace', defaultValue: 'overview' },
  argTypes: {
    variant: { control: 'select', options: ['underline', 'pill'] },
    size: { control: 'select', options: ['sm', 'md'] },
  },
}

export const Underline = {}

export const Pill = { args: { variant: 'pill' } }

export const Small = { args: { size: 'sm' } }

export const ActivateOnFocus = { args: { activateOnFocus: true } }

export const Compound = {
  render: () => (
    <Tabs variant="pill" size="sm" defaultValue="week">
      <TabList aria-label="Range">
        <Tab value="week">Week</Tab>
        <Tab value="month">Month</Tab>
        <Tab value="year">Year</Tab>
      </TabList>
      <TabPanel value="week">Last 7 days</TabPanel>
      <TabPanel value="month">Last 30 days</TabPanel>
      <TabPanel value="year">Last 12 months</TabPanel>
    </Tabs>
  ),
}
