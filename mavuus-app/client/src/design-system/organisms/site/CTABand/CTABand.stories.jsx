import { CTABand } from './CTABand'

export default {
  title: 'Organisms/Site/CTABand',
  component: CTABand,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => (
      <div className="bg-surface-page">
        <Story />
      </div>
    ),
  ],
}

export const Default = {}

export const Wide = {
  args: {
    wide: true,
    title: 'Need help with a marketing project?',
    text: 'Tell us what you need and we will match you with a vetted vendor from our community.',
    buttonLabel: 'Contact Us',
    buttonTo: '/contact',
  },
}

export const Mobile = { globals: { viewport: { value: 'mobile', isRotated: false } } }
