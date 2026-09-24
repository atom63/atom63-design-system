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

const RAMP_STEPS = [
  { step: 50, l: 0.97, sFactor: 0.25 },
  { step: 100, l: 0.93, sFactor: 0.35 },
  { step: 200, l: 0.87, sFactor: 0.5 },
  { step: 300, l: 0.78, sFactor: 0.65 },
  { step: 400, l: 0.68, sFactor: 0.82 },
  { step: 500, l: 0.52, sFactor: 1.0 },
  { step: 600, l: 0.43, sFactor: 0.92 },
  { step: 700, l: 0.34, sFactor: 0.8 },
  { step: 800, l: 0.24, sFactor: 0.65 },
  { step: 900, l: 0.15, sFactor: 0.45 },
  { step: 950, l: 0.08, sFactor: 0.25 },
] as const

// b1 blue as fallback when no wallpaper or extraction fails
export const AUTO_FALLBACK_COLOR: ExtractedColor = { hue: 217, saturation: 0.9 }

export function applyAutoColorRamp(root: HTMLElement, color: ExtractedColor) {
  let primaryRgb: [number, number, number] = [0, 0, 0]
  for (const { step, l, sFactor } of RAMP_STEPS) {
    const s = Math.min(1, color.saturation * sFactor)
    const rgb = hslToRgb(color.hue, s, l)
    root.style.setProperty(`--color-auto-${step}`, `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, 1)`)
    if (step === 600) primaryRgb = rgb
  }
  const useLight = shouldUseLightForeground(...primaryRgb)
  const fgStep = useLight ? RAMP_STEPS[0] : RAMP_STEPS[RAMP_STEPS.length - 1]
  const fgS = Math.min(1, color.saturation * fgStep.sFactor)
  const fgRgb = hslToRgb(color.hue, fgS, fgStep.l)
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
