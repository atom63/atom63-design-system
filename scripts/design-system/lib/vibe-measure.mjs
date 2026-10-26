/**
 * The mechanical measures of the vibe runner (E4): what an agent changed in a
 * generated project, and what that code does with the design system. Pure
 * functions over file contents, so they are unit-tested without an agent.
 *
 * - craft violations: the `check:craft` rules (`scanSource`, `scanCss`);
 * - literal values: hex, `rgb()`, `hsl()` and `oklch()` colors, and Tailwind
 *   palette or arbitrary color utilities;
 * - the system-component share: JSX elements imported from `@atom63/*`,
 *   divided by every JSX element that is a third-party component or an
 *   interactive HTML element;
 * - warnings: patterns that are not wrong but usually unintended, such as a
 *   `<Button>` without `variant`, which draws the heaviest neutral solid.
 *   They are reported, never counted as craft violations.
 */
import ts from 'typescript'

import { declaredTokens, scanCss, scanSource } from './craft-rules.mjs'

/** Files the measures read: source under `src/`, not declaration files. */
export function isMeasuredFile(relative) {
  return (
    relative.startsWith('src/') && /\.(tsx?|css)$/.test(relative) && !relative.endsWith('.d.ts')
  )
}

/**
 * Files added or changed between two snapshots (`Map<relative path, content>`).
 * @param {Map<string, string>} before
 * @param {Map<string, string>} after
 */
export function changedFiles(before, after) {
  const added = []
  const changed = []
  for (const [relative, content] of after) {
    if (!before.has(relative)) added.push(relative)
    else if (before.get(relative) !== content) changed.push(relative)
  }
  const removed = [...before.keys()].filter(relative => !after.has(relative))
  return { added: added.sort(), changed: changed.sort(), removed: removed.sort() }
}

/**
 * `check:craft` violations in one file. With `knownTokens` (the token
 * manifest's names), reads of `--a63-*` variables that do not exist count too.
 * @param {{ knownTokens?: Iterable<string> }} [options]
 */
export function craftViolations(relative, text, options) {
  if (relative.endsWith('.css')) return scanCss(text, options)
  if (/\.tsx?$/.test(relative)) return scanSource(text, options)
  return []
}

/* A hex value counts only where a color can stand: a whole string ('#333'),
   after `:` or `=` (color: #333, fill="#333"), as a function argument
   (linear-gradient(#fff, #000)), or after a CSS length or line style
   (1px solid #ddd). It must end the value, so prose such as "Order #1042" or
   "#2024 roadmap" does not count. */
