# Figma token sync, plan 3: the plugin, rebuilt with Create and Import

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development
> (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use
> checkbox (`- [ ]`) syntax for tracking.

**Goal:** A designer opens a new Figma file, runs the plugin, and either creates a token system
from a few choices or imports a project's token CSS. Either way the file gets the site template's
variables, text styles and effect styles, and the created system exports as the template's token
CSS. The plugin is rebuilt from these two jobs. The pages it has today (Sync, Manage, Styles,
Rebind, patch export) are removed.

**Architecture:** The plugin is a thin interface over `@atom63/figma`, the same engine that the
agent's `use_figma` scripts run:

- **Create:** `buildTemplateFiles(choices)` rewrites a bundled copy of the site template's token
  CSS. It generates a new brand ramp in OKLCH and moves the default of each axis.
- **Import:** reads CSS the user picks or pastes.
- Both paths run the same parser (`buildProjectModel` plus `deriveStyles`) in the UI, where the
  browser can compute colors.
- The main thread plans with `checkModel` and applies with `syncModel`, which return the same
  results as the scripts.
- `readTokenTable` reads the token table that a file already holds. It finds the table by code
  syntax, so it also sees a table an agent wrote.

**Tech Stack:** TypeScript, React 19, `@atom63/ui-react`, esbuild, Vitest, and the Figma Plugin
API (variables, text and effect styles, `loadFontAsync`).

**Spec:** [figma-token-sync-spec.md](./figma-token-sync-spec.md), sections "User journeys" 1 and
2 and "Plugin". Plans 1 and 2 are merged: `@atom63/figma` already has the parser, the engine, the
style sync, the scripts and the CLI.

**Decisions this plan makes inside the spec:**

- **What Create offers:**
  - Brand: any hex color. It replaces the `b1` ramp, which stays the default brand.
  - Neutral: one of the template's ramps `n1` to `n6`.
  - Radius: `none`, `subtle`, `default` or `round`.
  - Type scale: `compact`, `normal`, `comfortable` or `large`.
  - Font: the first family of `--font-sans`.
  - Each choice becomes the default mode of its axis, and every other mode is kept.
- **How the brand ramp is built:**
  - The hue is kept from the input color.
  - The lightness follows a fixed ladder of 11 steps.
  - The chroma follows the input and is reduced until each step fits sRGB.
  - The step nearest the input's lightness is the input itself.
  - Steps are written as `rgba()`, like the template's palette.
- **The template copy:**
  - The template's token CSS is copied byte for byte into `packages/figma/template/tokens`, from
    `atom63-site-template` commit `72ad54e`.
  - It is embedded as a generated module, like the runtime.
  - Plan 4 wires the template repository to it.
- **Atom63 in the plugin:** the plugin has no Atom63 mode. Atom63 is synced by the agent path
  (`atom63-figma sync --model`).
- **Export CSS:** a download button for each file, using a Blob and `<a download>` in the UI
  iframe, which Figma plugin UIs support. Each file also gets a copy button.

## Global Constraints

- Code is the only source of truth. Neither Create nor Import deletes a variable or a style, and
  neither changes a variable or a style that is not in its token set.
- Variables are named by meaning, with no `Atom63` or `--a63-` prefix. The CSS name lives in code
  syntax.
- The plugin UI runs on the Atom63 design system (`@atom63/ui-react` and `--a63-*` tokens). It
  has no network access (`"allowedDomains": ["none"]`).
- Text styles use font style `Regular`.
- Numbers compare with a tolerance relative to their size.
- Commits use Conventional Commit titles and English bodies that say what changed. Add a
  changeset for `@atom63/figma`; the plugin is private.

## Review Focus

- **An extreme brand color** (`#ffff00`, `#000000`, `#ffffff`): every step stays in sRGB, the
  lightness falls from step 50 to step 950, and no channel is `NaN`. Pinned in Task 1.
- **An invalid brand or font** (`blue`, `#12`, an empty string, a font with a quote or a
  semicolon): the builder throws a message that names the value. Create shows that message and
  stays disabled. Pinned in Tasks 1, 2 and 7.
- **Create or Import run twice on the same file:** the second run plans zero creates and zero
  updates, and makes no duplicate styles. Pinned in Task 4.
- **A font Figma cannot load** (for example a font the account does not have): the text styles
  fall back to Inter, and the result lists the fallback. Pinned in Task 4, shown in Task 6.
- **Exported CSS read back:** the files Export gives, synced by the agent, report zero changes
  against the file Create wrote. Pinned in Task 2 (Create and Export use the same files) and in
  the real-Figma run in Task 8.

---

## File structure

| File | Responsibility |
| --- | --- |
| `packages/figma/src/ramp.ts` | OKLCH conversions and `brandRamp` |
| `packages/figma/template/tokens/*.css` | Byte-for-byte copy of the template's token CSS |
| `packages/figma/scripts/embed-template.mjs` | Writes `src/template-tokens.generated.ts` |
| `packages/figma/src/template.ts` | `TemplateChoices`, `TEMPLATE_DEFAULTS`, `buildTemplateFiles` |
| `packages/figma/src/table.ts` | `readTokenTable`: what the file already holds |
| `packages/figma/src/runtime.ts` | `syncModel` and `checkModel` for in-process use |
| `apps/figma-plugin/src/messages.ts` | The plugin's message types (replaces `types/messages.ts`) |
| `apps/figma-plugin/src/main/figma-api.ts` | `figma` adapted to `StylesApi` |
| `apps/figma-plugin/src/main/handle.ts` | Main-thread message handler, testable with the fake |
| `apps/figma-plugin/src/code.ts` | Shows the UI, settings, and routes messages to `handle` |
| `apps/figma-plugin/src/ui.tsx` | App shell: header and the Home, Create and Import views |
| `apps/figma-plugin/src/app/*` | Views and their pure helpers |

---

### Task 1: An OKLCH brand ramp

**Files:**

- Create: `packages/figma/src/ramp.ts`, `packages/figma/test/ramp.test.ts`
- Modify: `packages/figma/src/index.ts`

**Interfaces:**

- Produces:

```ts
export const RAMP_STEPS: readonly [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950]
export interface Oklch { l: number; c: number; h: number }
export function parseHex(hex: string): [number, number, number] | null
export function rgbToOklch(rgb: [number, number, number]): Oklch
export function oklchToRgb(color: Oklch): [number, number, number]
export function brandRamp(hex: string): string[] // 11 `rgba(r, g, b, 1)` strings
```

- [ ] **Step 1: Write the failing tests**

`packages/figma/test/ramp.test.ts`:

```ts
import { brandRamp, oklchToRgb, parseHex, rgbToOklch } from '../src/ramp'

const channels = (css: string) => {
  const match = /^rgba\((\d+), (\d+), (\d+), 1\)$/.exec(css)
  if (!match) throw new Error(`not an rgba() step: ${css}`)
  return [Number(match[1]), Number(match[2]), Number(match[3])] as const
}
const lightness = (css: string) =>
  rgbToOklch(channels(css).map(value => value / 255) as [number, number, number]).l

describe('brandRamp', () => {
  it('gives eleven rgba() steps with the input at its nearest step', () => {
    const ramp = brandRamp('#2c7fff')
    expect(ramp).toHaveLength(11)
    expect(ramp).toContain('rgba(44, 127, 255, 1)')
  })

  it.each(['#2c7fff', '#ffff00', '#000000', '#ffffff', '#e11d48', '#808080'])(
    'falls in lightness from 50 to 950 and stays in sRGB for %s',
    hex => {
      const ramp = brandRamp(hex)
      for (const step of ramp)
        for (const value of channels(step)) expect(value).toBeGreaterThanOrEqual(0)
      for (let index = 1; index < ramp.length; index++)
        expect(lightness(ramp[index])).toBeLessThan(lightness(ramp[index - 1]))
    }
  )

  it('keeps a grey input grey', () => {
    for (const step of brandRamp('#808080')) {
      const [r, g, b] = channels(step)
      expect(Math.max(r, g, b) - Math.min(r, g, b)).toBeLessThanOrEqual(1)
    }
  })

  it.each(['blue', '#12', '', '#12345g'])('refuses %j with a message that names it', value => {
    expect(() => brandRamp(value)).toThrow(`"${value}" is not a hex color`)
  })
})

describe('OKLCH conversions', () => {
  it('reads white as full lightness and no chroma', () => {
    const white = rgbToOklch([1, 1, 1])
    expect(white.l).toBeCloseTo(1, 4)
    expect(white.c).toBeCloseTo(0, 4)
  })

  it('round-trips an sRGB color', () => {
    const rgb = parseHex('#e11d48') ?? [0, 0, 0]
    oklchToRgb(rgbToOklch(rgb)).forEach((value, index) => expect(value).toBeCloseTo(rgb[index], 4))
  })

  it('reads three- and six-digit hex', () => {
    expect(parseHex('#fff')).toEqual([1, 1, 1])
    expect(parseHex('2c7fff')).toEqual([44 / 255, 127 / 255, 1])
    expect(parseHex('#12')).toBeNull()
  })
})
```

- [ ] **Step 2: Run the tests to see them fail**

Run: `pnpm --filter @atom63/figma test -- ramp`
Expected: FAIL, `../src/ramp` does not exist.

- [ ] **Step 3: Implement `ramp.ts`**

```ts
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
    match[1].length === 3
      ? [...match[1]].map(digit => digit + digit).join('')
      : match[1]
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
```

Add `export * from './ramp'` to `index.ts`.

- [ ] **Step 4: Run the tests**

Run: `pnpm --filter @atom63/figma test`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add packages/figma/src/ramp.ts packages/figma/src/index.ts packages/figma/test/ramp.test.ts
git commit -m "feat(figma): generate a brand ramp in OKLCH from one color"
```

---

### Task 2: The template's token CSS and a builder over it

**Files:**

- Create: `packages/figma/template/tokens/{index,palette,axes,semantic,scale,theme}.css` (copies),
  `packages/figma/scripts/embed-template.mjs`, `packages/figma/src/template-tokens.generated.ts`
  (generated), `packages/figma/src/template.ts`, `packages/figma/test/template.test.ts`
- Modify: `packages/figma/package.json` (scripts), `packages/figma/src/index.ts`, `.prettierignore`

**Interfaces:**

- Consumes: `brandRamp`, `RAMP_STEPS` (Task 1), `CssFile`, `buildProjectModel`, `deriveStyles`.
- Produces:

```ts
export const TEMPLATE_TOKENS: CssFile[] // generated: index, palette, axes, semantic, scale, theme
export const NEUTRALS: readonly ['n1', 'n2', 'n3', 'n4', 'n5', 'n6']
export const RADII: readonly ['none', 'subtle', 'default', 'round']
export const TYPE_SCALES: readonly ['compact', 'normal', 'comfortable', 'large']
export interface TemplateChoices {
  /** Hex color the b1 ramp is generated from; null keeps the template's own ramp. */
  brand: string | null
  neutral: (typeof NEUTRALS)[number]
  radius: (typeof RADII)[number]
  typeScale: (typeof TYPE_SCALES)[number]
  /** First family of --font-sans. */
  font: string
}
export const TEMPLATE_DEFAULTS: TemplateChoices
export const TEMPLATE_BRAND: string // '#2c7fff', the template's b1-500, for the color input
export function buildTemplateFiles(choices: TemplateChoices): CssFile[]
```

- [ ] **Step 1: Copy the template's token CSS and embed it**

```bash
mkdir -p packages/figma/template/tokens
git -C ~/Projects/atom63-site-template show 72ad54e:src/styles/tokens/index.css > packages/figma/template/tokens/index.css
for f in palette axes semantic scale theme; do
  git -C ~/Projects/atom63-site-template show 72ad54e:src/styles/tokens/$f.css > packages/figma/template/tokens/$f.css
done
printf '\n# A byte-for-byte copy of atom63-site-template/src/styles/tokens; buildTemplateFiles edits it by pattern.\npackages/figma/template/\n' >> .prettierignore
```

`packages/figma/scripts/embed-template.mjs`:

```js
import { readFileSync, writeFileSync } from 'node:fs'

// The site template's token CSS, in the order index.css imports it, for buildTemplateFiles.
const names = ['index', 'palette', 'axes', 'semantic', 'scale', 'theme']
const files = names.map(name => ({
  name: `${name}.css`,
  text: readFileSync(new URL(`../template/tokens/${name}.css`, import.meta.url), 'utf8'),
}))
writeFileSync(
  new URL('../src/template-tokens.generated.ts', import.meta.url),
  `// Generated by scripts/embed-template.mjs from template/tokens. Do not edit.\n` +
    `import type { CssFile } from './css-model'\n\n` +
    `export const TEMPLATE_TOKENS: CssFile[] = ${JSON.stringify(files)}\n`
)
```

In `packages/figma/package.json`, add `"embed:template": "node scripts/embed-template.mjs"` and
change `build` to `"pnpm embed:template && pnpm build:runtime && tsup"`. Then run
`pnpm --filter @atom63/figma embed:template`. The generated file is committed, as
`runtime-source.generated.ts` is, so the plugin can resolve the TypeScript sources without a
build.

- [ ] **Step 2: Write the failing tests**

`packages/figma/test/template.test.ts`:

```ts
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { buildProjectModel } from '../src/css-model'
import { brandRamp, RAMP_STEPS } from '../src/ramp'
import { deriveStyles } from '../src/styles'
import { buildTemplateFiles, TEMPLATE_DEFAULTS, TEMPLATE_TOKENS } from '../src/template'

const text = (name: string, files = buildTemplateFiles(TEMPLATE_DEFAULTS)) =>
  files.find(file => file.name === name)?.text ?? ''

describe('the template copy', () => {
  it('matches template/tokens', () => {
    for (const file of TEMPLATE_TOKENS)
      expect(file.text).toBe(
        readFileSync(resolve(__dirname, '../template/tokens', file.name), 'utf8')
      )
  })
})

describe('buildTemplateFiles', () => {
  it('returns the template unchanged for the defaults', () => {
    expect(buildTemplateFiles(TEMPLATE_DEFAULTS)).toEqual(TEMPLATE_TOKENS)
  })

  it('replaces the b1 ramp with one generated from the brand color', () => {
    const files = buildTemplateFiles({ ...TEMPLATE_DEFAULTS, brand: '#e11d48' })
    const ramp = brandRamp('#e11d48')
    RAMP_STEPS.forEach((step, index) =>
      expect(text('palette.css', files)).toContain(`--color-b1-${step}: ${ramp[index]};`)
    )
    expect(text('palette.css', files)).toContain('--color-b2-500: rgba(247, 103, 13, 1);')
  })

  it('makes each chosen axis value the default mode', () => {
    const files = buildTemplateFiles({
      ...TEMPLATE_DEFAULTS,
      neutral: 'n3',
      radius: 'round',
      typeScale: 'large',
    })
    const { model } = buildProjectModel(files)
    const modes = (name: string) => model.collections.find(item => item.name === name)?.modes
    expect(modes('Surface')?.[0]).toBe('n3')
    expect(modes('Radius')?.[0]).toBe('round')
    expect(modes('Type scale')?.[0]).toBe('large')
    expect(modes('Surface')).toHaveLength(6)
  })

  it('sets the first family of the sans stack', () => {
    const files = buildTemplateFiles({ ...TEMPLATE_DEFAULTS, font: 'Inter' })
    const { model, raw } = buildProjectModel(files)
    expect(deriveStyles(model, raw).text[0].family).toEqual({ value: 'Inter' })
  })

  it.each(['', 'Geist"; } :root {', 'a;b'])('refuses the font %j', font => {
    expect(() => buildTemplateFiles({ ...TEMPLATE_DEFAULTS, font })).toThrow(
      `"${font}" is not a font family name`
    )
  })

  it('refuses a brand that is not a hex color', () => {
    expect(() => buildTemplateFiles({ ...TEMPLATE_DEFAULTS, brand: 'blue' })).toThrow(
      '"blue" is not a hex color'
    )
  })
})
```

- [ ] **Step 3: Run the tests to see them fail**

Run: `pnpm --filter @atom63/figma test -- template`
Expected: FAIL, `../src/template` does not exist.

- [ ] **Step 4: Implement `template.ts`**

```ts
/**
 * The site template's token set with a person's choices: a brand ramp from
 * one color, and a default for each axis. The output is the template's own
 * token CSS, edited by pattern, so Create in the plugin and Export CSS give
 * exactly the files a project started from the template holds.
 */
import type { CssFile } from './css-model'
import { brandRamp, RAMP_STEPS } from './ramp'
import { TEMPLATE_TOKENS } from './template-tokens.generated'

export { TEMPLATE_TOKENS }
export const NEUTRALS = ['n1', 'n2', 'n3', 'n4', 'n5', 'n6'] as const
export const RADII = ['none', 'subtle', 'default', 'round'] as const
export const TYPE_SCALES = ['compact', 'normal', 'comfortable', 'large'] as const

export interface TemplateChoices {
  /** Hex color the b1 ramp is generated from; null keeps the template's own ramp. */
  brand: string | null
  neutral: (typeof NEUTRALS)[number]
  radius: (typeof RADII)[number]
  typeScale: (typeof TYPE_SCALES)[number]
  /** First family of --font-sans. */
  font: string
}

export const TEMPLATE_BRAND = '#2c7fff'
export const TEMPLATE_DEFAULTS: TemplateChoices = {
  brand: null,
  neutral: 'n1',
  radius: 'default',
  typeScale: 'normal',
  font: 'Geist',
}

/** Moves `:root` onto the block of the chosen value of a `data-*` axis. */
function moveDefault(css: string, attribute: string, value: string): string {
  const current = new RegExp(`:root,\\s*(\\[data-${attribute}=["'][^"']+["']\\])`)
  const target = new RegExp(`(\\[data-${attribute}=["']${value}["']\\]) \\{`)
  const stripped = css.replace(current, '$1')
  if (!target.test(stripped))
    throw new Error(`The template has no data-${attribute}="${value}" block`)
  return stripped.replace(target, ':root,\n$1 {')
}

function replaceRamp(css: string, ramp: string[]): string {
  return RAMP_STEPS.reduce(
    (text, step, index) =>
      text.replace(new RegExp(`(--color-b1-${step}:\\s*)[^;]+;`), `$1${ramp[index]};`),
    css
  )
}

function replaceFont(css: string, font: string): string {
  if (!/^[A-Za-z0-9][A-Za-z0-9 -]*$/.test(font))
    throw new Error(`"${font}" is not a font family name`)
  return css.replace(/(--font-sans:\s*)("[^"]*"|'[^']*'|[^,;]+)/, `$1"${font.trim()}"`)
}

export function buildTemplateFiles(choices: TemplateChoices): CssFile[] {
  const ramp = choices.brand === null ? null : brandRamp(choices.brand)
  const fontChanged = choices.font !== TEMPLATE_DEFAULTS.font
  if (fontChanged) replaceFont('', choices.font)
  return TEMPLATE_TOKENS.map(file => {
    let text = file.text
    if (file.name === 'palette.css' && ramp) text = replaceRamp(text, ramp)
    if (file.name === 'axes.css') {
      if (choices.neutral !== TEMPLATE_DEFAULTS.neutral)
        text = moveDefault(text, 'surface', choices.neutral)
      if (choices.radius !== TEMPLATE_DEFAULTS.radius)
        text = moveDefault(text, 'radius', choices.radius)
      if (choices.typeScale !== TEMPLATE_DEFAULTS.typeScale)
        text = moveDefault(text, 'type-scale', choices.typeScale)
    }
    if (file.name === 'theme.css' && fontChanged) text = replaceFont(text, choices.font)
    return { name: file.name, text }
  })
}
```

Add `export * from './template'` to `index.ts`.

- [ ] **Step 5: Run the tests**

Run: `pnpm --filter @atom63/figma test`
Expected: PASS. If `buildProjectModel` names the type-scale collection differently from
`Type scale`, use the name it gives (the real-Figma runs in plans 1 and 2 showed `Type scale`).

- [ ] **Step 6: Commit**

```bash
git add .prettierignore packages/figma/template packages/figma/scripts/embed-template.mjs packages/figma/src/template-tokens.generated.ts packages/figma/src/template.ts packages/figma/src/index.ts packages/figma/package.json packages/figma/test/template.test.ts
git commit -m "feat(figma): build the site template's token CSS from a few choices"
```

---

### Task 3: In-process sync and the token table a file holds

**Files:**

- Create: `packages/figma/src/table.ts`, `packages/figma/test/table.test.ts`
- Modify: `packages/figma/src/runtime.ts`, `packages/figma/src/index.ts`

**Interfaces:**

- Consumes: `planSync`, `readSnapshot`, `applyPlan`, `readDocument`, `planStyles`, `applyStyles`,
  `StylesApi`, `ApplyResult`, `StylePlan`, `StyleResult`.
- Produces:

```ts
export type PartTotals = Omit<SyncPlan['totals'], 'orphaned'>
export interface CheckOutcome {
  planned: PartTotals
  verification: PartTotals
  styles?: StylePlan
}
export interface SyncOutcome {
  planned: PartTotals
  applied: ApplyResult
  verification: PartTotals
  styles?: { planned: StylePlan; applied: StyleResult; verification: StylePlan }
}
export function syncModel(figma: StylesApi, model: SyncModel): Promise<SyncOutcome>
export function checkModel(figma: StylesApi, model: SyncModel): Promise<CheckOutcome>
export interface TokenTable {
  collections: { name: string; modes: number; variables: number }[]
  /** Variables with a code syntax, so written from code by a sync, the plugin or an agent. */
  variables: number
  textStyles: number // local text styles named Text/…
  effectStyles: number // local effect styles named Shadow/…
}
export function readTokenTable(figma: StylesApi): Promise<TokenTable>
```

`sync(figma, packed)` and `check(figma, packed)` become one-liners over `syncModel` and
`checkModel`, so the scripts and the plugin run the same code.

- [ ] **Step 1: Write the failing tests**

`packages/figma/test/table.test.ts`:

```ts
import { resolve } from 'node:path'

import { readTokenDirectory } from '../src/css-files'
import { buildProjectModel } from '../src/css-model'
import { checkModel, syncModel } from '../src/runtime'
import { deriveStyles } from '../src/styles'
import { readTokenTable } from '../src/table'
import { createFakeFigma } from './fake-figma'

const project = buildProjectModel(readTokenDirectory(resolve(__dirname, 'fixtures/project-tokens')))
const model = { ...project.model, styles: deriveStyles(project.model, project.raw) }

describe('in-process sync', () => {
  it('syncs a token set with its styles and verifies it', async () => {
    const fake = createFakeFigma()
    const outcome = await syncModel(fake.figma, model)
    expect(outcome.applied.created).toBe(model.summary.variables)
    expect(outcome.verification).toMatchObject({ create: 0, update: 0 })
    expect(outcome.styles?.verification).toMatchObject({ create: [], update: [] })
  })

  it('checks a synced file as unchanged', async () => {
    const fake = createFakeFigma()
    await syncModel(fake.figma, model)
    const outcome = await checkModel(fake.figma, model)
    expect(outcome.planned).toMatchObject({ create: 0, update: 0 })
    expect(outcome.styles).toMatchObject({ create: [], update: [] })
  })
})

describe('readTokenTable', () => {
  it('reads an empty file as empty', async () => {
    expect(await readTokenTable(createFakeFigma().figma)).toEqual({
      collections: [],
      variables: 0,
      textStyles: 0,
      effectStyles: 0,
    })
  })

  it('counts the variables written from code and the styles', async () => {
    const fake = createFakeFigma()
    await syncModel(fake.figma, model)
    const table = await readTokenTable(fake.figma)
    expect(table.variables).toBe(model.summary.variables)
    expect(table.collections.map(item => item.name)).toEqual(
      model.collections.map(item => item.name)
    )
    expect(table.textStyles).toBe(model.styles.text.length)
    expect(table.effectStyles).toBe(model.styles.effects.length)
  })

  it('does not count a variable made in Figma', async () => {
    const fake = createFakeFigma()
    await syncModel(fake.figma, model)
    const collection = (await fake.api.getLocalVariableCollectionsAsync())[0]
    fake.api.createVariable('my-accent', collection, 'COLOR')
    expect((await readTokenTable(fake.figma)).variables).toBe(model.summary.variables)
  })
})
```

- [ ] **Step 2: Run the tests to see them fail**

Run: `pnpm --filter @atom63/figma test -- table`
Expected: FAIL, `syncModel` and `../src/table` do not exist.

- [ ] **Step 3: Implement**

In `runtime.ts`, move the bodies of `sync` and `check` into `syncModel` and `checkModel`, which
take a `SyncModel`, and add the outcome types:

```ts
export type PartTotals = Omit<SyncPlan['totals'], 'orphaned'>
export interface CheckOutcome {
  planned: PartTotals
  verification: PartTotals
  styles?: StylePlan
}
export interface SyncOutcome {
  planned: PartTotals
  applied: ApplyResult
  verification: PartTotals
  styles?: { planned: StylePlan; applied: StyleResult; verification: StylePlan }
}

export async function syncModel(figma: FigmaLike, model: SyncModel): Promise<SyncOutcome> {
  const plan = planSync(model, await readSnapshot(figma.variables, model))
  const applied = await applyPlan(figma.variables, model, plan)
  const after = planSync(model, await readSnapshot(figma.variables, model))
  const result = {
    planned: partTotals(plan.totals),
    applied,
    verification: partTotals(after.totals),
  }
  if (!model.styles) return result
  const stylePlan = await planStyles(figma, model.styles)
  const styleApplied = await applyStyles(figma, model.styles, stylePlan)
  return {
    ...result,
    styles: {
      planned: stylePlan,
      applied: styleApplied,
      verification: await planStyles(figma, model.styles),
    },
  }
}

export async function checkModel(figma: FigmaLike, model: SyncModel): Promise<CheckOutcome> {
  const plan = planSync(model, await readSnapshot(figma.variables, model))
  const result = { planned: partTotals(plan.totals), verification: partTotals(plan.totals) }
  if (!model.styles) return result
  return { ...result, styles: await planStyles(figma, model.styles) }
}

export const sync = (figma: FigmaLike, packed: PackedModel) => syncModel(figma, unpackModel(packed))
export const check = (figma: FigmaLike, packed: PackedModel) =>
  checkModel(figma, unpackModel(packed))
```

Import `ApplyResult` from `./apply`, `SyncModel` from `./plan`, and `StylePlan` and
`StyleResult` from `./style-sync`.

`packages/figma/src/table.ts`:

```ts
/**
 * What a Figma file already holds of a token set: the variables written from
 * code (found by their code syntax, so a table an agent wrote counts too) and
 * the styles a sync writes.
 */
import { readDocument } from './apply'
import type { StylesApi } from './style-sync'

export interface TokenTable {
  collections: { name: string; modes: number; variables: number }[]
  /** Variables with a code syntax, so written from code by a sync, the plugin or an agent. */
  variables: number
  textStyles: number
  effectStyles: number
}

export async function readTokenTable(figma: StylesApi): Promise<TokenTable> {
  const collections = (await readDocument(figma.variables))
    .map(collection => ({
      name: collection.name,
      modes: collection.modes.length,
      variables: collection.variables.filter(variable => variable.token).length,
    }))
    .filter(collection => collection.variables > 0)
  const textStyles = (await figma.getLocalTextStylesAsync()).filter(style =>
    style.name.startsWith('Text/')
  ).length
  const effectStyles = (await figma.getLocalEffectStylesAsync()).filter(style =>
    style.name.startsWith('Shadow/')
  ).length
  return {
    collections,
    variables: collections.reduce((total, item) => total + item.variables, 0),
    textStyles,
    effectStyles,
  }
}
```

In `index.ts` add `export * from './table'` and
`export { check, checkModel, type CheckOutcome, type PartTotals, sync, syncModel, type SyncOutcome } from './runtime'`.
Rebuild with `pnpm --filter @atom63/figma build`. The runtime grows a little, and the scripts
test still checks the 49,000-character limit.

- [ ] **Step 4: Run the tests**

Run: `pnpm --filter @atom63/figma test`
Expected: PASS, with the scripts and CLI tests unchanged.

- [ ] **Step 5: Commit**

```bash
git add packages/figma/src/runtime.ts packages/figma/src/runtime-source.generated.ts packages/figma/src/table.ts packages/figma/src/index.ts packages/figma/test/table.test.ts
git commit -m "feat(figma): sync a token set in process and read the token table a file holds"
```

---

### Task 4: The plugin's main thread, rewritten

**Files:**

- Create: `apps/figma-plugin/src/messages.ts`, `apps/figma-plugin/src/main/figma-api.ts`,
  `apps/figma-plugin/src/main/handle.ts`, `apps/figma-plugin/__tests__/handle.test.ts`
- Modify: `apps/figma-plugin/src/code.ts` (replaced), `apps/figma-plugin/vitest.config.ts`
- Delete: `apps/figma-plugin/src/sync/export.ts`, `apps/figma-plugin/src/sync/rebind.ts`,
  `apps/figma-plugin/__tests__/export.test.ts`

`src/types/messages.ts` stays until Task 5 removes the old UI that imports it.

**Interfaces:**

- Consumes: `syncModel`, `checkModel`, `readTokenTable`, `SyncOutcome`, `CheckOutcome`,
  `TokenTable`, `StylesApi`, `SyncModel` (Task 3).
- Produces:

```ts
// src/messages.ts
export interface PluginSettings { theme: 'light' | 'dark' | 'system' }
export type UIToMain =
  | { type: 'scan' }
  | { type: 'plan'; model: SyncModel }
  | { type: 'apply'; model: SyncModel }
  | { type: 'load-settings' }
  | { type: 'save-settings'; data: Partial<PluginSettings> }
export type MainToUI =
  | { type: 'table'; data: TokenTable }
  | { type: 'planned'; data: CheckOutcome }
  | { type: 'applied'; data: SyncOutcome & { table: TokenTable } }
  | { type: 'settings'; data: PluginSettings }
  | { type: 'error'; data: { message: string } }
// src/main/handle.ts
export function handle(figma: StylesApi, message: UIToMain): Promise<MainToUI | null>
// src/main/figma-api.ts
export function figmaApi(): StylesApi
```

- [ ] **Step 1: Write the failing tests**

`apps/figma-plugin/__tests__/handle.test.ts`:

```ts
import { resolve } from 'node:path'

import { buildProjectModel, deriveStyles } from '@atom63/figma'
import { readTokenDirectory } from '@atom63/figma/node'
import { handle } from '../src/main/handle'
import { createFakeFigma } from '../../../packages/figma/test/fake-figma'

const project = buildProjectModel(
  readTokenDirectory(resolve(__dirname, '../../../packages/figma/test/fixtures/project-tokens'))
)
const model = { ...project.model, styles: deriveStyles(project.model, project.raw) }

describe('the main thread', () => {
  it('reads an empty file as an empty table', async () => {
    const { figma } = createFakeFigma()
    expect(await handle(figma, { type: 'scan' })).toEqual({
      type: 'table',
      data: { collections: [], variables: 0, textStyles: 0, effectStyles: 0 },
    })
  })

  it('plans the whole token set for an empty file', async () => {
    const { figma } = createFakeFigma()
    const reply = await handle(figma, { type: 'plan', model })
    if (reply?.type !== 'planned') throw new Error(`unexpected ${reply?.type}`)
    expect(reply.data.planned.create).toBe(model.summary.variables)
    expect(reply.data.styles?.create).toHaveLength(
      model.styles.text.length + model.styles.effects.length
    )
  })

  it('applies, verifies, and returns the new table', async () => {
    const { figma } = createFakeFigma()
    const reply = await handle(figma, { type: 'apply', model })
    if (reply?.type !== 'applied') throw new Error(`unexpected ${reply?.type}`)
    expect(reply.data.verification).toMatchObject({ create: 0, update: 0 })
    expect(reply.data.table).toMatchObject({
      variables: model.summary.variables,
      textStyles: model.styles.text.length,
      effectStyles: model.styles.effects.length,
    })
  })

  it('changes nothing and makes no duplicate styles when run again', async () => {
    const fake = createFakeFigma()
    await handle(fake.figma, { type: 'apply', model })
    const reply = await handle(fake.figma, { type: 'apply', model })
    if (reply?.type !== 'applied') throw new Error(`unexpected ${reply?.type}`)
    expect(reply.data.planned).toMatchObject({ create: 0, update: 0 })
    expect(reply.data.styles?.planned).toMatchObject({ create: [], update: [] })
    expect(fake.textStyles).toHaveLength(model.styles.text.length)
  })

  it('reports text styles that fall back to Inter when the font cannot load', async () => {
    const { figma } = createFakeFigma({ fonts: ['Inter'] })
    const reply = await handle(figma, { type: 'apply', model })
    if (reply?.type !== 'applied') throw new Error(`unexpected ${reply?.type}`)
    expect(reply.data.styles?.applied.fontFallbacks).toContainEqual({
      style: 'Text/base',
      wanted: 'Geist',
      used: 'Inter',
    })
  })
})
```

- [ ] **Step 2: Run the tests to see them fail**

Run: `pnpm --filter @atom63/figma-plugin test`
Expected: FAIL, `../src/main/handle` does not exist.

- [ ] **Step 3: Implement**

`apps/figma-plugin/src/messages.ts`:

```ts
/** Messages between the plugin UI and its main thread. */
import type { CheckOutcome, SyncModel, SyncOutcome, TokenTable } from '@atom63/figma'

export interface PluginSettings {
  theme: 'light' | 'dark' | 'system'
}

export type UIToMain =
  | { type: 'scan' }
  | { type: 'plan'; model: SyncModel }
  | { type: 'apply'; model: SyncModel }
  | { type: 'load-settings' }
  | { type: 'save-settings'; data: Partial<PluginSettings> }

export type MainToUI =
  | { type: 'table'; data: TokenTable }
  | { type: 'planned'; data: CheckOutcome }
  | { type: 'applied'; data: SyncOutcome & { table: TokenTable } }
  | { type: 'settings'; data: PluginSettings }
  | { type: 'error'; data: { message: string } }
```

`apps/figma-plugin/src/main/handle.ts`:

```ts
/** The main thread's work: read the token table, plan and apply token sets. */
import { checkModel, readTokenTable, type StylesApi, syncModel } from '@atom63/figma'

import type { MainToUI, UIToMain } from '../messages'

export async function handle(figma: StylesApi, message: UIToMain): Promise<MainToUI | null> {
  switch (message.type) {
    case 'scan':
      return { type: 'table', data: await readTokenTable(figma) }
    case 'plan':
      return { type: 'planned', data: await checkModel(figma, message.model) }
    case 'apply': {
      const outcome = await syncModel(figma, message.model)
      return { type: 'applied', data: { ...outcome, table: await readTokenTable(figma) } }
    }
    default:
      return null
  }
}
```

`apps/figma-plugin/src/main/figma-api.ts`:

```ts
/// <reference types="@figma/plugin-typings" />
/**
 * The figma global as the engine's StylesApi. The plugin typings' objects
 * satisfy the engine's structural interfaces; the casts narrow overloads.
 */
import type { EffectStyleLike, StylesApi, TextStyleLike } from '@atom63/figma'

export function figmaApi(): StylesApi {
  return {
    variables: {
      getLocalVariableCollectionsAsync: () => figma.variables.getLocalVariableCollectionsAsync(),
      getVariableByIdAsync: id => figma.variables.getVariableByIdAsync(id),
      createVariableCollection: name => figma.variables.createVariableCollection(name),
      createVariable: (name, collection, type) =>
        figma.variables.createVariable(name, collection as VariableCollection, type),
      createVariableAlias: variable => figma.variables.createVariableAlias(variable as Variable),
    },
    getLocalTextStylesAsync: async () =>
      (await figma.getLocalTextStylesAsync()) as unknown as TextStyleLike[],
    getLocalEffectStylesAsync: async () =>
      (await figma.getLocalEffectStylesAsync()) as unknown as EffectStyleLike[],
    createTextStyle: () => figma.createTextStyle() as unknown as TextStyleLike,
    createEffectStyle: () => figma.createEffectStyle() as unknown as EffectStyleLike,
    loadFontAsync: font => figma.loadFontAsync(font),
  }
}
```

Replace `apps/figma-plugin/src/code.ts` with:

```ts
// The plugin's main thread: shows the UI, keeps settings, and runs the token
// sync engine against this file. Cipher by Atom63, You Zhang (ATOM63).
/// <reference types="@figma/plugin-typings" />

import { figmaApi } from './main/figma-api'
import { handle } from './main/handle'
import type { MainToUI, PluginSettings, UIToMain } from './messages'

figma.showUI(__html__, { width: 480, height: 640, title: 'Cipher by Atom63', themeColors: true })

const DEFAULT_SETTINGS: PluginSettings = { theme: 'system' }
const post = (message: MainToUI) => figma.ui.postMessage(message)

async function loadSettings(): Promise<PluginSettings> {
  return { ...DEFAULT_SETTINGS, ...((await figma.clientStorage.getAsync('settings')) ?? {}) }
}

figma.ui.onmessage = async (message: UIToMain) => {
  try {
    if (message.type === 'load-settings') {
      post({ type: 'settings', data: await loadSettings() })
      return
    }
    if (message.type === 'save-settings') {
      await figma.clientStorage.setAsync('settings', { ...(await loadSettings()), ...message.data })
      return
    }
    const reply = await handle(figmaApi(), message)
    if (reply) post(reply)
  } catch (error) {
    post({ type: 'error', data: { message: error instanceof Error ? error.message : String(error) } })
  }
}
```

Delete `src/sync/export.ts`, `src/sync/rebind.ts` and `__tests__/export.test.ts`. In
`vitest.config.ts`, set `coverage.include` to `['src/main/**/*.ts', 'src/app/**/*.ts']`.
Old UI pages still compile against `src/types/messages.ts`; Task 5 removes them.

- [ ] **Step 4: Run the tests and checks**

Run: `pnpm --filter @atom63/figma-plugin test && pnpm --filter @atom63/figma-plugin typecheck`
Expected: PASS. If `typecheck` fails in an old page only because it imported something from
`src/sync/*`, delete that page now (Task 5 deletes it anyway) and note it in the ledger.

- [ ] **Step 5: Commit**

```bash
git add -A apps/figma-plugin/src/messages.ts apps/figma-plugin/src/main apps/figma-plugin/src/code.ts apps/figma-plugin/src/sync apps/figma-plugin/__tests__ apps/figma-plugin/vitest.config.ts
git commit -m "feat(figma-plugin): rewrite the main thread over the in-process sync engine"
```

---

### Task 5: The plugin shell and Home

**Files:**

- Create: `apps/figma-plugin/src/app/table-summary.ts`, `apps/figma-plugin/src/app/Home.tsx`,
  `apps/figma-plugin/src/app/app.module.css`, `apps/figma-plugin/__tests__/table-summary.test.ts`
- Modify: `apps/figma-plugin/src/ui.tsx` (replaced), `apps/figma-plugin/src/hooks/useFigmaMessage.ts`,
  `apps/figma-plugin/src/utils/theme.ts`, `apps/figma-plugin/src/components/layout/AppHeader.tsx`,
  `apps/figma-plugin/src/components/layout/index.ts`
- Delete: `apps/figma-plugin/src/pages/`, `apps/figma-plugin/src/types/messages.ts`,
  `apps/figma-plugin/src/components/layout/Sidebar.*`, `apps/figma-plugin/src/components/layout/PageLayout.*`,
  `apps/figma-plugin/src/components/ui/RenameDialog/`, `apps/figma-plugin/src/hooks/useRename.ts`,
  `apps/figma-plugin/src/hooks/useSelection.ts`, `apps/figma-plugin/src/hooks/useListKeyboard.ts`,
  `apps/figma-plugin/src/utils/css-highlight.ts`, and any other file under `src/` that nothing imports
  afterwards (Step 4 lists them)

**Interfaces:**

- Consumes: `MainToUI`, `UIToMain`, `PluginSettings` (Task 4), `TokenTable` (Task 3).
- Produces:

```ts
// src/app/table-summary.ts
export function summarizeTable(table: TokenTable): { empty: boolean; line: string }
// src/app/Home.tsx
export function Home(props: { onCreate: () => void; onImport: () => void }): JSX.Element
// src/hooks/useFigmaMessage.ts (kept names, new types)
export function useFigmaMessage(handler: (message: MainToUI) => void): void
export function usePostMessage(): (message: UIToMain) => void
```

- [ ] **Step 1: Write the failing test**

`apps/figma-plugin/__tests__/table-summary.test.ts`:

```ts
import { summarizeTable } from '../src/app/table-summary'

describe('summarizeTable', () => {
  it('calls a file with no variables from code empty', () => {
    expect(
      summarizeTable({ collections: [], variables: 0, textStyles: 0, effectStyles: 0 })
    ).toEqual({ empty: true, line: 'This file has no token table yet.' })
  })

  it('counts variables, collections and styles', () => {
    expect(
      summarizeTable({
        collections: [
          { name: 'Base', modes: 1, variables: 300 },
          { name: 'Mode', modes: 2, variables: 87 },
        ],
        variables: 387,
        textStyles: 13,
        effectStyles: 1,
      })
    ).toEqual({
      empty: false,
      line: '387 variables in 2 collections, 13 text styles and 1 effect style.',
    })
  })
})
```

- [ ] **Step 2: Run the test to see it fail**

Run: `pnpm --filter @atom63/figma-plugin test -- table-summary`
Expected: FAIL, `../src/app/table-summary` does not exist.

- [ ] **Step 3: Implement the summary, Home and the shell**

`apps/figma-plugin/src/app/table-summary.ts`:

```ts
import type { TokenTable } from '@atom63/figma'

const count = (value: number, one: string, many: string) => `${value} ${value === 1 ? one : many}`

/** One line that says what token table the file holds. */
export function summarizeTable(table: TokenTable): { empty: boolean; line: string } {
  if (table.variables === 0) return { empty: true, line: 'This file has no token table yet.' }
  return {
    empty: false,
    line:
      `${count(table.variables, 'variable', 'variables')} in ` +
      `${count(table.collections.length, 'collection', 'collections')}, ` +
      `${count(table.textStyles, 'text style', 'text styles')} and ` +
      `${count(table.effectStyles, 'effect style', 'effect styles')}.`,
  }
}
```

`apps/figma-plugin/src/app/app.module.css`:

```css
.view {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
  padding: var(--spacing-xl);
}

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
}

.meta {
  margin: 0;
  font-size: 12px;
  color: var(--muted-foreground);
}

.list {
  margin: 0;
  padding: 0;
  list-style: none;
  font-size: 12px;
  font-variant-numeric: tabular-nums;
}

.list li {
  display: flex;
  justify-content: space-between;
  padding-block: var(--spacing-xs);
  border-bottom: 1px solid var(--border);
}

.code {
  font-family: var(--font-mono, monospace);
  font-size: 11px;
}

.files {
  display: none;
}

.choices {
  display: grid;
  gap: var(--spacing-lg);
}

.choice {
  display: grid;
  gap: var(--spacing-xs);
}

.brandRow {
  display: flex;
  gap: var(--spacing-sm);
  align-items: end;
}

.swatch {
  inline-size: 32px;
  block-size: 32px;
  padding: 0;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background: none;
}

.preview {
  display: grid;
  gap: var(--spacing-md);
  padding: var(--spacing-xl);
  border: 1px solid;
}
```

`apps/figma-plugin/src/app/Home.tsx`:

```tsx
import type { TokenTable } from '@atom63/figma'
import { useEffect, useState } from 'react'

import { Button, LoadingState, SectionHeader } from '../components/ui'
import { useFigmaMessage, usePostMessage } from '../hooks/useFigmaMessage'
import styles from './app.module.css'
import { summarizeTable } from './table-summary'

/** What the file holds: two ways in for an empty file, a summary for a file with a table. */
export function Home({ onCreate, onImport }: { onCreate: () => void; onImport: () => void }) {
  const postMessage = usePostMessage()
  const [table, setTable] = useState<TokenTable | null>(null)

  useEffect(() => postMessage({ type: 'scan' }), [postMessage])
  useFigmaMessage(message => {
    if (message.type === 'table') setTable(message.data)
  })

  if (!table) return <LoadingState />
  const summary = summarizeTable(table)

  if (summary.empty)
    return (
      <div className={styles.view}>
        <SectionHeader
          description="Create a token system from a brand color and a few choices, or import the token CSS of a project. Either way this file gets variables, text styles and effect styles that match the code."
          title="Start a token table"
        />
        <div className={styles.actions}>
          <Button onClick={onCreate} variant="primary">
            Create a token system
          </Button>
          <Button onClick={onImport} variant="secondary">
            Import from CSS
          </Button>
        </div>
      </div>
    )

  return (
    <div className={styles.view}>
      <SectionHeader description={summary.line} title="Token table" />
      <ul className={styles.list}>
        {table.collections.map(collection => (
          <li key={collection.name}>
            <span>{collection.name}</span>
            <span>
              {collection.variables} variables, {collection.modes}{' '}
              {collection.modes === 1 ? 'mode' : 'modes'}
            </span>
          </li>
        ))}
      </ul>
      <p className={styles.meta}>
        Code is the source of these tokens. After the token CSS changes, ask your coding agent to
        sync this file (<span className={styles.code}>atom63-figma sync</span>), or import the CSS
        again here.
      </p>
      <div className={styles.actions}>
        <Button onClick={onImport} variant="secondary">
          Import again
        </Button>
      </div>
    </div>
  )
}
```

Replace `apps/figma-plugin/src/ui.tsx` with:

```tsx
/**
 * Cipher by Atom63: a token table for this Figma file, created from a few
 * choices or imported from a project's token CSS. You Zhang (ATOM63).
 */
import { UIProvider } from '@atom63/ui-react'
import { useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'

import { Create } from './app/Create'
import { Home } from './app/Home'
import { Import } from './app/Import'
import { AppHeader } from './components/layout'
import { ErrorBoundary, PageErrorBoundary, ToastProvider } from './components/ui'
import { TooltipPortal } from './components/ui/Tooltip'
import { useFigmaMessage, usePostMessage } from './hooks/useFigmaMessage'
import { applyTheme } from './utils/theme'

type View = 'home' | 'create' | 'import'

function App() {
  const [view, setView] = useState<View>('home')
  const [isDark, setIsDark] = useState(() => document.documentElement.dataset.a63Mode === 'dark')
  const postMessage = usePostMessage()

  useEffect(() => postMessage({ type: 'load-settings' }), [postMessage])
  useFigmaMessage(message => {
    if (message.type === 'settings') {
      applyTheme(message.data.theme)
      setIsDark(document.documentElement.dataset.a63Mode === 'dark')
    }
  })

  const toggleTheme = () => {
    const next = isDark ? 'light' : 'dark'
    setIsDark(!isDark)
    applyTheme(next, true)
    postMessage({ type: 'save-settings', data: { theme: next } })
  }
  const home = () => setView('home')

  return (
    <div className="plugin-container">
      <AppHeader isDark={isDark} onToggleTheme={toggleTheme} />
      <div className="plugin-main">
        <PageErrorBoundary pageName={view}>
          {view === 'home' && (
            <Home onCreate={() => setView('create')} onImport={() => setView('import')} />
          )}
          {view === 'create' && <Create onDone={home} />}
          {view === 'import' && <Import onDone={home} />}
        </PageErrorBoundary>
      </div>
    </div>
  )
}

const container = document.getElementById('root')
// Follow Figma's theme until the saved setting loads, so the first paint has a mode.
applyTheme('system')
if (container)
  createRoot(container).render(
    <ErrorBoundary>
      <UIProvider className="plugin-root">
        <ToastProvider>
          <App />
          <TooltipPortal />
        </ToastProvider>
      </UIProvider>
    </ErrorBoundary>
  )
```

Create placeholders that Tasks 6 and 7 replace, so the shell builds now:

`apps/figma-plugin/src/app/Create.tsx`:

```tsx
import { Button } from '../components/ui'

export function Create({ onDone }: { onDone: () => void }) {
  return <Button onClick={onDone}>Back</Button>
}
```

`apps/figma-plugin/src/app/Import.tsx`:

```tsx
import { Button } from '../components/ui'

export function Import({ onDone }: { onDone: () => void }) {
  return <Button onClick={onDone}>Back</Button>
}
```

- **`hooks/useFigmaMessage.ts`:**
  - Import `MainToUI` and `UIToMain` from `'../messages'` in place of the old types.
  - Keep `useFigmaMessage` and `usePostMessage`, and delete `useFigmaMessageType` if nothing uses
    it.
  - `usePostMessage` posts `parent.postMessage({ pluginMessage: message }, '*')`, as it does now.
- **`utils/theme.ts`:** import `PluginSettings` from `'../messages'`.
- **`AppHeader.tsx`:** remove the view-mode button and the `viewMode` and `onToggleViewMode`
  props.
- **`components/layout/index.ts`:** export only `AppHeader`.
- **`src/ui.scss`:** remove the rules for the sidebar and `.plugin-layout` if they exist, and
  keep `.plugin-container` and `.plugin-main` as a single column.

- [ ] **Step 4: Delete the old UI and anything left unused**

Delete the files listed above, then list the source files that nothing imports any more:

```bash
cd apps/figma-plugin
for f in $(find src -name '*.ts' -o -name '*.tsx' | grep -v -e 'src/code.ts' -e 'src/ui.tsx' -e 'global.d.ts'); do
  base=$(basename "$f" | sed -E 's/\.(module\.)?(tsx?|css)$//')
  dir=$(basename "$(dirname "$f")")
  name=$([ "$base" = index ] && echo "$dir" || echo "$base")
  grep -rqE "from ['\"][^'\"]*/$name['\"]|from ['\"][^'\"]*/$name/" src --include='*.ts' --include='*.tsx' || echo "unused: $f"
done
```

Delete each unused file it lists, and its `.module.css`, unless it is in
`components/ui/index.tsx`'s exports and something imports that barrel name. Run it again until it
lists nothing.

- [ ] **Step 5: Run the tests and checks**

Run: `pnpm --filter @atom63/figma-plugin test && pnpm --filter @atom63/figma-plugin typecheck && pnpm --filter @atom63/figma-plugin lint && pnpm --filter @atom63/figma-plugin build`
Expected: PASS. Lower the `--max-warnings` cap in `package.json` to the number of warnings that
`lint` now reports (0 if none).

- [ ] **Step 6: Commit**

```bash
git add -A apps/figma-plugin
git commit -m "feat(figma-plugin): a single-column shell with a Home that reads the token table"
```

---

### Task 6: Import

**Files:**

- Create: `apps/figma-plugin/src/app/read-css.ts`, `apps/figma-plugin/src/app/Outcome.tsx`,
  `apps/figma-plugin/__tests__/read-css.test.ts`
- Modify: `apps/figma-plugin/src/app/Import.tsx` (replaces the placeholder)

**Interfaces:**

- Consumes: `buildProjectModel`, `deriveStyles`, `CssFile`, `ColorResolver`, `CheckOutcome`,
  `SyncOutcome`; `createBrowserColorResolver` (`src/utils/css-color.ts`, kept).
- Produces:

```ts
// src/app/read-css.ts
export function orderCssFiles(files: CssFile[]): CssFile[]
export interface ReadProject {
  model: SyncModel // with styles
  notes: string[]
  skipped: { token: string; reason: string }[]
}
export function readProject(files: CssFile[], resolveColor?: ColorResolver): ReadProject
// src/app/Outcome.tsx
export function Outcome(props: { planned?: CheckOutcome; applied?: SyncOutcome }): JSX.Element | null
```

- [ ] **Step 1: Write the failing tests**

`apps/figma-plugin/__tests__/read-css.test.ts`:

```ts
import { readFileSync, readdirSync } from 'node:fs'
import { resolve } from 'node:path'

import { orderCssFiles, readProject } from '../src/app/read-css'

const dir = resolve(__dirname, '../../../packages/figma/test/fixtures/project-tokens')
const fixture = readdirSync(dir).map(name => ({
  name,
  text: readFileSync(resolve(dir, name), 'utf8'),
}))

describe('orderCssFiles', () => {
  it('puts files in the order index.css imports them, then the rest by name', () => {
    const files = [
      { name: 'zeta.css', text: '' },
      { name: 'theme.css', text: '' },
      { name: 'palette.css', text: '' },
      { name: 'index.css', text: '@import "./palette.css";\n@import "./theme.css";' },
    ]
    expect(orderCssFiles(files).map(file => file.name)).toEqual([
      'palette.css',
      'theme.css',
      'index.css',
      'zeta.css',
    ])
  })
})

describe('readProject', () => {
  it('reads token CSS into a model with its styles', () => {
    const project = readProject(orderCssFiles(fixture))
    expect(project.model.summary.variables).toBeGreaterThan(300)
    expect(project.model.styles?.text.map(style => style.name)).toContain('Text/base')
    expect(project.model.styles?.effects.map(style => style.name)).toContain('Shadow/md')
  })
})
```

- [ ] **Step 2: Run the tests to see them fail**

Run: `pnpm --filter @atom63/figma-plugin test -- read-css`
Expected: FAIL, `../src/app/read-css` does not exist.

- [ ] **Step 3: Implement**

`apps/figma-plugin/src/app/read-css.ts`:

```ts
/**
 * Token CSS into a model the main thread can sync: read here in the UI, where
 * the browser computes colors Node cannot, with the styles derived from it.
 */
import {
  buildProjectModel,
  type ColorResolver,
  type CssFile,
  deriveStyles,
  type SyncModel,
} from '@atom63/figma'

/** Later declarations win, so read files in the order index.css imports them. */
export function orderCssFiles(files: CssFile[]): CssFile[] {
  const imports = [
    ...(files.find(file => file.name === 'index.css')?.text ?? '').matchAll(
      /@import\s+["'](?:\.\/)?([^"']+)["']/g
    ),
  ].map(match => match[1])
  const rank = (name: string) => (imports.includes(name) ? imports.indexOf(name) : imports.length)
  return [...files].sort(
    (left, right) => rank(left.name) - rank(right.name) || left.name.localeCompare(right.name)
  )
}

export interface ReadProject {
  model: SyncModel
  notes: string[]
  skipped: { token: string; reason: string }[]
}

export function readProject(files: CssFile[], resolveColor?: ColorResolver): ReadProject {
  const project = buildProjectModel(files, resolveColor)
  const model = { ...project.model, styles: deriveStyles(project.model, project.raw) }
  return { model, notes: project.notes, skipped: project.model.skipped }
}
```

`apps/figma-plugin/src/app/Outcome.tsx`:

```tsx
import type { CheckOutcome, SyncOutcome } from '@atom63/figma'

import { Alert } from '../components/ui'
import styles from './app.module.css'

/** What a plan would change, or what an apply changed and whether it verified. */
export function Outcome({ planned, applied }: { planned?: CheckOutcome; applied?: SyncOutcome }) {
  if (applied) {
    const stylesLeft =
      (applied.styles?.verification.create.length ?? 0) +
      (applied.styles?.verification.update.length ?? 0)
    const left = applied.verification.create + applied.verification.update + stylesLeft
    const fallbacks = applied.styles?.applied.fontFallbacks ?? []
    return (
      <>
        <Alert title={left === 0 ? 'The file matches the code' : `${left} changes did not apply`} variant={left === 0 ? 'success' : 'error'}>
          {applied.applied.created} variables created, {applied.applied.updated} updated;{' '}
          {applied.styles?.applied.created ?? 0} styles created, {applied.styles?.applied.updated ?? 0} updated.
        </Alert>
        {fallbacks.length > 0 && (
          <Alert title={`${fallbacks.length} text styles use another font`} variant="info">
            <ul className={styles.list}>
              {fallbacks.map(item => (
                <li key={`${item.style}-${item.wanted}`}>
                  <span>{item.style}</span>
                  <span>
                    {item.used} in place of {item.wanted}
                  </span>
                </li>
              ))}
            </ul>
          </Alert>
        )}
      </>
    )
  }
  if (!planned) return null
  const styleChanges = (planned.styles?.create.length ?? 0) + (planned.styles?.update.length ?? 0)
  return (
    <p className={styles.meta}>
      {planned.planned.create} variables to create, {planned.planned.update} to update,{' '}
      {planned.planned.unchanged} unchanged; {styleChanges} styles to create or update.
      {planned.planned.typeConflicts > 0 &&
        ` ${planned.planned.typeConflicts} variables have another type in this file and are left alone.`}
    </p>
  )
}
```

Replace `apps/figma-plugin/src/app/Import.tsx`:

```tsx
import type { CheckOutcome, CssFile, SyncOutcome } from '@atom63/figma'
import { useMemo, useRef, useState } from 'react'

import { Alert, Button, SectionHeader, Textarea } from '../components/ui'
import { useFigmaMessage, usePostMessage } from '../hooks/useFigmaMessage'
import { createBrowserColorResolver } from '../utils/css-color'
import styles from './app.module.css'
import { Outcome } from './Outcome'
import { orderCssFiles, type ReadProject, readProject } from './read-css'

/** Import a project's token CSS: pick or paste it, preview the plan, apply it. */
export function Import({ onDone }: { onDone: () => void }) {
  const postMessage = usePostMessage()
  const fileInput = useRef<HTMLInputElement>(null)
  const resolveColor = useMemo(() => createBrowserColorResolver(), [])
  const [files, setFiles] = useState<CssFile[]>([])
  const [pasted, setPasted] = useState('')
  const [busy, setBusy] = useState<'plan' | 'apply' | null>(null)
  const [planned, setPlanned] = useState<CheckOutcome | undefined>()
  const [applied, setApplied] = useState<SyncOutcome | undefined>()
  const [error, setError] = useState<string | null>(null)

  const sources = pasted.trim() ? [...files, { name: 'pasted.css', text: pasted }] : files
  const project = useMemo((): ReadProject | { error: string } | null => {
    if (sources.length === 0) return null
    try {
      return readProject(orderCssFiles(sources), resolveColor)
    } catch (readError) {
      return { error: readError instanceof Error ? readError.message : String(readError) }
    }
  }, [files, pasted, resolveColor]) // eslint-disable-line react-hooks/exhaustive-deps

  useFigmaMessage(message => {
    if (message.type === 'planned') setPlanned(message.data)
    if (message.type === 'applied') setApplied(message.data)
    if (message.type === 'error') setError(message.data.message)
    if (['planned', 'applied', 'error'].includes(message.type)) setBusy(null)
  })

  const pick = async (list: FileList | null) => {
    if (!list) return
    setFiles(
      await Promise.all(
        Array.from(list).map(async file => ({ name: file.name, text: await file.text() }))
      )
    )
    setPlanned(undefined)
    setApplied(undefined)
  }
  const send = (type: 'plan' | 'apply') => {
    if (!project || 'error' in project) return
    setError(null)
    setBusy(type)
    postMessage({ type, model: project.model })
  }
  const pending = planned
    ? planned.planned.create +
      planned.planned.update +
      (planned.styles?.create.length ?? 0) +
      (planned.styles?.update.length ?? 0)
    : 0

  return (
    <div className={styles.view}>
      <SectionHeader
        description="Pick the CSS files that hold your design tokens (src/styles/tokens in the site template), or paste them. Each data-* attribute becomes a collection with its values as modes; light and dark become the Mode collection."
        title="Import from CSS"
      />
      <input
        accept=".css,text/css"
        className={styles.files}
        multiple
        onChange={event => void pick(event.target.files)}
        ref={fileInput}
        type="file"
      />
      <div className={styles.actions}>
        <Button onClick={() => fileInput.current?.click()} variant="secondary">
          {files.length > 0 ? `${files.length} files chosen` : 'Choose CSS files'}
        </Button>
      </div>
      <Textarea
        aria-label="Token CSS"
        onChange={event => setPasted(event.target.value)}
        placeholder="Or paste token CSS here"
        rows={4}
        value={pasted}
      />
      {project && 'error' in project && (
        <Alert title="The CSS could not be read" variant="error">
          {project.error}
        </Alert>
      )}
      {project && !('error' in project) && (
        <p className={styles.meta}>
          {project.model.summary.variables} variables in {project.model.summary.collections}{' '}
          collections, {project.model.styles?.text.length ?? 0} text styles and{' '}
          {project.model.styles?.effects.length ?? 0} effect styles.
          {project.skipped.length > 0 &&
            ` ${project.skipped.length} tokens are not Figma variables (shadows, font stacks and colors computed from others).`}{' '}
          {project.notes.join(' ')}
        </p>
      )}
      <div className={styles.actions}>
        <Button
          disabled={!project || 'error' in project}
          loading={busy === 'plan'}
          onClick={() => send('plan')}
          variant="secondary"
        >
          Preview changes
        </Button>
        {pending > 0 && (
          <Button loading={busy === 'apply'} onClick={() => send('apply')} variant="primary">
            {`Apply ${pending} ${pending === 1 ? 'change' : 'changes'}`}
          </Button>
        )}
        <Button onClick={onDone} variant="ghost">
          Back
        </Button>
      </div>
      {error && (
        <Alert title="Import failed" variant="error">
          {error}
        </Alert>
      )}
      <Outcome applied={applied} planned={applied ? undefined : planned} />
    </div>
  )
}
```

If the repository's React lint rules flag the `useMemo` dependency comment, compute `sources`
inside the memo from `files` and `pasted` instead, and drop the comment.

- [ ] **Step 4: Run the tests and checks**

Run: `pnpm --filter @atom63/figma-plugin test && pnpm --filter @atom63/figma-plugin typecheck && pnpm --filter @atom63/figma-plugin lint && pnpm --filter @atom63/figma-plugin build`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/figma-plugin/src/app apps/figma-plugin/__tests__/read-css.test.ts
git commit -m "feat(figma-plugin): import token CSS with a preview and a verified apply"
```

---

### Task 7: Create, with a live preview and Export CSS

**Files:**

- Create: `apps/figma-plugin/src/app/preview.ts`, `apps/figma-plugin/src/app/download.ts`,
  `apps/figma-plugin/__tests__/preview.test.ts`
- Modify: `apps/figma-plugin/src/app/Create.tsx` (replaces the placeholder)

**Interfaces:**

- Consumes: `buildTemplateFiles`, `TemplateChoices`, `TEMPLATE_DEFAULTS`, `TEMPLATE_BRAND`,
  `NEUTRALS`, `RADII`, `TYPE_SCALES` (Task 2); `readProject`, `Outcome` (Task 6).
- Produces:

```ts
// src/app/preview.ts
export interface PreviewValues {
  background?: string; foreground?: string; card?: string; border?: string
  primary?: string; primaryForeground?: string; mutedForeground?: string
  radius?: number; textSize?: number; textLeading?: number; font: string
}
export function previewValues(model: SyncModel): PreviewValues
// src/app/download.ts
export function downloadFile(name: string, text: string): void
```

- [ ] **Step 1: Write the failing tests**

`apps/figma-plugin/__tests__/preview.test.ts`:

```ts
import { brandRamp, buildTemplateFiles, TEMPLATE_DEFAULTS } from '@atom63/figma'
import { previewValues } from '../src/app/preview'
import { readProject } from '../src/app/read-css'

const preview = (choices = TEMPLATE_DEFAULTS) =>
  previewValues(readProject(buildTemplateFiles(choices)).model)

describe('previewValues', () => {
  it('resolves primary through brand to the generated ramp', () => {
    const values = preview({ ...TEMPLATE_DEFAULTS, brand: '#e11d48' })
    expect(values.primary).toBe(brandRamp('#e11d48')[6])
  })

  it('follows the chosen radius and type scale', () => {
    expect(preview()).toMatchObject({ radius: 10, textSize: 15, textLeading: 23 })
    expect(preview({ ...TEMPLATE_DEFAULTS, radius: 'round', typeScale: 'large' })).toMatchObject({
      radius: 15,
      textSize: 18,
    })
  })

  it('uses the chosen font', () => {
    expect(preview({ ...TEMPLATE_DEFAULTS, font: 'Inter' }).font).toBe('Inter')
  })

  it('reads light-mode surfaces', () => {
    const values = preview()
    expect(values.background).toMatch(/^rgba\(/)
    expect(values.border).toMatch(/^rgba\(/)
  })
})
```

The template's `--primary` aliases `--brand-600`, `--radius-lg` is 10 in the `default` mode and
15 in `round`, and `--text-base-size`/`--text-base-leading` are 15/23 in `normal` and 18/27.6 in
`large`. These values come from the fixture that plans 1 and 2 synced.

- [ ] **Step 2: Run the tests to see them fail**

Run: `pnpm --filter @atom63/figma-plugin test -- preview`
Expected: FAIL, `../src/app/preview` does not exist.

- [ ] **Step 3: Implement**

`apps/figma-plugin/src/app/preview.ts`:

```ts
/**
 * The values a preview card shows, read from the model in each collection's
 * default mode (the first, which the parser puts first), through aliases.
 */
import type { SyncColor, SyncModel, SyncValue } from '@atom63/figma'

export interface PreviewValues {
  background?: string
  foreground?: string
  card?: string
  border?: string
  primary?: string
  primaryForeground?: string
  mutedForeground?: string
  radius?: number
  textSize?: number
  textLeading?: number
  font: string
}

const css = ({ r, g, b, a }: SyncColor) =>
  `rgba(${[r, g, b].map(value => Math.round(value * 255)).join(', ')}, ${Math.round(a * 1000) / 1000})`

export function previewValues(model: SyncModel): PreviewValues {
  const byToken = new Map(
    model.collections.flatMap(collection =>
      collection.variables.map(variable => [
        variable.token,
        variable.values[collection.modes[0]] as SyncValue | undefined,
      ])
    )
  )
  const resolve = (token: string, depth = 0): SyncValue | undefined => {
    const value = byToken.get(token)
    if (!value || depth > 8) return undefined
    if ('alias' in value) return resolve(value.alias, depth + 1)
    if ('composed' in value) {
      const target = resolve(value.composed.alias, depth + 1)
      if (!target || !('value' in target) || typeof target.value !== 'object') return undefined
      return { value: { ...target.value, a: (target.value.a * value.composed.opacity) / 100 } }
    }
    return value
  }
  const color = (token: string) => {
    const value = resolve(token)
    return value && 'value' in value && typeof value.value === 'object' ? css(value.value) : undefined
  }
  const number = (token: string) => {
    const value = resolve(token)
    return value && 'value' in value && typeof value.value === 'number' ? value.value : undefined
  }
  const family = model.styles?.text[0]?.family
  return {
    background: color('--background'),
    foreground: color('--foreground'),
    card: color('--card'),
    border: color('--border'),
    primary: color('--primary'),
    primaryForeground: color('--primary-foreground'),
    mutedForeground: color('--muted-foreground'),
    radius: number('--radius-lg'),
    textSize: number('--text-base-size'),
    textLeading: number('--text-base-leading'),
    font: family && 'value' in family ? family.value : 'Inter',
  }
}
```

`apps/figma-plugin/src/app/download.ts`:

```ts
/** Saves a text file from the plugin UI; Figma plugin iframes allow Blob downloads. */
export function downloadFile(name: string, text: string): void {
  const url = URL.createObjectURL(new Blob([text], { type: 'text/css' }))
  const link = document.createElement('a')
  link.href = url
  link.download = name
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}
```

Replace `apps/figma-plugin/src/app/Create.tsx`:

```tsx
import {
  buildTemplateFiles,
  type CssFile,
  NEUTRALS,
  RADII,
  type SyncOutcome,
  TEMPLATE_BRAND,
  TEMPLATE_DEFAULTS,
  type TemplateChoices,
  TYPE_SCALES,
} from '@atom63/figma'
import { SegmentedControl } from '@atom63/ui-react'
import { useMemo, useState } from 'react'

import { Alert, Button, CopyButton, Input, SectionHeader } from '../components/ui'
import { useFigmaMessage, usePostMessage } from '../hooks/useFigmaMessage'
import { createBrowserColorResolver } from '../utils/css-color'
import styles from './app.module.css'
import { downloadFile } from './download'
import { Outcome } from './Outcome'
import { previewValues } from './preview'
import { readProject } from './read-css'

const items = <T extends string>(values: readonly T[], label = (value: T) => value) =>
  values.map(value => ({ label: label(value), value }))

/** Create a token system from a brand color and a few choices; export it as the template's CSS. */
export function Create({ onDone }: { onDone: () => void }) {
  const postMessage = usePostMessage()
  const resolveColor = useMemo(() => createBrowserColorResolver(), [])
  const [choices, setChoices] = useState<TemplateChoices>(TEMPLATE_DEFAULTS)
  const [brandText, setBrandText] = useState(TEMPLATE_BRAND)
  const [busy, setBusy] = useState(false)
  const [applied, setApplied] = useState<SyncOutcome | undefined>()
  const [error, setError] = useState<string | null>(null)

  // Create and Export use these same files, so the exported CSS is what the file holds.
  const built = useMemo((): { files: CssFile[]; model: ReturnType<typeof readProject>['model'] } | { error: string } => {
    try {
      const files = buildTemplateFiles(choices)
      return { files, model: readProject(files, resolveColor).model }
    } catch (buildError) {
      return { error: buildError instanceof Error ? buildError.message : String(buildError) }
    }
  }, [choices, resolveColor])
  const preview = 'error' in built ? null : previewValues(built.model)

  useFigmaMessage(message => {
    if (message.type === 'applied') setApplied(message.data)
    if (message.type === 'error') setError(message.data.message)
    if (message.type === 'applied' || message.type === 'error') setBusy(false)
  })

  const set = <K extends keyof TemplateChoices>(key: K, value: TemplateChoices[K]) => {
    setApplied(undefined)
    setChoices(current => ({ ...current, [key]: value }))
  }
  const setBrand = (value: string) => {
    setBrandText(value)
    set('brand', value.toLowerCase() === TEMPLATE_BRAND ? null : value)
  }
  const create = () => {
    if ('error' in built) return
    setError(null)
    setBusy(true)
    postMessage({ type: 'apply', model: built.model })
  }

  return (
    <div className={styles.view}>
      <SectionHeader
        description="Pick a brand color and the defaults of each axis. The file gets the site template's variables and styles with your choices as the default modes; every other mode stays, so designs can switch them."
        title="Create a token system"
      />
      <div className={styles.choices}>
        <div className={styles.brandRow}>
          <input
            aria-label="Brand color picker"
            className={styles.swatch}
            onChange={event => setBrand(event.target.value)}
            type="color"
            value={/^#[0-9a-f]{6}$/i.test(brandText) ? brandText : TEMPLATE_BRAND}
          />
          <Input label="Brand color" onChange={event => setBrand(event.target.value)} value={brandText} />
        </div>
        <div className={styles.choice}>
          <span className={styles.meta}>Neutral</span>
          <SegmentedControl
            items={items(NEUTRALS, value => value.toUpperCase())}
            onValueChange={value => set('neutral', value as TemplateChoices['neutral'])}
            value={choices.neutral}
          />
        </div>
        <div className={styles.choice}>
          <span className={styles.meta}>Radius</span>
          <SegmentedControl
            items={items(RADII)}
            onValueChange={value => set('radius', value as TemplateChoices['radius'])}
            value={choices.radius}
          />
        </div>
        <div className={styles.choice}>
          <span className={styles.meta}>Type scale</span>
          <SegmentedControl
            items={items(TYPE_SCALES)}
            onValueChange={value => set('typeScale', value as TemplateChoices['typeScale'])}
            value={choices.typeScale}
          />
        </div>
        <Input label="Font" onChange={event => set('font', event.target.value)} value={choices.font} />
      </div>

      {'error' in built && (
        <Alert title="Check your choices" variant="error">
          {built.error}
        </Alert>
      )}

      {preview && (
        <div
          aria-label="Preview"
          className={styles.preview}
          role="img"
          style={{
            background: preview.card ?? preview.background,
            color: preview.foreground,
            borderColor: preview.border,
            borderRadius: preview.radius,
            fontFamily: `"${preview.font}", system-ui`,
            fontSize: preview.textSize,
            lineHeight: preview.textLeading ? `${preview.textLeading}px` : undefined,
          }}
        >
          <strong>Your token system</strong>
          <span style={{ color: preview.mutedForeground }}>
            Text, surfaces and the primary action follow your choices.
          </span>
          <span
            style={{
              justifySelf: 'start',
              padding: '6px 14px',
              borderRadius: preview.radius,
              background: preview.primary,
              color: preview.primaryForeground ?? 'white',
            }}
          >
            Primary action
          </span>
        </div>
      )}

      <div className={styles.actions}>
        <Button disabled={'error' in built} loading={busy} onClick={create} variant="primary">
          Create in this file
        </Button>
        <Button onClick={onDone} variant="ghost">
          Back
        </Button>
      </div>
      {error && (
        <Alert title="Create failed" variant="error">
          {error}
        </Alert>
      )}
      <Outcome applied={applied} />

      {!('error' in built) && (
        <>
          <SectionHeader
            description="These are the template's src/styles/tokens files with your choices. Put them in a project started from the site template; from then on, code is the source."
            title="Export CSS"
          />
          <ul className={styles.list}>
            {built.files.map(file => (
              <li key={file.name}>
                <span className={styles.code}>{file.name}</span>
                <span className={styles.actions}>
                  <Button onClick={() => downloadFile(file.name, file.text)} size="sm" variant="secondary">
                    Download
                  </Button>
                  <CopyButton label={file.name} size="sm" text={file.text} variant="outline">
                    Copy
                  </CopyButton>
                </span>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}
```

The inline colors are the user's own token values shown as data, not UI chrome, so they do not
break the Atom63 rule against literal colors. If the plugin's `Input` adapter does not pass
`onChange` through, add it to the adapter's props.

- [ ] **Step 4: Run the tests and checks**

Run: `pnpm --filter @atom63/figma-plugin test && pnpm --filter @atom63/figma-plugin typecheck && pnpm --filter @atom63/figma-plugin lint && pnpm --filter @atom63/figma-plugin build`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/figma-plugin/src/app apps/figma-plugin/__tests__/preview.test.ts
git commit -m "feat(figma-plugin): create a token system with a live preview and export its CSS"
```

---

### Task 8: Docs, changeset and a real-Figma walk

**Files:**

- Modify: `apps/figma-plugin/docs/ARCHITECTURE.md` (rewrite), `apps/figma-plugin/docs/description.md`,
  `packages/figma/README.md`, `docs/design-system/figma-token-sync-spec.md` (Status line)
- Create: `.changeset/figma-plugin-create-import.md`

- [ ] **Step 1: Docs**

- **`ARCHITECTURE.md`:** rewrite it to describe:
  - The two threads: `code.ts` with `main/handle.ts` over `@atom63/figma`, and `ui.tsx` with the
    Home, Create and Import views.
  - Where the CSS is read: in the UI, because the browser computes colors.
  - The messages in `src/messages.ts`.
  - That Atom63 itself is synced by the agent path.
- **`description.md`:** describe Create and Import in two short paragraphs.
- **`packages/figma/README.md`:** add a "For plugins" section that lists `buildTemplateFiles`,
  `brandRamp`, `syncModel`, `checkModel` and `readTokenTable`.
- **The spec's Status line:** say that plans 1 to 3 are implemented.

- [ ] **Step 2: Changeset**

`.changeset/figma-plugin-create-import.md`:

```md
---
'@atom63/figma': minor
---

Add what the Figma plugin's Create and Import use: `brandRamp` generates a brand ramp in OKLCH, `buildTemplateFiles` writes the site template's token CSS from a few choices, `syncModel` and `checkModel` sync a token set in process with the same results as the scripts, and `readTokenTable` reads the token table a file holds.
```

- [ ] **Step 3: Verify the way CI does**

```bash
rm -rf packages/figma/dist
pnpm --filter @atom63/figma test && pnpm --filter @atom63/figma typecheck && pnpm --filter @atom63/figma lint && pnpm --filter @atom63/figma build
pnpm --filter @atom63/figma-plugin test && pnpm --filter @atom63/figma-plugin typecheck && pnpm --filter @atom63/figma-plugin lint && pnpm --filter @atom63/figma-plugin build
npx prettier --check packages/figma apps/figma-plugin docs/design-system .changeset
```

Expected: all pass.

- [ ] **Step 4: Real-Figma walk (computer use in the Figma desktop app)**

1. Load the worktree's build in Figma:
   - Figma's development plugin "Cipher by Atom63" loads the main checkout's
     `apps/figma-plugin`, which stays on `main`.
   - Import this worktree's `apps/figma-plugin/manifest.json` with Plugins → Development →
     Import plugin from manifest.
   - If Figma refuses because the id is already registered, stop and ask the user. Do not switch
     the main checkout's branch.
2. Create:
   - In a new Design file in the A63 team, run the plugin. Home shows "Start a token table".
   - Choose Create, brand `#e11d48`, neutral N3, radius round, type scale large and font Inter.
   - Take a screenshot of the preview, then choose "Create in this file".
   - The result says that the file matches the code.
   - Take a screenshot of Home with the token table summary.
3. Export:
   - Download the six files, or copy them if the download does not land in `~/Downloads`.
   - Put them in a scratch directory.
   - Run `node packages/figma/dist/cli.js sync --tokens <dir> --out <scratch>/scripts`.
   - Run each `check-N.js` with the Figma MCP server's `use_figma` on the same file.
   - Every check must report `create: 0` and `update: 0` for variables and styles, which proves
     the export matches what Create wrote.
4. Import:
   - In a second new file, choose Import from CSS and pick the fixture's files
     (`packages/figma/test/fixtures/project-tokens`).
   - Preview, apply, and take a screenshot of the result.
   - Choose Import again and Preview: zero changes.
5. Record the results, with the file keys, in the pull request description.

- [ ] **Step 5: Commit**

```bash
git add apps/figma-plugin/docs packages/figma/README.md docs/design-system/figma-token-sync-spec.md .changeset/figma-plugin-create-import.md
git commit -m "docs(figma-plugin): describe the rebuilt plugin's Create and Import"
```

## Out of scope

- Weights, letter spacing, and more choices in Create (a second brand, a custom neutral).
- A zip download for Export CSS.
- Plan 4: the template repository consuming `@atom63/figma` and a Node resolver for relative
  colors.
- Publishing the plugin to the Figma Community.
