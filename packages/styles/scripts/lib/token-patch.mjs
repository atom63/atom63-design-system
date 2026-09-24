import path from 'node:path'

/**
 * Applies a token patch exported by the Atom63 Figma plugin to DTCG sources.
 * Pure: takes parsed documents, returns edited copies or the reasons it cannot.
 *
 * Version 1 maps CSS custom properties to Figma values in single-mode collections:
 *   { "format": "atom63-token-patch", "version": 1,
 *     "tokens": { "--color-b1-500": { "type": "COLOR", "value": { r, g, b, a } } } }
 * Version 2 lists changes per collection mode, each a literal or an alias:
 *   { "format": "atom63-token-patch", "version": 2, "changes": [
 *     { "token": "--a63-text-accent", "collection": "Atom63 Mode", "mode": "dark",
 *       "type": "COLOR", "alias": "--a63-brand-300" } ] }
 * A literal is converted back into the token's existing DTCG $type and units. A
 * multi-mode collection's change is written into the resolver context of its mode.
 */

/** sRGB channel (0..1) to linear light. */
function toLinear(channel) {
  return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4
}

/**
 * sRGB (0..1) to OKLCH, via linear sRGB → OKLab (Björn Ottosson,
 * https://bottosson.github.io/posts/oklab/). Hue in degrees, 0..360.
 */
export function srgbToOklch(r, g, b) {
  const [lr, lg, lb] = [r, g, b].map(toLinear)
  const l = Math.cbrt(0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb)
  const m = Math.cbrt(0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb)
  const s = Math.cbrt(0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb)
  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s
  const A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s
  const B = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s
  const hue = (Math.atan2(B, A) * 180) / Math.PI
  return [L, Math.hypot(A, B), hue < 0 ? hue + 360 : hue]
}

const round = (value, digits) => Number(value.toFixed(digits))

function toHex(channels) {
  return `#${channels.map(channel => channel.toString(16).padStart(2, '0')).join('')}`
}

/** Converts one Figma value into the token's current DTCG $value. */
export function convertValue(token, patchEntry) {
  const { type, value } = patchEntry
  switch (token.$type) {
    case 'color': {
      if (type !== 'COLOR') throw new Error(`expected a COLOR, got ${type}`)
      const alpha = round(value.a ?? 1, 3)
      if (token.$value.colorSpace === 'srgb') {
        const bytes = [value.r, value.g, value.b].map(channel => Math.round(channel * 255))
        return {
          colorSpace: 'srgb',
          components: bytes.map(byte => byte / 255),
          alpha,
          hex: toHex(bytes),
        }
      }
      if (token.$value.colorSpace === 'oklch') {
        const components = srgbToOklch(value.r, value.g, value.b).map(channel => round(channel, 3))
        return alpha === 1
          ? { colorSpace: 'oklch', components }
          : { colorSpace: 'oklch', components, alpha }
      }
      throw new Error(`unsupported colorSpace ${token.$value.colorSpace}`)
    }
    case 'dimension': {
      if (type !== 'FLOAT') throw new Error(`expected a FLOAT, got ${type}`)
      const { unit } = token.$value
      return { value: unit === 'rem' ? round(value / 16, 4) : round(value, 3), unit }
    }
    case 'duration': {
      if (type !== 'FLOAT') throw new Error(`expected a FLOAT, got ${type}`)
      const { unit } = token.$value
      return { value: unit === 's' ? round(value / 1000, 4) : round(value, 3), unit }
    }
    case 'number':
      if (type !== 'FLOAT') throw new Error(`expected a FLOAT, got ${type}`)
      return round(value, 4)
    default:
      throw new Error(`$type ${token.$type} cannot be written from Figma yet`)
  }
}

/** Walks a DTCG group and calls `visit(cssName, node, $type, path)` for each token. */
function walkTokens(group, trail, inheritedType, visit) {
  const type = group.$type ?? inheritedType
  for (const [key, node] of Object.entries(group)) {
    if (key.startsWith('$') && key !== '$root') continue
    if (Object.hasOwn(node, '$value')) {
      const path = key === '$root' ? trail : [...trail, key]
      visit(`--${path.join('-')}`, node, node.$type ?? type, path)
    } else {
      walkTokens(node, [...trail, key], type, visit)
    }
  }
}

/** Indexes every token in `*.tokens.json` documents: `--a-b-c` → { file, node, type, path }. */
export function indexTokens(documents) {
  const index = new Map()
  for (const [file, document] of documents) {
    if (file.endsWith('.resolver.json')) continue
    walkTokens(document, [], undefined, (name, node, type, path) =>
      index.set(name, { file, node, type, path })
    )
  }
  return index
}

/**
 * Indexes the tokens of DTCG resolvers, one entry per place a token is declared:
 * a set (applies in every context) or one context of the resolver's modifier.
 */
