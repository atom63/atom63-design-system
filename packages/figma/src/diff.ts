/**
 * Figma → code: how a Figma file differs from the code tokens. Code is the
 * source, so the variables edited in Figma are the differences:
 * as a change list an agent (or a person) applies to the project's token CSS.
 * Code stays the source of truth, so nothing is written back automatically: the
 * list names the file, the selector and the value, and the edit happens in code,
 * where the agent can keep an alias an alias and change a calc() input instead of
 * its result. A sync after that brings Figma back in line.
 */
import type { ProjectModel, TokenSource } from './css-model'
import { isDerivedToken } from './derived'
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
  // A token is the same token in whichever collection the file holds it.
  const byToken = new Map(
    snapshot.flatMap(collection => collection.variables.map(item => [item.token, item] as const))
  )
  for (const collection of project.model.collections) {
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

export interface TokenDiff {
  /** Values that differ from the code, per token and mode. */
  changed: ProjectChange[]
  /** Variables with no code syntax: made in Figma, proposed as new tokens. */
  proposed: { collection: string; name: string; values: Record<string, SyncValue | undefined> }[]
  /** Code tokens the file does not have yet. */
  missing: { token: string; collection: string }[]
  /**
   * Variables standing for a token the code no longer has; kept, so no design
   * breaks. A component's derived variables (`color-mix(…)` code syntax) are
   * not tokens, so they are neither orphans nor proposals.
   */
  orphaned: { collection: string; name: string; token: string }[]
}

export function diffTokens(project: ProjectModel, figma: SnapshotCollection[]): TokenDiff {
  const tokensInCode = new Set(
    project.model.collections.flatMap(collection => collection.variables.map(item => item.token))
  )
  const tokensInFigma = new Set(
    figma.flatMap(collection => collection.variables.map(variable => variable.token))
  )
  return {
    changed: planChangeList(project, figma),
    proposed: figma.flatMap(collection =>
      collection.variables
        .filter(variable => variable.token === null)
        .map(variable => ({
          collection: collection.name,
          name: variable.name,
          values: variable.values,
        }))
    ),
    missing: project.model.collections.flatMap(collection =>
      collection.variables
        .filter(variable => !tokensInFigma.has(variable.token))
        .map(variable => ({ token: variable.token, collection: collection.name }))
    ),
    orphaned: figma.flatMap(collection =>
      collection.variables.flatMap(variable =>
        variable.token !== null &&
        !tokensInCode.has(variable.token) &&
        !isDerivedToken(variable.token)
          ? [{ collection: collection.name, name: variable.name, token: variable.token }]
          : []
      )
    ),
  }
}

/** The differences as a change list for an agent; empty when Figma matches the code. */
export function formatDiff(diff: TokenDiff): string {
  const parts = [formatChangeList(diff.changed).trimEnd()].filter(Boolean)
  if (diff.proposed.length > 0)
    parts.push(
      [
        '## Variables made in Figma',
        '',
        'These have no token in code. Add a token for each one the design keeps, then sync.',
        '',
        ...diff.proposed.map(
          item =>
            `- ${item.collection} / \`${item.name}\`: ${Object.entries(item.values)
              .map(([mode, value]) => `${mode} \`${formatValue(value)}\``)
              .join(', ')}`
        ),
      ].join('\n')
    )
  if (diff.orphaned.length > 0)
    parts.push(
      [
        '## Tokens the code no longer has',
        '',
        'Figma keeps these variables so no design loses a binding. Rebind designs, then delete them in Figma.',
        '',
        ...diff.orphaned.map(item => `- ${item.collection} / \`${item.name}\` (\`${item.token}\`)`),
      ].join('\n')
    )
  if (diff.missing.length > 0)
    parts.push(
      `## Not in Figma yet\n\n${diff.missing.length} tokens are missing from the file. Run the sync scripts.`
    )
  return parts.length > 0 ? `${parts.join('\n\n')}\n` : ''
}
