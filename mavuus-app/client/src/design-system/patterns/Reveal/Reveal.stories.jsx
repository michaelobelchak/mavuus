import { Card } from '../Card'
import { Reveal } from './Reveal'

export default {
  title: 'Patterns/Reveal',
  component: Reveal,
  tags: ['autodocs'],
  argTypes: { variant: { control: 'select', options: ['rise', 'fade', 'clip'] } },
  args: { variant: 'rise' },
}

export const Rise = {
  render: (args) => (
    <Reveal {...args}>
      <Card>Rises into view</Card>
    </Reveal>
  ),
}

export const Fade = { ...Rise, args: { variant: 'fade' } }

export const Clip = {
  args: { variant: 'clip' },
  render: (args) => (
    <Reveal {...args}>
      <div className="aspect-video rounded-sheet bg-surface-sunken" />
    </Reveal>
  ),
}

export const Staggered = {
  render: (args) => (
    <div className="grid grid-cols-3 gap-ds-md">
      {['Strategy', 'Leadership', 'Growth'].map((title, index) => (
        <Reveal key={title} {...args} index={index}>
          <Card>{title}</Card>
        </Reveal>
      ))}
    </div>
  ),
}
