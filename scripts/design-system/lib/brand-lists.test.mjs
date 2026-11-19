import assert from 'node:assert/strict'
import { it } from 'node:test'
import { fileURLToPath } from 'node:url'

import { brandListProblems, brandLists, brandSource, readRepoText } from './brand-lists.mjs'

const root = fileURLToPath(new URL('../../..', import.meta.url))

it('every hand-written brand list matches the brand ramp resolver', () => {
  assert.deepEqual(brandListProblems(readRepoText(root)), [])
})

it('reports a list that misses a brand the resolver adds', () => {
  const read = readRepoText(root)
  const withB7 = file => {
    if (file !== brandSource) return read(file)
    const resolver = JSON.parse(read(file))
    resolver.modifiers.brand.contexts.b7 = []
    return JSON.stringify(resolver)
  }
  const problems = brandListProblems(withB7)
  assert.deepEqual(
    problems.map(problem => problem.split(':')[0]),
    brandLists.map(list => list.file)
  )
})
