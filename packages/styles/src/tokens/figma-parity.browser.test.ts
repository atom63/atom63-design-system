import { afterEach, beforeAll, describe, expect, it } from 'vitest'
import { page } from 'vitest/browser'
import model from '../../generated/atom63.figma-sync.json'
import { resetRoot, root } from '../test/apply-styles'

/*
 * Figma/web parity across every axis. Each Figma variable is resolved through
 * the sync model the way Figma resolves it (follow aliases; a collection takes
 * its mode from the active context) and compared with what the browser computes
 * for the token under the same data-a63-* attributes. The Swift parity test
 * checks the default context only; this one checks every mode of every axis,
 * and every theme × brand × surface × mode combination for colors, because
 * those four interact.
 *
 * Variables the model lists as `computed` vary on more axes than one Figma
 * collection can hold; Figma shows their default and renderers evaluate their
 * expression, so they are left out here, and so is any variable whose alias
 * chain reaches one of them in the context being checked. The viewport matches the generator's
 * page (1280 × 720), because viewport units and media queries resolve against it.
 */

type Rgba = { r: number; g: number; b: number; a: number }
type Value = { alias?: string; value?: Rgba | number | string }
interface Variable {
  name: string
  token: string
  type: 'COLOR' | 'FLOAT' | 'STRING'
  values: Record<string, Value>
}
interface Collection {
  name: string
  modes: string[]
  variables: Variable[]
}

const { collections, computed } = model as {
  collections: Collection[]
  computed: { token: string }[]
}
const computedTokens = new Set(computed.map(entry => entry.token))
const byToken = new Map<string, { collection: Collection; variable: Variable }>()
for (const collection of collections)
  for (const variable of collection.variables) byToken.set(variable.token, { collection, variable })

// Context keys and the attribute each one sets on the root.
const attributes = {
  theme: 'data-a63-theme',
  mode: 'data-a63-mode',
  brand: 'data-a63-brand',
  surface: 'data-a63-surface',
  designLanguage: 'data-a63-design-language',
  input: 'data-a63-input',
  density: 'data-a63-density',
  radius: 'data-a63-radius',
  typeScale: 'data-a63-type-scale',
  font: 'data-a63-font',
  windowSize: 'data-window-size',
} as const
type Context = Record<keyof typeof attributes, string>

const defaults: Context = {
  theme: 'modern',
  mode: 'light',
  brand: 'b1',
  surface: 'n1',
  designLanguage: 'web',
  input: 'pointer',
  density: 'comfortable',
  radius: 'default',
  typeScale: 'normal',
  font: 'sans',
  windowSize: 'md',
}

// Which context key picks the mode of each axis collection.
const collectionAxis: Record<string, keyof Context> = {
  'Atom63 Mode': 'mode',
  'Atom63 Brand': 'brand',
  'Atom63 Surface': 'surface',
  'Atom63 Design Language': 'designLanguage',
  'Atom63 Input': 'input',
  'Atom63 Density': 'density',
  'Atom63 Radius': 'radius',
  'Atom63 Type Scale': 'typeScale',
  'Atom63 Font': 'font',
  'Atom63 Window Size': 'windowSize',
}

function modeOf(collection: Collection, context: Context): string {
  if (collection.name === 'Atom63 Theme') return `${context.theme}-${context.mode}`
  const axis = collectionAxis[collection.name]
  return axis ? context[axis] : collection.modes[0]
}

/**
 * The value Figma shows for a token in a context, following aliases, and
 * whether the chain passed through a `computed` variable.
 */
function resolveInModel(
  token: string,
  context: Context,
  seen: string[] = []
): { value: Value['value']; approximate: boolean } {
  const found = byToken.get(token)
  if (!found) throw new Error(`${token} is not in the Figma sync model`)
  if (seen.includes(token)) throw new Error(`alias cycle: ${[...seen, token].join(' -> ')}`)
  const entry = found.variable.values[modeOf(found.collection, context)]
  if (entry?.alias) {
    const target = resolveInModel(entry.alias, context, [...seen, token])
    return { ...target, approximate: target.approximate || computedTokens.has(token) }
  }
  return { value: entry?.value, approximate: computedTokens.has(token) }
}

function applyContext(context: Context) {
  const element = root()
  for (const [key, attribute] of Object.entries(attributes))
    element.setAttribute(attribute, context[key as keyof Context])
  element.classList.remove('light', 'dark')
  element.classList.add(context.mode)
}

const probe = document.createElement('div')
document.body.append(probe)

/** Float sRGB, like the generator reads it: no 8-bit rounding. */
function browserColor(value: string): Rgba | null {
  probe.style.color = ''
  probe.style.color = `color(from ${value} srgb r g b / alpha)`
  if (!probe.style.color) return null
  const match = /^color\(srgb ([-\d.e]+) ([-\d.e]+) ([-\d.e]+)(?: \/ ([-\d.e]+))?\)$/.exec(
    getComputedStyle(probe).color
  )
  if (!match) return null
  const channel = (text: string) => Math.min(1, Math.max(0, Number(text)))
  return {
    r: channel(match[1]),
    g: channel(match[2]),
    b: channel(match[3]),
    a: channel(match[4] ?? '1'),
  }
}

