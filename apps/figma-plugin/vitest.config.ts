import { defineConfig } from 'vitest/config'

import { sharedTestOptions } from '../../config/vite/vitest-defaults'

export default defineConfig({
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
