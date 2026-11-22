/**
 * Plate palette: from the pixels of a plate (the main picture of an art
 * landing page) to the three colour roles a plate scope sets — page tone, deep
 * ink and one accent — with WCAG contrast checks and the scoped stylesheet.
 * Pure functions; plate-palette.mjs reads the pixels and writes the file.
 *
 * The stylesheet sets `--color-auto-50…950` for `[data-a63-brand='auto']`, so
 * the brand ramp and every role derived from it recompute on the scope (the
 * rescope path of semantics), and overrides the page surface and the primary
 * and secondary text with the `--a63-if-light` / `--a63-if-dark` switch, so a
 * nested `[data-a63-mode='dark']` section (the dark band) swaps them.
 */

/** sRGB 0–255 → linear 0–1 */
const toLinear = value => {
  const s = value / 255
  return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
}
const fromLinear = value =>
  Math.round(
    Math.min(
      1,
      Math.max(0, value <= 0.0031308 ? 12.92 * value : 1.055 * value ** (1 / 2.4) - 0.055)
    ) * 255
  )

/** [r, g, b] 0–255 → { l, a, b } OKLab */
export function rgbToOklab([r, g, b]) {
  const [lr, lg, lb] = [r, g, b].map(toLinear)
  const l = Math.cbrt(0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb)
  const m = Math.cbrt(0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb)
  const s = Math.cbrt(0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb)
  return {
    l: 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    a: 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    b: 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  }
}

/** OKLab → linear sRGB (may be out of gamut) */
function oklabToLinear({ l, a, b }) {
  const lc = (l + 0.3963377774 * a + 0.2158037573 * b) ** 3
  const mc = (l - 0.1055613458 * a - 0.0638541728 * b) ** 3
  const sc = (l - 0.0894841775 * a - 1.291485548 * b) ** 3
  return [
    4.0767416621 * lc - 3.3077115913 * mc + 0.2309699292 * sc,
    -1.2684380046 * lc + 2.6097574011 * mc - 0.3413193965 * sc,
    -0.0041960863 * lc - 0.7034186147 * mc + 1.707614701 * sc,
  ]
}

const inGamut = rgb => rgb.every(v => v >= -1e-4 && v <= 1 + 1e-4)

/** OKLCH → [r, g, b] 0–255, reducing chroma until it fits sRGB. */
export function oklchToRgb(l, c, h) {
  const at = chroma => {
    const rad = (h * Math.PI) / 180
    return oklabToLinear({ l, a: chroma * Math.cos(rad), b: chroma * Math.sin(rad) })
  }
  let low = 0
  let high = c
  if (!inGamut(at(c))) {
    for (let i = 0; i < 24; i++) {
      const mid = (low + high) / 2
      if (inGamut(at(mid))) low = mid
      else high = mid
    }
    return at(low).map(fromLinear)
  }
  return at(c).map(fromLinear)
}

export const chroma = lab => Math.hypot(lab.a, lab.b)
export const hue = lab => ((Math.atan2(lab.b, lab.a) * 180) / Math.PI + 360) % 360

