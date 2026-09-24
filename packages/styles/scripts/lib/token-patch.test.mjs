import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { test } from 'node:test'
import { fileURLToPath } from 'node:url'

import { applyPatch, convertValue, srgbToOklch } from './token-patch.mjs'

const foundation = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../src/tokens/foundation'
)
const load = name => [name, JSON.parse(readFileSync(path.join(foundation, name), 'utf8'))]
const sources = () =>
  new Map(['primitives.tokens.json', 'palette.tokens.json', 'motion.tokens.json'].map(load))
const patch = tokens => ({ format: 'atom63-token-patch', version: 1, tokens })
const tokensRoot = path.resolve(foundation, '..')
const withResolvers = () =>
  new Map([
    ...sources(),
    ...[
      'surface.resolver.json',
      'brand-ramp.resolver.json',
      'brand-action.resolver.json',
      'semantics.resolver.json',
    ].map(name => [name, JSON.parse(readFileSync(path.join(tokensRoot, name), 'utf8'))]),
  ])
const patchV2 = changes => ({ format: 'atom63-token-patch', version: 2, changes })

test('converts sRGB to OKLCH', () => {
  const [l, c, h] = srgbToOklch(1, 0, 0)
  assert.ok(Math.abs(l - 0.628) < 0.001, `L ${l}`)
  assert.ok(Math.abs(c - 0.2577) < 0.001, `C ${c}`)
  assert.ok(Math.abs(h - 29.23) < 0.05, `H ${h}`)
  const [white, whiteChroma] = srgbToOklch(1, 1, 1)
  assert.ok(Math.abs(white - 1) < 1e-4 && whiteChroma < 1e-4)
})

test('writes an sRGB color back as 8-bit components with a matching hex', () => {
  const value = convertValue(
    { $type: 'color', $value: { colorSpace: 'srgb', components: [0, 0, 0], alpha: 1 } },
    { type: 'COLOR', value: { r: 0.172549, g: 0.498039, b: 1, a: 1 } }
  )
  assert.equal(value.hex, '#2c7fff')
  assert.deepEqual(
    value.components.map(channel => Math.round(channel * 255)),
    [44, 127, 255]
  )
})

test('keeps each token in its own color space and units', () => {
  const result = applyPatch(
    sources(),
    patch({
      '--color-b1-500': { type: 'COLOR', value: { r: 0.1, g: 0.4, b: 0.9, a: 1 } },
      '--color-red-500': { type: 'COLOR', value: { r: 1, g: 0, b: 0, a: 1 } },
      '--spacing-4': { type: 'FLOAT', value: 18 },
      '--duration-150': { type: 'FLOAT', value: 160 },
    })
  )
  assert.deepEqual(result.errors, [])
  assert.deepEqual(result.changed.sort(), [
    '--color-b1-500',
    '--color-red-500',
    '--duration-150',
    '--spacing-4',
  ])
  const primitives = result.documents.get('primitives.tokens.json')
  assert.equal(primitives.color.b1['500'].$value.hex, '#1a66e6')
  assert.deepEqual(primitives.spacing['4'].$value, { value: 18, unit: 'px' })
  assert.deepEqual(primitives.duration['150'].$value, { value: 160, unit: 'ms' })
  const palette = result.documents.get('palette.tokens.json')
  assert.deepEqual(palette.color.red['500'].$value, {
    colorSpace: 'oklch',
    components: [0.628, 0.258, 29.234],
  })
})

test('writes nothing when any token cannot be applied', () => {
  const original = sources()
  const result = applyPatch(
    original,
    patch({
      '--color-b1-500': { type: 'COLOR', value: { r: 0.1, g: 0.4, b: 0.9, a: 1 } },
      '--duration-instant': { type: 'FLOAT', value: 10 },
      '--a63-action-primary': { type: 'COLOR', value: { r: 1, g: 1, b: 1, a: 1 } },
      '--spacing-4': { type: 'COLOR', value: { r: 1, g: 1, b: 1, a: 1 } },
    })
  )
  assert.equal(result.documents.size, 0)
  assert.deepEqual(result.changed, [])
  assert.deepEqual(result.errors.sort(), [
    '--a63-action-primary: not defined in a DTCG source yet',
    '--duration-instant: an alias in the DTCG source ({duration.none}); point it at another variable instead',
    '--spacing-4: expected a FLOAT, got COLOR',
  ])
  // The input documents are never mutated.
  assert.equal(original.get('primitives.tokens.json').color.b1['500'].$value.hex, '#2c7fff')
})

