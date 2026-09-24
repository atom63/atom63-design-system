import { shouldUseLightForeground } from './auto-contrast'

export const AUTO_PRIMARY_ID = 'auto'

export function isAutoPrimary(primary: string): boolean {
  return primary === AUTO_PRIMARY_ID
}

export interface ExtractedColor {
  hue: number
  saturation: number
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255
  g /= 255
  b /= 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const l = (max + min) / 2
  if (max === min) return [0, 0, l]
  const d = max - min
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
  let h = 0
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6
  else if (max === g) h = ((b - r) / d + 2) / 6
  else h = ((r - g) / d + 4) / 6
  return [h * 360, s, l]
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  h = (((h % 360) + 360) % 360) / 360
  if (s === 0) {
    const v = Math.round(l * 255)
    return [v, v, v]
  }
  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1
    if (t > 1) t -= 1
    if (t < 1 / 6) return p + (q - p) * 6 * t
    if (t < 1 / 2) return q
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
    return p
  }
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s
  const p = 2 * l - q
  return [
    Math.round(hue2rgb(p, q, h + 1 / 3) * 255),
    Math.round(hue2rgb(p, q, h) * 255),
    Math.round(hue2rgb(p, q, h - 1 / 3) * 255),
  ]
}

/*
 * Ramp steps as OKLCH targets. Lightness and chroma copy the built-in b1 ramp,
 * so a custom brand reads like the built-in ones and meets the same contrast
 * (white on 600, 600 as text on a light page, 400 as text on a dark page). OKLCH
 * lightness is perceptual, so every hue lands at the same lightness per step,
 * which HSL lightness does not do (a yellow at HSL 43% is far lighter than a blue).
 */
const RAMP_STEPS = [
  { step: 50, l: 0.982, c: 0.014 },
  { step: 100, l: 0.96, c: 0.029 },
  { step: 200, l: 0.913, c: 0.053 },
  { step: 300, l: 0.856, c: 0.081 },
  { step: 400, l: 0.782, c: 0.118 },
  { step: 500, l: 0.619, c: 0.207 },
  { step: 600, l: 0.508, c: 0.195 },
  { step: 700, l: 0.388, c: 0.172 },
  { step: 800, l: 0.283, c: 0.144 },
  { step: 900, l: 0.177, c: 0.11 },
  { step: 950, l: 0.106, c: 0.074 },
] as const

/* The saturation that reproduces the b1 chroma values above. */
const REFERENCE_SATURATION = 0.9

function linearToSrgb(c: number): number {
  return c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055
}

function srgbToLinear(c: number): number {
  const s = c / 255
  return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
}

/** OKLCH to linear sRGB (components may fall outside 0..1 when out of gamut). */
function oklchToLinearRgb(l: number, c: number, h: number): [number, number, number] {
  const hr = (h * Math.PI) / 180
  const a = c * Math.cos(hr)
  const b = c * Math.sin(hr)
  const l_ = (l + 0.3963377774 * a + 0.2158037573 * b) ** 3
  const m_ = (l - 0.1055613458 * a - 0.0638541728 * b) ** 3
  const s_ = (l - 0.0894841775 * a - 1.291485548 * b) ** 3
  return [
    4.0767416621 * l_ - 3.3077115913 * m_ + 0.2309699292 * s_,
    -1.2684380046 * l_ + 2.6097574011 * m_ - 0.3413193965 * s_,
    -0.0041960863 * l_ - 0.7034186147 * m_ + 1.707614701 * s_,
  ]
}

function inGamut([r, g, b]: [number, number, number]): boolean {
  const e = 1e-4
  return r >= -e && r <= 1 + e && g >= -e && g <= 1 + e && b >= -e && b <= 1 + e
}