/** WCAG 2 relative luminance of [r, g, b] 0–255. */
export function luminance(rgb) {
  const [r, g, b] = rgb.map(toLinear)
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

/** WCAG 2 contrast ratio. */
export function contrast(first, second) {
  const [hi, lo] = [luminance(first), luminance(second)].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}

export const hex = rgb => `#${rgb.map(v => v.toString(16).padStart(2, '0')).join('')}`

/**
 * k-means in OKLab over [r, g, b] pixels, seeded deterministically from
 * lightness quantiles. Returns clusters sorted by weight, each with its mean
 * colour, OKLab value and share of the pixels.
 */
export function quantize(pixels, k = 6, rounds = 12) {
  const points = pixels.map(rgb => ({ rgb, lab: rgbToOklab(rgb) }))
  const distance = (p, c) => (p.l - c.l) ** 2 + (p.a - c.a) ** 2 + (p.b - c.b) ** 2
  // Farthest-point seeding from the median-lightness pixel: deterministic, and a
  // small saturated region (the accent) gets its own centre instead of merging.
  const byLightness = [...points].sort((x, y) => x.lab.l - y.lab.l)
  let centres = [{ ...byLightness[Math.floor(byLightness.length / 2)].lab }]
  while (centres.length < Math.min(k, points.length)) {
    let far = points[0].lab
    let farDistance = -1
    for (const { lab } of points) {
      const nearest = Math.min(...centres.map(centre => distance(lab, centre)))
      if (nearest > farDistance) {
        farDistance = nearest
        far = lab
      }
    }
    centres.push({ ...far })
  }
  let labels = new Array(points.length).fill(0)
  for (let round = 0; round < rounds; round++) {
    labels = points.map(({ lab }) => {
      let best = 0
      for (let i = 1; i < centres.length; i++)
        if (distance(lab, centres[i]) < distance(lab, centres[best])) best = i
      return best
    })
    centres = centres.map((centre, i) => {
      const members = points.filter((_, index) => labels[index] === i)
      if (members.length === 0) return centre
      const sum = members.reduce(
        (acc, { lab }) => ({ l: acc.l + lab.l, a: acc.a + lab.a, b: acc.b + lab.b }),
        { l: 0, a: 0, b: 0 }
      )
      return { l: sum.l / members.length, a: sum.a / members.length, b: sum.b / members.length }
    })
  }
  return centres
    .map((centre, i) => {
      const members = points.filter((_, index) => labels[index] === i)
      if (members.length === 0) return null
      const mean = [0, 1, 2].map(channel =>
        Math.round(members.reduce((acc, { rgb }) => acc + rgb[channel], 0) / members.length)
      )
      return { rgb: mean, lab: rgbToOklab(mean), weight: members.length / points.length }
    })
    .filter(Boolean)
    .sort((x, y) => y.weight - x.weight)
}

/** The ramp steps of the auto brand (theme/core/auto-primary.ts), b1's chroma at saturation 0.9. */
export const RAMP_STEPS = [
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
]

/** A brand ramp at the accent's hue; chroma scales with the accent's own (b1's 500 is 0.207). */
export function accentRamp(accentLab) {
  const scale = Math.min(1.2, chroma(accentLab) / 0.207)
  const h = hue(accentLab)
  return RAMP_STEPS.map(({ step, l, c }) => ({ step, rgb: oklchToRgb(l, c * scale, h) }))
}

/** The foreground --a63-action-primary-foreground picks on a fill: the CSS step at oklch l 0.57. */
export function actionForeground(fillRgb) {
  const { l, a, b } = rgbToOklab(fillRgb)
  const h = hue({ a, b })
  const c = chroma({ a, b }) * 0.06
  return l < 0.57 ? oklchToRgb(0.985, c, h) : oklchToRgb(0.15, c, h)
}

/** Moves a colour along OKLab lightness, keeping its hue and chroma, until it reaches `ratio` on `against`. */
export function pushToContrast(rgb, against, ratio) {
  const lab = rgbToOklab(rgb)
  // Away from `against`: lighter on a dark colour, darker on a light one.
  const lighter = luminance(against) < 0.18
  let current = rgb
  for (let l = lab.l; l >= 0 && l <= 1; l += lighter ? 0.01 : -0.01) {
    current = oklchToRgb(l, chroma(lab), hue(lab))
    if (contrast(current, against) >= ratio) return current
  }
  return lighter ? [255, 255, 255] : [0, 0, 0]
}

const mix = (first, second, share) =>
  first.map((v, i) => Math.round(v * share + second[i] * (1 - share)))

/**
 * Picks the roles from the clusters of the whole plate and of its safe area
 * (the calm region the headline sits on), then checks and, for the ink and the
 * secondary text, adjusts contrast.
 *
 * - page tone: the heaviest cluster of the safe area;
 * - deep ink: the darkest cluster on a light page tone, the lightest on a dark one;
 * - accent: the most chromatic cluster holding at least 0.5% of the plate,
 *   when its OKLCH chroma reaches 0.06 (else the plate keeps the theme brand).
 *
 * Returns the roles, the ramp, every checked pair and the problems that make
 * the palette unusable.
 */
export function platePalette({ plate, safeArea }) {
  const page = safeArea[0]
  const mode = page.lab.l >= 0.6 ? 'light' : 'dark'
  // The ink sits on the far side of the page tone: the darkest cluster on a light
  // plate, the lightest on a dark one.
  const ink = [...plate].sort((x, y) =>
    mode === 'light' ? x.lab.l - y.lab.l : y.lab.l - x.lab.l
  )[0]
  const accent = plate
    .filter(cluster => cluster.weight >= 0.005 && chroma(cluster.lab) >= 0.06)
    .sort((x, y) => chroma(y.lab) - chroma(x.lab))[0]
  const notes = []

  const inkRgb = pushToContrast(ink.rgb, page.rgb, 7)
  if (hex(inkRgb) !== hex(ink.rgb))
    notes.push(`ink moved from ${hex(ink.rgb)} to ${hex(inkRgb)} to reach 7:1 on the page tone`)
  const [light, dark] =
    luminance(page.rgb) > luminance(inkRgb) ? [page.rgb, inkRgb] : [inkRgb, page.rgb]
  const secondaryOnLight = pushToContrast(mix(dark, light, 0.72), light, 4.5)
  const secondaryOnDark = pushToContrast(mix(light, dark, 0.72), dark, 4.5)

  const ramp = accent ? accentRamp(accent.lab) : null
  const action = ramp?.find(entry => entry.step === 600).rgb
  const pairs = [
    { pair: 'primary text on light surface', ratio: contrast(dark, light), minimum: 4.5 },
    {
      pair: 'secondary text on light surface',
      ratio: contrast(secondaryOnLight, light),
      minimum: 4.5,
    },
    {
      pair: 'secondary text on dark surface',
      ratio: contrast(secondaryOnDark, dark),
      minimum: 4.5,
    },
  ]
  if (action) {
    const foreground = actionForeground(action)
    pairs.push(
      // Actions sit on the page tone; the ramp's 600 step is the fill in both modes.
      {
        pair: 'primary action (brand 600) on the page tone',
        ratio: contrast(action, page.rgb),
        minimum: 3,
      },
      { pair: 'text on the primary action', ratio: contrast(foreground, action), minimum: 4.5 }
    )
  } else {
    notes.push('no chromatic cluster reaches chroma 0.06: the scope keeps the theme brand')
  }
  const problems = pairs
    .filter(({ ratio, minimum }) => ratio < minimum)
    .map(({ pair, ratio, minimum }) => `${pair}: ${ratio.toFixed(2)}:1, needs ${minimum}:1`)

  return {
    mode,
    roles: {
      page: page.rgb,
      ink: inkRgb,
      accent: accent?.rgb ?? null,
      neutrals: plate
        .filter(c => c !== page && c !== ink && c !== accent)
        .slice(0, 2)
        .map(c => c.rgb),
    },
    surfaces: { light, dark, secondaryOnLight, secondaryOnDark },
    ramp,
    pairs,
    notes,
    problems,
  }
}

const rgbCss = ([r, g, b]) => `rgb(${r} ${g} ${b})`
const switched = (light, dark) =>
  `var(--a63-if-light, ${rgbCss(light)}) var(--a63-if-dark, ${rgbCss(dark)})`

/** The scoped stylesheet for `[data-a63-plate='<id>']`. */
export function plateScopeCss(id, palette, source) {
  if (!/^[a-z0-9-]+$/.test(id))
    throw new Error(`plate id "${id}" must be lowercase letters, digits and dashes`)
  const scope = `[data-a63-plate='${id}']`
  const { light, dark, secondaryOnLight, secondaryOnDark } = palette.surfaces
  const lines = [
    '/*',
    ` * Generated by scripts/design-system/plate-palette.mjs from ${source}. Do not edit; rerun it.`,
    ` * Roles: page ${hex(palette.roles.page)}, ink ${hex(palette.roles.ink)}, accent ${palette.roles.accent ? hex(palette.roles.accent) : 'none (theme brand)'}.`,
    ` * Use on an element with data-a63-plate="${id}" data-a63-brand="auto"; suggested mode: ${palette.mode}.`,
    ' * A nested [data-a63-mode="dark"] section swaps the page tone and the ink (the dark band).',
    ' */',
  ]
  if (palette.ramp) {
    lines.push(
      `${scope} {`,
      ...palette.ramp.map(({ step, rgb }) => `  --color-auto-${step}: ${rgbCss(rgb)};`),
      '}',
      ''
    )
  }
  lines.push(
    // [data-a63-brand] lifts the scope above the semantics rescope rule at any load order.
    `${scope}[data-a63-brand],`,
    `${scope} [data-a63-mode] {`,
    `  --a63-surface-page: ${switched(light, dark)};`,
    `  --a63-text-primary: ${switched(dark, light)};`,
    `  --a63-text-secondary: ${switched(secondaryOnLight, secondaryOnDark)};`,
    '}',
    ''
  )
  return lines.join('\n')
}