function indexResolvers(documents) {
  const entries = []
  for (const [file, document] of documents) {
    if (!file.endsWith('.resolver.json')) continue
    const [[axis, modifier] = [null, { contexts: {} }]] = Object.entries(document.modifiers ?? {})
    const contexts = Object.keys(modifier.contexts)
    for (const set of Object.values(document.sets ?? {})) {
      const { selector, atRule } = set.$extensions?.['io.atom63.css'] ?? {}
      // Only a set declared at :root with no condition applies everywhere.
      const unconditional = selector === ':root' && !atRule
      for (const source of set.sources) {
        walkTokens(source, [], undefined, (name, node, type, path) =>
          entries.push({
            file,
            node,
            type,
            path,
            name,
            axis,
            contexts,
            context: null,
            unconditional,
          })
        )
      }
    }
    for (const [context, sources] of Object.entries(modifier.contexts)) {
      for (const source of sources) {
        walkTokens(source, [], undefined, (name, node, type, path) =>
          entries.push({ file, node, type, path, name, axis, contexts, context })
        )
      }
    }
  }
  return entries
}

const isAlias = value => typeof value === 'string' && value.startsWith('{')

/** Where a v2 change is written, or why it cannot be: { target } | { error }. */
function locate(change, tokens, resolvers) {
  const { token, mode } = change
  const declared = resolvers.filter(entry => entry.name === token)
  if (mode === 'Value') {
    const target =
      tokens.get(token) ??
      declared.find(entry => entry.context === null && entry.unconditional !== false)
    if (target) return { target }
    if (declared.some(entry => entry.context === null)) {
      return {
        error: 'declared only in conditional scopes (media query or selector); edit it in code',
      }
    }
    if (declared.length) {
      const { axis, file } = declared[0]
      return { error: `varies by ${axis} in ${path.basename(file)}; edit it in its ${axis} modes` }
    }
    return { error: 'not defined in a DTCG source yet' }
  }
  const inContext = declared.find(entry => entry.context === mode)
  if (inContext) return { target: inContext }
  // A mode belongs to an axis if any resolver of that axis declares it as a context.
  const axisHasMode = axis =>
    resolvers.some(entry => entry.axis === axis && entry.contexts.includes(mode))
  const shared = declared.find(entry => entry.context === null && axisHasMode(entry.axis))
  if (shared) {
    return {
      error: `shared by every ${shared.axis} in ${path.basename(shared.file)}; a ${mode}-only exception is added in code`,
    }
  }
  return { error: `not defined for ${mode} in a DTCG source yet` }
}

function applyV2(copies, patch) {
  const tokens = indexTokens(copies)
  const resolvers = indexResolvers(copies)
  const known = new Map([
    ...[...tokens].map(([name, entry]) => [name, entry.path]),
    ...resolvers.map(entry => [entry.name, entry.path]),
  ])
  const errors = []
  const changed = []
  const touched = new Set()

  for (const change of patch.changes) {
    const label = change.mode === 'Value' ? change.token : `${change.token} (${change.mode})`
    const { target, error } = locate(change, tokens, resolvers)
    if (error) {
      errors.push(`${label}: ${error}`)
      continue
    }
    const { node, type, file } = target
    if (node.$extensions?.['io.atom63.derive'] !== undefined) {
      errors.push(`${label}: computed in CSS (io.atom63.derive); change its inputs instead`)
      continue
    }
    if (change.alias !== undefined) {
      const aliasPath = known.get(change.alias)
      if (!aliasPath) {
        errors.push(`${label}: alias target ${change.alias} is not a DTCG token`)
        continue
      }
      node.$value = `{${aliasPath.join('.')}}`
    } else {
      if (isAlias(node.$value)) {
        errors.push(
          `${label}: an alias in the DTCG source (${node.$value}); point it at another variable instead`
        )
        continue
      }
      try {
        node.$value = convertValue({ ...node, $type: type }, change)
      } catch (conversionError) {
        errors.push(`${label}: ${conversionError.message}`)
        continue
      }
    }
    changed.push(label)
    touched.add(file)
  }
  return { changed, errors, touched }
}

/**
 * Applies `patch` to `documents` (Map of file → parsed DTCG document), all or
 * nothing. Returns { documents, changed, errors }: `documents` holds edited
 * copies of the files that changed, and is empty when there are errors.
 *
 * Version 1 carries one literal per token for single-mode collections. Version 2
 * carries changes per collection mode, each a literal `value` or an `alias` (the
 * CSS custom property of another token); a change in a multi-mode collection is
 * written into the resolver context of that mode.
 */
export function applyPatch(documents, patch) {
  if (patch?.format !== 'atom63-token-patch' || ![1, 2].includes(patch.version)) {
    return {
      documents: new Map(),
      changed: [],
      errors: ['not an atom63-token-patch v1 or v2 file'],
    }
  }
  const copies = new Map(
    [...documents].map(([file, document]) => [file, JSON.parse(JSON.stringify(document))])
  )
  const v2 =
    patch.version === 2
      ? patch
      : {
          changes: Object.entries(patch.tokens).map(([token, entry]) => ({
            token,
            mode: 'Value',
            ...entry,
          })),
        }
  const { changed, errors, touched } = applyV2(copies, v2)
  if (errors.length) return { documents: new Map(), changed: [], errors }
  return {
    documents: new Map([...copies].filter(([file]) => touched.has(file))),
    changed,
    errors,
  }
}
