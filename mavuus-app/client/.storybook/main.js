/** @type {import('@storybook/react-vite').StorybookConfig} */
const config = {
  framework: '@storybook/react-vite',
  stories: [
    '../src/design-system/**/*.mdx',
    '../src/design-system/**/*.stories.jsx',
  ],
  addons: ['@storybook/addon-docs', '@storybook/addon-a11y'],
  core: { disableTelemetry: true },
  // The project vite.config.js (the @ alias, React and Tailwind plugins) is loaded
  // automatically. Its manualChunks only make sense for the app bundle, so drop them here.
  viteFinal: async (viteConfig) => {
    if (viteConfig.build?.rollupOptions?.output) {
      delete viteConfig.build.rollupOptions.output.manualChunks
    }
    // The Storybook preview bundles every story plus axe, so it is larger than the app chunks.
    viteConfig.build = { ...viteConfig.build, chunkSizeWarningLimit: 1500 }
    return viteConfig
  },
}

export default config
