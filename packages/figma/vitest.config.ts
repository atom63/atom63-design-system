import { defineConfig } from 'vitest/config'

import { sharedTestOptions } from '../../config/vite/vitest-defaults'

export default defineConfig({
  test: {
    ...sharedTestOptions,
    environment: 'node',
    globals: true,
    include: ['test/**/*.test.ts'],
  },
})
