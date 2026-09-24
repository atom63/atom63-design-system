/**
 * Builds token CSS from DTCG source files (Design Tokens Format Module 2025.10).
 *
 * Each `src/{tokens,contracts,themes}/**\/<name>.tokens.json` produces the sibling `<name>.css`: one
 * `:root` custom property per token, named by joining the token's group path
 * with `-` (`spacing` > `1` becomes `--spacing-1`). The JSON is the source of
 * truth; the CSS is generated and must not be edited by hand.
 *
 * Supported types: color (srgb, oklch), dimension, duration, cubicBezier, number,
 * fontFamily. A value may instead be a DTCG alias such as `{duration.150}`, which
 * becomes `var(--duration-150)`; aliases may point into any source file, and an
 * alias to a token that does not exist fails the build.
 *
 * A `<name>.resolver.json` (DTCG Resolver Module 2025.10) with one modifier whose
 * contexts hold inline token groups produces `<name>.css` with one rule per
 * context, `[data-a63-<axis>='<context>']`. The default context also applies at
 * `:root`. The attribute comes from `$extensions["io.atom63.css"].attribute`.
 *
 * A resolver may also list `sets` in its `resolutionOrder`: token groups that
 * apply unconditionally, emitted before the modifier's contexts under the
 * selector in the set's `$extensions["io.atom63.css"].selector`, wrapped in its
 * `atRule` (for example `@media (pointer: coarse)`) when it has one; a resolver
 * may consist of sets only, one per CSS scope. A context with
 * no sources emits no rule, so a modifier can hold overrides for a few contexts
 * only. `$extensions["io.atom63.css"].selectors` on the resolver may name the
 * selector of any context, replacing the attribute selector (the mode axis
 * also answers to `.light` / `.dark` classes). A token's `$description` is kept as a comment above its declaration.
 *
 * A token whose value is computed in CSS keeps a plain DTCG `$value` (its main
 * input, usually an alias, which is what Figma and other readers see) and puts
 * the CSS expression in `$extensions["io.atom63.derive"]`. `{token.path}`
 * placeholders in the expression become `var(--token-path)`, and each must name
 * an existing token. Example: the auto brand ramp,
 * `"var(--color-auto-50, {color.b1.50})"` over `$value` `"{color.b1.50}"`.
 *
 * Values with no DTCG type (transforms, `env()`, composite shadows…) live in
 * hand-written `*.native.css` files. Every declaration there must be listed with a
 * reason in `src/tokens/native-values.json`, and every listed entry must still
 * exist; `--check` enforces both, so a new hand-written value needs a reviewed
 * entry. See docs/design-system/token-single-source.md.
 *
 * Usage: node scripts/build-css-from-dtcg.mjs [--check]
 */
import { readdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import prettier from 'prettier'

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const tokensRoot = path.join(packageRoot, 'src/tokens')

function formatColor(value, name) {
  const { colorSpace, components, alpha = 1 } = value
  if (colorSpace === 'srgb') {
    const [r, g, b] = components.map(channel => Math.round(channel * 255))
    // `hex` is the optional fallback; if present it must describe the same color,
    // so an edit to one field cannot silently disagree with the other.
    const hex = `#${[r, g, b].map(channel => channel.toString(16).padStart(2, '0')).join('')}`
    if (value.hex && value.hex.toLowerCase() !== hex) {
      throw new Error(`${name}: hex ${value.hex} does not match components (${hex})`)
    }
    return `rgba(${r}, ${g}, ${b}, ${alpha})`
  }
  if (colorSpace === 'oklch') {
    const channels = components.join(' ')
    return alpha === 1 ? `oklch(${channels})` : `oklch(${channels} / ${alpha})`
  }
  throw new Error(`${name}: unsupported colorSpace "${colorSpace}"`)
}

// CSS generic families and system keywords stay unquoted; every other family
// name is quoted.
const GENERIC_FAMILIES = new Set([
  'serif',
  'sans-serif',
  'monospace',
  'cursive',
  'fantasy',
  'system-ui',
  'ui-serif',
  'ui-sans-serif',
  'ui-monospace',
  'ui-rounded',
  'emoji',
  'math',
  'fangsong',
])

function formatFontFamily(value) {
  const families = Array.isArray(value) ? value : [value]
  return families
    .map(family => (GENERIC_FAMILIES.has(family) ? family : `'${family.replaceAll("'", "\\'")}'`))
    .join(', ')
}

const ALIAS = /^\{([^{}]+)\}$/

/** `{z-layer.window.$root}` → `z-layer-window` */
function aliasTarget(reference) {
  const segments = reference.split('.')
  if (segments.at(-1) === '$root') segments.pop()
  return segments.join('-')
}

function formatValue(type, value, name, knownNames) {
  const alias = typeof value === 'string' ? value.match(ALIAS) : null
  if (alias) {
    const target = aliasTarget(alias[1])
    if (!knownNames.has(target)) throw new Error(`${name}: alias {${alias[1]}} has no target token`)
    return `var(--${target})`
  }
  switch (type) {
    case 'color':
      return formatColor(value, name)
    case 'dimension':
    case 'duration':
      return `${value.value}${value.unit}`
    case 'cubicBezier':
      return `cubic-bezier(${value.join(', ')})`
    case 'number':
    case 'fontWeight':
      return String(value)
    case 'fontFamily':
      return formatFontFamily(value)
    case 'shadow': {
      // A DTCG shadow or list of shadows; an empty list is CSS `none`.
      const layers = Array.isArray(value) ? value : [value]
      if (layers.length === 0) return 'none'
      return layers
        .map(layer => {
          const lengths = [layer.offsetX, layer.offsetY, layer.blur, layer.spread].map(length =>
            formatValue('dimension', length, name, knownNames)
          )
          const color = formatValue('color', layer.color, name, knownNames)
          return `${layer.inset ? 'inset ' : ''}${lengths.join(' ')} ${color}`
        })
        .join(', ')
    }
    case 'strokeStyle':
      if (typeof value !== 'string')
        throw new Error(`${name}: only keyword stroke styles are supported`)
      return value
    default:
      throw new Error(`${name}: unsupported $type "${type}"`)
  }
}

/** Expands an `io.atom63.derive` expression: `{a.b}` → `var(--a-b)`. */
function formatDerive(expression, name, knownNames) {
  if (typeof expression !== 'string') {
    throw new Error(`${name}: $extensions["io.atom63.derive"] must be a CSS expression string`)
  }
  return expression.replaceAll(/\{([^{}]+)\}/g, (_, reference) => {
    const target = aliasTarget(reference)
    if (!knownNames.has(target))
      throw new Error(`${name}: derive {${reference}} has no target token`)
    return `var(--${target})`
  })
}

/**
 * Walks a DTCG group, inheriting `$type`, and yields
 * [cssName, $type, $value, derive, $description].
 */
function* walk(group, trail, inheritedType) {
  const type = group.$type ?? inheritedType
  for (const [key, node] of Object.entries(group)) {
    // `$root` is the group's own token: `z-layer` > `window` > `$root` is
    // `--z-layer-window`, next to `--z-layer-window-ceiling`.
    if (key.startsWith('$') && key !== '$root') continue
    const name = (key === '$root' ? trail : [...trail, key]).join('-')
    if (Object.hasOwn(node, '$value')) {
      const tokenType = node.$type ?? type
      if (!tokenType) throw new Error(`${name}: no $type on the token or its groups`)
      yield [
        name,
        tokenType,
        node.$value,
        node.$extensions?.['io.atom63.derive'],
        node.$description,
      ]
    } else {
      yield* walk(node, [...trail, key], type)
    }
  }
}

async function findSources(directory) {
  const found = []
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const entryPath = path.join(directory, entry.name)
    if (entry.isDirectory()) found.push(...(await findSources(entryPath)))
    else if (/\.(tokens|resolver)\.json$/.test(entry.name)) found.push(entryPath)
  }
  return found.sort()
}

