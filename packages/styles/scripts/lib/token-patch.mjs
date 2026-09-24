/**
 * Applies a token patch exported by the Atom63 Figma plugin to DTCG sources.
 * Pure: takes parsed documents, returns edited copies or the reasons it cannot.
 *
 * A patch maps CSS custom properties to Figma values:
 *   { "format": "atom63-token-patch", "version": 1,
 *     "tokens": { "--color-b1-500": { "type": "COLOR", "value": { r, g, b, a } } } }
 * Each value is converted back into the token's existing DTCG $type and units.
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

/** Indexes every token by CSS custom property: `--a-b-c` → { file, node, $type }. */
export function indexTokens(documents) {
  const index = new Map()
  for (const [file, document] of documents) {
    const visit = (group, trail, inheritedType) => {
      const type = group.$type ?? inheritedType
      for (const [key, node] of Object.entries(group)) {
        if (key.startsWith('$') && key !== '$root') continue
        if (Object.hasOwn(node, '$value')) {
          const name = `--${(key === '$root' ? trail : [...trail, key]).join('-')}`
          index.set(name, { file, node, type: node.$type ?? type })
        } else {
          visit(node, [...trail, key], type)
        }
      }
    }
    visit(document, [], undefined)
  }
  return index
}

/**
 * Applies `patch` to `documents` (Map of file → parsed DTCG document), all or
 * nothing. Returns { documents, changed, errors }: `documents` holds edited
 * copies of the files that changed, and is empty when there are errors.
 */
export function applyPatch(documents, patch) {
  if (patch?.format !== 'atom63-token-patch' || patch.version !== 1) {
    return { documents: new Map(), changed: [], errors: ['not an atom63-token-patch v1 file'] }
  }
  const copies = new Map(
    [...documents].map(([file, document]) => [file, JSON.parse(JSON.stringify(document))])
  )
  const index = indexTokens(copies)
  const errors = []
  const changed = []
  const touched = new Set()

  for (const [name, entry] of Object.entries(patch.tokens)) {
    const token = index.get(name)
    if (!token) {
      errors.push(`${name}: not defined in a DTCG source yet`)
      continue
    }
    if (typeof token.node.$value === 'string' && token.node.$value.startsWith('{')) {
      errors.push(`${name}: an alias in the DTCG source (${token.node.$value})`)
      continue
    }
    try {
      token.node.$value = convertValue({ ...token.node, $type: token.type }, entry)
      changed.push(name)
      touched.add(token.file)
    } catch (error) {
      errors.push(`${name}: ${error.message}`)
    }
  }

  if (errors.length) return { documents: new Map(), changed: [], errors }
  return {
    documents: new Map([...copies].filter(([file]) => touched.has(file))),
    changed,
    errors,
  }
}
