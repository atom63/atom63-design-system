/**
 * Project mode, Figma → code: the variables edited in Figma since the last sync,
 * as a change list an agent (or a person) applies to the project's token CSS.
 * Code stays the source of truth, so nothing is written back automatically: the
 * list names the file, the selector and the value, and the edit happens in code,
 * where the agent can keep an alias an alias and change a calc() input instead of
 * its result. A sync after that brings Figma back in line.
 */
import type { ProjectModel, TokenSource } from './css-model'
import type { SnapshotCollection, SyncColor, SyncValue } from './plan'
import { valuesEqual } from './plan'

export interface ProjectChange {
  token: string
  name: string
  collection: string
  mode: string
  source: TokenSource | undefined
  from: SyncValue
  to: SyncValue | undefined
}

export function planChangeList(
  project: ProjectModel,
  snapshot: SnapshotCollection[]
): ProjectChange[] {
  const changes: ProjectChange[] = []
  for (const collection of project.model.collections) {
    const current = snapshot.find(item => item.name === collection.name)
    if (!current) continue
    const byToken = new Map(current.variables.map(item => [item.token, item]))
    for (const variable of collection.variables) {
      const actual = byToken.get(variable.token)
      if (!actual) continue
      for (const mode of collection.modes) {
        const from = variable.values[mode]
        const to = actual.values[mode]
        if (!from || valuesEqual(from, to)) continue
        changes.push({
          token: variable.token,
          name: variable.name,
          collection: collection.name,
          mode,
          source: project.sources[variable.token]?.[mode],
          from,
          to,
        })
      }
    }
  }
  return changes
}

function channel(value: number): number {
  return Math.round(Math.min(1, Math.max(0, value)) * 255)
}

function formatColor(color: SyncColor): string {
  const [r, g, b] = [color.r, color.g, color.b].map(channel)
  if (color.a >= 0.999)
    return `#${[r, g, b].map(item => item.toString(16).padStart(2, '0')).join('')}`
  return `rgb(${r} ${g} ${b} / ${Math.round(color.a * 1000) / 1000})`
}

/** A value as CSS. Numbers keep px when the code writes a length. */
export function formatValue(value: SyncValue | undefined, source?: TokenSource): string {
  if (!value) return '(no value)'
  if ('alias' in value) return `var(${value.alias})`
  if ('composed' in value)
    return `color-mix(in srgb, var(${value.composed.alias}) ${value.composed.opacity}%, transparent)`
  if (typeof value.value === 'number') {
    const length = source ? /px|rem|calc\(/.test(source.expression) : false
    return length ? `${value.value}px` : String(value.value)
  }
  if (typeof value.value === 'string') return value.value
  return formatColor(value.value)
}

export function formatChangeList(changes: ProjectChange[]): string {
  if (changes.length === 0) return ''
  const lines = [
    '# Token changes from Figma',
    '',
    'Apply these to the token CSS in src/styles/tokens. Keep a var() reference where the',
    'new value is another token, and where the code computes a value (calc()), change the',
    'input that gives the new result instead of writing the result in.',
    '',
  ]
  for (const change of changes) {
    const where = change.source
      ? `\`${change.source.file}\`, \`${change.source.selector}\``
      : `${change.collection} (${change.mode})`
    const computed =
      change.source &&
      !/^var\([^()]*\)$/.test(change.source.expression) &&
      /calc\(|var\(|color-mix\(|from /.test(change.source.expression)
        ? ` The code has \`${change.source.expression}\`.`
        : ''
    lines.push(
      `- ${where}: set \`${change.token}\` to \`${formatValue(change.to, change.source)}\` (now \`${formatValue(change.from, change.source)}\`).${computed}`
    )
  }
  return `${lines.join('\n')}\n`
}