/** Expands a source file into CSS rules: [{ selector, groups }]. */
function toRules(sourcePath, document) {
  if (sourcePath.endsWith('.tokens.json')) return [{ selector: ':root', groups: [document] }]
  if (document.version !== '2025.10')
    throw new Error(`${sourcePath}: resolver version must be 2025.10`)
  const modifiers = Object.entries(document.modifiers ?? {})
  if (modifiers.length > 1) throw new Error(`${sourcePath}: expected at most one modifier`)
  const inline = sources => {
    for (const source of sources) {
      if (Object.hasOwn(source, '$ref'))
        throw new Error(`${sourcePath}: only inline sources are supported`)
    }
    return sources
  }
  let modifierName
  let modifierRules = []
  if (modifiers.length === 1) {
    const [[name, modifier]] = modifiers
    modifierName = name
    const attribute = document.$extensions?.['io.atom63.css']?.attribute
    if (!attribute) throw new Error(`${sourcePath}: missing $extensions["io.atom63.css"].attribute`)
    if (!Object.hasOwn(modifier.contexts, modifier.default)) {
      throw new Error(
        `${sourcePath}: default context "${modifier.default}" of "${name}" is missing`
      )
    }
    const selectors = document.$extensions['io.atom63.css'].selectors ?? {}
    modifierRules = Object.entries(modifier.contexts)
      .filter(([, sources]) => sources.length > 0)
      .map(([context, sources]) => {
        const scoped = `[${attribute}='${context}']`
        const selector =
          selectors[context] ?? (context === modifier.default ? `:root,\n${scoped}` : scoped)
        return { selector, groups: inline(sources) }
      })
  }
  const order =
    document.resolutionOrder ?? (modifierName ? [{ $ref: `#/modifiers/${modifierName}` }] : [])
  return order.flatMap(({ $ref }) => {
    if (modifierName && $ref === `#/modifiers/${modifierName}`) return modifierRules
    const setName = /^#\/sets\/(.+)$/.exec($ref ?? '')?.[1]
    const set = setName && document.sets?.[setName]
    if (!set) throw new Error(`${sourcePath}: resolutionOrder entry ${$ref} does not resolve`)
    const { selector, atRule } = set.$extensions?.['io.atom63.css'] ?? {}
    if (!selector) {
      throw new Error(`${sourcePath}: set "${setName}" needs $extensions["io.atom63.css"].selector`)
    }
    return [{ selector, atRule, groups: inline(set.sources) }]
  })
}

function tokensOf(rules) {
  return rules.flatMap(rule => rule.groups.flatMap(group => [...walk(group, [], undefined)]))
}

function render(sourcePath, document, rules, knownNames) {
  const relativeSource = path.relative(packageRoot, sourcePath)
  const summary = document.$description ?? document.description
  const description = summary
    ? `\n *\n${summary
        .split('\n')
        .map(line => ` * ${line}`.trimEnd())
        .join('\n')}`
    : ''
  const blocks = rules.map(rule => {
    const declarations = tokensOf([rule]).map(([name, type, value, derive, description]) => {
      // The plain value is validated even when a derive expression replaces it.
      const plain = formatValue(type, value, name, knownNames)
      const css = derive === undefined ? plain : formatDerive(derive, name, knownNames)
      const comment = description
        ? `  /* ${description.replaceAll('*/', '* /').split('\n').join('\n     ')} */\n`
        : ''
      return `${comment}  --${name}: ${css};`
    })
    const block = `${rule.selector} {\n${declarations.join('\n')}\n}\n`
    // A set may sit inside a conditional group rule (`@media …`, `@supports …`).
    return rule.atRule ? `${rule.atRule} {\n${block}}\n` : block
  })
  // A split contract keeps one entry point: its generated CSS imports the
  // hand-written native part (`$extensions["io.atom63.css"].imports`).
  const imports = (document.$extensions?.['io.atom63.css']?.imports ?? [])
    .map(file => `@import '${file}';\n`)
    .join('')
  return (
    `/*\n * Generated from ${relativeSource} by scripts/build-css-from-dtcg.mjs. Do not edit;\n` +
    ` * change the DTCG source and run \`pnpm --filter @atom63/styles generate:tokens\`.${description}\n */\n` +
    (imports ? `${imports}\n` : '') +
    blocks.join('\n')
  )
}

