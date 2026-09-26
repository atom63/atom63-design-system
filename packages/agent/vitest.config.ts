import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

import { sharedTestOptions } from '../../config/vite/vitest-defaults'

export default defineConfig({
  plugins: [react()],
  test: {
    ...sharedTestOptions,
    environment: 'jsdom',
    globals: true,
  },
})
