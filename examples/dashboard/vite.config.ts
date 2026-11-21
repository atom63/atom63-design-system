import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defaultClientConditions, defineConfig } from 'vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    // Resolve the workspace @atom63/* packages to source, like the other examples.
    conditions: ['@atom63/source', ...defaultClientConditions],
    dedupe: ['react', 'react-dom'],
  },
})