function browserNumber(value: string): number | null {
  const trimmed = value.trim()
  const percent = /^(-?[\d.]+)%$/.exec(trimmed)
  if (percent) return Number(percent[1])
  if (/^-?[\d.]+$/.test(trimmed)) return Number(trimmed)
  const time = /^(-?[\d.]+)(ms|s)$/.exec(trimmed)
  if (time) return Number(time[1]) * (time[2] === 's' ? 1000 : 1)
  probe.style.width = ''
  probe.style.width = trimmed
  if (probe.style.width) return Number.parseFloat(getComputedStyle(probe).width)
  return null
}

const normalize = (text: string) => text.replace(/\s+/g, ' ').trim()

/** Differences between the model and the browser for these tokens in one context. */
function compare(context: Context, variables: Variable[]): string[] {
  applyContext(context)
  const styles = getComputedStyle(root())
  const label = `${context.theme}-${context.mode} ${Object.entries(context)
    .filter(
      ([key, value]) =>
        key !== 'theme' && key !== 'mode' && value !== defaults[key as keyof Context]
    )
    .map(([key, value]) => `${key}=${value}`)
    .join(' ')}`.trim()
  const differences: string[] = []
  for (const variable of variables) {
    const raw = styles.getPropertyValue(variable.token)
    const { value: expected, approximate } = resolveInModel(variable.token, context)
    if (approximate) continue
    if (variable.type === 'COLOR') {
      const web = browserColor(raw)
      const figma = expected as Rgba
      if (!web) continue
      const drift = Math.max(
        Math.abs(web.r - figma.r),
        Math.abs(web.g - figma.g),
        Math.abs(web.b - figma.b),
        Math.abs(web.a - figma.a)
      )
      if (drift > 1.5 / 255) differences.push(`${variable.token} @ ${label}`)
    } else if (variable.type === 'FLOAT') {
      const web = browserNumber(raw)
      if (web === null) continue
      if (Math.abs(web - (expected as number)) > 0.01)
        differences.push(`${variable.token} @ ${label}`)
    } else if (normalize(raw) !== normalize(String(expected))) {
      differences.push(`${variable.token} @ ${label}`)
    }
  }
  return differences
}

const allVariables = collections
  .flatMap(collection => collection.variables)
  .filter(variable => !computedTokens.has(variable.token))
const colorVariables = allVariables.filter(variable => variable.type === 'COLOR')

// Every mode of every axis on its own, and every theme × mode.
const axisContexts: Context[] = [defaults]
for (const collection of collections) {
  const axis = collectionAxis[collection.name]
  if (!axis) continue
  for (const mode of collection.modes)
    if (mode !== defaults[axis]) axisContexts.push({ ...defaults, [axis]: mode })
}
for (const theme of ['modern', 'aqua', 'retro', 'terminal'])
  for (const mode of ['light', 'dark']) axisContexts.push({ ...defaults, theme, mode })

// Colors: every theme × brand × surface × mode.
const colorContexts: Context[] = []
for (const theme of ['modern', 'aqua', 'retro', 'terminal'])
  for (const brand of ['b1', 'b2', 'b3', 'b4', 'b5', 'b6'])
    for (const surface of ['n1', 'n2', 'n3', 'n4', 'n5', 'n6'])
      for (const mode of ['light', 'dark'])
        colorContexts.push({ ...defaults, theme, brand, surface, mode })

beforeAll(async () => {
  await page.viewport(1280, 720)
})

afterEach(() => {
  resetRoot()
  for (const attribute of Object.values(attributes)) root().removeAttribute(attribute)
  root().classList.remove('light', 'dark')
})

/** Groups differences by token, listing the contexts where each one differs. */
function summarize(differences: string[]) {
  const byTokenName = new Map<string, string[]>()
  for (const difference of differences) {
    const [token, context] = difference.split(' @ ')
    byTokenName.set(token, [...(byTokenName.get(token) ?? []), context])
  }
  return Object.fromEntries(
    [...byTokenName].map(([token, contexts]) => [
      token,
      `${contexts.length}: ${contexts.slice(0, 3).join(' | ')}`,
    ])
  )
}

describe('Figma/web parity', () => {
  it('matches every variable on every axis', () => {
    const differences = axisContexts.flatMap(context => compare(context, allVariables))
    expect(summarize(differences)).toEqual({})
  })

  it('matches every color across theme × brand × surface × mode', () => {
    const differences = colorContexts.flatMap(context => compare(context, colorVariables))
    expect(summarize(differences)).toEqual({})
  })
})
