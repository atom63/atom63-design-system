import assert from 'node:assert/strict'
import { readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, it } from 'node:test'
import { fileURLToPath } from 'node:url'

import { needsUseClient, serverSafeByPackage } from './use-client.mjs'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..')

// The packages whose build runs preserve-use-client.mjs, which restores
// `'use client'` only where the source declares it.
const packages = { '@atom63/ui-react': 'packages/ui-react', '@atom63/mdx': 'packages/mdx' }

// Components known to call hooks without the directive. Fix one by adding
// `'use client'` and removing it here; never add to this list.
const pending = {
  '@atom63/ui-react': [],
  '@atom63/mdx': [],
}

const sourceFiles = dir =>
  readdirSync(path.join(root, dir, 'src'), { recursive: true })
    .map(file => path.posix.join('src', file.split(path.sep).join('/')))
    .filter(file => file.endsWith('.tsx') && !/\.(test|stories)\.tsx$/.test(file))
    .sort()

describe("'use client' in source", () => {
  for (const [name, dir] of Object.entries(packages)) {
    it(`${name}: every component that calls a hook starts with 'use client'`, () => {
      const exempt = new Set([...serverSafeByPackage[name], ...pending[name]])
      const missing = sourceFiles(dir).filter(
        file =>
          !exempt.has(file) && needsUseClient(readFileSync(path.join(root, dir, file), 'utf8'))
      )
      assert.deepEqual(
        missing,
        [],
        `Add 'use client' at the top of these files; the build keeps it only where the source has it.`
      )
    })

    it(`${name}: the pending list holds only files that still need the directive`, () => {
      const stale = pending[name].filter(
        file => !needsUseClient(readFileSync(path.join(root, dir, file), 'utf8'))
      )
      assert.deepEqual(stale, [], 'Remove these from `pending` in use-client-sources.test.mjs.')
    })
  }
})
