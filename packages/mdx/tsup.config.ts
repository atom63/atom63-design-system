import { defineConfig } from 'tsup'

export default defineConfig({
  entry: [
    'src/index.ts',
    'src/blocks/index.ts',
    'src/blocks/credits-block-entry.ts',
    'src/blocks/media-caption-entry.ts',
    'src/article/index.ts',
    'src/editor/index.ts',
    'src/lightbox/index.ts',
    'src/runtime/index.ts',
    'src/primitives/index.ts',
  ],
  format: ['esm'],
  dts: true,
  clean: true,
  sourcemap: true,
  external: [
    'react',
    'react-dom',
    '@atom63/ui-react',
    '@mdx-js/react',
    'beautiful-mermaid',
    'shiki',
    'shiki/core',
    'shiki/engine/oniguruma',
    'shiki/wasm',
  ],
  treeshake: true,
})
