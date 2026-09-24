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
  new Map(['primitives.tokens.json', 'palette.tokens.json', 'aliases.tokens.json'].map(load))
const patch = tokens => ({ format: 'atom63-token-patch', version: 1, tokens })

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
  assert.equal(result.documents.has('aliases.tokens.json'), false)
})

test('writes nothing when any token cannot be applied', () => {
  const original = sources()
  const result = applyPatch(
    original,
    patch({
      '--color-b1-500': { type: 'COLOR', value: { r: 0.1, g: 0.4, b: 0.9, a: 1 } },
      '--surface-light-1': { type: 'COLOR', value: { r: 1, g: 1, b: 1, a: 1 } },
      '--a63-action-primary': { type: 'COLOR', value: { r: 1, g: 1, b: 1, a: 1 } },
      '--spacing-4': { type: 'COLOR', value: { r: 1, g: 1, b: 1, a: 1 } },
    })
  )
  assert.equal(result.documents.size, 0)
  assert.deepEqual(result.changed, [])
  assert.deepEqual(result.errors.sort(), [
    '--a63-action-primary: not defined in a DTCG source yet',
    '--spacing-4: expected a FLOAT, got COLOR',
    '--surface-light-1: an alias in the DTCG source ({color.n1.light.1})',
  ])
  // The input documents are never mutated.
  assert.equal(original.get('primitives.tokens.json').color.b1['500'].$value.hex, '#2c7fff')
})

test('rejects files that are not token patches', () => {
  assert.deepEqual(applyPatch(sources(), { tokens: {} }).errors, [
    'not an atom63-token-patch v1 file',
  ])
})
