/**
 * Builds token CSS from DTCG source files (Design Tokens Format Module 2025.10).
 *
 * Each `src/tokens/**\/<name>.tokens.json` produces the sibling `<name>.css`: one
 * `:root` custom property per token, named by joining the token's group path
 * with `-` (`spacing` > `1` becomes `--spacing-1`). The JSON is the source of
 * truth; the CSS is generated and must not be edited by hand.
 *
 * Supported types: color (srgb, oklch), dimension, duration, cubicBezier, number.
 *
 * Usage: node scripts/build-css-from-dtcg.mjs [--check]
 */
import { readdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

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

function formatValue(type, value, name) {
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
    default:
      throw new Error(`${name}: unsupported $type "${type}"`)
  }
}

/** Walks a DTCG group, inheriting `$type`, and yields [cssName, cssValue]. */
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
      yield [name, formatValue(tokenType, node.$value, name)]
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

function render(sourcePath, document) {
  const relativeSource = path.relative(packageRoot, sourcePath)
  const declarations = [...walk(document, [], undefined)]
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
const stale = []
for (const sourcePath of await findSources(tokensRoot)) {
  const document = JSON.parse(await readFile(sourcePath, 'utf8'))
  const cssPath = sourcePath.replace(/\.tokens\.json$/, '.css')
  const css = render(sourcePath, document)
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
