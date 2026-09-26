import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts', 'src/primitives/index.ts', 'src/state/index.ts', 'src/runtime/index.ts'],
  format: ['esm'],
  dts: true,
  clean: true,
  sourcemap: true,
  external: ['react', 'react-dom', '@atom63/ui-react', 'lucide-react', 'motion'],
  treeshake: true,
})
