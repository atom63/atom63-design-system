import path from 'node:path'

/**
 * Pure checks for packages/templates (T5 in docs/design-system/template-library-plan.md).
 * check-templates.mjs reads the files; these functions only look at their text.
 */

export const KINDS = { blocks: 'block', pages: 'page' }
export const READINESS = ['draft', 'ready']
export const REQUIRED_STORIES = ['Desktop', 'Phone', 'Themes']
const METADATA_FIELDS = ['id', 'kind', 'title', 'description', 'category', 'tags', 'readiness']

/** Read the `export const template = { … } as const` literal from a template source. */
export function parseTemplateMetadata(source) {
  const match = source.match(/export const template = (\{[\s\S]*?\n\}) as const/)
  if (!match) return null
  try {
    return new Function(`return (${match[1]})`)()
  } catch {
    return null
  }
}

/** Every module specifier a source imports or re-exports. */
export function importSpecifiers(source) {
  const specifiers = []
  for (const match of source.matchAll(
    /(?:^|\n)\s*(?:import|export)\b[^'"]*?from\s+['"]([^'"]+)['"]/g
  )) {
    specifiers.push(match[1])
  }
  for (const match of source.matchAll(/(?:^|\n)\s*import\s+['"]([^'"]+)['"]/g)) {
    specifiers.push(match[1])
  }
  return specifiers
}

/**
 * A template may import only the design system, React, the icon set and
 * relative files inside the templates source; anything else is an app module
 * or a dependency a product would not have. `fromPath` is the importing file,
 * relative to packages/templates/src.
 */
export function isAllowedImport(specifier, fromPath) {
  if (specifier.startsWith('./') || specifier.startsWith('../')) {
    const target = path.posix.normalize(path.posix.join(path.posix.dirname(fromPath), specifier))
    return !target.startsWith('../')
  }
  return specifier === 'react' || specifier === 'lucide-react' || specifier.startsWith('@atom63/')
}

export function metadataProblems(metadata, { dir, id }) {
  if (!metadata) return ['has no `export const template = { … } as const` metadata']
  const problems = []
  for (const field of METADATA_FIELDS) {
    const value = metadata[field]
    const empty = Array.isArray(value)
      ? value.length === 0
      : typeof value !== 'string' || value === ''
    if (empty) problems.push(`metadata \`${field}\` is missing or empty`)
  }
  if (metadata.id && metadata.id !== id) {
    problems.push(`metadata id "${metadata.id}" does not match its folder "${id}"`)
  }
  if (metadata.kind && metadata.kind !== KINDS[dir]) {
    problems.push(`metadata kind "${metadata.kind}" should be "${KINDS[dir]}" in ${dir}/`)
  }
  if (metadata.readiness && !READINESS.includes(metadata.readiness)) {
    problems.push(
      `metadata readiness "${metadata.readiness}" is not one of ${READINESS.join(', ')}`
    )
  }
  return problems
}

export function storyProblems(storySource) {
  if (storySource === null) return ['has no stories file']
  return REQUIRED_STORIES.filter(
    name => !new RegExp(`export const ${name}\\b`).test(storySource)
  ).map(name => `stories file has no \`${name}\` story`)
}

/**
 * Check a set of templates. Each entry is { dir: 'blocks' | 'pages', id,
 * files: [{ path, source }], storySource: string | null }, with each path
 * relative to packages/templates/src. The template's own
 * file is `<id>.tsx`; every other non-story file in its folder is support code
 * held to the same import rule.
 */
export function checkTemplates(entries) {
  const problems = []
  const report = (entry, message) => problems.push(`${entry.dir}/${entry.id}: ${message}`)
  const usedBlocks = new Set()
  for (const entry of entries) {
    const main = entry.files.find(file => file.path.endsWith(`/${entry.id}.tsx`))
    if (!main) {
      report(entry, `has no ${entry.id}.tsx`)
      continue
    }
    for (const message of metadataProblems(parseTemplateMetadata(main.source), entry)) {
      report(entry, message)
    }
    for (const file of entry.files) {
      for (const specifier of importSpecifiers(file.source)) {
        if (!isAllowedImport(specifier, file.path)) {
          report(entry, `${file.path} imports "${specifier}"; use @atom63/*, react or lucide-react`)
        }
        const block = specifier.match(/\/blocks\/([^/]+)\//)
        if (entry.dir === 'pages' && block) usedBlocks.add(block[1])
      }
    }
    for (const message of storyProblems(entry.storySource)) report(entry, message)
  }
  for (const entry of entries) {
    if (entry.dir === 'blocks' && !usedBlocks.has(entry.id)) {
      report(entry, 'is not used by any page')
    }
  }
  return problems
}
