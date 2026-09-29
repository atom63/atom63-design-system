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
