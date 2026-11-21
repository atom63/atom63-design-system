import { existsSync, readFileSync } from 'node:fs'
import { defineConfig } from 'tsup'

// Every module the root barrel re-exports becomes its own build entry, so the
// built root is a list of re-exports over per-module files. A consumer's
// bundler then drops whole files it does not use (`sideEffects: false`) instead
// of keeping every top-level expression of one module (the a11y patterns, the
// cross-renderer table, the axis lists) it cannot prove unused.
const rootModuleEntries = [
  ...readFileSync('src/index.ts', 'utf8').matchAll(/from '(\.\/[^']+)'/g),
].map(([, specifier]) => {
  const base = `src/${specifier.slice(2)}`
  const file = [`${base}.ts`, `${base}/index.ts`].find(existsSync)
  if (!file) throw new Error(`Cannot resolve ${specifier} from src/index.ts`)
  return file
})

export default defineConfig({
  clean: true,
  dts: { entry: ['src/index.ts'] },
  entry: [...new Set(['src/index.ts', ...rootModuleEntries])],
  format: ['esm'],
  sourcemap: true,
  treeshake: true,
})
