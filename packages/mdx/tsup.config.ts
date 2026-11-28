import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { defineConfig } from 'tsup'

const publicEntries = [
  'src/index.ts',
  'src/blocks/index.ts',
  'src/blocks/credits-block-entry.ts',
  'src/blocks/media-caption-entry.ts',
  'src/article/index.ts',
  'src/editor/index.ts',
  'src/lightbox/index.ts',
  'src/runtime/index.ts',
  'src/primitives/index.ts',
]

// Every module a public barrel re-exports becomes its own build entry, so each
// built barrel is a list of re-exports over per-module files. A consumer's
// bundler then drops whole files it does not use (`sideEffects` lists only CSS)
// instead of keeping shared chunks whose imports (Base UI, motion, sonner) it
// cannot prove unused. Same approach as packages/ui-react/tsup.config.ts.
// Nested `index` barrels are split the same way, so a `'use client'` module
// (DemoConfigPanel) lands in a file of its own, apart from a server-safe
// sibling (DemoStage) that its folder's barrel also re-exports.
const barrelModuleEntries = (barrel: string): string[] =>
  [...readFileSync(barrel, 'utf8').matchAll(/from '(\.\.?\/[^']+)'/g)].flatMap(([, specifier]) => {
    const base = path.posix.join(path.posix.dirname(barrel), specifier)
    const file = [`${base}.ts`, `${base}.tsx`, `${base}/index.ts`, `${base}/index.tsx`].find(
      existsSync
    )
    if (!file) throw new Error(`Cannot resolve ${specifier} from ${barrel}`)
    return /\/index\.tsx?$/.test(file) ? [file, ...barrelModuleEntries(file)] : [file]
  })
const moduleEntries = publicEntries.flatMap(barrelModuleEntries)

export default defineConfig({
  entry: [...new Set([...publicEntries, ...moduleEntries])],
  format: ['esm'],
  // Read by scripts/design-system/preserve-use-client.mjs, which deletes it.
  metafile: true,
  dts: { entry: publicEntries },
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
