import { tokens } from '../src/design-system/tokens/tokens.js'
import { THEMES, withLayout, withRouter, withTheme } from './decorators'
import '../src/index.css'

/** @type {import('@storybook/react-vite').Preview} */
const preview = {
  // The first decorator is the innermost: layout padding, then theme, then the router outside.
  decorators: [withLayout, withTheme, withRouter],
  globalTypes: {
    theme: {
      description: 'Theme (dark is a placeholder until it has role tokens)',
      toolbar: {
        title: 'Theme',
        icon: 'mirror',
        items: Object.entries(THEMES).map(([value, title]) => ({ value, title })),
        dynamicTitle: true,
      },
    },
  },
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
        rail: { name: 'Rail 1100', styles: { width: '1100px', height: '800px' }, type: 'desktop' },
        laptop: { name: 'Laptop 1024', styles: { width: '1024px', height: '768px' }, type: 'desktop' },
        tablet: { name: 'Tablet 768', styles: { width: '768px', height: '1024px' }, type: 'tablet' },
        mobile: { name: 'Mobile 390', styles: { width: '390px', height: '844px' }, type: 'mobile' },
      },
    },
    a11y: { test: 'todo' },
  },
  initialGlobals: {
    backgrounds: { value: 'page' },
    theme: 'light',
  },
}

export default preview
