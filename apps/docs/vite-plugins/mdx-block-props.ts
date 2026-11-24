import path from 'node:path'
import { fileURLToPath } from 'node:url'
import ts from 'typescript'
import type { Plugin } from 'vite'
import type { MdxBlockPropsIndex, MdxBlockPropRow } from '../src/lib/mdx-block-props'

/**
 * Reads the props of the public @atom63/mdx blocks from their TypeScript
 * types, the way a docgen does: the props of each component's first
 * parameter, minus the ones React's DOM attribute types bring, with their doc
 * comments and the defaults written in the component's parameter. Compound
 * parts (`Steps.Step`, `Timeline.Item`) are read the same way.
 *
 * The docs pages render the result as props tables (`virtual:mdx-block-props`),
 * and the Markdown twins and the agent index carry it, so the tables cannot
 * drift from the types. The page layout primitives of `@atom63/ui-react/layout`
 * are read the same way (`virtual:layout-props`).
 */

const workspaceRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..')
const blocksEntry = path.join(workspaceRoot, 'packages/mdx/src/blocks/index.ts')
const layoutEntry = path.join(workspaceRoot, 'packages/ui-react/src/layout/index.ts')

/** The layout primitives the "Page layout" docs page documents. */
export const layoutComponents = ['Container', 'Page', 'Section', 'SectionHeader'] as const

const literalFlags =
  ts.TypeFlags.StringLiteral | ts.TypeFlags.NumberLiteral | ts.TypeFlags.BooleanLiteral

/** The function a component is: `function X(…)`, or the one inside `forwardRef(…)` / `memo(…)`. */
function componentFunction(declaration: ts.Node | undefined): ts.SignatureDeclaration | null {
  let node: ts.Node | undefined = declaration
  if (node && ts.isVariableDeclaration(node)) {
    node = node.initializer
    while (node && ts.isCallExpression(node)) node = node.arguments[0]
  }
  return node && ts.isFunctionLike(node) ? node : null
}

/** `{ label = 'Key idea', width = DEFAULT_WIDTH }` → `{ label: "'Key idea'", width: '320' }`. */
function parameterDefaults(
  checker: ts.TypeChecker,
  declaration: ts.Node | undefined
): Record<string, string> {
  const parameter = componentFunction(declaration)?.parameters[0]
  const defaults: Record<string, string> = {}
  if (!parameter || !ts.isObjectBindingPattern(parameter.name)) return defaults
  for (const element of parameter.name.elements) {
    if (!element.initializer) continue
    let value: ts.Expression = element.initializer
    // A module constant with a literal value reads better as the value.
    if (ts.isIdentifier(value)) {
      const constant = checker.getSymbolAtLocation(value)?.valueDeclaration
      const literal =
        constant && ts.isVariableDeclaration(constant) ? constant.initializer : undefined
      if (literal && ts.isLiteralExpression(literal)) value = literal
    }
    defaults[(element.propertyName ?? element.name).getText()] = value
      .getText()
      .replace(/\s+/g, ' ')
  }
  return defaults
}

/** A prop declared only in node_modules (DOM attributes, `key`, `ref`) is not the block's own. */
function isOwnProp(symbol: ts.Symbol): boolean {
  return (symbol.declarations ?? []).some(
    declaration => !declaration.getSourceFile().fileName.includes('/node_modules/')
  )
}

/** `'a' | 'b'` for a union of literals (even behind an unexported alias), else the type as written. */
function typeText(checker: ts.TypeChecker, type: ts.Type, declaration: ts.Declaration): string {
  if (type.isUnion() && type.types.every(member => member.flags & literalFlags)) {
    const members = type.types.map(member => checker.typeToString(member))
    const named = members.filter(member => member !== 'true' && member !== 'false')
    return [...named, ...(named.length < members.length ? ['boolean'] : [])]
      .join(' | ')
      .replaceAll('"', "'")
  }
  const written = ts.isPropertySignature(declaration) ? declaration.type : undefined
  if (written) return written.getText().replace(/\s+/g, ' ')
  return checker.typeToString(type, undefined, ts.TypeFormatFlags.NoTruncation)
}

