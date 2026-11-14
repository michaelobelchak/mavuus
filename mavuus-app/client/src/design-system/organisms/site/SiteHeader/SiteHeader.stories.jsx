import { SiteHeader } from './SiteHeader'

export default {
  title: 'Organisms/Site/SiteHeader',
  component: SiteHeader,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => (
      <div className="min-h-80 bg-surface-page">
        <Story />
      </div>
    ),
  ],
}

export const Default = {}

export const ActivePage = { parameters: { router: { initialEntries: ['/about'] } } }

export const Mobile = { globals: { viewport: { value: 'mobile', isRotated: false } } }
