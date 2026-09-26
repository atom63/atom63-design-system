import * as foundation from '@atom63/ui-foundation'
import {
  type A11yPatternBinding,
  getA11yPattern,
  getCrossRendererContract,
  crossRendererContracts,
  visualArchetypes,
} from '@atom63/ui-foundation'

/**
 * Reads a component's contract from @atom63/ui-foundation for its docs page,
 * so the page cannot drift from the source the components and the Swift
 * renderer are generated from.
 *
 * Contract objects follow one convention: every array is an axis, named in the
 * plural (`sizes`), whose default, when it has one, sits under
 * `default<Singular>` (`defaultSize`). `slots`, `states`, `tokenSlots` and
 * `visualArchetypes` are not props, so they get their own rows.
 */

export type ContractAxis = {
  default?: string
  name: string
  values: string[]
}

export type AccessibilityPatternDoc = {
  knownGaps: readonly { check: string; reason: string }[]
  name: string
  options: [option: string, value: string][]
  source: string
}

export type ComponentContractDoc = {
  accessibility?: AccessibilityPatternDoc
  archetypes: { description: string; id: string; label: string }[]
  axes: ContractAxis[]
  crossRenderer?: CrossRendererDoc
  exportName: string
  slots: string[]
  source: string
  states: string[]
  tokenSlots: string[]
}

export type CrossRendererDoc = {
  accessibilityOutcomes: readonly string[]
  intent: string
  parity: string
  platformAdaptations: { react: readonly string[]; swiftUI: readonly string[] }
  requiredStates: readonly string[]
  sharedOutcomes: readonly string[]
  swiftUIRenderer: string
}

const NON_AXIS_KEYS = new Set(['slots', 'states', 'tokenSlots', 'visualArchetypes'])

/** The APG pattern a contract binds to in its `accessibility` field, if any. */
function accessibilityDoc(value: unknown): AccessibilityPatternDoc | undefined {
  if (!value || typeof value !== 'object' || !('pattern' in value)) {
    return undefined
  }
  const binding = value as A11yPatternBinding
  const pattern = getA11yPattern(binding.pattern)
  return {
    knownGaps: binding.knownGaps ?? [],
    name: pattern.name,
    options: Object.entries(binding.options ?? {}),
    source: pattern.source,
  }
}

function camelCase(slug: string): string {
  return slug.replace(/-([a-z])/g, (_, letter: string) => letter.toUpperCase())
}

function stringValue(value: unknown): string {
  if (typeof value === 'string') {
    return value
  }
  if (value && typeof value === 'object') {
    return Object.values(value).map(String).join(' / ')
  }
  return String(value)
}

function strings(value: unknown): string[] {
  return Array.isArray(value) ? value.map(stringValue) : []
}

function defaultKey(axis: string): string {
  const singular = axis.endsWith('s') ? axis.slice(0, -1) : axis
  return `default${singular[0]?.toUpperCase()}${singular.slice(1)}`
}

const exports = foundation as Record<string, unknown>

const crossRendererIds = new Set<string>(crossRendererContracts.map(contract => contract.id))

export function getComponentContractDoc(slug: string): ComponentContractDoc | null {
  // Most exports are the camel-cased slug, but acronyms keep their case
  // (input-otp → inputOTPContract), so match without regard to case.
  const wanted = `${camelCase(slug)}Contract`.toLowerCase()
  const exportName = Object.keys(exports).find(name => name.toLowerCase() === wanted)
  const contract = exportName ? exports[exportName] : undefined
  if (!exportName || !contract || typeof contract !== 'object') {
    return null
  }
  const fields = contract as Record<string, unknown>
  const prefix = exportName.slice(0, -'Contract'.length)

  const axes: ContractAxis[] = Object.entries(fields)
    .filter(([key, value]) => Array.isArray(value) && !NON_AXIS_KEYS.has(key))
    .map(([name, values]) => {
      const fallback = fields[defaultKey(name)]
      return {
        name,
        values: strings(values),
        ...(fallback !== undefined ? { default: stringValue(fallback) } : {}),
      }
    })

  // A default whose values live outside the contract object: some contracts
  // keep the list as a sibling export (buttonSizes), others only fix a default.
  for (const [key, fallback] of Object.entries(fields)) {
    if (!key.startsWith('default')) continue
    const singular = key.slice('default'.length)
    const name = `${singular[0]?.toLowerCase()}${singular.slice(1)}s`
    if (axes.some(axis => axis.name === name)) continue
    axes.push({
      name,
      values: strings(exports[`${prefix}${singular}s`]),
      default: stringValue(fallback),
    })
  }

  const archetypes = strings(fields.visualArchetypes).flatMap(id => {
    const archetype = (visualArchetypes as Record<string, { description: string; label: string }>)[
      id
    ]
    return archetype ? [{ description: archetype.description, id, label: archetype.label }] : []
  })

  let crossRenderer: CrossRendererDoc | undefined
  if (crossRendererIds.has(slug)) {
    const shared = getCrossRendererContract(slug as Parameters<typeof getCrossRendererContract>[0])
    crossRenderer = {
      accessibilityOutcomes: shared.accessibilityOutcomes,
      intent: shared.intent,
      parity: shared.parity,
      platformAdaptations: shared.platformAdaptations,
      requiredStates: shared.requiredStates,
      sharedOutcomes: shared.sharedOutcomes,
      swiftUIRenderer: shared.swiftUIRenderer,
    }
  }

  const accessibility = accessibilityDoc(fields.accessibility)

  return {
    ...(accessibility ? { accessibility } : {}),
    archetypes,
    axes,
    ...(crossRenderer ? { crossRenderer } : {}),
    exportName,
    slots: strings(fields.slots),
    source: `packages/ui-foundation/src/components/${slug}/${slug}-contract.ts`,
    states: strings(fields.states),
    tokenSlots: strings(fields.tokenSlots),
  }
}

