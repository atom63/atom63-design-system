import assert from 'node:assert/strict'
import { it } from 'node:test'

import { affectsIos } from './ios-impact.mjs'

it('ignores ui-foundation version and changelog changes', () => {
  assert.equal(affectsIos(['packages/ui-foundation/package.json']), false)
  assert.equal(affectsIos(['packages/ui-foundation/CHANGELOG.md']), false)
  assert.equal(
    affectsIos(['packages/ui-foundation/package.json', 'packages/ui-foundation/CHANGELOG.md']),
    false
  )
})

it('selects iOS for ui-foundation contracts, sources and generated models', () => {
  assert.equal(affectsIos(['packages/ui-foundation/contracts/components/button.json']), true)
  assert.equal(affectsIos(['packages/ui-foundation/src/a11y/dialog.ts']), true)
  assert.equal(affectsIos(['packages/ui-foundation/generated/contracts.json']), true)
})

it('selects iOS for token sources and generated models', () => {
  assert.equal(affectsIos(['packages/styles/src/tokens/color.json']), true)
  assert.equal(affectsIos(['packages/styles/generated/atom63.tokens.json']), true)
  assert.equal(affectsIos(['packages/styles/scripts/build-css-from-dtcg.mjs']), true)
})

it('selects iOS for the Swift package, the demo and the root manifest', () => {
  assert.equal(affectsIos(['packages/ui-ios/Sources/Atom63UI/AtomButton.swift']), true)
  assert.equal(affectsIos(['examples/ios-demo/snapshot-simulator.json']), true)
  assert.equal(affectsIos(['Package.swift']), true)
})

it('selects iOS for the cross-renderer, component and a11y generators', () => {
  assert.equal(affectsIos(['scripts/generate-cross-renderer-contracts.mjs']), true)
  assert.equal(affectsIos(['scripts/generate-component-contracts.mjs']), true)
  assert.equal(affectsIos(['scripts/design-system/lib/component-contracts.mjs']), true)
  assert.equal(affectsIos(['scripts/generate-a11y-ios-contracts.mjs']), true)
})

it('selects iOS for a CI workflow change', () => {
  assert.equal(affectsIos(['.github/workflows/ci.yml']), true)
})

it('ignores unrelated web, docs and changeset changes', () => {
  assert.equal(
    affectsIos([
      'packages/ui-react/src/components/card/card.tsx',
      'apps/docs/src/content/intro.mdx',
      '.changeset/brave-owls-sing.md',
      'packages/styles/package.json',
    ]),
    false
  )
})
