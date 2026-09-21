/**
 * Dominant-color extraction for image-backed surfaces.
 *
 * Two entry points, because callers differ in what they already have:
 *
 * - `extractColorFromImage(img)` samples an image element that is **already
 *   decoded**. Use it when the image is on screen anyway (a lazy-loaded card
 *   that just fired `onLoad`): it costs one small canvas read and no network.
 * - `loadAndExtractColor(url)` fetches the URL itself. Use it only when no
 *   element exists yet — it issues its own request, so calling it for a list of
 *   lazy images defeats their laziness and pulls every full-size source.
 *
 * Results are cached per `url::region`, and concurrent requests for the same
 * key share one extraction.
 */

export interface ExtractedColor {
  /** `"r g b"`, for `rgb(var(--x) / <alpha>)`. */
  css: string
  /** Lightness clamped for white-text contrast; hue and saturation kept. */
  darker: string
  raw: { r: number; g: number; b: number }
}

export type ColorSampleRegion = 'bottom' | 'full' | 'top'

export interface ExtractColorOptions {
  /** Longest edge of the downsample buffer. Tiny on purpose — this is a
   *  histogram, not a thumbnail. */
  maxSize?: number
  sampleRegion?: ColorSampleRegion
  /** RGB distance below which two pixels join the same bucket. */
  similarityThreshold?: number
}

const DEFAULTS = {
  maxSize: 16,
  sampleRegion: 'full' as ColorSampleRegion,
  similarityThreshold: 50,
}

const cache = new Map<string, ExtractedColor>()
const pending = new Map<string, Promise<ExtractedColor>>()

export function colorCacheKey(imageUrl: string, sampleRegion: string): string {
  return `${imageUrl}::${sampleRegion}`
}