/** Kebab-case outcome ids read as sentences: `focus-is-not-trapped` → "Focus is not trapped". */
export function outcomeLabel(outcome: string): string {
  const words = outcome.replaceAll('-', ' ')
  return words[0]?.toUpperCase() + words.slice(1)
}

/** The option values a component picks: ` (activation: manual)`, or empty. */
export function patternOptionsLabel(pattern: AccessibilityPatternDoc): string {
  const options = pattern.options.map(([option, value]) => `${option}: ${value}`).join(', ')
  return options ? ` (${options})` : ''
}

function codeList(values: readonly string[]): string {
  return values.length > 0 ? values.map(value => `\`${value}\``).join(', ') : '—'
}

export function componentContractMarkdown(slug: string): string {
  const doc = getComponentContractDoc(slug)
  if (!doc) {
    return ''
  }

  const rows = doc.axes.map(
    axis =>
      `| \`${axis.name}\` | ${codeList(axis.values)} | ${axis.default ? `\`${axis.default}\`` : '—'} |`
  )
  const lines = [
    '## Contract',
    '',
    `Source: \`${doc.source}\` (\`${doc.exportName}\` in \`@atom63/ui-foundation\`).`,
    '',
  ]
  if (rows.length > 0) {
    lines.push('| Axis | Values | Default |', '| --- | --- | --- |', ...rows, '')
  }
  if (doc.slots.length > 0) lines.push(`**Slots:** ${codeList(doc.slots)}`, '')
  if (doc.states.length > 0) lines.push(`**States:** ${codeList(doc.states)}`, '')
  if (doc.tokenSlots.length > 0) lines.push(`**Token slots:** ${codeList(doc.tokenSlots)}`, '')
  if (doc.archetypes.length > 0) {
    lines.push(
      `**Visual archetype:** ${doc.archetypes.map(item => `${item.label} — ${item.description}`).join('; ')}`,
      ''
    )
  }

  const pattern = doc.accessibility
  if (pattern) {
    lines.push(
      `**Accessibility pattern:** [${pattern.name}](${pattern.source})${patternOptionsLabel(pattern)}`,
      ''
    )
    for (const gap of pattern.knownGaps) {
      lines.push(`- Known gap (\`${gap.check}\`): ${gap.reason}`)
    }
    if (pattern.knownGaps.length > 0) lines.push('')
  }

  const shared = doc.crossRenderer
  if (shared) {
    lines.push(
      '### Web and iOS',
      '',
      `${shared.intent} Rendered by \`${shared.swiftUIRenderer}\` in SwiftUI, with \`${shared.parity}\` parity.`,
      '',
      `**Required states:** ${codeList(shared.requiredStates)}`,
      '',
      '**Shared outcomes:**',
      '',
      ...shared.sharedOutcomes.map(outcome => `- ${outcomeLabel(outcome)}`),
      '',
      '**Accessibility outcomes:**',
      '',
      ...shared.accessibilityOutcomes.map(outcome => `- ${outcomeLabel(outcome)}`),
      '',
      '**Platform adaptations:**',
      '',
      ...shared.platformAdaptations.react.map(item => `- React: ${item}`),
      ...shared.platformAdaptations.swiftUI.map(item => `- SwiftUI: ${item}`),
      ''
    )
  }

  return lines.join('\n').trimEnd()
}
