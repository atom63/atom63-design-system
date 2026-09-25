/**
 * Pure helpers for `pnpm ds:new`: names, the registry insertions a new
 * component needs, and the files it starts from. Every insertion throws when
 * its anchor is missing, so a registry that changes shape breaks the scaffold
 * loudly (the CI dry run catches it) instead of producing a half-wired
 * component.
 */

/** @param {string} slug kebab-case component name, e.g. `stat-meter` */
export function componentNames(slug) {
  if (!/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/.test(slug)) {
    throw new Error(`"${slug}" is not a kebab-case component name (e.g. stat-meter)`)
  }
  const parts = slug.split('-')
  const pascal = parts.map(part => part[0].toUpperCase() + part.slice(1)).join('')
  return { slug, pascal, camel: pascal[0].toLowerCase() + pascal.slice(1) }
}

const EXPORT_STATEMENT = /^export (?:type )?\{[\s\S]*?\} from '([^']+)'\n/gm

/**
 * Insert `block` among the `export … from '<path>'` statements whose path
 * `familyOf` recognises, before the first family that sorts after `slug`.
 * @param {string} source
 * @param {string} slug
 * @param {string} block
 * @param {(path: string) => string | null} familyOf
 */
export function insertExportBlock(source, slug, block, familyOf) {
  let insertAt = -1
  let lastFamilyEnd = -1
  for (const match of source.matchAll(EXPORT_STATEMENT)) {
    const family = familyOf(match[1])
    if (family === null) continue
    if (family === slug) throw new Error(`exports for "${slug}" already exist`)
    lastFamilyEnd = match.index + match[0].length
    if (insertAt === -1 && family > slug) insertAt = match.index
  }
  if (lastFamilyEnd === -1) throw new Error('found no component export statements to sort among')
  const at = insertAt === -1 ? lastFamilyEnd : insertAt
  return source.slice(0, at) + block + source.slice(at)
}

export const foundationFamily = path =>
  path.match(/^\.\/components\/([a-z0-9-]+)\/\1-contract$/)?.[1] ?? null
export const reactFamily = path => path.match(/^\.\/components\/([a-z0-9-]+)$/)?.[1] ?? null

/** Add `./recipes/<slug>.css` to the package exports, in order among the recipes. */
export function insertRecipeExport(packageJsonText, slug) {
  const pkg = JSON.parse(packageJsonText)
  const key = `./recipes/${slug}.css`
  if (key in pkg.exports) throw new Error(`${key} is already exported`)
  const entries = Object.entries(pkg.exports)
  const recipeIndexes = entries.flatMap(([name], index) =>
    name.startsWith('./recipes/') ? [index] : []
  )
  if (recipeIndexes.length === 0) throw new Error('package.json has no ./recipes/* exports')
  const after = recipeIndexes.find(index => entries[index][0] > key)
  const at = after ?? recipeIndexes.at(-1) + 1
  entries.splice(at, 0, [key, `./src/components/${slug}/${slug}.css`])
  pkg.exports = Object.fromEntries(entries)
  return `${JSON.stringify(pkg, null, 2)}\n`
}

