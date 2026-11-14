import { VideoEmbed } from './VideoEmbed'

export default {
  title: 'Patterns/VideoEmbed',
  component: VideoEmbed,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="max-w-2xl">
        <Story />
      </div>
    ),
  ],
}

export const ComingSoon = {}

export const File = { args: { src: '/videos/sample.mp4', title: 'Sample recording' } }
