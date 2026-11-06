import { Link } from './Link'

export default {
  title: 'Primitives/Link',
  component: Link,
  tags: ['autodocs'],
  args: { children: 'Read the member guide', to: '/resources' },
  argTypes: { variant: { control: 'select', options: ['inline', 'standalone'] } },
}

export const Inline = {
  render: (args) => (
    <p className="text-body text-text-secondary">
      New here? <Link {...args} /> before your first session.
    </p>
  ),
}

export const Standalone = { args: { variant: 'standalone', children: 'View all jobs', to: '/jobs' } }

export const External = { args: { to: undefined, href: 'https://mavuus.com', children: 'Visit mavuus.com' } }
