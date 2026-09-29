import { defaultClientConditions, defaultServerConditions } from 'vite'
import { defineConfig } from 'vitest/config'

import { sharedTestOptions } from '../../config/vite/vitest-defaults'

export default defineConfig({
  resolve: {
    // Test against workspace source for @atom63/figma, not its built dist.
    conditions: ['@atom63/source', ...defaultClientConditions],
  },
  // The tests run in Node, which resolves through the SSR conditions.
  ssr: { resolve: { conditions: ['@atom63/source', ...defaultServerConditions] } },
  test: {
    ...sharedTestOptions,
    globals: true,
    include: ['__tests__/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      include: [
        'src/parsers/**/*.ts',
        'src/libraries/color-converters.ts',
        'src/libraries/variable-binding.ts',
        'src/types/messages.ts',
      ],
      reporter: ['text', 'text-summary'],
    },
  },
})
