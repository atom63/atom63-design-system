import { readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const here = path.dirname(fileURLToPath(import.meta.url))

// The root entry re-exports only `runtime/`, and React is an optional peer
// needed only by `@atom63/agent/react`. `zustand` (unlike `zustand/vanilla`)
// imports React, so it is banned here too.
const REACT_IMPORT = /from\s+['"](?:react(?:-dom)?(?:\/[^'"]*)?|zustand)['"]/

describe('@atom63/agent root entry', () => {
  it('re-exports only the runtime', () => {
    const entry = readFileSync(path.join(here, 'index.ts'), 'utf8')
    expect(entry.trim()).toBe("export * from './runtime'")
  })

  it('never imports React', () => {
    const dir = path.join(here, 'runtime')
    const sources = readdirSync(dir).filter(
      name => name.endsWith('.ts') && !name.includes('.test.')
    )
    expect(sources.length).toBeGreaterThan(0)

    for (const name of sources) {
      const source = readFileSync(path.join(dir, name), 'utf8')
      expect(source, name).not.toMatch(REACT_IMPORT)
    }
  })
})