/** OKLCH to 8-bit sRGB, lowering chroma until the color fits the sRGB gamut. */
function oklchToRgb(l: number, c: number, h: number): [number, number, number] {
  let low = 0
  let high = c
  if (!inGamut(oklchToLinearRgb(l, c, h))) {
    for (let i = 0; i < 20; i++) {
      const mid = (low + high) / 2
      if (inGamut(oklchToLinearRgb(l, mid, h))) low = mid
      else high = mid
    }
    c = low
  }
  return oklchToLinearRgb(l, c, h).map(v =>
    Math.round(Math.min(1, Math.max(0, linearToSrgb(v))) * 255)
  ) as [number, number, number]
}

/** The OKLCH hue of an HSL hue (the hues differ, most around yellow and blue). */
function oklchHue(hslHue: number): number {
  const [r, g, b] = hslToRgb(hslHue, 1, 0.5).map(srgbToLinear)
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b)
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b)
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b)
  const a = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s
  const bb = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s
  return ((Math.atan2(bb, a) * 180) / Math.PI + 360) % 360
}

// b1 blue as fallback when no wallpaper or extraction fails
export const AUTO_FALLBACK_COLOR: ExtractedColor = { hue: 217, saturation: 0.9 }

export function applyAutoColorRamp(root: HTMLElement, color: ExtractedColor) {
  const hue = oklchHue(color.hue)
  const chromaScale = Math.min(1, color.saturation) / REFERENCE_SATURATION
  let primaryRgb: [number, number, number] = [0, 0, 0]
  for (const { step, l, c } of RAMP_STEPS) {
    const rgb = oklchToRgb(l, c * chromaScale, hue)
    root.style.setProperty(`--color-auto-${step}`, `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, 1)`)
    if (step === 600) primaryRgb = rgb
  }
  const fgStep = shouldUseLightForeground(...primaryRgb)
    ? RAMP_STEPS[0]
    : RAMP_STEPS[RAMP_STEPS.length - 1]
  const fgRgb = oklchToRgb(fgStep.l, fgStep.c * chromaScale, hue)
  root.style.setProperty(
    '--color-auto-foreground',
    `rgba(${fgRgb[0]}, ${fgRgb[1]}, ${fgRgb[2]}, 1)`
  )
}

export function clearAutoColorRamp(root: HTMLElement) {
  for (const { step } of RAMP_STEPS) {
    root.style.removeProperty(`--color-auto-${step}`)
  }
  root.style.removeProperty('--color-auto-foreground')
}

export async function extractDominantColor(imageSrc: string): Promise<ExtractedColor | null> {
  try {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve()
      img.onerror = reject
      img.src = imageSrc
    })

    if (img.naturalWidth === 0 || img.naturalHeight === 0) return null
    const scale = Math.min(1, 100 / img.naturalWidth)
    const w = Math.round(img.naturalWidth * scale)
    const h = Math.round(img.naturalHeight * scale)
    if (w === 0 || h === 0) return null
    const canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d')
    if (!ctx) return null

    ctx.drawImage(img, 0, 0, w, h)
    img.src = ''
    const { data } = ctx.getImageData(0, 0, w, h)

    const buckets = new Float64Array(36)
    const bucketSat = new Float64Array(36)
    const bucketCount = new Float64Array(36)

    const stride = w * h > 2500 ? 16 : 4
    for (let i = 0; i < data.length; i += stride) {
      const r = data[i]
      const g = data[i + 1]
      const b = data[i + 2]
      const [hue, s, l] = rgbToHsl(r, g, b)
      if (s < 0.15 || l < 0.1 || l > 0.9) continue
      const bucket = Math.floor(hue / 10) % 36
      buckets[bucket] += s
      bucketSat[bucket] += s
      bucketCount[bucket] += 1
    }

    let maxBucket = 0
    let maxVal = buckets[0]
    for (let i = 1; i < 36; i++) {
      if (buckets[i] > maxVal) {
        maxVal = buckets[i]
        maxBucket = i
      }
    }

    if (maxVal === 0) return null

    const dominantHue = maxBucket * 10 + 5
    const avgSat = bucketCount[maxBucket] > 0 ? bucketSat[maxBucket] / bucketCount[maxBucket] : 0.6

    return { hue: dominantHue, saturation: Math.max(0.4, Math.min(1, avgSat * 1.2)) }
  } catch {
    return null
  }
}
