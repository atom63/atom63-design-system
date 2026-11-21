/**
 * The static measures of `measure-adoption`: what one adopter source file does
 * with the design system. Pure functions over file contents, so they are
 * unit-tested on fixtures without an adopter checkout.
 *
 * - system imports and components: JSX elements whose root name is imported
 *   from a design-system package (`@atom63/ui-react`, `@atom63/mdx`, ...);
 * - hand-written interactive elements: intrinsic `<button>`, `<input>`,
 *   `<select>`, `<textarea>`, `<dialog>`, `<a>` with `onClick`, and any
 *   intrinsic element with `role="button"`;
 * - other UI libraries: imports from Radix, MUI, Headless UI and the like, and
 *   imports of shadcn-style copies under a `components/ui/` folder;
 * - literal colours: `findLiterals` from the vibe measures (hex, `rgb()`,
 *   `hsl()`, `oklch()` values and Tailwind palette or arbitrary colour
 *   utilities). In CSS, a literal assigned to a custom property (`--x: #fff`)
 *   is a local token definition and is counted apart from other literals.
 */
import path from 'node:path'

import ts from 'typescript'

import { findLiterals } from './vibe-measure.mjs'

/** Packages, other than the design system, that ship UI components or primitives. */
export const OTHER_UI_LIBRARY =
  /^(?:@radix-ui\/|radix-ui$|@mui\/|@material-ui\/|@headlessui\/|@chakra-ui\/|@mantine\/|antd$|@ant-design\/|react-aria(?:-components)?$|@react-aria\/|@ariakit\/|@base-ui-components\/|@base-ui\/|@ark-ui\/|@heroui\/|@nextui-org\/|react-bootstrap$|@reach\/|vaul$|cmdk$|sonner$|react-select$|react-day-picker$|input-otp$)/

/** The hand-written element kinds the report counts, in report order. */
export const HANDWRITTEN_KINDS = [
  'button',
  'input',
  'select',
  'textarea',
  'dialog',
  'a[onClick]',
  '[role=button]',
]

const HANDWRITTEN_TAGS = new Set(['button', 'input', 'select', 'textarea', 'dialog'])

/** Where an import specifier points, relative to the adopter app root. */
function resolveLocal(fileRelative, specifier) {
  if (specifier.startsWith('.')) return path.posix.join(path.posix.dirname(fileRelative), specifier)
  if (specifier.startsWith('@/')) return `src/${specifier.slice(2)}`
  if (specifier.startsWith('~/')) return `src/${specifier.slice(2)}`
  return null
}

/** True for a path inside a `components/ui/` folder (the shadcn convention). */
export function isShadcnCopy(relative) {
  return /(?:^|\/)components\/ui\//.test(relative)
}

function attributeValue(attribute) {
  const initializer = attribute.initializer
  if (!initializer) return true
  if (ts.isStringLiteral(initializer)) return initializer.text
  if (ts.isJsxExpression(initializer) && initializer.expression) {
    const expression = initializer.expression
    if (ts.isStringLiteral(expression) || ts.isNoSubstitutionTemplateLiteral(expression)) {
      return expression.text
    }
    return null
  }
  return null
}

/**
 * Static measures of one TSX or TS file.
 * @param {string} source
 * @param {string} relative path from the adopter app root, POSIX separators
 * @param {{ systemPackages: Iterable<string> }} options
 * @returns {{
 *   importsSystem: boolean,
 *   importsAtom63: boolean,
 *   systemPackagesImported: string[],
 *   systemComponents: Record<string, number>,
 *   handwritten: Record<string, number>,
 *   otherUiImports: string[],
 * }}
 */
