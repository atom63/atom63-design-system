import { defineConfig } from 'vitest/config'

import { sharedTestOptions } from '../../config/vite/vitest-defaults'

// Real Chromium is required: jsdom does not apply cascade layers, which is
// the conflict this regression covers.
export default defineConfig({
  test: {
    ...sharedTestOptions,
    environment: 'node',
    include: ['src/**/*.cascade.test.ts'],
  },
})
