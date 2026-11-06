import { MemoryRouter } from 'react-router-dom'
import { tokens } from '../src/design-system/tokens/tokens.js'
import '../src/index.css'

/** @type {import('@storybook/react-vite').Preview} */
const preview = {
  decorators: [
    (Story) => (
      <MemoryRouter>
        <div className="bg-surface-page p-ds-lg font-sans text-text-primary">
          <Story />
        </div>
      </MemoryRouter>
    ),
  ],
  parameters: {
    layout: 'padded',
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      options: {
        page: { name: 'Page', value: tokens['surface-page'] },
        raised: { name: 'Raised', value: tokens['surface-raised'] },
        sunken: { name: 'Sunken', value: tokens['surface-sunken'] },
        inverse: { name: 'Inverse', value: tokens['surface-inverse'] },
      },
    },
    viewport: {
      options: {
        desktop: { name: 'Desktop 1440', styles: { width: '1440px', height: '900px' }, type: 'desktop' },
        laptop: { name: 'Laptop 1024', styles: { width: '1024px', height: '768px' }, type: 'desktop' },
        tablet: { name: 'Tablet 768', styles: { width: '768px', height: '1024px' }, type: 'tablet' },
        mobile: { name: 'Mobile 390', styles: { width: '390px', height: '844px' }, type: 'mobile' },
      },
    },
    a11y: { test: 'todo' },
  },
  initialGlobals: {
    backgrounds: { value: 'page' },
  },
}

export default preview
