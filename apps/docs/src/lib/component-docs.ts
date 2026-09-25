import { componentContractMarkdown } from './component-contract'
import {
  componentCatalogGroupForSlug,
  componentCatalogItems,
  componentDocPath,
  componentDocSlug,
  componentLabel,
  type ComponentCatalogItem,
} from './component-catalog'

const groupGuidance: Record<string, readonly string[]> = {
  actions: [
    'Keep the semantic action or link element intact when composing custom content.',
    'Make loading, disabled, and destructive behavior explicit in the product flow.',
  ],
  'content-and-surfaces': [
    'Keep product data and fetching outside the presentational component.',
    'Test long, empty, and narrow content before adding local layout overrides.',
  ],
  'feedback-and-utilities': [
    'Keep the utility’s semantic purpose explicit instead of relying on visual treatment alone.',
    'For animated or transient members, preserve reduced-motion behavior and surrounding layout.',
  ],
  'forms-and-selection': [
    'Pair controls with persistent labels and explain errors beside the affected field.',
    'Validate focus visibility, disabled state, invalid state, and touch input together.',
  ],
  navigation: [
    'Preserve link, menu, command, or selection semantics instead of styling generic containers.',
    'Expose current location when applicable and verify alternate input paths at narrow widths.',
  ],
  overlays: [
    'When the family opens a surface, preserve its focus, Escape, and dismissal semantics.',
    'Check portal placement, stacking, and small-viewport containment in the consuming product.',
  ],
}

export type ComponentExportSurface = {
  types: string[]
  values: string[]
}

type ExportNames = ComponentExportSurface

function namesFromExportBlock(block: string): ExportNames {
  const types: string[] = []
  const values: string[] = []

  for (const rawEntry of block.split(',')) {
    const entry = rawEntry.replace(/\/\*[\s\S]*?\*\//g, '').trim()
    if (!entry) {
      continue
    }

    const isType = entry.startsWith('type ')
    const exportedName = entry
      .replace(/^type\s+/, '')
      .split(/\s+as\s+/)
      .at(-1)
      ?.trim()
    if (exportedName) {
      ;(isType ? types : values).push(exportedName)
    }
  }

  return { types, values }
}

function unique(names: readonly string[]): string[] {
  return [...new Set(names)]
}

function allPublicValueExports(source: string): Set<string> {
  const values: string[] = []

  for (const match of source.matchAll(/export\s+(type\s+)?\{([^}]*)\}\s+from\s+['"][^'"]+['"]/g)) {
    if (match[1]) {
      continue
    }
    values.push(...namesFromExportBlock(match[2] ?? '').values)
  }

  return new Set(values)
}

export function componentExportSurface(
  slug: string,
  uiReactIndexSource: string
): ComponentExportSurface {
  const types: string[] = []
  const values: string[] = []

  for (const match of uiReactIndexSource.matchAll(
    /export\s+(type\s+)?\{([^}]*)\}\s+from\s+['"]\.\/components\/([^'"]+)['"]/g
  )) {
    if (match[3] !== slug) {
      continue
    }

    const names = namesFromExportBlock(match[2] ?? '')
    if (match[1]) {
      types.push(...names.values, ...names.types)
    } else {
      values.push(...names.values)
      types.push(...names.types)
    }
  }

  const item = componentCatalogItems.find(candidate => candidate.slug === slug)
  if (item?.additionalValueExports) {
    const publicValues = allPublicValueExports(uiReactIndexSource)
    values.push(...item.additionalValueExports.filter(name => publicValues.has(name)))
  }

  return {
    types: unique(types),
    values: unique(values),
  }
}

export type ComponentDoc = {
  guidance: readonly string[]
  item: ComponentCatalogItem
  label: string
  path: string
  related: readonly ComponentCatalogItem[]
  slug: string
  summary: string
  usageExports: readonly string[]
}

export function getComponentDoc(slug: string): ComponentDoc | null {
  const item = componentCatalogItems.find(candidate => candidate.slug === slug)
  const group = componentCatalogGroupForSlug(slug)
  if (!item || !group) {
    return null
  }

  return {
    guidance: [item.usage, ...(groupGuidance[group.id] ?? [])],
    item,
    label: componentLabel(slug),
    path: componentDocPath(slug),
    related: item.relatedSlugs.flatMap(relatedSlug => {
      const related = componentCatalogItems.find(candidate => candidate.slug === relatedSlug)
      return related ? [related] : []
    }),
    slug,
    summary: item.summary,
    usageExports: item.usageExports,
  }
}

function markdownExportList(names: readonly string[]): string {
  return names.length > 0 ? names.map(name => `\`${name}\``).join(', ') : 'None.'
}

export function componentReferenceMarkdown(slug: string, uiReactIndexSource: string): string {
  const doc = getComponentDoc(slug)
  if (!doc) {
    return ''
  }

  const related = doc.related
    .map(item => `- [${componentLabel(item.slug)}](${componentDocPath(item.slug)})`)
    .join('\n')
  const exports = componentExportSurface(slug, uiReactIndexSource)
  const contract = componentContractMarkdown(slug)

  return `## Usage

\`\`\`tsx
import { ${doc.usageExports.join(', ')} } from '${doc.item.importPath}'
\`\`\`

## API surface

**Values:** ${markdownExportList(exports.values)}

**Types:** ${markdownExportList(exports.types)}

TypeScript remains the source of truth for complete prop contracts.
${contract ? `\n${contract}\n` : ''}
## Related components

${related}`
}

export function componentDocMarkdown(slug: string, uiReactIndexSource: string): string {
  const doc = getComponentDoc(slug)
  if (!doc) {
    return ''
  }

  const status = doc.item.status === 'stable' ? 'Stable' : 'Preview'
  const guidance = doc.guidance.map(item => `- ${item}`).join('\n')
  const reference = componentReferenceMarkdown(slug, uiReactIndexSource)

  return `# ${doc.label}

${doc.summary}

**Status:** ${status}

## Preview

The live documentation page renders the \`${doc.item.storyExport}\` story maintained with the component.

## Guidance

${guidance}

${reference}
`
}

export function isComponentDocSlug(slug: string): boolean {
  return componentCatalogItems.some(item => componentDocSlug(item.slug) === slug)
}
