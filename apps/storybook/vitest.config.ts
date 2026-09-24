import { storybookTest } from '@storybook/addon-vitest/vitest-plugin'
import { playwright } from '@vitest/browser-playwright'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defaultServerConditions } from 'vite'
import { defineConfig } from 'vitest/config'

import { sharedTestOptions } from '../../config/vite/vitest-defaults'

const dirname = path.dirname(fileURLToPath(import.meta.url))

// `storybook`: every story becomes a browser test that renders it (and runs
// its play function, if any) in Chromium.
// `visual`: the same stories, each compared against a committed screenshot.
// See
// https://storybook.js.org/docs/writing-tests/integrations/vitest-addon
export default defineConfig({
  test: {
    ...sharedTestOptions,
    projects: [
      {
        extends: true,
        plugins: [storybookTest({ configDir: path.join(dirname, '.storybook') })],
        test: {
          name: 'storybook',
          browser: {
            enabled: true,
            headless: true,
            provider: playwright(),
            instances: [{ browser: 'chromium' }],
          },
        },
      },
      {
        extends: true,
        // Workspace packages load from source, as they do in Storybook.
        resolve: { conditions: ['@atom63/source', ...defaultServerConditions] },
        ssr: { resolve: { conditions: ['@atom63/source', ...defaultServerConditions] } },
        test: {
          name: 'ssr',
          environment: 'node',
          include: ['ssr/**/*.test.tsx'],
        },
      },
      {
        extends: true,
        plugins: [storybookTest({ configDir: path.join(dirname, '.storybook') })],
        test: {
          name: 'visual',
          setupFiles: ['./.storybook/visual.setup.ts'],
          browser: {
            enabled: true,
            headless: true,
            provider: playwright({ contextOptions: { reducedMotion: 'reduce' } }),
            instances: [{ browser: 'chromium', viewport: { width: 1280, height: 800 } }],
            expect: {
              toMatchScreenshot: {
                comparatorName: 'pixelmatch',
                // One flat folder of `<story id>-<browser>-<platform>.png`, next to
                // this config rather than next to the story files in ui-react.
                resolveScreenshotPath: ({ arg, browserName, platform, ext, root }) =>
                  `${root}/visual/__screenshots__/${arg}-${browserName}-${platform}${ext}`,
                resolveDiffPath: ({ arg, browserName, platform, ext, root }) =>
                  `${root}/visual/__diff__/${arg}-${browserName}-${platform}${ext}`,
              },
            },
          },
        },
      },
    ],
  },
})
