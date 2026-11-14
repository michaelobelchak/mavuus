import { SiteFooter } from './SiteFooter'

export default {
  title: 'Organisms/Site/SiteFooter',
  component: SiteFooter,
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

export const Mobile = { globals: { viewport: { value: 'mobile', isRotated: false } } }