function propRows(
  checker: ts.TypeChecker,
  propsType: ts.Type,
  defaults: Record<string, string>
): MdxBlockPropRow[] {
  return checker
    .getPropertiesOfType(propsType)
    .filter(isOwnProp)
    .map(prop => {
      const declared = prop.valueDeclaration ?? prop.declarations![0]!
      const required = !(prop.flags & ts.SymbolFlags.Optional)
      const type = checker.getTypeOfSymbolAtLocation(prop, declared)
      const description = ts
        .displayPartsToString(prop.getDocumentationComment(checker))
        .replace(/\s+/g, ' ')
        .trim()
      const defaultValue = defaults[prop.name]
      return {
        name: prop.name,
        type: typeText(checker, required ? type : checker.getNonNullableType(type), declared),
        required,
        ...(defaultValue ? { defaultValue } : {}),
        ...(description ? { description } : {}),
      }
    })
    .sort((a, b) => Number(b.required) - Number(a.required) || a.name.localeCompare(b.name))
}

/** The props type of a component value: its call signature's first parameter. */
function propsTypeOf(checker: ts.TypeChecker, componentType: ts.Type, location: ts.Node) {
  const parameter = componentType.getCallSignatures()[0]?.getParameters()[0]
  return parameter ? checker.getTypeOfSymbolAtLocation(parameter, location) : null
}

/**
 * `{ [Component or Component.Part]: rows }` for the components an entry
 * exports (all of them, or those `only` names) and the parts hung on them,
 * required props first.
 */
function readEntryProps(
  entry: string,
  tsconfig: string,
  only?: readonly string[]
): MdxBlockPropsIndex {
  const config = ts.getParsedCommandLineOfConfigFile(
    path.join(workspaceRoot, tsconfig),
    {},
    { ...ts.sys, onUnRecoverableConfigFileDiagnostic() {} }
  )
  const program = ts.createProgram({
    rootNames: [entry],
    options: { ...config?.options, noEmit: true },
  })
  const checker = program.getTypeChecker()
  const module = checker.getSymbolAtLocation(program.getSourceFile(entry)!)!
  const blocks: MdxBlockPropsIndex = {}

  for (const exported of checker.getExportsOfModule(module)) {
    if (!/^[A-Z][a-z]/.test(exported.name)) continue
    if (only && !only.includes(exported.name)) continue
    const symbol =
      exported.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(exported) : exported
    const declaration = symbol.valueDeclaration
    if (!declaration) continue
    const componentType = checker.getTypeOfSymbolAtLocation(symbol, declaration)
    const props = propsTypeOf(checker, componentType, declaration)
    if (!props) continue
    blocks[exported.name] = propRows(checker, props, parameterDefaults(checker, declaration))

    for (const part of checker.getPropertiesOfType(componentType)) {
      if (!/^[A-Z]/.test(part.name)) continue
      const partType = checker.getTypeOfSymbolAtLocation(part, declaration)
      const partProps = propsTypeOf(checker, partType, declaration)
      if (!partProps) continue
      blocks[`${exported.name}.${part.name}`] = propRows(
        checker,
        partProps,
        parameterDefaults(checker, partType.getSymbol()?.valueDeclaration)
      )
    }
  }
  return Object.fromEntries(Object.entries(blocks).sort(([a], [b]) => a.localeCompare(b)))
}

let cached: MdxBlockPropsIndex | null = null

/** Every component `@atom63/mdx/blocks` exports, with its parts. */
export function readMdxBlockProps(): MdxBlockPropsIndex {
  cached ??= readEntryProps(blocksEntry, 'packages/mdx/tsconfig.json')
  return cached
}

let cachedLayout: MdxBlockPropsIndex | null = null

/** Page, Container, Section and SectionHeader from `@atom63/ui-react/layout`. */
export function readLayoutProps(): MdxBlockPropsIndex {
  cachedLayout ??= readEntryProps(layoutEntry, 'packages/ui-react/tsconfig.json', layoutComponents)
  return cachedLayout
}

const virtualModules: Record<string, () => MdxBlockPropsIndex> = {
  'virtual:layout-props': readLayoutProps,
  'virtual:mdx-block-props': readMdxBlockProps,
}

/**
 * Serves `virtual:mdx-block-props` (the props of every @atom63/mdx block) and
 * `virtual:layout-props` (the layout primitives'), read from their types.
 */
export function mdxBlockPropsPlugin(): Plugin {
  return {
    name: 'design-system-mdx-block-props',
    resolveId(id) {
      return id in virtualModules ? `\0${id}` : null
    },
    load(id) {
      const read = id.startsWith('\0') ? virtualModules[id.slice(1)] : undefined
      return read ? `export default ${JSON.stringify(read())}\n` : null
    },
  }
}
