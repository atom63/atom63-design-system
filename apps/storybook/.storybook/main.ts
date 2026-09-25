import type { StorybookConfig } from '@storybook/react-vite'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defaultClientConditions, mergeConfig } from 'vite'

const dirname = path.dirname(fileURLToPath(import.meta.url))

// Stories live next to their components in packages/ui-react, packages/mdx and
// packages/brand.
// They load the workspace packages through the repo-private `@atom63/source`
// export condition, so edits to a component or token hot-reload without
// rebuilding dist.
const config: StorybookConfig = {
  stories: [
    '../../../packages/ui-react/src/**/*.mdx',
    '../../../packages/ui-react/src/**/*.stories.@(ts|tsx)',
    '../../../packages/mdx/src/**/*.stories.@(ts|tsx)',
    '../../../packages/brand/src/**/*.stories.@(ts|tsx)',
    // Token reference stories for @atom63/styles, which has no stories of its own.
    '../stories/**/*.stories.@(ts|tsx)',
  ],
  addons: ['@storybook/addon-docs', '@storybook/addon-a11y', '@storybook/addon-vitest'],
  framework: { name: '@storybook/react-vite', options: {} },
  core: { disableTelemetry: true },
  typescript: {
    reactDocgen: 'react-docgen-typescript',
    // Components live in packages/ui-react, outside this app. Docgen documents
    // only files matched by both `include` and the tsconfig project, so point
    // both at the library.
    reactDocgenTypescriptOptions: {
      tsconfigPath: path.resolve(dirname, '../../../packages/ui-react/tsconfig.json'),
      include: ['../../packages/ui-react/src/**/*.tsx'],
    },
  },
  async viteFinal(viteConfig) {
    return mergeConfig(viteConfig, {
      plugins: [tailwindcss()],
      resolve: {
        conditions: ['@atom63/source', ...defaultClientConditions],
        dedupe: ['react', 'react-dom'],
      },
    })
  },
}

export default config