test('rejects files that are not token patches', () => {
  assert.deepEqual(applyPatch(sources(), { tokens: {} }).errors, [
    'not an atom63-token-patch v1 or v2 file',
  ])
})

test('v2: writes a changed alias into the resolver context of its mode', () => {
  const result = applyPatch(
    withResolvers(),
    patchV2([
      {
        token: '--a63-text-accent',
        collection: 'Atom63 Mode',
        mode: 'dark',
        type: 'COLOR',
        alias: '--a63-brand-300',
      },
      {
        token: '--color-b2-500',
        collection: 'Atom63 Foundation',
        mode: 'Value',
        type: 'COLOR',
        alias: '--color-b1-500',
      },
    ])
  )
  assert.deepEqual(result.errors, [])
  assert.deepEqual(result.changed.sort(), ['--a63-text-accent (dark)', '--color-b2-500'])
  const semantics = result.documents.get('semantics.resolver.json')
  assert.equal(semantics.modifiers.mode.contexts.dark[0].a63.text.accent.$value, '{a63.brand.300}')
  // The light context is untouched.
  assert.equal(
    semantics.modifiers.mode.contexts.light[0].a63.text.accent.$value,
    '{a63.brand.text}'
  )
  assert.equal(
    result.documents.get('primitives.tokens.json').color.b2['500'].$value,
    '{color.b1.500}'
  )
})

test('v2: writes a literal into the context of a multi-mode collection', () => {
  const documents = withResolvers()
  // Give the n2 context a literal so there is one to edit.
  documents.get('surface.resolver.json').modifiers.surface.contexts.n2[0].surface.light[
    '2'
  ].$value = { colorSpace: 'srgb', components: [1, 1, 1], alpha: 1 }
  const result = applyPatch(
    documents,
    patchV2([
      {
        token: '--surface-light-2',
        collection: 'Atom63 Surface',
        mode: 'n2',
        type: 'COLOR',
        value: { r: 1, g: 0, b: 0, a: 1 },
      },
    ])
  )
  assert.deepEqual(result.errors, [])
  const surface = result.documents.get('surface.resolver.json')
  assert.equal(surface.modifiers.surface.contexts.n2[0].surface.light['2'].$value.hex, '#ff0000')
})

test('v2: explains what it cannot write, and writes nothing', () => {
  const result = applyPatch(
    withResolvers(),
    patchV2([
      // Shared by every brand in the base set; only b4 changed in Figma.
      {
        token: '--a63-action-primary',
        collection: 'Atom63 Brand',
        mode: 'b4',
        type: 'COLOR',
        alias: '--a63-brand-700',
      },
      // Computed in CSS.
      {
        token: '--a63-surface-page',
        collection: 'Atom63 Mode',
        mode: 'light',
        type: 'COLOR',
        alias: '--surface-light-1',
      },
      // An alias in code, set to a raw color in Figma.
      {
        token: '--a63-text-primary',
        collection: 'Atom63 Mode',
        mode: 'dark',
        type: 'COLOR',
        value: { r: 1, g: 1, b: 1, a: 1 },
      },
      // An alias to something that is not a DTCG token.
      {
        token: '--a63-border-subtle',
        collection: 'Atom63 Mode',
        mode: 'light',
        type: 'COLOR',
        alias: '--a63-no-such-token',
      },
    ])
  )
  assert.equal(result.documents.size, 0)
  assert.deepEqual(result.errors.sort(), [
    '--a63-action-primary (b4): shared by every brand in brand-action.resolver.json; a b4-only exception is added in code',
    '--a63-border-subtle (light): computed in CSS (io.atom63.derive); change its inputs instead',
    '--a63-surface-page (light): computed in CSS (io.atom63.derive); change its inputs instead',
    '--a63-text-primary (dark): an alias in the DTCG source ({surface.dark.12}); point it at another variable instead',
  ])
})
