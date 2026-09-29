# Figma token sync, plan 2: text and effect styles

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development
> (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use
> checkbox (`- [ ]`) syntax for tracking.

**Goal:** A sync writes text styles and shadow effect styles next to the variables, bound to them,
so a person drawing in Figma picks the same type and shadows the code uses.

**Architecture:** Styles are derived from a token set, not authored separately:
`deriveStyles(model, raw)` pairs size and line-height variables into text styles and turns shadow
tokens into effect styles, for a project's CSS and for Atom63's model alike. The engine gains
`planStyles` and `applyStyles` against Figma's style API, the runtime applies them in the last
script part, and the CLI adds them to its summary.

**Tech Stack:** TypeScript, Vitest, the Figma Plugin API (`createTextStyle`, `createEffectStyle`,
`TextStyle.setBoundVariable`, `loadFontAsync`) through `use_figma`.

**Spec:** [figma-token-sync-spec.md](./figma-token-sync-spec.md), section "System". Plan 1
([figma-token-sync-plan-1.md](./figma-token-sync-plan-1.md)) is merged: `@atom63/figma` holds the
engine, packer, runtime, script builder, diff and CLI this plan extends.

**Decisions this plan makes inside the spec:**

- Style names: `Text/<step>` (for example `Text/base`, `Text/2xl`) and `Shadow/<step>`.
- A style is matched by its name. Figma styles have no code syntax; the description names the
  tokens (`var(--text-base-size) / var(--text-base-leading)`) for Dev Mode readers.
- Text styles bind font size and line height to their variables. The family is bound to a font
  variable only when every mode's font loads in Figma; otherwise it is set as a literal from the
  first mode, and the result says so.
- Style edits made in Figma are not listed by `diff` in this plan; check scripts report that
  styles drifted, and a sync restores them.

## Global Constraints

- Code is the only source of truth; a sync never deletes a style, and never changes a style that
  is not in the token set.
- Every `use_figma` script stays under 49,000 characters, and every script result under 20 KB.
- Numbers compare with a tolerance relative to their size (Figma stores 32-bit floats).
- Text styles use font style `Regular`; weights are out of scope for this plan.
- Commits: Conventional Commit titles, English bodies that say what changed; a changeset for
  `@atom63/figma`.

## Review Focus

- **A font the file cannot load** (`Geist` in a Figma account without it): the text style falls
  back to `Inter Regular`, the result lists the fallback, and the sync continues. Pinned in Task 3.
- **A font variable with an unloadable mode** (Atom63 `font/app` has `Doto` and `Brawler`): the
  family is not bound; the first loadable family is set as a literal and reported. Pinned in
  Task 3.
- **A style whose variable is missing** (a skipped or renamed size token): the style is skipped
  with a reason, not created half-bound. Pinned in Task 1.
- **Running the same scripts twice**: the second run plans zero style creates and updates, with
  shadow values read back as 32-bit floats. Pinned in Task 3.
- **A style a designer made in Figma** (a name not in the token set): left untouched. Pinned in
  Task 3.

---

## File structure

| File                                                    | Responsibility                                                      |
| ------------------------------------------------------- | ------------------------------------------------------------------- |
| `packages/figma/src/styles.ts`                          | Style types, `parseShadow`, `deriveStyles`                          |
| `packages/figma/src/style-sync.ts`                      | `readStyles`, `planStyles`, `applyStyles` against Figma's style API |
| `packages/figma/src/css-model.ts`                       | Keeps the raw expression of each skipped token (`raw`)              |
| `packages/figma/src/plan.ts`                            | `SyncModel.styles?`                                                 |
| `packages/figma/src/pack.ts`                            | Packs `styles` into the script payload                              |
| `packages/figma/src/runtime.ts`, `scripts.ts`, `cli.ts` | Styles in the last part, results and summary                        |
| `packages/figma/test/fake-styles.ts`                    | In-memory text and effect styles and fonts for the fake `figma`     |

---

### Task 1: Derive styles from a token set

**Files:**

- Create: `packages/figma/src/styles.ts`, `packages/figma/test/styles.test.ts`
- Modify: `packages/figma/src/css-model.ts` (`ProjectModel.raw`), `packages/figma/src/plan.ts`
  (`SyncModel.styles?`), `packages/figma/src/index.ts`

**Interfaces:**

- Consumes: `SyncModel`, `SyncColor`, `ProjectModel`, `parseColor`.
- Produces:

```ts
export interface ShadowLayer {
  inset: boolean
  x: number
  y: number
  blur: number
  spread: number
  color: SyncColor
}
export type StyleNumber = { alias: string } | { value: number }
export interface TextStyleSpec {
  name: string
  description: string
  family: { alias: string; fallback: string } | { value: string }
  fontSize: StyleNumber
  lineHeight: StyleNumber
}
export interface EffectStyleSpec {
  name: string
  description: string
  layers: ShadowLayer[]
}
export interface StyleSet {
  text: TextStyleSpec[]
  effects: EffectStyleSpec[]
  skipped: { name: string; reason: string }[]
}
export function parseShadow(expression: string): ShadowLayer[] | null
export function deriveStyles(model: SyncModel, raw?: Record<string, string>): StyleSet
```

`ProjectModel` gains `raw: Record<string, string>`: the effective `:root` expression of every
token the model skipped, so shadows and font stacks reach `deriveStyles`. `SyncModel` gains
`styles?: StyleSet`.

- [ ] **Step 1: Write the failing tests**

`packages/figma/test/styles.test.ts`:

```ts
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { readTokenDirectory } from '../src/css-files'
import { buildProjectModel } from '../src/css-model'
import type { SyncModel } from '../src/plan'
import { deriveStyles, parseShadow } from '../src/styles'

const project = buildProjectModel(readTokenDirectory(resolve(__dirname, 'fixtures/project-tokens')))
const atom63 = JSON.parse(
  readFileSync(resolve(__dirname, '../../styles/generated/atom63.figma-sync.json'), 'utf8')
) as SyncModel

describe('parseShadow', () => {
  it('reads each layer of a box shadow', () => {
    expect(
      parseShadow('0px 1px 2px 0px rgb(0 0 0 / 0.05), 0px 2px 4px -2px rgb(0 0 0 / 0.08)')
    ).toEqual([
      { inset: false, x: 0, y: 1, blur: 2, spread: 0, color: { r: 0, g: 0, b: 0, a: 0.05 } },
      { inset: false, x: 0, y: 2, blur: 4, spread: -2, color: { r: 0, g: 0, b: 0, a: 0.08 } },
    ])
  })

  it('reads inset layers and missing blur or spread', () => {
    expect(parseShadow('inset 0 1px #000')).toEqual([
      { inset: true, x: 0, y: 1, blur: 0, spread: 0, color: { r: 0, g: 0, b: 0, a: 1 } },
    ])
  })

  it('refuses what an effect style cannot hold', () => {
    expect(parseShadow('none')).toBeNull()
    expect(parseShadow('0 0 0 1px color-mix(in oklch, black 8%, transparent)')).toBeNull()
  })
})

describe('deriveStyles', () => {
  it('pairs the project text steps into text styles bound to their variables', () => {
    const styles = deriveStyles(project.model, project.raw)
    const base = styles.text.find(style => style.name === 'Text/base')
    expect(base).toEqual({
      name: 'Text/base',
      description: 'var(--text-base-size) / var(--text-base-leading)',
      family: { value: 'Geist' },
      fontSize: { alias: '--text-base-size' },
      lineHeight: { alias: '--text-base-leading' },
    })
    expect(styles.text.map(style => style.name)).toContain('Text/9xl')
  })

  it('turns the project shadows into effect styles', () => {
    const styles = deriveStyles(project.model, project.raw)
    const md = styles.effects.find(style => style.name === 'Shadow/md')
    expect(md?.layers).toHaveLength(2)
    expect(md?.description).toBe('var(--shadow-md)')
  })

  it('derives Atom63 text styles bound to its font variable, and its shadow styles', () => {
    const styles = deriveStyles(atom63)
    expect(styles.text.find(style => style.name === 'Text/base')).toMatchObject({
      family: { alias: '--a63-font-app', fallback: 'Geist' },
      fontSize: { alias: '--typography-base-font-size' },
      lineHeight: { alias: '--typography-base-line-height' },
    })
    expect(styles.effects.map(style => style.name)).toContain('Shadow/2xl')
  })

  it('skips a text step whose line height the model does not have', () => {
    const model: SyncModel = {
      ...project.model,
      collections: project.model.collections.map(collection => ({
        ...collection,
        variables: collection.variables.filter(item => item.token !== '--text-xs-leading'),
      })),
    }
    const styles = deriveStyles(model, project.raw)
    expect(styles.text.map(style => style.name)).not.toContain('Text/xs')
    expect(styles.skipped).toContainEqual({
      name: 'Text/xs',
      reason: 'no line height token (--text-xs-leading)',
    })
  })
})
```

- [ ] **Step 2: Run the tests to see them fail**

Run: `pnpm --filter @atom63/figma test -- styles`
Expected: FAIL, `../src/styles` does not exist.

- [ ] **Step 3: Keep the raw expressions of skipped tokens in `css-model.ts`**

In `buildProjectModel`, next to `skipped.push({ token, reason: failure })` and the other
`skipped.push` calls, record the token's effective `:root` expression:

```ts
const raw: ProjectModel['raw'] = {}
const remember = (token: string) => {
  const declaration = effective(token, defaults)
  if (declaration) raw[token] = declaration.expression
}
```

Call `remember(token)` wherever a token is pushed to `skipped`, add `raw: Record<string, string>`
to `ProjectModel`, and return `raw` with `model`, `sources` and `notes`. Update the one place in
`cli.ts` that builds a `ProjectModel` from `--model` to pass `raw: {}`.

- [ ] **Step 4: Implement `styles.ts`**

```ts
/**
 * Text and effect styles derived from a token set: text steps pair a size and
 * a line-height variable, shadows become drop or inner shadow layers. Works on
 * a project's CSS model and on Atom63's model alike.
 */
import { parseColor } from './css-model'
import type { SyncColor, SyncModel, SyncVariable } from './plan'

export interface ShadowLayer {
  inset: boolean
  x: number
  y: number
  blur: number
  spread: number
  color: SyncColor
}
export type StyleNumber = { alias: string } | { value: number }
export interface TextStyleSpec {
  name: string
  description: string
  family: { alias: string; fallback: string } | { value: string }
  fontSize: StyleNumber
  lineHeight: StyleNumber
}
export interface EffectStyleSpec {
  name: string
  description: string
  layers: ShadowLayer[]
}
export interface StyleSet {
  text: TextStyleSpec[]
  effects: EffectStyleSpec[]
  skipped: { name: string; reason: string }[]
}

/** Splits on commas outside parentheses. */
function layersOf(expression: string): string[] {
  const parts: string[] = []
  let depth = 0
  let current = ''
  for (const char of expression) {
    if (char === '(') depth += 1
    if (char === ')') depth -= 1
    if (char === ',' && depth === 0) {
      parts.push(current.trim())
      current = ''
    } else current += char
  }
  if (current.trim()) parts.push(current.trim())
  return parts
}

const LENGTH = /^-?\d*\.?\d+(px)?$/

export function parseShadow(expression: string): ShadowLayer[] | null {
  const layers: ShadowLayer[] = []
  for (const layer of layersOf(expression.replace(/\s+/g, ' '))) {
    const words = layer.match(/(?:[a-z-]+\([^()]*\)|\S)+/gi) ?? []
    const inset = words.includes('inset')
    const lengths = words.filter(word => LENGTH.test(word)).map(word => Number.parseFloat(word))
    const colorWord = words.find(word => word !== 'inset' && !LENGTH.test(word))
    const color = colorWord ? parseColor(colorWord) : null
    if (lengths.length < 2 || lengths.length > 4 || !color) return null
    const [x, y, blur = 0, spread = 0] = lengths
    layers.push({ inset, x, y, blur, spread, color })
  }
  return layers.length > 0 ? layers : null
}

const TEXT_PAIRS = [
  { size: /^--text-(.+)-size$/, leading: (step: string) => `--text-${step}-leading` },
  {
    size: /^--typography-(.+)-font-size$/,
    leading: (step: string) => `--typography-${step}-line-height`,
  },
]
const SHADOW = [/^--shadow-(.+)$/, /^--effect-shadow-(.+)$/]
const FONT_VARIABLE = '--a63-font-app'
const FONT_STACK = '--font-sans'

/** The first family of a CSS font stack, unquoted. */
export function firstFamily(stack: string): string {
  return layersOf(stack)[0]?.replace(/^['"]|['"]$/g, '') ?? 'Inter'
}

export function deriveStyles(model: SyncModel, raw: Record<string, string> = {}): StyleSet {
  const variables = new Map<string, SyncVariable>(
    model.collections.flatMap(collection =>
      collection.variables.map(variable => [variable.token, variable] as const)
    )
  )
  const skipped: StyleSet['skipped'] = []

  // The family: a font variable when the model has one, else the first font of the sans stack.
  const fontVariable = variables.get(FONT_VARIABLE)
  const firstValue = fontVariable && Object.values(fontVariable.values)[0]
  const fallbackStack =
    firstValue && 'alias' in firstValue
      ? String((variables.get(firstValue.alias)?.values.Value as { value?: string })?.value ?? '')
      : ''
  const family: TextStyleSpec['family'] = fontVariable
    ? { alias: FONT_VARIABLE, fallback: firstFamily(fallbackStack || 'Inter') }
    : { value: firstFamily(raw[FONT_STACK] ?? 'Inter') }

  const text: TextStyleSpec[] = []
  for (const token of variables.keys()) {
    for (const pair of TEXT_PAIRS) {
      const step = pair.size.exec(token)?.[1]
      if (!step) continue
      const name = `Text/${step}`
      const leading = pair.leading(step)
      if (!variables.has(leading)) {
        skipped.push({ name, reason: `no line height token (${leading})` })
        continue
      }
      text.push({
        name,
        description: `var(${token}) / var(${leading})`,
        family,
        fontSize: { alias: token },
        lineHeight: { alias: leading },
      })
    }
  }

  const effects: EffectStyleSpec[] = []
  const shadowSources = new Map<string, string>(Object.entries(raw))
  for (const [token, variable] of variables)
    if (variable.type === 'STRING') {
      const value = Object.values(variable.values)[0]
      if (value && 'value' in value && typeof value.value === 'string')
        shadowSources.set(token, value.value)
    }
  for (const [token, expression] of shadowSources) {
    const step = SHADOW.map(pattern => pattern.exec(token)?.[1]).find(Boolean)
    if (!step) continue
    const name = `Shadow/${step}`
    const layers = parseShadow(expression)
    if (!layers) {
      skipped.push({ name, reason: `not a plain box shadow (${token})` })
      continue
    }
    effects.push({ name, description: `var(${token})`, layers })
  }

  return { text, effects, skipped }
}
```

Add `export * from './styles'` to `index.ts` and `styles?: StyleSet` to `SyncModel` in
`plan.ts` (import the type from `./styles`).

- [ ] **Step 5: Run the tests**

Run: `pnpm --filter @atom63/figma test`
Expected: PASS. If `parseColor('rgb(0 0 0 / 0.05)')` returns null, extend `parseColor` for the
space-separated `rgb()` form and add that case to the `project-sync` value tests first.

- [ ] **Step 6: Commit**

```bash
git add packages/figma
git commit -m "feat(figma): derive text and shadow styles from a token set"
```

---

### Task 2: A fake `figma` with styles and fonts

**Files:**

- Create: `packages/figma/test/fake-styles.ts`
- Modify: `packages/figma/test/fake-figma.ts`

**Interfaces:**

- Produces: `createFakeFigma({ fonts?: string[] })` returning `{ ..., figma, run, textStyles,
effectStyles }`, where `figma` also has `getLocalTextStylesAsync`, `getLocalEffectStylesAsync`,
  `createTextStyle`, `createEffectStyle`, `loadFontAsync`, `variables`. `loadFontAsync` rejects a
  family not in `fonts` (default `['Inter', 'Geist']`). Text styles record
  `boundVariables: { fontSize?, lineHeight?, fontFamily? }` as `{ type: 'VARIABLE_ALIAS', id }`,
  and `setBoundVariable('fontFamily', variable)` rejects when any of the variable's mode values
  (resolved through aliases) is a family not in `fonts`, like Figma's unloaded-font error.

- [ ] **Step 1: Write `fake-styles.ts`**

```ts
import type { VariableLike } from '../src/apply'

export interface FakeTextStyle {
  id: string
  name: string
  description: string
  fontName: { family: string; style: string }
  fontSize: number
  lineHeight: { unit: 'PIXELS'; value: number } | { unit: 'AUTO' }
  boundVariables: Record<string, { type: 'VARIABLE_ALIAS'; id: string }>
  setBoundVariable(field: string, variable: VariableLike | null): void
}
export interface FakeEffectStyle {
  id: string
  name: string
  description: string
  effects: unknown[]
}

export function createFakeStyles(
  fonts: string[],
  familiesOf: (variable: VariableLike) => string[]
) {
  let next = 0
  const textStyles: FakeTextStyle[] = []
  const effectStyles: FakeEffectStyle[] = []
  const loaded = new Set<string>()
  return {
    textStyles,
    effectStyles,
    api: {
      getLocalTextStylesAsync: async () => [...textStyles],
      getLocalEffectStylesAsync: async () => [...effectStyles],
      loadFontAsync: async (font: { family: string; style: string }) => {
        if (!fonts.includes(font.family))
          throw new Error(`The font "${font.family}" could not be loaded`)
        loaded.add(font.family)
      },
      createTextStyle(): FakeTextStyle {
        const style: FakeTextStyle = {
          id: `S:t${next++}`,
          name: '',
          description: '',
          fontName: { family: 'Inter', style: 'Regular' },
          fontSize: 12,
          lineHeight: { unit: 'AUTO' },
          boundVariables: {},
          setBoundVariable(field, variable) {
            if (!variable) {
              delete this.boundVariables[field]
              return
            }
            if (field === 'fontFamily')
              for (const family of familiesOf(variable))
                if (!loaded.has(family)) throw new Error(`Cannot use unloaded font "${family}"`)
            this.boundVariables[field] = { type: 'VARIABLE_ALIAS', id: variable.id }
          },
        }
        textStyles.push(style)
        return style
      },
      createEffectStyle(): FakeEffectStyle {
        const style = { id: `S:e${next++}`, name: '', description: '', effects: [] }
        effectStyles.push(style)
        return style
      },
    },
  }
}
```

- [ ] **Step 2: Wire it into `fake-figma.ts`**

```ts
export function createFakeFigma({ fonts = ['Inter', 'Geist'] }: { fonts?: string[] } = {}) {
  const fake = createFakeApi()
  const familiesOf = (variable: VariableLike): string[] =>
    Object.values(variable.valuesByMode).flatMap(value => {
      if (typeof value === 'string') return [value.split(',')[0].replace(/['"]/g, '').trim()]
      if (value && typeof value === 'object' && 'id' in value) {
        const target = fake.variables.get((value as { id: string }).id)
        return target ? familiesOf(target) : []
      }
      return []
    })
  const styles = createFakeStyles(fonts, familiesOf)
  const figma = { variables: fake.api, ...styles.api }
  const run = (script: string) => new AsyncFunction('figma', script)(figma)
  return { ...fake, ...styles, figma, run }
}
```

- [ ] **Step 3: Run the existing suite**

Run: `pnpm --filter @atom63/figma test`
Expected: PASS (nothing uses the styles yet).

- [ ] **Step 4: Commit**

```bash
git add packages/figma/test
git commit -m "test(figma): fake Figma text and effect styles and fonts"
```

---

### Task 3: Plan and apply styles

**Files:**

- Create: `packages/figma/src/style-sync.ts`, `packages/figma/test/style-sync.test.ts`
- Modify: `packages/figma/src/index.ts`

**Interfaces:**

- Consumes: `StyleSet`, `VariablesApi`, `tokenOfCodeSyntax`, `createFakeFigma` (Task 2).
- Produces:

```ts
export interface StylesApi {
  variables: VariablesApi
  getLocalTextStylesAsync(): Promise<TextStyleLike[]>
  getLocalEffectStylesAsync(): Promise<EffectStyleLike[]>
  createTextStyle(): TextStyleLike
  createEffectStyle(): EffectStyleLike
  loadFontAsync(font: { family: string; style: string }): Promise<void>
}
export interface StylePlan {
  create: string[]
  update: string[]
  unchanged: number
  skipped: { name: string; reason: string }[]
}
export interface StyleResult {
  created: number
  updated: number
  /** Text styles whose family could not be bound or loaded, and what they use instead. */
  fontFallbacks: { style: string; wanted: string; used: string }[]
}
export async function planStyles(api: StylesApi, styles: StyleSet): Promise<StylePlan>
export async function applyStyles(
  api: StylesApi,
  styles: StyleSet,
  plan: StylePlan
): Promise<StyleResult>
```

- [ ] **Step 1: Write the failing tests**

`packages/figma/test/style-sync.test.ts`:

```ts
import { resolve } from 'node:path'

import { applyPlan, readSnapshot } from '../src/apply'
import { readTokenDirectory } from '../src/css-files'
import { buildProjectModel } from '../src/css-model'
import { planSync, type SyncModel } from '../src/plan'
import { applyStyles, planStyles } from '../src/style-sync'
import { deriveStyles } from '../src/styles'
import { createFakeFigma } from './fake-figma'

const project = buildProjectModel(readTokenDirectory(resolve(__dirname, 'fixtures/project-tokens')))
const styles = deriveStyles(project.model, project.raw)

async function withVariables(fonts?: string[], model: SyncModel = project.model) {
  const fake = createFakeFigma({ fonts })
  await applyPlan(fake.api, model, planSync(model, await readSnapshot(fake.api, model)))
  return fake
}

describe('style sync', () => {
  it('creates text styles bound to their variables, and effect styles', async () => {
    const fake = await withVariables()
    const plan = await planStyles(fake.figma, styles)
    expect(plan.create.length).toBe(styles.text.length + styles.effects.length)
    const result = await applyStyles(fake.figma, styles, plan)
    expect(result.fontFallbacks).toEqual([])
    const base = fake.textStyles.find(style => style.name === 'Text/base')
    expect(base?.fontName).toEqual({ family: 'Geist', style: 'Regular' })
    const size = [...fake.variables.values()].find(
      item => item.codeSyntax?.WEB === 'var(--text-base-size)'
    )
    expect(base?.boundVariables.fontSize).toEqual({ type: 'VARIABLE_ALIAS', id: size?.id })
    expect(base?.description).toBe('var(--text-base-size) / var(--text-base-leading)')
    const md = fake.effectStyles.find(style => style.name === 'Shadow/md')
    expect(md?.effects).toHaveLength(2)
  })

  it('plans nothing on a second run, with values read back as 32-bit floats', async () => {
    const fake = await withVariables()
    await applyStyles(fake.figma, styles, await planStyles(fake.figma, styles))
    for (const style of fake.effectStyles)
      style.effects = (
        style.effects as {
          color: Record<string, number>
          offset: Record<string, number>
          radius: number
          spread: number
        }[]
      ).map(effect => ({
        ...effect,
        color: Object.fromEntries(
          Object.entries(effect.color).map(([key, value]) => [key, Math.fround(value)])
        ),
        radius: Math.fround(effect.radius),
        spread: Math.fround(effect.spread),
      }))
    const again = await planStyles(fake.figma, styles)
    expect(again).toMatchObject({ create: [], update: [] })
  })

  it('falls back to Inter when the family cannot load, and says so', async () => {
    const fake = await withVariables(['Inter'])
    const result = await applyStyles(fake.figma, styles, await planStyles(fake.figma, styles))
    expect(fake.textStyles.find(style => style.name === 'Text/base')?.fontName.family).toBe('Inter')
    expect(result.fontFallbacks).toContainEqual({
      style: 'Text/base',
      wanted: 'Geist',
      used: 'Inter',
    })
  })

  it('leaves a style made in Figma alone', async () => {
    const fake = await withVariables()
    const mine = fake.figma.createEffectStyle()
    mine.name = 'Brand glow'
    await applyStyles(fake.figma, styles, await planStyles(fake.figma, styles))
    expect(fake.effectStyles.find(style => style.name === 'Brand glow')?.effects).toEqual([])
  })

  it('updates a style whose shadow changed in code', async () => {
    const fake = await withVariables()
    await applyStyles(fake.figma, styles, await planStyles(fake.figma, styles))
    const changed = {
      ...styles,
      effects: styles.effects.map(style =>
        style.name === 'Shadow/md' ? { ...style, layers: style.layers.slice(0, 1) } : style
      ),
    }
    expect((await planStyles(fake.figma, changed)).update).toEqual(['Shadow/md'])
  })
})
```

Add a test for the font variable with an unloadable mode, using a two-variable model:

```ts
it('does not bind a font variable with a mode Figma cannot load', async () => {
  const model: SyncModel = {
    schemaVersion: 1,
    summary: { collections: 2, variables: 5, aliasValues: 1, skipped: 0 },
    skipped: [],
    collections: [
      {
        name: 'Base',
        modes: ['Value'],
        variables: [
          {
            name: 'sans',
            token: '--font-family-sans',
            type: 'STRING',
            values: { Value: { value: "'Geist', sans-serif" } },
          },
          {
            name: 'pixel',
            token: '--font-family-pixel',
            type: 'STRING',
            values: { Value: { value: "'Doto', monospace" } },
          },
          {
            name: 'size',
            token: '--typography-base-font-size',
            type: 'FLOAT',
            values: { Value: { value: 15 } },
          },
          {
            name: 'leading',
            token: '--typography-base-line-height',
            type: 'FLOAT',
            values: { Value: { value: 23 } },
          },
        ],
      },
      {
        name: 'Font',
        modes: ['sans', 'pixel'],
        variables: [
          {
            name: 'app',
            token: '--a63-font-app',
            type: 'STRING',
            values: {
              sans: { alias: '--font-family-sans' },
              pixel: { alias: '--font-family-pixel' },
            },
          },
        ],
      },
    ],
  }
  const fake = await withVariables(['Inter', 'Geist'], model)
  const derived = deriveStyles(model)
  const result = await applyStyles(fake.figma, derived, await planStyles(fake.figma, derived))
  const base = fake.textStyles.find(style => style.name === 'Text/base')
  expect(base?.boundVariables.fontFamily).toBeUndefined()
  expect(base?.fontName.family).toBe('Geist')
  expect(result.fontFallbacks).toContainEqual({
    style: 'Text/base',
    wanted: '--a63-font-app',
    used: 'Geist',
  })
})
```

- [ ] **Step 2: Run the tests to see them fail**

Run: `pnpm --filter @atom63/figma test -- style-sync`
Expected: FAIL, `../src/style-sync` does not exist.

- [ ] **Step 3: Implement `style-sync.ts`**

```ts
/**
 * Text and effect styles against Figma's style API. Styles are matched by name;
 * one not in the token set is never touched. Text styles bind size and line
 * height to their variables; the family binds only when every mode's font
 * loads, else it is a literal and the result says so.
 */
import { tokenOfCodeSyntax, type VariableLike, type VariablesApi } from './apply'
import {
  type EffectStyleSpec,
  firstFamily,
  type ShadowLayer,
  type StyleSet,
  type TextStyleSpec,
} from './styles'

type Alias = { type: 'VARIABLE_ALIAS'; id: string }
export interface TextStyleLike {
  id: string
  name: string
  description: string
  fontName: { family: string; style: string }
  fontSize: number
  lineHeight: unknown
  boundVariables?: Record<string, Alias | undefined>
  setBoundVariable(
    field: 'fontFamily' | 'fontSize' | 'lineHeight',
    variable: VariableLike | null
  ): void
}
export interface EffectStyleLike {
  id: string
  name: string
  description: string
  effects: readonly unknown[]
}
export interface StylesApi {
  variables: VariablesApi
  getLocalTextStylesAsync(): Promise<TextStyleLike[]>
  getLocalEffectStylesAsync(): Promise<EffectStyleLike[]>
  createTextStyle(): TextStyleLike
  createEffectStyle(): EffectStyleLike
  loadFontAsync(font: { family: string; style: string }): Promise<void>
}
export interface StylePlan {
  create: string[]
  update: string[]
  unchanged: number
  skipped: { name: string; reason: string }[]
}
export interface StyleResult {
  created: number
  updated: number
  fontFallbacks: { style: string; wanted: string; used: string }[]
}

const near = (left: number, right: number) =>
  Math.abs(left - right) < 1e-6 * Math.max(1, Math.abs(left), Math.abs(right))

async function variablesOf(api: VariablesApi) {
  const byToken = new Map<string, VariableLike>()
  const byId = new Map<string, VariableLike>()
  for (const collection of await api.getLocalVariableCollectionsAsync())
    for (const id of collection.variableIds) {
      const variable = await api.getVariableByIdAsync(id)
      if (!variable) continue
      byId.set(variable.id, variable)
      const token = tokenOfCodeSyntax(variable.codeSyntax?.WEB)
      if (token) byToken.set(token, variable)
    }
  return { byToken, byId }
}

/** Every family a font variable resolves to, in any mode, through aliases. */
function familiesOf(variable: VariableLike, byId: Map<string, VariableLike>): string[] {
  return Object.values(variable.valuesByMode).flatMap(value => {
    if (typeof value === 'string') return [firstFamily(value)]
    if (value && typeof value === 'object' && (value as Alias).type === 'VARIABLE_ALIAS') {
      const target = byId.get((value as Alias).id)
      return target ? familiesOf(target, byId) : []
    }
    return []
  })
}

function effectOf(layer: ShadowLayer) {
  return {
    type: layer.inset ? 'INNER_SHADOW' : 'DROP_SHADOW',
    color: { ...layer.color },
    offset: { x: layer.x, y: layer.y },
    radius: layer.blur,
    spread: layer.spread,
    visible: true,
    blendMode: 'NORMAL',
    ...(layer.inset ? {} : { showShadowBehindNode: false }),
  }
}

function sameEffects(spec: EffectStyleSpec, style: EffectStyleLike): boolean {
  const effects = style.effects as ReturnType<typeof effectOf>[]
  return (
    effects.length === spec.layers.length &&
    spec.layers.every((layer, index) => {
      const effect = effects[index]
      const wanted = effectOf(layer)
      return (
        effect.type === wanted.type &&
        near(effect.offset.x, wanted.offset.x) &&
        near(effect.offset.y, wanted.offset.y) &&
        near(effect.radius, wanted.radius) &&
        near(effect.spread ?? 0, wanted.spread) &&
        (['r', 'g', 'b', 'a'] as const).every(key => near(effect.color[key], wanted.color[key]))
      )
    })
  )
}

function sameText(
  spec: TextStyleSpec,
  style: TextStyleLike,
  byToken: Map<string, VariableLike>
): boolean {
  const bound = (field: string, alias: string) =>
    style.boundVariables?.[field]?.id === byToken.get(alias)?.id
  return (
    style.description === spec.description &&
    ('alias' in spec.fontSize
      ? bound('fontSize', spec.fontSize.alias)
      : near(style.fontSize, spec.fontSize.value)) &&
    ('alias' in spec.lineHeight ? bound('lineHeight', spec.lineHeight.alias) : true) &&
    ('value' in spec.family
      ? style.fontName.family === spec.family.value || style.fontName.family === 'Inter'
      : true)
  )
}

export async function planStyles(api: StylesApi, styles: StyleSet): Promise<StylePlan> {
  const { byToken } = await variablesOf(api.variables)
  const text = new Map((await api.getLocalTextStylesAsync()).map(style => [style.name, style]))
  const effects = new Map((await api.getLocalEffectStylesAsync()).map(style => [style.name, style]))
  const plan: StylePlan = { create: [], update: [], unchanged: 0, skipped: [...styles.skipped] }
  for (const spec of styles.text) {
    const missing = [spec.fontSize, spec.lineHeight]
      .map(value => ('alias' in value ? value.alias : null))
      .find(alias => alias && !byToken.has(alias))
    if (missing) {
      plan.skipped.push({ name: spec.name, reason: `variable ${missing} is not in the file` })
      continue
    }
    const current = text.get(spec.name)
    if (!current) plan.create.push(spec.name)
    else if (sameText(spec, current, byToken)) plan.unchanged += 1
    else plan.update.push(spec.name)
  }
  for (const spec of styles.effects) {
    const current = effects.get(spec.name)
    if (!current) plan.create.push(spec.name)
    else if (current.description === spec.description && sameEffects(spec, current))
      plan.unchanged += 1
    else plan.update.push(spec.name)
  }
  return plan
}

async function loads(api: StylesApi, family: string): Promise<boolean> {
  try {
    await api.loadFontAsync({ family, style: 'Regular' })
    return true
  } catch {
    return false
  }
}

export async function applyStyles(
  api: StylesApi,
  styles: StyleSet,
  plan: StylePlan
): Promise<StyleResult> {
  const result: StyleResult = { created: 0, updated: 0, fontFallbacks: [] }
  const { byToken, byId } = await variablesOf(api.variables)
  const wanted = new Set([...plan.create, ...plan.update])
  const text = new Map((await api.getLocalTextStylesAsync()).map(style => [style.name, style]))
  const effects = new Map((await api.getLocalEffectStylesAsync()).map(style => [style.name, style]))
  await loads(api, 'Inter')

  for (const spec of styles.text) {
    if (!wanted.has(spec.name)) continue
    const style = text.get(spec.name) ?? api.createTextStyle()
    if (!text.has(spec.name)) result.created += 1
    else result.updated += 1
    style.name = spec.name
    style.description = spec.description

    const literal = 'value' in spec.family ? spec.family.value : spec.family.fallback
    const family = (await loads(api, literal)) ? literal : 'Inter'
    style.fontName = { family, style: 'Regular' }
    if (family !== literal)
      result.fontFallbacks.push({ style: spec.name, wanted: literal, used: family })
    if ('alias' in spec.family) {
      // Figma refuses to bind a family it cannot load in every mode: load them first.
      const variable = byToken.get(spec.family.alias)
      const families = variable ? familiesOf(variable, byId) : []
      const loaded = await Promise.all(families.map(item => loads(api, item)))
      if (variable && families.length > 0 && loaded.every(Boolean))
        style.setBoundVariable('fontFamily', variable)
      else {
        style.setBoundVariable('fontFamily', null)
        result.fontFallbacks.push({ style: spec.name, wanted: spec.family.alias, used: family })
      }
    }
    for (const [field, value] of [
      ['fontSize', spec.fontSize],
      ['lineHeight', spec.lineHeight],
    ] as const) {
      if ('alias' in value) style.setBoundVariable(field, byToken.get(value.alias) ?? null)
      else if (field === 'fontSize') style.fontSize = value.value
      else style.lineHeight = { unit: 'PIXELS', value: value.value }
    }
  }

  for (const spec of styles.effects) {
    if (!wanted.has(spec.name)) continue
    const style = effects.get(spec.name) ?? api.createEffectStyle()
    if (!effects.has(spec.name)) result.created += 1
    else result.updated += 1
    style.name = spec.name
    style.description = spec.description
    style.effects = spec.layers.map(effectOf)
  }
  return result
}
```

Export `planStyles`, `applyStyles` and the types from `index.ts`.

- [ ] **Step 4: Run the tests**

Run: `pnpm --filter @atom63/figma test`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add packages/figma
git commit -m "feat(figma): plan and apply text and effect styles bound to variables"
```

---

### Task 4: Styles in scripts, results and the CLI

**Files:**

- Modify: `packages/figma/src/pack.ts`, `packages/figma/src/runtime.ts`,
  `packages/figma/src/scripts.ts`, `packages/figma/src/cli.ts`,
  `packages/figma/test/scripts.test.ts`, `packages/figma/test/cli.test.ts`

**Interfaces:**

- Consumes: `deriveStyles`, `planStyles`, `applyStyles`, `StyleSet`.
- Produces:
  - `PackedModel` gains `y?: StyleSet` (styles travel unpacked; they are small).
  - `buildScripts` puts `styles` only in the last part; the runtime's `sync` then returns
    `styles: { planned: StylePlan; applied: StyleResult; verification: StylePlan }` and `check`
    returns `styles: StylePlan`, for that part only.
  - The runtime's functions take `figma` itself (it now needs `figma.createTextStyle` and so on)
    and pass `figma.variables` to the variable engine.
  - `atom63-figma sync` derives styles (`deriveStyles(model, project.raw)`) unless `--no-styles`
    is passed, and its summary gains `styles: { text: number; effects: number; skipped }`.

- [ ] **Step 1: Write the failing tests**

In `scripts.test.ts`:

```ts
it('writes styles in the last part, and a second run plans no style changes', async () => {
  const model = { ...project, styles: deriveStyles(project, projectRaw) }
  const { run, textStyles, effectStyles } = createFakeFigma()
  const scripts = buildScripts(model, 'sync')
  let last: { styles?: { verification: { create: string[]; update: string[] } } } = {}
  for (const script of scripts) last = (await run(script)) as typeof last
  expect(textStyles.length).toBe(model.styles.text.length)
  expect(effectStyles.length).toBe(model.styles.effects.length)
  expect(last.styles?.verification).toMatchObject({ create: [], update: [] })
  for (const script of buildScripts(model, 'check')) last = (await run(script)) as typeof last
})
```

(`projectRaw` is `buildProjectModel(...).raw`; keep the existing `project` binding as the model.)

In `cli.test.ts`, extend the first test: the summary has `styles.text > 0` and
`styles.effects > 0`, and after running the sync scripts the fake has that many text and effect
styles.

- [ ] **Step 2: Run the tests to see them fail**

Run: `pnpm --filter @atom63/figma test -- scripts cli`
Expected: FAIL, styles are not written.

- [ ] **Step 3: Implement**

- `pack.ts`: `packModel` copies `model.styles` to `y`; `unpackModel` restores `styles: packed.y`.
- `scripts.ts`: `partOf` drops `styles` for every group but the last:
  `const last = index === groups.length - 1; wrap(packModel({ ...partOf(model, group), styles: last ? model.styles : undefined }), …)`,
  and add the styles' JSON length to the last group's budget check so the guard still holds.
- `runtime.ts`:

```ts
interface FigmaLike extends StylesApi {}

export async function sync(figma: FigmaLike, packed: PackedModel) {
  const model = unpackModel(packed)
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
```

`check` adds `styles: await planStyles(figma, model.styles)` when the part has styles. `read`
keeps taking `figma.variables` through `readDocument(figma.variables)`.

- `cli.ts`: after `project(values)`, set `model.styles = values['no-styles'] ? undefined : deriveStyles(model, raw)`
  (add `'no-styles': { type: 'boolean' }` to `parseArgs`), and add the `styles` counts and
  `skipped` to the summary.
- Rebuild the runtime (`pnpm --filter @atom63/figma build`) so `RUNTIME_SOURCE` has the style
  code; check the Atom63 scripts still fit under the limit (the scripts test does).

- [ ] **Step 4: Run the tests**

Run: `pnpm --filter @atom63/figma test`
Expected: PASS.

- [ ] **Step 5: Changeset and commit**

Run `pnpm changeset`, `@atom63/figma`, minor: "Sync writes text styles bound to size, line-height
and font variables, and shadow effect styles, derived from the token set."

```bash
git add packages/figma .changeset
git commit -m "feat(figma): write text and effect styles in agent sync scripts"
```

---

### Task 5: Guide and a real-Figma run

**Files:**

- Modify: `packages/figma/README.md`, `docs/design-system/figma-token-sync-spec.md` (the decisions
  above, under "System")

- [ ] **Step 1: README**

Under "Sync code to Figma", add: the last script part also writes text styles (`Text/<step>`,
bound to the size and line-height variables, so they follow the type-scale modes) and shadow
effect styles (`Shadow/<step>`); its result has `styles.verification`, which must plan no creates
or updates; `styles.applied.fontFallbacks` lists text styles that use another font than the code,
because the family could not load in Figma; `--no-styles` writes variables only.

- [ ] **Step 2: Spec**

Under "System", replace the example role list with the step names this plan uses, and add: styles
are matched by name; the description names the tokens; the family binds to a font variable only
when every mode's font loads.

- [ ] **Step 3: Real-Figma run (manual, Figma MCP server)**

1. New Figma file; `atom63-figma sync --tokens ~/Projects/atom63-site-template/src/styles/tokens --out /tmp/figma-styles`.
2. Run the script with `use_figma`; `styles.verification` plans no creates or updates; note
   `fontFallbacks` (Geist may not be available).
3. With a short `use_figma` script, place a text node using `Text/base` and a frame using
   `Shadow/md`, switch the frame's `Type scale` mode to `large`, and take a screenshot: the text
   grows with the mode.
4. Run the check script: no changes.
5. For Atom63, run its three scripts in another new file and record `fontFallbacks` for
   `font/app`.

Record the results in the pull request description.

- [ ] **Step 4: Verify the way CI does, and commit**

```bash
rm -rf packages/figma/dist
pnpm --filter @atom63/figma test && pnpm --filter @atom63/figma typecheck && pnpm --filter @atom63/figma lint && pnpm --filter @atom63/figma build
pnpm --filter @atom63/figma-plugin typecheck && pnpm --filter @atom63/figma-plugin build
npx prettier --check packages/figma docs/design-system
git add packages/figma docs/design-system
git commit -m "docs(figma): describe the text and effect styles a sync writes"
```

## Out of scope

- Listing style edits made in Figma in `diff` (check scripts report drift; a sync restores it).
- Font weights and letter spacing in text styles.
- Styles for colors (variables cover them) and grids.
