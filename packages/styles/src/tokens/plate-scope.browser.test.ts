// A plate scope (scripts/design-system/plate-palette.mjs) on the real cascade:
// the page tone, ink and brand ramp it writes must reach the semantic roles on
// the scope, swap in a nested dark band, and leave the page outside alone.
import { afterEach, describe, expect, it } from 'vitest'

import {
  platePalette,
  plateScopeCss,
  quantize,
} from '../../../../scripts/design-system/lib/plate-palette.mjs'
import '../test/apply-styles'

const repeat = (rgb: number[], count: number) => Array.from({ length: count }, () => rgb)
const SKY = [232, 236, 240]
const pixels = [...repeat(SKY, 600), ...repeat([20, 26, 34], 340), ...repeat([214, 40, 38], 30)]
const palette = platePalette({ plate: quantize(pixels, 3), safeArea: quantize(repeat(SKY, 20), 1) })

const rgb = ([r, g, b]: number[]) => `rgb(${r}, ${g}, ${b})`

function mount() {
  const style = document.createElement('style')
  style.textContent = plateScopeCss('test-plate', palette, 'fixture')
  document.head.append(style)
  const outside = document.createElement('div')
  const scope = document.createElement('div')
  scope.dataset.a63Plate = 'test-plate'
  scope.dataset.a63Brand = 'auto'
  const band = document.createElement('div')
  band.dataset.a63Mode = 'dark'
  scope.append(band)
  document.body.append(outside, scope)
  const paint = (element: HTMLElement, role: string) => {
    element.style.backgroundColor = `var(${role})`
    return getComputedStyle(element).backgroundColor
  }
  const ink = (element: HTMLElement) => {
    element.style.color = 'var(--a63-text-primary)'
    return getComputedStyle(element).color
  }
  return { style, outside, scope, band, paint, ink }
}

afterEach(() => {
  document.body.replaceChildren()
  for (const style of document.head.querySelectorAll('style:not([data-vite-dev-id])')) {
    if (style.textContent?.includes('test-plate')) style.remove()
  }
})

describe('plate scope', () => {
  it('sets the page tone and the ink on the scope', () => {
    const { scope, paint, ink } = mount()
    expect(paint(scope, '--a63-surface-page')).toBe(rgb(palette.surfaces.light))
    expect(ink(scope)).toBe(rgb(palette.surfaces.dark))
  })

  it('swaps them in a nested dark band', () => {
    const { band, paint, ink } = mount()
    expect(paint(band, '--a63-surface-page')).toBe(rgb(palette.surfaces.dark))
    expect(ink(band)).toBe(rgb(palette.surfaces.light))
  })

  it('derives the primary action from the accent ramp', () => {
    const { scope, paint } = mount()
    const step600 = palette.ramp!.find(entry => entry.step === 600)!.rgb
    expect(paint(scope, '--a63-action-primary')).toBe(rgb(step600))
  })

  it('leaves the page outside the scope on the theme', () => {
    const { outside, scope, paint } = mount()
    expect(paint(outside, '--a63-surface-page')).not.toBe(paint(scope, '--a63-surface-page'))
  })
})
