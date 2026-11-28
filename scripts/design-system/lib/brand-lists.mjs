/**
 * The brand ids (b1, b2, …) are listed by hand in several renderers, tests and
 * docs. The source is the brand ramp resolver: one context per brand, plus
 * `auto`. brandListProblems() reports every list that disagrees with it, so
 * adding a brand cannot miss one (docs/design-system/theme-authoring.md,
 * "Adding a brand").
 */
import { readFileSync } from 'node:fs'
import path from 'node:path'

export const brandSource = 'packages/styles/src/tokens/brand-ramp.resolver.json'

/** Quoted brand ids, such as 'b1', in a list's source text. */
const ids = text => [...text.matchAll(/'(b\d+)'/g)].map(match => match[1])

/** Each hand-written list: the file and how to read its brand ids from the source text. */
export const brandLists = [
  {
    file: 'packages/styles/src/tokens/foundation/primitives.tokens.json',
    read: text => Object.keys(JSON.parse(text).color).filter(key => /^b\d+$/.test(key)),
  },
  {
    file: 'packages/ui-foundation/src/axes.ts',
    read: text => ids(/attribute: 'data-a63-brand',\s*values: \[([^\]]*)\]/.exec(text)?.[1] ?? ''),
  },
  {
    file: 'packages/styles/scripts/generate-figma-sync.mjs',
    read: text =>
      ids(/attribute: 'data-a63-brand',[^}]*?modes: \[([^\]]*)\]/.exec(text)?.[1] ?? ''),
  },
  {
    file: 'packages/ui-ios/Scripts/lib/theme-graph.mjs',
    read: text => ids(/export const brands = \[([^\]]*)\]/.exec(text)?.[1] ?? ''),
  },
  {
    file: 'packages/styles/src/tokens/contrast.browser.test.ts',
    read: text => ids(/const brands = \[([^\]]*)\]/.exec(text)?.[1] ?? ''),
  },
  {
    file: 'packages/styles/src/tokens/figma-parity.browser.test.ts',
    read: text => ids(/for \(const brand of \[([^\]]*)\]\)/.exec(text)?.[1] ?? ''),
  },
  {
    file: 'apps/storybook/stories/tokens/color-primitives.stories.tsx',
    read: text => ids(/const BRAND_SCALES = \[([^\]]*)\]/.exec(text)?.[1] ?? ''),
  },
  {
    file: 'apps/docs/src/foundation/token-meta.ts',
    read: text => ids(/BRAND_SCALES = \[([\s\S]*?)\] as const/.exec(text)?.[1] ?? ''),
  },
  {
    file: 'apps/docs/src/components/foundation/brand-scale-row.tsx',
    read: text =>
      [...(/BRAND_500[^{]*\{([^}]*)\}/.exec(text)?.[1] ?? '').matchAll(/(b\d+):/g)].map(
        match => match[1]
      ),
  },
]

/** Brand ids from the ramp resolver, without `auto`. */
export function sourceBrands(text) {
  return Object.keys(JSON.parse(text).modifiers.brand.contexts).filter(id => id !== 'auto')
}

/**
 * Compares every list with the source. `readText(file)` returns a file's text,
 * relative to the repository root.
 */
export function brandListProblems(readText) {
  const expected = sourceBrands(readText(brandSource))
  const problems = []
  const sorted = list => [...new Set(list)].sort().join(', ')
  for (const { file, read } of brandLists) {
    const found = read(readText(file))
    if (sorted(found) !== sorted(expected) || found.length !== expected.length) {
      problems.push(
        `${file}: brands [${found.join(', ')}] differ from ${brandSource} [${expected.join(', ')}]`
      )
    }
  }
  // brand-action holds per-brand exceptions, so it may list fewer brands, never others.
  const actionFile = 'packages/styles/src/tokens/brand-action.resolver.json'
  for (const id of sourceBrands(readText(actionFile))) {
    if (!expected.includes(id))
      problems.push(`${actionFile}: ${id} is not a brand in ${brandSource}`)
  }
  return problems
}

export function readRepoText(root) {
  return file => readFileSync(path.join(root, file), 'utf8')
}
