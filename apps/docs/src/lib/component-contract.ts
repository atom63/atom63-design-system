import { type A11yPatternBinding, getA11yPattern, visualArchetypes } from '@atom63/ui-foundation'

import contractIndex from '../../../../packages/ui-foundation/generated/component-contracts.json'
import type { ComponentStatus } from './component-catalog'

/**
 * Reads a component's contract for its docs page from
 * packages/ui-foundation/generated/component-contracts.json, which
 * scripts/generate-component-contracts.mjs writes from the JSON contract
 * sources with every list resolved, so the page cannot drift from the source
 * the components and the Swift renderer are generated from. The generator
 * decides which fields are axes and which default belongs to which axis.
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

type ResolvedContract = {
  accessibility?: A11yPatternBinding
  axes: ContractAxis[]
  crossRenderer?: CrossRendererDoc
  exportName: string
  maturity: ComponentStatus
  slots: string[]
  source: string
  states: string[]
  tokenSlots: string[]
  visualArchetypes: string[]
}

const contracts = (contractIndex as { components: Record<string, ResolvedContract> }).components

/** The APG pattern a contract binds to in its `accessibility` field, if any. */
function accessibilityDoc(
  binding: A11yPatternBinding | undefined
): AccessibilityPatternDoc | undefined {
  if (!binding) {
    return undefined
  }
  const pattern = getA11yPattern(binding.pattern)
  return {
    knownGaps: binding.knownGaps ?? [],
    name: pattern.name,
    options: Object.entries(binding.options ?? {}),
    source: pattern.source,
  }
}

/** The maturity a component's contract declares, if it has one. */
export function getComponentMaturity(slug: string): ComponentStatus | undefined {
  return contracts[slug]?.maturity
}

export function getComponentContractDoc(slug: string): ComponentContractDoc | null {
  const contract = contracts[slug]
  if (!contract) {
    return null
  }

  const archetypes = contract.visualArchetypes.flatMap(id => {
    const archetype = (visualArchetypes as Record<string, { description: string; label: string }>)[
      id
    ]
    return archetype ? [{ description: archetype.description, id, label: archetype.label }] : []
  })

  const shared = contract.crossRenderer
  const crossRenderer: CrossRendererDoc | undefined = shared && {
    accessibilityOutcomes: shared.accessibilityOutcomes,
    intent: shared.intent,
    parity: shared.parity,
    platformAdaptations: shared.platformAdaptations,
    requiredStates: shared.requiredStates,
    sharedOutcomes: shared.sharedOutcomes,
    swiftUIRenderer: shared.swiftUIRenderer,
  }

  const accessibility = accessibilityDoc(contract.accessibility)

  return {
    ...(accessibility ? { accessibility } : {}),
    archetypes,
    axes: contract.axes,
    ...(crossRenderer ? { crossRenderer } : {}),
    exportName: contract.exportName,
    slots: contract.slots,
    source: contract.source,
    states: contract.states,
    tokenSlots: contract.tokenSlots,
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
