import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import { URL } from 'node:url'

import { codeSyntaxFor, composedTarget, scopesFor } from './figma-sync-rules.mjs'

const synced = new Set(['--a63-brand-500', '--a63-action-primary'])

test('composedTarget reads a color at an opacity in either order', () => {
  assert.deepEqual(
    composedTarget('color-mix(in oklch, var(--a63-brand-500) 30%, transparent)', synced),
    { alias: '--a63-brand-500', opacity: 30 }
  )
  assert.deepEqual(
    composedTarget('color-mix(in srgb, var(--a63-brand-500), transparent 20%)', synced),
    { alias: '--a63-brand-500', opacity: 80 }
  )
  assert.deepEqual(
    composedTarget('color-mix(in oklab, transparent 60%, var(--a63-action-primary))', synced),
    { alias: '--a63-action-primary', opacity: 40 }
  )
  assert.deepEqual(
    composedTarget('color-mix(in srgb, var(--a63-brand-500), transparent)', synced),
    { alias: '--a63-brand-500', opacity: 50 }
  )
})

test('composedTarget leaves other mixes and unsynced targets alone', () => {
  assert.equal(composedTarget('color-mix(in oklch, var(--a63-brand-500) 30%, white)', synced), null)
  assert.equal(composedTarget('color-mix(in oklch, black 22%, transparent)', synced), null)
  assert.equal(composedTarget('color-mix(in oklch, var(--other) 30%, transparent)', synced), null)
})

test('scopesFor hides foundation primitives and raw neutral steps', () => {
  const hidden = { group: 'foundation', scopes: [] }
  assert.deepEqual(
    scopesFor({ token: '--color-b1-500', type: 'COLOR', collection: 'Atom63 Foundation' }),
    hidden
  )
  assert.deepEqual(
    scopesFor({ token: '--surface-light-3', type: 'COLOR', collection: 'Atom63 Surface' }).scopes,
    []
  )
})

test('scopesFor sends semantic colors and numbers to the right pickers', () => {
  const scopes = (token, type, collection = 'Atom63 Semantic') =>
    scopesFor({ token, type, collection })?.scopes
  assert.deepEqual(scopes('--a63-text-secondary', 'COLOR'), ['TEXT_FILL'])
  assert.deepEqual(scopes('--a63-action-primary-foreground', 'COLOR'), ['TEXT_FILL'])
  assert.deepEqual(scopes('--a63-border-subtle', 'COLOR'), ['STROKE_COLOR'])
  assert.deepEqual(scopes('--a63-focus-ring', 'COLOR'), ['STROKE_COLOR'])
  assert.deepEqual(scopes('--a63-surface-page', 'COLOR'), ['FRAME_FILL', 'SHAPE_FILL'])
  assert.deepEqual(scopes('--a63-control-radius', 'FLOAT', 'Atom63 Contract'), ['CORNER_RADIUS'])
  assert.deepEqual(scopes('--a63-control-height-md', 'FLOAT', 'Atom63 Contract'), ['WIDTH_HEIGHT'])
  assert.deepEqual(scopes('--a63-widget-rim-width', 'FLOAT', 'Atom63 Contract'), ['STROKE_FLOAT'])
  assert.deepEqual(scopes('--a63-menu-item-gap', 'FLOAT', 'Atom63 Contract'), ['GAP'])
  assert.deepEqual(scopes('--a63-control-font-size-md', 'FLOAT', 'Atom63 Contract'), ['FONT_SIZE'])
  assert.deepEqual(scopes('--a63-motion-duration-fast', 'FLOAT'), [])
  assert.deepEqual(scopes('--a63-font-app', 'STRING', 'Atom63 Font'), ['FONT_FAMILY'])
})

test('scopesFor has no rule for an unknown number, so the generator fails', () => {
  assert.equal(scopesFor({ token: '--a63-mystery', type: 'FLOAT', collection: 'x' }), null)
})

test('every variable in the generated model has scopes and code syntax', () => {
  const model = JSON.parse(
    readFileSync(new URL('../../generated/atom63.figma-sync.json', import.meta.url), 'utf8')
  )
  for (const collection of model.collections) {
    for (const variable of collection.variables) {
      assert.ok(Array.isArray(variable.scopes), `${variable.token} has no scopes`)
      assert.equal(variable.codeSyntax, codeSyntaxFor(variable.token))
    }
  }
})