const check = process.argv.includes('--check')
const sources = []
const sourceRoots = [
  tokensRoot,
  ...['src/contracts', 'src/themes'].map(dir => path.join(packageRoot, dir)),
]
for (const sourcePath of (await Promise.all(sourceRoots.map(findSources))).flat()) {
  const document = JSON.parse(await readFile(sourcePath, 'utf8'))
  sources.push([sourcePath, document, toRules(sourcePath, document)])
}
// Every token name across all sources, so aliases can point into any file, plus
// every custom property the package's hand-written CSS declares: while a layer is
// migrated, a DTCG token may alias one that is still written in CSS.
const knownNames = new Set(sources.flatMap(([, , rules]) => tokensOf(rules).map(([name]) => name)))
async function findCss(directory) {
  const found = []
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const entryPath = path.join(directory, entry.name)
    if (entry.isDirectory()) found.push(...(await findCss(entryPath)))
    else if (entry.name.endsWith('.css')) found.push(entryPath)
  }
  return found
}
const generatedCss = new Set(
  sources.map(([sourcePath]) => sourcePath.replace(/\.(tokens|resolver)\.json$/, '.css'))
)
for (const file of await findCss(path.join(packageRoot, 'src'))) {
  if (generatedCss.has(file)) continue
  const css = (await readFile(file, 'utf8')).replaceAll(/\/\*[\s\S]*?\*\//g, '')
  for (const [, name] of css.matchAll(/--([\w-]+)\s*:/g)) knownNames.add(name)
}

const stale = []
for (const [sourcePath, document, rules] of sources) {
  const cssPath = sourcePath.replace(/\.(tokens|resolver)\.json$/, '.css')
  // Format with the repository config, like the other generators, so the output
  // passes format:check and --check compares like with like.
  const options = (await prettier.resolveConfig(cssPath)) ?? {}
  const css = await prettier.format(render(sourcePath, document, rules, knownNames), {
    ...options,
    filepath: cssPath,
  })
  if (check) {
    const current = await readFile(cssPath, 'utf8').catch(() => '')
    if (current !== css) stale.push(path.relative(packageRoot, cssPath))
  } else {
    await writeFile(cssPath, css)
  }
}

// CSS-native values: every declaration in a *.native.css file is listed with a reason.
const srcRoot = path.join(packageRoot, 'src')
async function findNative(directory) {
  const found = []
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const entryPath = path.join(directory, entry.name)
    if (entry.isDirectory()) found.push(...(await findNative(entryPath)))
    else if (entry.name.endsWith('.native.css')) found.push(entryPath)
  }
  return found.sort()
}
const nativeList = JSON.parse(await readFile(path.join(tokensRoot, 'native-values.json'), 'utf8'))
const declaredNative = new Set()
for (const file of await findNative(srcRoot)) {
  const css = (await readFile(file, 'utf8')).replaceAll(/\/\*[\s\S]*?\*\//g, '')
  for (const [, name] of css.matchAll(/(--[\w-]+)\s*:/g)) declaredNative.add(name)
}
const unlisted = [...declaredNative].filter(name => !nativeList.values[name])
const unused = Object.keys(nativeList.values).filter(name => !declaredNative.has(name))
if (unlisted.length || unused.length) {
  process.stderr.write(
    [
      ...unlisted.map(
        name => `${name}: declared in a *.native.css file but not listed in native-values.json`
      ),
      ...unused.map(
        name => `${name}: listed in native-values.json but no *.native.css file declares it`
      ),
    ].join('\n') + '\n'
  )
  process.exit(1)
}

if (stale.length) {
  process.stderr.write(
    `Stale DTCG output: ${stale.join(', ')}\nRun pnpm --filter @atom63/styles generate:tokens.\n`
  )
  process.exit(1)
}
process.stdout.write(check ? 'DTCG CSS output is current.\n' : 'Built CSS from DTCG sources.\n')