export function getCachedColor(
  imageUrl: string,
  sampleRegion: ColorSampleRegion = DEFAULTS.sampleRegion
): ExtractedColor | null {
  return cache.get(colorCacheKey(imageUrl, sampleRegion)) ?? null
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  const rn = r / 255
  const gn = g / 255
  const bn = b / 255

  const max = Math.max(rn, gn, bn)
  const min = Math.min(rn, gn, bn)
  const delta = max - min
  const l = (max + min) / 2

  if (delta === 0) return [0, 0, l]

  const s = l > 0.5 ? delta / (2 - max - min) : delta / (max + min)

  let h = 0
  if (max === rn) h = ((gn - bn) / delta + (gn < bn ? 6 : 0)) / 6
  else if (max === gn) h = ((bn - rn) / delta + 2) / 6
  else h = ((rn - gn) / delta + 4) / 6

  return [h, s, l]
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  if (s === 0) {
    const v = Math.round(l * 255)
    return [v, v, v]
  }

  const hue2rgb = (p: number, q: number, t: number) => {
    const tn = t < 0 ? t + 1 : t > 1 ? t - 1 : t
    if (tn < 1 / 6) return p + (q - p) * 6 * tn
    if (tn < 1 / 2) return q
    if (tn < 2 / 3) return p + (q - p) * (2 / 3 - tn) * 6
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

/**
 * Cap the tint's *relative luminance*, keeping hue and saturation.
 *
 * Clamping HSL lightness instead is the obvious move and it is wrong: lightness
 * is not perceptual luminance, so at high saturation an L=0.13 yellow still
 * resolves to rgb(63 65 1) — nearly 4x the luminance of an L=0.13 blue, and
 * bright enough to put white text under AA. Capping luminance directly targets
 * the property contrast is actually computed from, so every hue lands at the
 * same readable depth and a bright yellow becomes deep gold rather than grey.
 */
function darkenForContrast(r: number, g: number, b: number, maxLuminance: number): string {
  const [h, s, l] = rgbToHsl(r, g, b)

  const at = (lightness: number) => hslToRgb(h, s, lightness)
  const luminance = ([rr, gg, bb]: [number, number, number]) => relativeLuminance(rr, gg, bb)

  if (luminance(at(l)) <= maxLuminance) {
    const [ar, ag, ab] = at(l)
    return `${ar} ${ag} ${ab}`
  }

  // Luminance rises monotonically with lightness at fixed hue/saturation.
  let lo = 0
  let hi = l
  for (let i = 0; i < 24; i += 1) {
    const mid = (lo + hi) / 2
    if (luminance(at(mid)) > maxLuminance) hi = mid
    else lo = mid
  }

  const [ar, ag, ab] = at(lo)
  return `${ar} ${ag} ${ab}`
}

function srgbToLinear(channel: number): number {
  const c = channel / 255
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
}

function relativeLuminance(r: number, g: number, b: number): number {
  return 0.2126 * srgbToLinear(r) + 0.7152 * srgbToLinear(g) + 0.0722 * srgbToLinear(b)
}

/**
 * Luminance ceiling for the tint. Solved against a real photo set: the tint is
 * a load-bearing contrast layer rather than decoration, so it has to stay dark
 * enough that white copy clears AA over the brightest card underneath it.
 */
export const TINT_MAX_LUMINANCE = 0.015

/**
 * Darken a color to the tint luminance ceiling, keeping hue and saturation.
 *
 * Exported because it is the contract the card overlay relies on: whatever hue
 * a photo yields, the result is dark enough to carry white copy.
 */
export function capColorForContrast(r: number, g: number, b: number): string {
  return darkenForContrast(r, g, b, TINT_MAX_LUMINANCE)
}

function extractFromPixels(pixels: Uint8ClampedArray, threshold: number): ExtractedColor {
  const thresholdSq = threshold * threshold
  const buckets: Array<{ r: number; g: number; b: number; count: number; vib: number }> = []

  for (let i = 0; i < pixels.length; i += 4) {
    const r = pixels[i] ?? 0
    const g = pixels[i + 1] ?? 0
    const b = pixels[i + 2] ?? 0
    const a = pixels[i + 3] ?? 0

    if (a < 125) continue

    let merged = false
    for (const bucket of buckets) {
      const dr = r - bucket.r
      const dg = g - bucket.g
      const db = b - bucket.b
      if (dr * dr + dg * dg + db * db < thresholdSq) {
        const total = bucket.count + 1
        bucket.r = Math.round((bucket.r * bucket.count + r) / total)
        bucket.g = Math.round((bucket.g * bucket.count + g) / total)
        bucket.b = Math.round((bucket.b * bucket.count + b) / total)
        bucket.count = total
        const mx = Math.max(bucket.r, bucket.g, bucket.b)
        bucket.vib = mx === 0 ? 0 : ((mx - Math.min(bucket.r, bucket.g, bucket.b)) / mx) * total
        merged = true
        break
      }
    }

    if (!merged) {
      const mx = Math.max(r, g, b)
      buckets.push({ r, g, b, count: 1, vib: mx === 0 ? 0 : (mx - Math.min(r, g, b)) / mx })
    }
  }

  // Most common clusters first, then the most vibrant among them — a photo's
  // largest bucket is often a washed-out sky, which makes a lifeless tint.
  buckets.sort((a, b) => b.count - a.count)
  const top = buckets.slice(0, 5)
  top.sort((a, b) => b.vib - a.vib)

  const winner = top.at(0) ?? { r: 0, g: 0, b: 0 }
  const { r, g, b } = winner

  return {
    raw: { r, g, b },
    css: `${r} ${g} ${b}`,
    darker: darkenForContrast(r, g, b, TINT_MAX_LUMINANCE),
  }
}

/**
 * Sample an already-decoded image element. Throws if the element is not ready
 * or the canvas is tainted by a cross-origin source without CORS headers.
 */
export function extractColorFromImage(
  img: HTMLImageElement,
  options: ExtractColorOptions = {}
): ExtractedColor {
  const {
    maxSize = DEFAULTS.maxSize,
    sampleRegion = DEFAULTS.sampleRegion,
    similarityThreshold = DEFAULTS.similarityThreshold,
  } = options

  if (!img.naturalWidth || !img.naturalHeight) {
    throw new Error('Image is not decoded yet')
  }

  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  if (!ctx) throw new Error('Canvas context unavailable')

  const scale = Math.min(1, maxSize / Math.max(img.naturalWidth, img.naturalHeight))
  const w = Math.max(1, Math.round(img.naturalWidth * scale))

  let srcY = 0
  let srcH = img.naturalHeight

  if (sampleRegion === 'bottom') {
    srcY = Math.floor(img.naturalHeight * 0.5)
    srcH = img.naturalHeight - srcY
  } else if (sampleRegion === 'top') {
    srcH = Math.floor(img.naturalHeight * 0.5)
  }

  const drawH = Math.max(1, Math.round(srcH * scale))
  canvas.width = w
  canvas.height = drawH

  ctx.drawImage(img, 0, srcY, img.naturalWidth, srcH, 0, 0, w, drawH)
  return extractFromPixels(ctx.getImageData(0, 0, w, drawH).data, similarityThreshold)
}

/**
 * Sample an image element and memoize under its `src`, so sibling surfaces
 * showing the same media extract once. Returns `null` instead of throwing —
 * callers treat a failure as "no tint", which is a valid resting state.
 */
export function extractColorFromLoadedImage(
  img: HTMLImageElement,
  options: ExtractColorOptions = {}
): ExtractedColor | null {
  const { sampleRegion = DEFAULTS.sampleRegion } = options
  const key = colorCacheKey(img.currentSrc || img.src, sampleRegion)

  const cached = cache.get(key)
  if (cached) return cached

  try {
    const result = extractColorFromImage(img, options)
    cache.set(key, result)
    return result
  } catch {
    return null
  }
}

/**
 * Load `imageUrl` and extract from it. Issues its own request — prefer
 * `extractColorFromLoadedImage` when the image is already on screen.
 */
export function loadAndExtractColor(
  imageUrl: string,
  options: ExtractColorOptions & { crossOrigin?: string } = {}
): Promise<ExtractedColor> {
  const { sampleRegion = DEFAULTS.sampleRegion, crossOrigin = 'anonymous' } = options
  const key = colorCacheKey(imageUrl, sampleRegion)

  const cached = cache.get(key)
  if (cached) return Promise.resolve(cached)

  const inflight = pending.get(key)
  if (inflight) return inflight

  const promise = new Promise<ExtractedColor>((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = crossOrigin

    img.onload = () => {
      try {
        const result = extractColorFromImage(img, { ...options, sampleRegion })
        cache.set(key, result)
        pending.delete(key)
        resolve(result)
      } catch (err) {
        pending.delete(key)
        reject(err instanceof Error ? err : new Error('Color extraction failed'))
      }
    }

    img.onerror = () => {
      pending.delete(key)
      reject(new Error(`Failed to load: ${imageUrl}`))
    }

    img.src = imageUrl
  })

  pending.set(key, promise)
  return promise
}
