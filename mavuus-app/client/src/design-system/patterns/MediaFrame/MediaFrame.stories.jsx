import { MediaFrame } from './MediaFrame'

const src = 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800'

export default {
  title: 'Patterns/MediaFrame',
  component: MediaFrame,
  tags: ['autodocs'],
  args: { src, alt: 'Members talking at a roundtable' },
  argTypes: { ratio: { control: 'select', options: ['3/2', '16/9', '4/3', '1/1', '4/5'] } },
  decorators: [
    (Story) => (
      <div className="group max-w-md">
        <Story />
      </div>
    ),
  ],
}

export const Default = {}

export const Wide = { args: { ratio: '16/9' } }

export const Square = { args: { ratio: '1/1' } }
