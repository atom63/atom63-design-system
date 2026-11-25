import assert from 'node:assert/strict'
import { it } from 'node:test'

import { docsImpact, isDocsSource, optsOutOfDocs } from './docs-impact.mjs'

it('treats contracts, component sources, token sources and pattern packages as docs sources', () => {
  assert.equal(isDocsSource('packages/ui-foundation/contracts/components/button.json'), true)
  assert.equal(isDocsSource('packages/ui-react/src/components/button/button.tsx'), true)
  assert.equal(isDocsSource('packages/ui-react/src/components/button/button.css'), true)
  assert.equal(isDocsSource('packages/styles/src/tokens/foundation/color.json'), true)
  assert.equal(isDocsSource('packages/inform/src/arbiter.ts'), true)
})

it('ignores tests, stories, generated contracts, versions and changelogs', () => {
  assert.equal(isDocsSource('packages/ui-react/src/components/button/button.test.tsx'), false)
  assert.equal(isDocsSource('packages/ui-react/src/components/button/button.stories.tsx'), false)
  assert.equal(isDocsSource('packages/ui-react/src/components/button/button-contract.ts'), false)
  assert.equal(isDocsSource('packages/ui-react/package.json'), false)
  assert.equal(isDocsSource('packages/ui-react/CHANGELOG.md'), false)
  assert.equal(isDocsSource('packages/ui-ios/Sources/Atom63UI/AtomButton.swift'), false)
})

it('passes when nothing the docs describe changed', () => {
  assert.deepEqual(docsImpact(['scripts/design-system/check-craft.mjs']), {
    status: 'ok',
    sources: [],
  })
})

it('passes when a docs page or a story changed with the source', () => {
  const source = 'packages/ui-react/src/components/button/button.tsx'
  assert.equal(docsImpact([source, 'apps/docs/src/pages/component-button.mdx']).status, 'ok')
  assert.equal(docsImpact([source, 'apps/docs/src/lib/component-catalog.ts']).status, 'ok')
  assert.equal(
    docsImpact([source, 'packages/ui-react/src/components/button/button.stories.tsx']).status,
    'ok'
  )
})

it('flags a source change with no docs or story change', () => {
  const source = 'packages/ui-foundation/contracts/components/button.json'
  assert.deepEqual(docsImpact([source, '.changeset/blue-cats.md']), {
    status: 'missing-docs',
    sources: [source],
  })
})

it('skips the flag when the PR body says Docs: n/a', () => {
  const files = ['packages/ui-react/src/components/button/button.tsx']
  assert.equal(docsImpact(files, 'Refactor only.\n\nDocs: n/a').status, 'opted-out')
  assert.equal(docsImpact(files, 'docs: N/A — internal rename').status, 'opted-out')
  assert.equal(docsImpact(files, 'The docs: n/a line is not here').status, 'missing-docs')
  assert.equal(optsOutOfDocs(undefined), false)
})