/** Append the recipe to recipes.css after the last component import. */
export function appendRecipeImport(css, slug) {
  const line = `@import '../components/${slug}/${slug}.css' layer(components);\n`
  const imports = [...css.matchAll(/^@import '\.\.\/components\/[^']+' layer\(components\);\n/gm)]
  if (imports.length === 0) throw new Error('recipes.css has no component imports')
  const last = imports.at(-1)
  const at = last.index + last[0].length
  return css.slice(0, at) + line + css.slice(at)
}

/** Add the component to its visual archetype's `components` list. */
export function addToArchetype(source, archetype, pascal) {
  const block = new RegExp(`^  ${archetype}: \\{[\\s\\S]*?^  \\},?$`, 'm').exec(source)
  if (!block) throw new Error(`unknown visual archetype "${archetype}"`)
  const list = /components: \[([\s\S]*?)\]/.exec(block[0])
  if (!list) throw new Error(`archetype "${archetype}" has no components list`)
  const names = [...list[1].matchAll(/'([^']+)'/g)].map(match => match[1])
  if (names.includes(pascal)) throw new Error(`${pascal} is already in the ${archetype} archetype`)
  const updated = block[0].replace(
    list[0],
    `components: [${[...names, pascal].map(name => `'${name}'`).join(', ')}]`
  )
  return source.slice(0, block.index) + updated + source.slice(block.index + block[0].length)
}

/** The ids of the visual archetypes, in declaration order. */
export function archetypeIds(source) {
  return [...source.matchAll(/^ {2}([a-z]+): \{\n {4}id: '\1',/gm)].map(match => match[1])
}

/**
 * Insert a `componentDefinitions` entry in alphabetical order.
 * @param {string} source component-catalog.ts
 * @param {string} slug
 * @param {{ relatedSlugs: string[], summary: string, usage: string, usageExports: string[] }} definition
 */
export function insertCatalogDefinition(source, slug, definition) {
  const start = source.indexOf('const componentDefinitions')
  if (start === -1) throw new Error('component-catalog.ts has no componentDefinitions')
  const end = source.indexOf('\n}', start)
  const keys = [...source.slice(start, end).matchAll(/^ {2}'?([a-z0-9-]+)'?: \{$/gm)]
  if (keys.some(key => key[1] === slug)) throw new Error(`catalog already defines "${slug}"`)
  const next = keys.find(key => key[1] > slug)
  const quote = value => `'${value.replaceAll('\\', '\\\\').replaceAll("'", "\\'")}'`
  const key = slug.includes('-') ? quote(slug) : slug
  const entry = [
    `  ${key}: {`,
    `    relatedSlugs: [${definition.relatedSlugs.map(quote).join(', ')}],`,
    `    summary: ${quote(definition.summary)},`,
    `    usage: ${quote(definition.usage)},`,
    `    usageExports: [${definition.usageExports.map(quote).join(', ')}],`,
    '  },',
    '',
  ].join('\n')
  const at = next ? start + next.index : end + 1
  return source.slice(0, at) + entry + source.slice(at)
}

/** The slugs `componentDefinitions` already knows. */
export function catalogSlugs(source) {
  const start = source.indexOf('const componentDefinitions')
  const end = source.indexOf('\n}', start)
  return [...source.slice(start, end).matchAll(/^ {2}'?([a-z0-9-]+)'?: \{$/gm)].map(
    match => match[1]
  )
}

/** The catalog group ids, from `components('<id>', [...])`. */
export function catalogCategories(source) {
  return [...source.matchAll(/components\('([a-z-]+)', \[/g)].map(match => match[1])
}

/** Add the slug to a catalog group's list, alphabetically. */
export function insertCatalogGroupSlug(source, category, slug) {
  const open = source.indexOf(`components('${category}', [`)
  if (open === -1) throw new Error(`unknown catalog category "${category}"`)
  const listStart = source.indexOf('[', open) + 1
  const listEnd = source.indexOf(']', listStart)
  const slugs = [...source.slice(listStart, listEnd).matchAll(/'([a-z0-9-]+)'/g)].map(
    match => match[1]
  )
  const sorted = [...slugs, slug].sort()
  const indent = /\n(\s*)'/.exec(source.slice(listStart, listEnd))?.[1] ?? '      '
  const body = `\n${sorted.map(item => `${indent}'${item}',`).join('\n')}\n${indent.slice(2)}`
  return source.slice(0, listStart) + body + source.slice(listEnd)
}

/* ── Files ───────────────────────────────────────────────────────────────── */

export function contractFile({ camel, pascal, slug }, archetype) {
  return `import type { VisualArchetypeId } from '../../visual-archetypes'

export const ${camel}Sizes = ['sm', 'md'] as const
export const ${camel}Slots = ['${slug}'] as const
export const ${camel}States = ['rest'] as const
export const ${camel}VisualArchetypes = ['${archetype}'] as const satisfies readonly VisualArchetypeId[]

export type ${pascal}Size = (typeof ${camel}Sizes)[number]
export type ${pascal}Slot = (typeof ${camel}Slots)[number]
export type ${pascal}State = (typeof ${camel}States)[number]
export type ${pascal}VisualArchetype = (typeof ${camel}VisualArchetypes)[number]

export interface ${pascal}Contract {
  defaultSize: ${pascal}Size
  sizes: readonly ${pascal}Size[]
  slots: readonly ${pascal}Slot[]
  states: readonly ${pascal}State[]
  visualArchetypes: readonly ${pascal}VisualArchetype[]
}

export const ${camel}Contract = {
  defaultSize: 'md',
  sizes: ${camel}Sizes,
  slots: ${camel}Slots,
  states: ${camel}States,
  visualArchetypes: ${camel}VisualArchetypes,
} satisfies ${pascal}Contract
`
}

export function foundationExportBlock({ camel, pascal, slug }) {
  const path = `./components/${slug}/${slug}-contract`
  return `export {
  ${camel}Contract,
  ${camel}Sizes,
  ${camel}Slots,
  ${camel}States,
  ${camel}VisualArchetypes,
} from '${path}'
export type {
  ${pascal}Contract,
  ${pascal}Size,
  ${pascal}Slot,
  ${pascal}State,
  ${pascal}VisualArchetype,
} from '${path}'
`
}

export function reactExportBlock({ pascal, slug }) {
  return `export { ${pascal} } from './components/${slug}'
export type { ${pascal}Props } from './components/${slug}'
`
}

export function componentFile({ camel, pascal, slug }) {
  return `import { type ${pascal}Size, ${camel}Contract } from '@atom63/ui-foundation'
import type * as React from 'react'

import { cn } from '../../lib/cn'

export type ${pascal}Props = React.ComponentProps<'div'> & {
  size?: ${pascal}Size
}

/* TODO(ds:new): describe what ${pascal} is for and what it is not for. */
export function ${pascal}({
  className,
  size = ${camel}Contract.defaultSize,
  ...props
}: ${pascal}Props): React.ReactElement {
  return (
    <div className={cn('a63-${pascal}', className)} data-size={size} data-slot="${slug}" {...props} />
  )
}
`
}

export function componentIndexFile({ pascal, slug }) {
  return `export { ${pascal} } from './${slug}'
export type { ${pascal}Props } from './${slug}'
`
}

export function recipeFile({ pascal }, archetype) {
  return `/*
 * ${pascal} recipe — the ${archetype.toUpperCase()} archetype. TODO(ds:new): name the
 * contract levers it reads. Tokens only: no literal colors, logical directions,
 * and focus styles on :focus-visible (\`pnpm check:craft\`).
 */

.a63-${pascal} {
  box-sizing: border-box;
  display: flex;
  align-items: center;
  gap: var(--a63-space-2);
  padding-block: var(--a63-space-2);
  padding-inline: var(--a63-space-3);
  border: var(--a63-control-border-width) solid var(--a63-border-subtle);
  border-radius: var(--a63-control-radius);
  background-color: var(--a63-surface-panel);
  color: var(--a63-text-primary);
  font-size: var(--a63-control-font-size-md);
}

.a63-${pascal}[data-size='sm'] {
  padding-block: var(--a63-space-1);
  padding-inline: var(--a63-space-2);
  font-size: var(--a63-control-font-size-sm);
}
`
}

export function storyFile({ camel, pascal }) {
  return `import { ${camel}Sizes, themes } from '@atom63/ui-foundation'
import { ${pascal}, UIProvider } from '@atom63/ui-react'
import '@atom63/ui-react/styles.css'
import type { Meta, StoryObj } from '@storybook/react-vite'

const meta = {
  title: 'UI React/${pascal}',
  component: ${pascal},
  argTypes: {
    size: { control: 'inline-radio', options: ${camel}Sizes },
  },
  args: { children: '${pascal}', size: 'md' },
} satisfies Meta<typeof ${pascal}>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
      {${camel}Sizes.map(size => (
        <${pascal} key={size} size={size}>
          {size}
        </${pascal}>
      ))}
    </div>
  ),
}

export const Themes: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 12 }}>
      {themes.map(theme =>
        (['light', 'dark'] as const).map(mode => (
          <UIProvider key={\`\${theme}-\${mode}\`} mode={mode} theme={theme}>
            <div style={{ background: 'var(--a63-surface-page)', padding: '0.75rem' }}>
              <${pascal}>
                {theme} / {mode}
              </${pascal}>
            </div>
          </UIProvider>
        ))
      )}
    </div>
  ),
}
`
}

export function testFile({ camel, pascal, slug }) {
  return `import { ${camel}Contract } from '@atom63/ui-foundation'
import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { ${pascal} } from './${slug}'

describe('${pascal}', () => {
  it('renders its slot with the default size', () => {
    const { container } = render(<${pascal}>Content</${pascal}>)
    const element = container.querySelector('[data-slot="${slug}"]')
    expect(element).toHaveAttribute('data-size', ${camel}Contract.defaultSize)
    expect(element).toHaveTextContent('Content')
  })

  it('applies the given size', () => {
    const { container } = render(<${pascal} size="sm">Content</${pascal}>)
    expect(container.querySelector('[data-slot="${slug}"]')).toHaveAttribute('data-size', 'sm')
  })
})
`
}

export function changesetFile({ pascal }, summary) {
  return `---
'@atom63/ui-foundation': minor
'@atom63/ui-react': minor
---

Add ${pascal}. ${summary}
`
}

/* ── iOS (cross-renderer) tier ───────────────────────────────────────────── */

/** The iOS demo catalog section for each docs catalog category. */
export const iosSectionForCategory = {
  actions: 'actions',
  'forms-and-selection': 'forms',
  navigation: 'navigation',
  overlays: 'actions',
  'content-and-surfaces': 'content',
  'feedback-and-utilities': 'feedback',
}

/** The iOS demo catalog sections, from `enum CatalogSection`. */
export function demoSections(source) {
  const start = source.indexOf('enum CatalogSection')
  if (start === -1) throw new Error('CatalogRegistry.swift has no CatalogSection enum')
  const end = source.indexOf('\n}', start)
  return [...source.slice(start, end).matchAll(/^ {2}case ([a-zA-Z]+)(?: = |$)/gm)].map(
    match => match[1]
  )
}

/** The shared outcomes a scaffolded contract starts with. */
export const scaffoldOutcomes = {
  shared: ['content-remains-readable'],
  accessibility: ['exposes-content-as-text'],
}

/** Append a cross-renderer contract to the JSON source. */
export function addCrossRendererContract(jsonText, { camel, pascal, slug }, intent) {
  const source = JSON.parse(jsonText)
  if (source.contracts.some(contract => contract.id === slug)) {
    throw new Error(`cross-renderer contract "${slug}" already exists`)
  }
  source.contracts.push({
    id: slug,
    foundationContract: slug,
    foundationAxis: 'states',
    catalogItem: camel,
    reactRenderer: pascal,
    swiftUIRenderer: `Atom${pascal}`,
    intent,
    parity: 'strict',
    requiredStates: ['rest'],
    sharedOutcomes: scaffoldOutcomes.shared,
    accessibilityOutcomes: scaffoldOutcomes.accessibility,
    platformAdaptations: {
      react: ['TODO(ds:new): how the web renderer adapts the shared intent.'],
      swiftUI: ['TODO(ds:new): how the SwiftUI renderer adapts the shared intent.'],
    },
  })
  return `${JSON.stringify(source, null, 2)}\n`
}

/** Add React conformance evidence before the end of `reactRendererConformance`. */
export function addReactConformance(source, { slug }) {
  const end = source.indexOf('] as const satisfies readonly ReactRendererConformanceEvidence[]')
  if (end === -1) throw new Error('renderer-conformance.ts has no reactRendererConformance list')
  const entry = `  {
    contractId: '${slug}',
    implementedStates: ['rest'],
    verifiedSharedOutcomes: [${scaffoldOutcomes.shared.map(item => `'${item}'`).join(', ')}],
    verifiedAccessibilityOutcomes: [${scaffoldOutcomes.accessibility.map(item => `'${item}'`).join(', ')}],
    verifiesMotionRecipe: false,
  },
`
  return source.slice(0, end) + entry + source.slice(end)
}

/** Add SwiftUI conformance evidence before the end of `AtomRendererConformance.verified`. */
export function addSwiftConformance(source, { slug }) {
  const start = source.indexOf('public static let verified: [AtomRendererConformanceEvidence] = [')
  if (start === -1) throw new Error('AtomRendererConformance.swift has no verified list')
  const end = source.indexOf('\n  ]\n', start)
  if (end === -1) throw new Error('cannot find the end of AtomRendererConformance.verified')
  const list = values => `[${values.map(value => `"${value}"`).join(', ')}]`
  const entry = `
    AtomRendererConformanceEvidence(
      contractId: "${slug}",
      implementedStates: ["rest"],
      verifiedSharedOutcomes: ${list(scaffoldOutcomes.shared)},
      verifiedAccessibilityOutcomes: ${list(scaffoldOutcomes.accessibility)},
      verifiesMotionRecipe: false
    ),`
  return source.slice(0, end) + entry + source.slice(end)
}

const swiftString = value => JSON.stringify(value)

/**
 * Add a catalog item to the iOS demo: an enum case plus a case in each of the
 * `switch self` properties, placed before each switch's closing brace.
 */
export function addDemoCatalogItem(source, { camel, pascal }, { section, symbol, summary }) {
  const enumStart = source.indexOf('enum CatalogItem:')
  if (enumStart === -1) throw new Error('CatalogRegistry.swift has no CatalogItem enum')
  const cases = [...source.slice(enumStart).matchAll(/^ {2}case ([a-zA-Z]+)$/gm)]
  if (cases.some(match => match[1] === camel))
    throw new Error(`catalog item "${camel}" already exists`)
  const lastCase = cases.at(-1)
  const caseAt = enumStart + lastCase.index + lastCase[0].length
  let next = `${source.slice(0, caseAt)}\n  case ${camel}${source.slice(caseAt)}`

  const values = {
    section: `.${section}`,
    title: swiftString(pascal.replace(/([a-z])([A-Z])/g, '$1 $2')),
    symbol: swiftString(symbol),
    summary: swiftString(summary),
    typeName: swiftString(`Atom${pascal}`),
    usage: swiftString(`Atom${pascal} { Text("Content") }`),
  }
  for (const [property, value] of Object.entries(values)) {
    const header = new RegExp(
      `^ {2}var ${property}: [A-Za-z]+ \\{\\n {4}switch self \\{\\n`,
      'm'
    ).exec(next)
    if (!header) throw new Error(`CatalogItem has no switch for "${property}"`)
    const close = next.indexOf('\n    }\n', header.index)
    next = `${next.slice(0, close)}\n    case .${camel}:\n      ${value}${next.slice(close)}`
  }
  return next
}

/** Route the new catalog item to its showcase and append a starter showcase view. */
export function addDemoShowcase(source, { camel, pascal }) {
  const header = source.indexOf('  var body: some View {\n    switch item {\n')
  if (header === -1) throw new Error('CatalogShowcases.swift has no `switch item` body')
  const close = source.indexOf('\n    }\n', header)
  const routed = `${source.slice(0, close)}\n    case .${camel}:\n      ${pascal}Showcase()${source.slice(close)}`
  return `${routed.trimEnd()}

private struct ${pascal}Showcase: View {
  var body: some View {
    Atom${pascal} {
      Text("${pascal.replace(/([a-z])([A-Z])/g, '$1 $2')}")
    }
  }
}
`
}

export function swiftViewFile({ pascal }) {
  return `import SwiftUI

/// TODO(ds:new): describe what Atom${pascal} is for. Mirrors \`${pascal}\` in
/// \`@atom63/ui-react\`; the shared intent lives in the cross-renderer contract.
public struct Atom${pascal}<Content: View>: View {
  @Environment(\\.atomTheme) private var theme
  @Environment(\\.colorScheme) private var colorScheme

  private let content: Content

  public init(@ViewBuilder content: () -> Content) {
    self.content = content()
  }

  public var body: some View {
    content
      .foregroundStyle(theme.colors.textPrimary.resolve(for: colorScheme))
      .padding(.horizontal, AtomTokens.Space.x3)
      .padding(.vertical, AtomTokens.Space.x2)
      .background(theme.colors.surfacePanel.resolve(for: colorScheme))
      .overlay {
        RoundedRectangle(cornerRadius: AtomTokens.Radius.medium)
          .strokeBorder(theme.colors.borderSubtle.resolve(for: colorScheme), lineWidth: 1)
      }
      .clipShape(.rect(cornerRadius: AtomTokens.Radius.medium))
  }
}
`
}
