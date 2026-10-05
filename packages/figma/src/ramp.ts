/**
 * A brand ramp (50 to 950) generated in OKLCH from one color: the hue stays,
 * the lightness follows a fixed ladder, and the chroma follows the input,
 * reduced until each step fits sRGB. The step nearest the input's lightness is
 * the input itself, so the color a person picked appears unchanged.
 */
export const RAMP_STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const
const LIGHTNESS = [0.975, 0.935, 0.87, 0.79, 0.7, 0.61, 0.52, 0.44, 0.36, 0.28, 0.2]
/** Chroma of each step relative to the most saturated one. */
const CHROMA = [0.12, 0.25, 0.45, 0.7, 0.9, 1, 0.95, 0.85, 0.72, 0.58, 0.45]

export interface Oklch {
  l: number
  c: number
  h: number
}
/** Gamma-encoded sRGB channels from 0 to 1. */
type Rgb = [number, number, number]

export function parseHex(hex: string): Rgb | null {
  const match = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(hex.trim())
  if (!match) return null
  const digits =
    match[1].length === 3 ? [...match[1]].map(digit => digit + digit).join('') : match[1]
  return [0, 2, 4].map(index => Number.parseInt(digits.slice(index, index + 2), 16) / 255) as Rgb
}

const toLinear = (value: number) =>
  value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
const fromLinear = (value: number) =>
  value <= 0.0031308 ? 12.92 * value : 1.055 * value ** (1 / 2.4) - 0.055

export function rgbToOklch(rgb: Rgb): Oklch {
  const [r, g, b] = rgb.map(toLinear)
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b)
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b)
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b)
  const lightness = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s
  const a = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s
  const bValue = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s
  const chroma = Math.hypot(a, bValue)
  const hue = chroma < 1e-6 ? 0 : ((Math.atan2(bValue, a) * 180) / Math.PI + 360) % 360
  return { l: lightness, c: chroma, h: hue }
}

/** Linear-light sRGB, which falls outside 0 to 1 for a color sRGB cannot show. */
function oklchToLinear({ l: lightness, c, h }: Oklch): Rgb {
  const a = c * Math.cos((h * Math.PI) / 180)
  const b = c * Math.sin((h * Math.PI) / 180)
  const l = (lightness + 0.3963377774 * a + 0.2158037573 * b) ** 3
  const m = (lightness - 0.1055613458 * a - 0.0638541728 * b) ** 3
  const s = (lightness - 0.0894841775 * a - 1.291485548 * b) ** 3
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ]
}

const inGamut = (rgb: Rgb) => rgb.every(value => value >= -1e-4 && value <= 1 + 1e-4)

/** The same lightness and hue with the most chroma, up to the given one, that sRGB holds. */
function fitSrgb(color: Oklch): Oklch {
  if (inGamut(oklchToLinear(color))) return color
  let low = 0
  let high = color.c
  for (let step = 0; step < 24; step++) {
    const middle = (low + high) / 2
    if (inGamut(oklchToLinear({ ...color, c: middle }))) low = middle
    else high = middle
  }
  return { ...color, c: low }
}

export function oklchToRgb(color: Oklch): Rgb {
  return oklchToLinear(color).map(value => fromLinear(Math.min(1, Math.max(0, value)))) as Rgb
}

const rgba = (rgb: Rgb) => `rgba(${rgb.map(value => Math.round(value * 255)).join(', ')}, 1)`

/** The eleven steps, 50 to 950, as `rgba()` strings like the template's palette. */
export function brandRamp(hex: string): string[] {
  const rgb = parseHex(hex)
  if (!rgb) throw new Error(`"${hex}" is not a hex color such as #2c7fff`)
  const input = rgbToOklch(rgb)
  const nearest = LIGHTNESS.reduce(
    (best, value, index) =>
      Math.abs(value - input.l) < Math.abs(LIGHTNESS[best] - input.l) ? index : best,
    0
  )
  return LIGHTNESS.map((l, index) =>
    index === nearest
      ? rgba(rgb)
      : rgba(oklchToRgb(fitSrgb({ l, c: (input.c * CHROMA[index]) / CHROMA[nearest], h: input.h })))
  )
}
