import assert from 'node:assert/strict'
import test from 'node:test'

import {
  contrast,
  hex,
  oklchToRgb,
  platePalette,
  plateScopeCss,
  quantize,
  rgbToOklab,
} from './plate-palette.mjs'

const repeat = (rgb, count) => Array.from({ length: count }, () => rgb)
// A light plate: a pale sky (the safe area), a dark ridge and a small red light.
const SKY = [232, 236, 240]
const RIDGE = [20, 26, 34]
const RED = [214, 40, 38]
const plate = [
  ...repeat(SKY, 600),
  ...repeat(RIDGE, 340),
  ...repeat(RED, 20),
  ...repeat([120, 128, 136], 40),
]

test('contrast follows WCAG: black on white is 21:1', () => {
  assert.equal(contrast([0, 0, 0], [255, 255, 255]).toFixed(1), '21.0')
})

test('oklch round-trips through OKLab for an in-gamut colour', () => {
  const lab = rgbToOklab([214, 40, 38])
  const h = (Math.atan2(lab.b, lab.a) * 180) / Math.PI
  assert.deepEqual(oklchToRgb(lab.l, Math.hypot(lab.a, lab.b), h), [214, 40, 38])
})

test('quantize finds the plate clusters, heaviest first', () => {
  const clusters = quantize(plate, 4)
  assert.equal(hex(clusters[0].rgb), hex(SKY))
  assert.ok(clusters.some(cluster => hex(cluster.rgb) === hex(RED)))
})

test('the roles: page from the safe area, ink on the far side, accent most chromatic', () => {
  const palette = platePalette({
    plate: quantize(plate, 4),
    safeArea: quantize(repeat(SKY, 50), 1),
  })
  assert.equal(palette.mode, 'light')
  assert.equal(hex(palette.roles.page), hex(SKY))
  assert.equal(hex(palette.roles.accent), hex(RED))
  assert.ok(contrast(palette.roles.ink, palette.roles.page) >= 7)
  assert.deepEqual(palette.problems, [])
})

test('a grey plate keeps the theme brand and reports it', () => {
  const grey = [...repeat([230, 230, 230], 80), ...repeat([30, 30, 30], 20)]
  const palette = platePalette({
    plate: quantize(grey, 2),
    safeArea: quantize(repeat([230, 230, 230], 10), 1),
  })
  assert.equal(palette.roles.accent, null)
  assert.equal(palette.ramp, null)
  assert.match(palette.notes.join('\n'), /keeps the theme brand/)
})

test('a dark plate suggests dark mode and keeps light text on it', () => {
  const night = [
    ...repeat([10, 16, 46], 80),
    ...repeat([245, 158, 11], 10),
    ...repeat([200, 205, 215], 10),
  ]
  const palette = platePalette({
    plate: quantize(night, 3),
    safeArea: quantize(repeat([10, 16, 46], 10), 1),
  })
  assert.equal(palette.mode, 'dark')
  assert.ok(contrast(palette.surfaces.light, palette.surfaces.dark) >= 7)
})

test('the stylesheet scopes the ramp and the switched roles', () => {
  const palette = platePalette({
    plate: quantize(plate, 4),
    safeArea: quantize(repeat(SKY, 50), 1),
  })
  const css = plateScopeCss('plate-01', palette, 'plate-01/hero.webp')
  assert.match(css, /\[data-a63-plate='plate-01'\] \{\n {2}--color-auto-50: rgb\(/)
  assert.match(
    css,
    /\[data-a63-plate='plate-01'\]\[data-a63-brand\],\n\[data-a63-plate='plate-01'\] \[data-a63-mode\] \{/
  )
  assert.match(
    css,
    /--a63-surface-page: var\(--a63-if-light, rgb\(232 236 240\)\) var\(--a63-if-dark, rgb\(/
  )
  assert.throws(() => plateScopeCss('Plate 1', palette, 'x'), /lowercase/)
})
