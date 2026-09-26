import { storybookTest } from '@storybook/addon-vitest/vitest-plugin'
import { playwright } from '@vitest/browser-playwright'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defaultServerConditions } from 'vite'
import { defineConfig } from 'vitest/config'

import { sharedTestOptions } from '../../config/vite/vitest-defaults'
import { CRAFT_PROJECT, CraftBaselineReporter, craftCommands } from './craft/node'

const dirname = path.dirname(fileURLToPath(import.meta.url))

// `storybook`: every story becomes a browser test that renders it (and runs
// its play function, if any) in Chromium.
// `visual`: the same stories, each compared against a committed screenshot.
// `craft`: the same stories, each checked for the runtime craft rules
// (craft/rules.ts); `craft-rules` tests those rules on fixtures.
// See
// https://storybook.js.org/docs/writing-tests/integrations/vitest-addon
export default defineConfig({
  test: {
    ...sharedTestOptions,
    // The craft reporter checks and rewrites the runtime craft baseline.
    reporters: ['default', new CraftBaselineReporter()],
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
        plugins: [storybookTest({ configDir: path.join(dirname, '.storybook') })],
        test: {
          name: CRAFT_PROJECT,
          setupFiles: ['./.storybook/craft.setup.ts'],
          browser: {
            enabled: true,
            headless: true,
            provider: playwright(),
            instances: [{ browser: 'chromium' }],
            commands: craftCommands,
          },
        },
      },
      {
        extends: true,
        test: {
          name: 'craft-rules',
          include: ['craft/**/*.test.ts'],
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
          name: 'cross-browser',
          // Render-only in Firefox and WebKit; axe runs in the Chromium project.
          setupFiles: ['./.storybook/render-only.setup.ts'],
          browser: {
            enabled: true,
            headless: true,
            provider: playwright(),
            instances: [{ browser: 'firefox' }, { browser: 'webkit' }],
          },
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
            // The tester iframe is scaled down to fit this outer page, so make the
            // page large enough that captures stay at 1:1, even for a story that
            // visual.setup.ts grows to its full height.
            provider: playwright({
              contextOptions: { reducedMotion: 'reduce', viewport: { width: 1280, height: 10000 } },
            }),
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