export function analyseSource(source, relative, { systemPackages }) {
  const system = new Set(systemPackages)
  const packageOf = specifier =>
    [...system].find(name => specifier === name || specifier.startsWith(`${name}/`))
  const isSystem = specifier => Boolean(packageOf(specifier))
  const file = ts.createSourceFile(
    relative,
    source,
    ts.ScriptTarget.Latest,
    true,
    relative.endsWith('.ts') ? ts.ScriptKind.TS : ts.ScriptKind.TSX
  )

  /** @type {Map<string, string>} local name -> module specifier */
  const imports = new Map()
  let importsSystem = false
  let importsAtom63 = false
  const otherUiImports = []
  const systemPackagesImported = new Set()
  const recordSpecifier = specifier => {
    if (specifier.startsWith('@atom63/')) importsAtom63 = true
    const pkg = packageOf(specifier)
    if (pkg) {
      importsSystem = true
      systemPackagesImported.add(pkg)
    }
    if (OTHER_UI_LIBRARY.test(specifier)) otherUiImports.push(specifier)
    else {
      const local = resolveLocal(relative, specifier)
      if (local && isShadcnCopy(local) && !isShadcnCopy(relative)) {
        otherUiImports.push(`components/ui/${local.split('components/ui/')[1]}`)
      }
    }
  }

  for (const statement of file.statements) {
    if (
      (ts.isImportDeclaration(statement) || ts.isExportDeclaration(statement)) &&
      statement.moduleSpecifier &&
      ts.isStringLiteral(statement.moduleSpecifier)
    ) {
      recordSpecifier(statement.moduleSpecifier.text)
    }
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

  const systemComponents = /** @type {Record<string, number>} */ ({})
  const handwritten = Object.fromEntries(HANDWRITTEN_KINDS.map(kind => [kind, 0]))
  const visit = node => {
    if (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) {
      const tag = node.tagName.getText(file)
      if (/^[a-z]/.test(tag) && !tag.includes('.')) {
        const attributes = new Map()
        for (const attribute of node.attributes.properties) {
          if (ts.isJsxAttribute(attribute)) {
            attributes.set(attribute.name.getText(file), attributeValue(attribute))
          }
        }
        if (HANDWRITTEN_TAGS.has(tag)) handwritten[tag]++
        else if (tag === 'a' && attributes.has('onClick')) handwritten['a[onClick]']++
        else if (attributes.get('role') === 'button') handwritten['[role=button]']++
      } else {
        const from = imports.get(tag.split('.')[0])
        if (from && isSystem(from)) systemComponents[tag] = (systemComponents[tag] ?? 0) + 1
      }
    }
    ts.forEachChild(node, visit)
  }
  visit(file)

  return {
    importsSystem,
    importsAtom63,
    systemPackagesImported: [...systemPackagesImported].sort(),
    systemComponents,
    handwritten,
    otherUiImports,
  }
}

/**
 * Literal colours in one file.
 * @returns {{ paletteUtilities: number, literalColors: number, localTokenDefinitions: number }}
 */
export function countLiteralColors(relative, text) {
  const { paletteUtilities, literalColors } = findLiterals(relative, text)
  if (!relative.endsWith('.css')) {
    return {
      paletteUtilities: paletteUtilities.length,
      literalColors: literalColors.length,
      localTokenDefinitions: 0,
    }
  }
  const definitions = literalColors.filter(match => match.startsWith('--')).length
  return {
    paletteUtilities: 0,
    literalColors: literalColors.length - definitions,
    localTokenDefinitions: definitions,
  }
}

/**
 * `data-slot` values a design-system source file renders as literals
 * (`data-slot="button-label"`, `'data-slot': 'dialog-popup'`). Adopters set
 * `data-slot` on their own components too, so the runtime pass counts only
 * the system's own slot names, not any `data-slot`.
 */
export function extractSlotNames(text) {
  return [...text.matchAll(/data-slot['"]?\s*[:=]\s*\{?\s*['"`]([a-z0-9-]+)['"`]/g)].map(
    ([, name]) => name
  )
}

/** Source files the static measures read: TS, TSX and CSS, no tests or declarations. */
export function isAnalysedFile(relative) {
  return (
    /\.(tsx?|css)$/.test(relative) &&
    !relative.endsWith('.d.ts') &&
    !/\.(test|spec)\.tsx?$/.test(relative) &&
    !/(?:^|\/)(?:__tests__|test|tests)\//.test(relative) &&
    !/(?:^|\/)routeTree\.gen\.ts$/.test(relative)
  )
}

/**
 * Totals for one app from `{ relative, text }` files.
 * @param {{ relative: string, text: string }[]} files
 * @param {{ systemPackages: Iterable<string>, top?: number }} options
 */
export function summariseApp(files, { systemPackages, top = 20 }) {
  const totals = {
    tsxFiles: 0,
    tsxFilesImportingSystem: 0,
    tsxFilesImportingAtom63: 0,
    tsxFilesByPackage: /** @type {Record<string, number>} */ ({}),
    systemComponentUses: 0,
    distinctSystemComponents: 0,
    topSystemComponents: /** @type {{ name: string, count: number }[]} */ ([]),
    handwritten: Object.fromEntries(HANDWRITTEN_KINDS.map(kind => [kind, 0])),
    handwrittenTotal: 0,
    otherUiLibraries: /** @type {Record<string, number>} */ ({}),
    shadcnCopyFiles: /** @type {string[]} */ ([]),
    literalColors: { paletteUtilities: 0, literalColors: 0, localTokenDefinitions: 0 },
    topLiteralColorFiles: /** @type {{ file: string, count: number }[]} */ ([]),
  }
  const components = /** @type {Record<string, number>} */ ({})
  const literalFiles = []
  for (const { relative, text } of files) {
    if (isShadcnCopy(relative) && /\.tsx?$/.test(relative)) totals.shadcnCopyFiles.push(relative)
    if (/\.tsx?$/.test(relative)) {
      const result = analyseSource(text, relative, { systemPackages })
      if (relative.endsWith('.tsx')) {
        totals.tsxFiles++
        if (result.importsSystem) totals.tsxFilesImportingSystem++
        if (result.importsAtom63) totals.tsxFilesImportingAtom63++
        for (const pkg of result.systemPackagesImported) {
          totals.tsxFilesByPackage[pkg] = (totals.tsxFilesByPackage[pkg] ?? 0) + 1
        }
      }
      for (const [name, count] of Object.entries(result.systemComponents)) {
        components[name] = (components[name] ?? 0) + count
      }
      for (const [kind, count] of Object.entries(result.handwritten))
        totals.handwritten[kind] += count
      for (const specifier of result.otherUiImports) {
        totals.otherUiLibraries[specifier] = (totals.otherUiLibraries[specifier] ?? 0) + 1
      }
    }
    const literals = countLiteralColors(relative, text)
    for (const key of Object.keys(literals)) totals.literalColors[key] += literals[key]
    const outsideTokens = literals.paletteUtilities + literals.literalColors
    if (outsideTokens) literalFiles.push({ file: relative, count: outsideTokens })
  }
  const ranked = Object.entries(components)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
  totals.systemComponentUses = ranked.reduce((sum, { count }) => sum + count, 0)
  totals.distinctSystemComponents = ranked.length
  totals.topSystemComponents = ranked.slice(0, top)
  totals.handwrittenTotal = Object.values(totals.handwritten).reduce((a, b) => a + b, 0)
  totals.otherUiLibraries = Object.fromEntries(
    Object.entries(totals.otherUiLibraries).sort(([a], [b]) => a.localeCompare(b))
  )
  totals.shadcnCopyFiles.sort()
  totals.topLiteralColorFiles = literalFiles
    .sort((a, b) => b.count - a.count || a.file.localeCompare(b.file))
    .slice(0, 10)
  return totals
}
