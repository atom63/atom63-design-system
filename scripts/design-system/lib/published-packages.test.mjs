import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { it } from 'node:test'

import { publishedPackageDirs } from '../published-packages.mjs'

it('the release workflow publishes the same packages as the scripts', () => {
  const workflow = readFileSync(
    new URL('../../../.github/workflows/release-beta.yml', import.meta.url),
    'utf8'
  )
  const line = /^\s*PUBLISHED_PACKAGES:\s*(.+)$/m.exec(workflow)
  assert.ok(line, 'release-beta.yml has no PUBLISHED_PACKAGES')
  assert.deepEqual(line[1].trim().split(/\s+/), publishedPackageDirs)
})

it('every published package is public', () => {
  for (const dir of publishedPackageDirs) {
    const manifest = JSON.parse(
      readFileSync(new URL(`../../../${dir}/package.json`, import.meta.url), 'utf8')
    )
    assert.notEqual(manifest.private, true, `${dir} is private`)
  }
})
