import react from '@vitejs/plugin-react'
import { defaultClientConditions } from 'vite'
import { defineConfig } from 'vitest/config'

import { sharedTestOptions } from '../../config/vite/vitest-defaults'

export default defineConfig({
  plugins: [react()],
  resolve: {
    // Test against workspace source for @atom63/ui-foundation, not its built dist.
    conditions: ['@atom63/source', ...defaultClientConditions],
  },
  test: {
    ...sharedTestOptions,
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
  },
})
