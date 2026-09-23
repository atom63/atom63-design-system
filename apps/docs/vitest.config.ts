import { defaultClientConditions } from 'vite'
import { defineConfig } from 'vitest/config'

import { sharedTestOptions } from '../../config/vite/vitest-defaults'

export default defineConfig({
  resolve: {
    conditions: ['@atom63/source', ...defaultClientConditions],
  },
  test: {
    ...sharedTestOptions,
    environment: 'jsdom',
    globals: true,
  },
})
