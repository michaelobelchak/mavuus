import { Avatar } from './Avatar'
import { AvatarStack } from './AvatarStack'

export default {
  title: 'Primitives/Avatar',
  component: Avatar,
  tags: ['autodocs'],
  args: { name: 'Leah Andrew', src: '/assets/people/leah-andrew.jpg' },
  argTypes: { size: { control: 'select', options: ['sm', 'md', 'lg'] } },
}

export const WithImage = {}

export const Initials = { args: { src: undefined } }

export const BrokenImage = { args: { src: '/does-not-exist.jpg' } }

export const Sizes = {
  render: (args) => (
    <div className="flex items-center gap-ds-md">
      <Avatar {...args} size="sm" />
      <Avatar {...args} size="md" />
      <Avatar {...args} size="lg" />
    </div>
  ),
}

const people = [
  { name: 'Michael Robinson', src: '/assets/people/michael-robinson.jpg' },
  { name: 'Vinay Nair', src: '/assets/people/vinay-nair.jpg' },
  { name: 'Cara Lim' },
  { name: 'Martin Pietrzak', src: '/assets/people/martin-pietrzak.jpg' },
  { name: 'Gayle Kosokowsky', src: '/assets/people/gayle-kosokowsky.jpg' },
  { name: 'Nathan Falceso', src: '/assets/people/nathan-falceso.jpg' },
]

export const Stack = { render: () => <AvatarStack people={people} max={4} /> }

export const StackSmall = { render: () => <AvatarStack people={people} max={3} size="sm" /> }