const LITERAL_COLOR =
  /(?<=['"`(]|[:=,]\s*|\(\s*|(?:solid|dashed|dotted|double|groove|ridge|inset|outset|px|em|rem|%|\d)\s+)#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3,4})(?=['"`),;}]|\s*$|\s+(?![A-Za-z]))|\b(?:rgba?|hsla?|oklch|oklab)\(\s*[\d.]/gm

/**
 * Literal values that should be tokens.
 * - `paletteUtilities`: Tailwind palette classes (`bg-blue-500`, `text-gray-600`)
 *   and arbitrary color utilities (`bg-[#fff]`), as `check:craft` reports them.
 * - `literalColors`: color literals anywhere else, such as an inline `style`
 *   or a CSS declaration.
 * @returns {{ paletteUtilities: string[], literalColors: string[] }}
 */
export function findLiterals(relative, text) {
  if (relative.endsWith('.css')) {
    return {
      paletteUtilities: [],
      literalColors: scanCss(text)
        .filter(({ rule }) => rule === 'raw-color')
        .map(({ match }) => match),
    }
  }
  const paletteUtilities = scanSource(text)
    .filter(({ rule }) => rule === 'raw-color')
    .map(({ match }) => match)
  // Arbitrary utilities such as `bg-[#fff]` are already counted above.
  const outsideUtilities = text.replace(/[\w:-]+-\[[^\]\s]*\]/g, '')
  const literalColors = [...outsideUtilities.matchAll(LITERAL_COLOR)].map(([match]) => match)
  return { paletteUtilities, literalColors }
}

/** HTML elements a person operates. Layout and text elements do not count. */
export const interactiveHtml = new Set([
  'a',
  'button',
  'details',
  'dialog',
  'form',
  'input',
  'label',
  'option',
  'select',
  'summary',
  'textarea',
])

/** Icon packages: their components are pictures, not UI the system could provide. */
const iconPackages = /^(?:lucide-react|@radix-ui\/react-icons|react-icons)(?:\/|$)/

/**
 * Counts the JSX elements in one TSX file by where they come from.
 * - `system`: imported from `@atom63/*`;
 * - `thirdParty`: imported from any other package (icons excluded);
 * - `icons`: imported from an icon package;
 * - `local`: defined in this project (a relative import or this file). Their
 *   own bodies are counted where they are defined, so a local wrapper around a
 *   system component still counts as system use;
 * - `interactiveHtml` and `otherHtml`: intrinsic elements.
 * @returns {{ system: number, thirdParty: number, icons: number, local: number, interactiveHtml: number, otherHtml: number, systemNames: Record<string, number> }}
 */
export function countJsxElements(source, fileName = 'file.tsx') {
  const file = ts.createSourceFile(
    fileName,
    source,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX
  )
  /** @type {Map<string, string>} local name → module specifier */
  const imports = new Map()
  for (const statement of file.statements) {
    if (!ts.isImportDeclaration(statement) || !statement.importClause) continue
    const from = /** @type {import('typescript').StringLiteral} */ (statement.moduleSpecifier).text
    const clause = statement.importClause
    if (clause.name) imports.set(clause.name.text, from)
    const bindings = clause.namedBindings
    if (bindings && ts.isNamespaceImport(bindings)) imports.set(bindings.name.text, from)
    if (bindings && ts.isNamedImports(bindings)) {
      for (const element of bindings.elements) imports.set(element.name.text, from)
    }
  }

  const counts = {
    system: 0,
    thirdParty: 0,
    icons: 0,
    local: 0,
    interactiveHtml: 0,
    otherHtml: 0,
    systemNames: /** @type {Record<string, number>} */ ({}),
  }
  const visit = node => {
    if (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) {
      const tag = node.tagName.getText(file)
      const root = tag.split('.')[0]
      if (/^[a-z]/.test(tag) && !tag.includes('.')) {
        if (interactiveHtml.has(tag)) counts.interactiveHtml++
        else counts.otherHtml++
      } else {
        const from = imports.get(root)
        if (from?.startsWith('@atom63/')) {
          counts.system++
          counts.systemNames[tag] = (counts.systemNames[tag] ?? 0) + 1
        } else if (from && iconPackages.test(from)) counts.icons++
        else if (from && !from.startsWith('.') && !from.startsWith('@/')) counts.thirdParty++
        else counts.local++
      }
    }
    ts.forEachChild(node, visit)
  }
  visit(file)
  return counts
}

/**
 * Warnings in one TSX file: each `<Button>` imported from `@atom63/*` that
 * passes no `variant` (and spreads no props that could carry one). It draws
 * the `default` neutral solid, the heaviest neutral, which is rarely meant for
 * a back, keypad or secondary action.
 * @returns {{ rule: 'button-without-variant', line: number, match: string }[]}
 */
export function findWarnings(source, fileName = 'file.tsx') {
  const file = ts.createSourceFile(
    fileName,
    source,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX
  )
  const systemButtons = new Set()
  for (const statement of file.statements) {
    if (!ts.isImportDeclaration(statement) || !statement.importClause) continue
    const from = /** @type {import('typescript').StringLiteral} */ (statement.moduleSpecifier).text
    const bindings = statement.importClause.namedBindings
    if (!from.startsWith('@atom63/') || !bindings || !ts.isNamedImports(bindings)) continue
    for (const element of bindings.elements) {
      if ((element.propertyName ?? element.name).text === 'Button')
        systemButtons.add(element.name.text)
    }
  }
  const warnings = []
  const visit = node => {
    if (
      (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) &&
      systemButtons.has(node.tagName.getText(file))
    ) {
      const attributes = node.attributes.properties
      const open = attributes.some(
        attribute =>
          ts.isJsxSpreadAttribute(attribute) ||
          (ts.isJsxAttribute(attribute) && attribute.name.getText(file) === 'variant')
      )
      if (!open) {
        const { line } = file.getLineAndCharacterOfPosition(node.getStart(file))
        warnings.push({
          rule: /** @type {const} */ ('button-without-variant'),
          line: line + 1,
          match: node.getText(file).split('\n')[0],
        })
      }
    }
    ts.forEachChild(node, visit)
  }
  visit(file)
  return warnings
}

/**
 * The system-component share: system elements over system, third-party and
 * interactive HTML elements. `null` when there is nothing to divide.
 */
export function systemShare({ system, thirdParty, interactiveHtml: html }) {
  const total = system + thirdParty + html
  return total === 0 ? null : system / total
}

/** Number of `error TSxxxx` diagnostics in `tsc` output. */
export function countTypeErrors(output) {
  return (output.match(/error TS\d+:/g) ?? []).length
}

/**
 * Every source measure over the files an agent added or changed.
 * @param {Map<string, string>} files relative path → content, already filtered
 */
export function measureSources(files, { knownTokens } = {}) {
  // Names the project declares itself are known too, wherever it declares them.
  const known = knownTokens && new Set(knownTokens)
  if (known)
    for (const text of files.values()) for (const name of declaredTokens(text)) known.add(name)
  const craft = []
  const warnings = []
  const literals = { paletteUtilities: [], literalColors: [] }
  const jsx = {
    system: 0,
    thirdParty: 0,
    icons: 0,
    local: 0,
    interactiveHtml: 0,
    otherHtml: 0,
    systemNames: /** @type {Record<string, number>} */ ({}),
  }
  let lines = 0
  for (const [relative, text] of files) {
    lines += text.split('\n').length
    for (const violation of craftViolations(relative, text, { knownTokens: known }))
      craft.push({ file: relative, ...violation })
    const found = findLiterals(relative, text)
    literals.paletteUtilities.push(...found.paletteUtilities)
    literals.literalColors.push(...found.literalColors)
    if (relative.endsWith('.tsx')) {
      for (const warning of findWarnings(text, relative))
        warnings.push({ file: relative, ...warning })
      const counts = countJsxElements(text, relative)
      for (const key of ['system', 'thirdParty', 'icons', 'local', 'interactiveHtml', 'otherHtml'])
        jsx[key] += counts[key]
      for (const [name, count] of Object.entries(counts.systemNames))
        jsx.systemNames[name] = (jsx.systemNames[name] ?? 0) + count
    }
  }
  return { craft, jsx, lines, literals, share: systemShare(jsx), warnings }
}
