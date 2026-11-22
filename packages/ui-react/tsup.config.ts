import { existsSync, readFileSync } from 'node:fs'
import { defineConfig } from 'tsup'

const publicEntries = [
  'src/index.ts',
  'src/calendar/index.ts',
  'src/chart/index.ts',
  'src/layout/index.ts',
  'src/media/index.ts',
  'src/media/media-lightbox/parts/index.ts',
  'src/preview/index.ts',
  'src/theme/index.ts',
]

// Every module the root barrel re-exports becomes its own build entry, so the
// built root is a list of re-exports over per-component files. A consumer's
// bundler then drops whole files it does not use (`sideEffects` lists only CSS)
// instead of keeping one module whose imports (sonner, input-otp, Base UI) and
// top-level calls it cannot prove unused.
const rootModuleEntries = [
  ...readFileSync('src/index.ts', 'utf8').matchAll(/from '(\.\/[^']+)'/g),
].map(([, specifier]) => {
  const base = `src/${specifier.slice(2)}`
  const file = [`${base}.ts`, `${base}.tsx`, `${base}/index.ts`, `${base}/index.tsx`].find(
    existsSync
  )
  if (!file) throw new Error(`Cannot resolve ${specifier} from src/index.ts`)
  return file
})

export default defineConfig({
  clean: true,
  dts: { entry: publicEntries },
  entry: [...new Set([...publicEntries, ...rootModuleEntries])],
  external: ['react', 'react-dom', 'motion', 'motion/react'],
  format: ['esm'],
  // Read by scripts/design-system/preserve-use-client.mjs, which deletes it.
  metafile: true,
  sourcemap: true,
  treeshake: true,
})
