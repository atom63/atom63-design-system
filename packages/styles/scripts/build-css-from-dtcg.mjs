/**
 * Builds token CSS from DTCG source files (Design Tokens Format Module 2025.10).
 *
 * Each `src/tokens/**\/<name>.tokens.json` produces the sibling `<name>.css`: one
 * `:root` custom property per token, named by joining the token's group path
 * with `-` (`spacing` > `1` becomes `--spacing-1`). The JSON is the source of
 * truth; the CSS is generated and must not be edited by hand.
 *
 * Supported types: color (srgb, oklch), dimension, duration, cubicBezier, number,
 * fontFamily. A value may instead be a DTCG alias such as `{duration.150}`, which
 * becomes `var(--duration-150)`; aliases may point into any source file, and an
 * alias to a token that does not exist fails the build.
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
      return String(value)
    case 'fontFamily':
      return formatFontFamily(value)
    default:
      throw new Error(`${name}: unsupported $type "${type}"`)
  }
}

/** Walks a DTCG group, inheriting `$type`, and yields [cssName, $type, $value]. */
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
      yield [name, tokenType, node.$value]
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
    else if (entry.name.endsWith('.tokens.json')) found.push(entryPath)
  }
  return found.sort()
}

function render(sourcePath, document, knownNames) {
  const relativeSource = path.relative(packageRoot, sourcePath)
  const declarations = [...walk(document, [], undefined)].map(([name, type, value]) => [
    name,
    formatValue(type, value, name, knownNames),
  ])
  const description = document.$description
    ? `\n *\n${document.$description
        .split('\n')
        .map(line => ` * ${line}`.trimEnd())
        .join('\n')}`
    : ''
  return (
    `/*\n * Generated from ${relativeSource} by scripts/build-css-from-dtcg.mjs. Do not edit;\n` +
    ` * change the DTCG source and run \`pnpm --filter @atom63/styles generate:tokens\`.${description}\n */\n` +
    `:root {\n${declarations.map(([name, value]) => `  --${name}: ${value};`).join('\n')}\n}\n`
  )
}

const check = process.argv.includes('--check')
const sources = []
for (const sourcePath of await findSources(tokensRoot)) {
  sources.push([sourcePath, JSON.parse(await readFile(sourcePath, 'utf8'))])
}
// Every token name across all sources, so aliases can point into any file.
const knownNames = new Set(
  sources.flatMap(([, document]) => [...walk(document, [], undefined)].map(([name]) => name))
)

const stale = []
for (const [sourcePath, document] of sources) {
  const cssPath = sourcePath.replace(/\.tokens\.json$/, '.css')
  // Format with the repository config, like the other generators, so the output
  // passes format:check and --check compares like with like.
  const options = (await prettier.resolveConfig(cssPath)) ?? {}
  const css = await prettier.format(render(sourcePath, document, knownNames), {
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

if (stale.length) {
  process.stderr.write(
    `Stale DTCG output: ${stale.join(', ')}\nRun pnpm --filter @atom63/styles generate:tokens.\n`
  )
  process.exit(1)
}
process.stdout.write(check ? 'DTCG CSS output is current.\n' : 'Built CSS from DTCG sources.\n')
