import { playwright } from '@vitest/browser-playwright'
import { defineConfig } from 'vitest/config'

import { sharedTestOptions } from '../../config/vite/vitest-defaults'

// CSS custom-property cascades can't be resolved in jsdom, so the styles package
// tests run in a real browser (chromium via Playwright). Only *.browser.test.ts
// files are collected.
export default defineConfig({
  test: {
    ...sharedTestOptions,
    include: ['src/**/*.browser.test.ts'],
    browser: {
      enabled: true,
      provider: playwright(),
      headless: true,
      instances: [{ browser: 'chromium' }],
    },
  },
})
