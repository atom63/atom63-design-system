import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { test } from 'node:test'
import { fileURLToPath } from 'node:url'

import {
  renderCompat,
  renderThemeBlock,
  renderTypeBlock,
  replaceThemeBlock,
  replaceTypeBlock,
  roleEntries,
  typeRoleNames,
  unknownTokens,
} from './role-bridges.mjs'

const table = {
  groups: [
    { label: 'Surfaces', roles: { background: '--a63-surface-page', card: '--a63-surface-panel' } },
    { label: 'Actions', roles: { primary: '--a63-action-primary' } },
  ],
}

test('lists roles in table order and rejects a duplicate', () => {
  assert.deepEqual(
    roleEntries(table).map(([role]) => role),
    ['background', 'card', 'primary']
  )
  assert.throws(
    () =>
      roleEntries({
        groups: [
          { label: 'A', roles: { x: '--a' } },
          { label: 'B', roles: { x: '--b' } },
        ],
      }),
    /lists "x" twice/
  )
})

test('rejects a role that maps to something other than a custom property', () => {
  assert.throws(
    () => roleEntries({ groups: [{ label: 'A', roles: { x: 'red' } }] }),
    /not a custom property/
  )
})

test('reports roles whose token the manifest does not declare', () => {
  const declared = new Set(['--a63-surface-page', '--a63-action-primary'])
  assert.deepEqual(unknownTokens(table, declared), [['card', '--a63-surface-panel']])
})

test('renders the Tailwind block and the compat bridge from the same table', () => {
  const block = renderThemeBlock(table)
  assert.match(block, /--color-background: var\(--a63-surface-page\);/)
  assert.match(block, /--color-primary: var\(--a63-action-primary\);/)
  const compat = renderCompat(table)
  assert.match(compat, /--background: var\(--a63-surface-page\);/)
  assert.match(compat, /\/\* Actions \*\/\n {2}--primary: var\(--a63-action-primary\);/)
})

test('replaces only the semantic block of theme.css, legacy or generated', () => {
  const legacy =
    '@theme inline {\n  --breakpoint-sm: 40rem;\n}\n\n' +
    '/* tokens/semantics.css — map Tailwind color utilities onto the canonical --a63-* layer */\n' +
    '@theme inline {\n  --color-old: var(--old);\n}\n\n/* after */\n'
  const once = replaceThemeBlock(legacy, renderThemeBlock(table))
  assert.match(once, /--breakpoint-sm: 40rem;/)
  assert.doesNotMatch(once, /--color-old/)
  assert.match(once, /\/\* after \*\//)
  assert.equal(replaceThemeBlock(once, renderThemeBlock(table)), once)
})

test('every role in the shipped table maps to a token the manifest declares', () => {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
  const roles = JSON.parse(readFileSync(path.join(root, 'src/tailwind/roles.json'), 'utf8'))
  const manifest = JSON.parse(readFileSync(path.join(root, 'generated/atom63.tokens.json'), 'utf8'))
  assert.deepEqual(unknownTokens(roles, new Set(manifest.entries.map(entry => entry.cssVar))), [])
})

const typeDoc = { a63: { type: { body: {}, 'title-1': {} } } }

test('renders a text utility and a strong variant per text role', () => {
  const block = renderTypeBlock(typeDoc)
  assert.ok(block.includes('--text-body: var(--a63-type-body-font-size);'))
  assert.ok(block.includes('--text-body--font-weight: var(--a63-type-body-font-weight);'))
  assert.ok(
    block.includes(
      '--text-title-1-strong--font-weight: var(--a63-type-title-1-font-weight-strong);'
    )
  )
})

test('appends the text role block once, then replaces it in place', () => {
  const css = '@theme inline {\n  --breakpoint-sm: 40rem;\n}\n'
  const once = replaceTypeBlock(css, renderTypeBlock(typeDoc))
  assert.match(once, /--breakpoint-sm: 40rem;/)
  assert.match(once, /--text-body:/)
  assert.equal(replaceTypeBlock(once, renderTypeBlock(typeDoc)), once)
})

test('every shipped text role has its four tokens in the manifest', () => {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
  const doc = JSON.parse(
    readFileSync(path.join(root, 'src/tokens/type-roles.resolver.json'), 'utf8')
  )
  const manifest = JSON.parse(readFileSync(path.join(root, 'generated/atom63.tokens.json'), 'utf8'))
  const declared = new Set(manifest.entries.map(entry => entry.cssVar))
  const missing = typeRoleNames(doc).flatMap(role =>
    ['font-size', 'line-height', 'font-weight', 'font-weight-strong']
      .map(part => `--a63-type-${role}-${part}`)
      .filter(token => !declared.has(token))
  )
  assert.deepEqual(missing, [])
  assert.equal(typeRoleNames(doc).length, 11)
})
