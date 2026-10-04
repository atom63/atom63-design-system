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
    return value && 'value' in value && typeof value.value === 'object'
      ? css(value.value)
      : undefined
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
