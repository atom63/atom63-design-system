import { afterEach, describe, expect, it } from 'vitest'
import { root } from '../test/apply-styles'

/*
 * The chart series colours (--a63-chart-1..5) must stay apart from each other
 * and from the brand for every brand, theme and mode, and each series must
 * reach WCAG 1.4.11's 3:1 for graphics against the surfaces a chart sits on.
 * Series 2 to 5 turn the hue of series 1 (the brand), so a wallpaper brand
 * (`auto`) is checked too, with a few ramps written the way the
 * personalization controller writes them.
 */

const themes = ['modern', 'aqua', 'retro', 'terminal'] as const
const modes = ['light', 'dark'] as const
const series = [1, 2, 3, 4, 5].map(index => `--a63-chart-${index}`)
const surfaces = ['--a63-surface-page', '--a63-surface-panel'] as const

/** WCAG 1.4.11: graphics that carry meaning reach 3:1 against what is next to them. */
const GRAPHICS_CONTRAST = 3
/** Smallest OKLab distance between two series, and between a series and the brand. */
const MIN_DISTANCE = 0.1

/** Wallpaper ramps the controller could write: a teal, a gold and a magenta. */
const autoRamps: Record<string, Record<number, string>> = {
  'auto (teal)': { 400: 'oklch(0.78 0.12 190)', 600: 'oklch(0.55 0.1 195)' },
  'auto (gold)': { 400: 'oklch(0.84 0.14 85)', 600: 'oklch(0.56 0.12 75)' },
  'auto (magenta)': { 400: 'oklch(0.74 0.2 330)', 600: 'oklch(0.55 0.22 335)' },
}

const brands: { label: string; brand: string; ramp?: Record<number, string> }[] = [
  ...['b1', 'b2', 'b3', 'b4', 'b5', 'b6'].map(brand => ({ label: brand, brand })),
  ...Object.entries(autoRamps).map(([label, ramp]) => ({ label, brand: 'auto', ramp })),
]

afterEach(() => {
  const element = root()
  for (const attribute of ['data-a63-theme', 'data-a63-mode', 'data-a63-brand']) {
    element.removeAttribute(attribute)
  }
  element.removeAttribute('style')
  element.classList.remove('dark', 'light')
})

interface Rgb {
  r: number
  g: number
  b: number
}

const canvas = document.createElement('canvas')
canvas.width = 1
canvas.height = 1
const context = canvas.getContext('2d', { colorSpace: 'srgb', willReadFrequently: true })

/** Paints one pixel and reads it back as sRGB, so any CSS colour syntax works. */
function toRgb(color: string): Rgb {
  if (!context) throw new Error('2d canvas unavailable')
  context.clearRect(0, 0, 1, 1)
  context.fillStyle = color
  context.fillRect(0, 0, 1, 1)
  const [r = 0, g = 0, b = 0] = context.getImageData(0, 0, 1, 1).data
  return { r, g, b }
}

function painted(cssVar: string): string {
  const probe = document.createElement('div')
  probe.style.color = `var(${cssVar})`
  document.body.appendChild(probe)
  const value = getComputedStyle(probe).color
  probe.remove()
  return value
}

const linear = (channel: number) => {
  const value = channel / 255
  return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
}

function luminance({ r, g, b }: Rgb): number {
  return 0.2126 * linear(r) + 0.7152 * linear(g) + 0.0722 * linear(b)
}

function contrast(a: Rgb, b: Rgb): number {
  const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number]
  return (light + 0.05) / (dark + 0.05)
}

function oklab({ r, g, b }: Rgb): [number, number, number] {
  const [lr, lg, lb] = [linear(r), linear(g), linear(b)]
  const l = Math.cbrt(0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb)
  const m = Math.cbrt(0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb)
  const s = Math.cbrt(0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb)
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ]
}

function distance(a: Rgb, b: Rgb): number {
  const [x, y] = [oklab(a), oklab(b)]
  return Math.hypot(x[0] - y[0], x[1] - y[1], x[2] - y[2])
}

function apply(theme: string, mode: string, brand: (typeof brands)[number]): void {
  const element = root()
  element.setAttribute('data-a63-theme', theme)
  element.setAttribute('data-a63-mode', mode)
  element.classList.remove('dark', 'light')
  element.classList.add(mode)
  element.setAttribute('data-a63-brand', brand.brand)
  element.removeAttribute('style')
  for (const [step, value] of Object.entries(brand.ramp ?? {})) {
    element.style.setProperty(`--color-auto-${step}`, value)
  }
}

describe('chart palette', () => {
  it('keeps every series apart from the others and from the brand, at 3:1 on its surfaces', () => {
    const failures: string[] = []

    for (const brand of brands) {
      for (const theme of themes) {
        for (const mode of modes) {
          apply(theme, mode, brand)
          const where = `${brand.label} ${theme}/${mode}`
          const colors = series.map(name => toRgb(painted(name)))
          const primary = toRgb(painted('--a63-action-primary'))

          for (const surface of surfaces) {
            const background = toRgb(painted(surface))
            colors.forEach((color, index) => {
              const ratio = contrast(color, background)
              if (ratio < GRAPHICS_CONTRAST) {
                failures.push(`${where} ${series[index]} on ${surface}: ${ratio.toFixed(2)}:1`)
              }
            })
          }

          for (let a = 0; a < colors.length; a += 1) {
            // Series 1 is the brand; the others must not land on it.
            if (a > 0) {
              const apart = distance(colors[a]!, primary)
              if (apart < MIN_DISTANCE) {
                failures.push(`${where} ${series[a]} vs the brand: ${apart.toFixed(3)}`)
              }
            }
            for (let b = a + 1; b < colors.length; b += 1) {
              const apart = distance(colors[a]!, colors[b]!)
              if (apart < MIN_DISTANCE) {
                failures.push(`${where} ${series[a]} vs ${series[b]}: ${apart.toFixed(3)}`)
              }
            }
          }
        }
      }
    }

    expect(failures, failures.join('\n')).toEqual([])
  })

  /* A UIProvider can set only the brand, under a root that sets the mode. The
     series must turn from that nested brand, not the root's. */
  it('turns from a brand set on a nested scope', () => {
    const scope = document.createElement('div')
    scope.setAttribute('data-a63-brand', 'b5')
    document.body.appendChild(scope)
    const read = (name: string) => {
      const probe = document.createElement('div')
      probe.style.color = `var(${name})`
      scope.appendChild(probe)
      const value = toRgb(getComputedStyle(probe).color)
      probe.remove()
      return value
    }
    const primary = read('--a63-action-primary')
    const failures = series
      .slice(1)
      .map(name => ({ name, apart: distance(read(name), primary) }))
      .filter(({ apart }) => apart < MIN_DISTANCE)
      .map(({ name, apart }) => `${name} vs the nested brand: ${apart.toFixed(3)}`)
    expect(distance(read('--a63-chart-1'), toRgb(painted('--a63-chart-1')))).toBeGreaterThan(
      MIN_DISTANCE
    )
    scope.remove()
    expect(failures, failures.join('\n')).toEqual([])
  })
})
