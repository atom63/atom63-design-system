/**
 * How a native renderer resolves an Atom63 color for a skin, brand, surface and
 * mode, from the two files @atom63/styles generates in the browser:
 *
 * - the Figma sync model: variables whose values are literals or aliases, one
 *   value per mode of their collection;
 * - the computed values: variables that vary on more axes than one collection
 *   can hold, resolved for every combination of those axes.
 *
 * Resolving follows aliases like Figma does, taking each collection's mode from
 * the selection, and reads a computed variable from its table instead. The Swift
 * generator emits exactly this data and Sources/Atom63UI ports this function;
 * packages/styles checks the result against Chromium for every combination.
 */

export const skins = ['modern', 'aqua', 'retro', 'terminal']
export const brands = ['b1', 'b2', 'b3', 'b4', 'b5', 'b6']
export const surfaces = ['n1', 'n2', 'n3', 'n4', 'n5', 'n6']

/** The mode iOS uses for collections that are not part of the selection. */
export const fixedModes = {
  'Atom63 Design Language': 'ios',
}

/** Which selection field picks the mode of a collection, if any. */
export function selectionKey(collectionName) {
  switch (collectionName) {
    case 'Atom63 Theme':
      return 'skin-mode'
    case 'Atom63 Mode':
      return 'mode'
    case 'Atom63 Brand':
      return 'brand'
    case 'Atom63 Surface':
      return 'surface'
    default:
      return null
  }
}

/** The key of a computed value: its axes and their modes, in `variesOn` order. */
export function computedKey(variesOn, selection) {
  const modeOf = {
    theme: selection.skin,
    mode: selection.mode,
    brand: selection.brand,
    surface: selection.surface,
    // Axes outside the selection take the mode iOS always uses, as for collections.
    'design-language': 'ios',
    input: 'pointer',
    density: 'comfortable',
    radius: 'default',
    'type-scale': 'normal',
    font: 'sans',
    'window-size': 'md',
  }
  return variesOn
    .map(axis => {
      if (!(axis in modeOf))
        throw new Error(`computed axis ${axis} is not part of the iOS selection`)
      return `${axis}=${modeOf[axis]}`
    })
    .join(',')
}

export function createResolver(model, computedValues) {
  const byToken = new Map(
    model.collections.flatMap(collection =>
      collection.variables.map(variable => [variable.token, { collection, variable }])
    )
  )

  function modeFor(collection, selection) {
    const key = selectionKey(collection.name)
    if (key === 'skin-mode') return `${selection.skin}-${selection.mode}`
    if (key) return selection[key]
    return fixedModes[collection.name] ?? collection.modes[0]
  }

  /** The RGBA of a token for a selection { skin, brand, surface, mode }. */
  function resolve(token, selection, seen = []) {
    if (seen.includes(token)) throw new Error(`Alias cycle: ${[...seen, token].join(' -> ')}`)
    const computed = computedValues.tokens[token]
    if (computed) {
      const value = computed.values[computedKey(computed.variesOn, selection)]
      if (!value) throw new Error(`${token} has no computed value for ${JSON.stringify(selection)}`)
      return value
    }
    const found = byToken.get(token)
    if (!found) throw new Error(`${token} is not in the Figma sync model`)
    const entry = found.variable.values[modeFor(found.collection, selection)]
    if (entry?.alias) return resolve(entry.alias, selection, [...seen, token])
    const value = entry?.value
    if (typeof value !== 'object' || value === null || !('r' in value)) {
      throw new Error(`${token} does not resolve to a color for ${JSON.stringify(selection)}`)
    }
    return value
  }

  /** Every token `roots` can reach, following aliases in every mode. */
  function reachable(roots) {
    const found = new Set()
    const visit = token => {
      if (found.has(token)) return
      found.add(token)
      if (computedValues.tokens[token]) return
      const entry = byToken.get(token)
      if (!entry) throw new Error(`${token} is not in the Figma sync model`)
      for (const value of Object.values(entry.variable.values)) if (value.alias) visit(value.alias)
    }
    roots.forEach(visit)
    return found
  }

  return { byToken, modeFor, resolve, reachable }
}
