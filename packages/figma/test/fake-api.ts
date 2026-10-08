import type { CollectionLike, ModeLike, RawValue, VariableLike, VariablesApi } from '../src/apply'

/** In-memory stand-in for the slice of `figma.variables` the sync uses. */
export function createFakeApi({ maxModes = 10 } = {}) {
  let nextId = 0
  const collections: (CollectionLike & { modes: ModeLike[]; variableIds: string[] })[] = []
  const variables = new Map<string, VariableLike>()

  /**
   * A variable's value as Figma resolves it for a consumer: through aliases and
   * composed colors (an alias at an opacity scales the color's alpha). The fake
   * has no explicit modes, so every collection resolves in its first mode.
   */
  const resolve = (variable: VariableLike, depth = 0): unknown => {
    const collection = collections.find(item => item.variableIds.includes(variable.id))
    const raw = collection ? variable.valuesByMode[collection.modes[0].modeId] : undefined
    const target = (id: string) => {
      const next = variables.get(id)
      return next && depth < 16 ? resolve(next, depth + 1) : undefined
    }
    if (raw && typeof raw === 'object' && 'type' in raw && raw.type === 'VARIABLE_ALIAS')
      return target((raw as unknown as { id: string }).id)
    if (raw && typeof raw === 'object' && 'color' in raw && 'opacity' in raw) {
      const { color, opacity } = raw as { color: { id: string }; opacity: number }
      const resolved = target(color.id) as { r: number; g: number; b: number; a?: number }
      return resolved && { ...resolved, a: (resolved.a ?? 1) * (opacity / 100) }
    }
    if (raw && typeof raw === 'object' && 'r' in raw) return { a: 1, ...raw }
    return raw
  }

  const api: VariablesApi = {
    getLocalVariableCollectionsAsync: () => Promise.resolve([...collections]),
    getVariableByIdAsync: id => Promise.resolve(variables.get(id) ?? null),
    createVariableCollection(name) {
      const modes: ModeLike[] = [{ modeId: `m${nextId++}`, name: 'Mode 1' }]
      const collection = {
        id: `c${nextId++}`,
        name,
        modes,
        variableIds: [] as string[],
        addMode(modeName: string) {
          if (modes.length >= maxModes) throw new Error('Limited to 1 mode')
          const modeId = `m${nextId++}`
          modes.push({ modeId, name: modeName })
          return modeId
        },
        renameMode(modeId: string, modeName: string) {
          const mode = modes.find(item => item.modeId === modeId)
          if (mode) mode.name = modeName
        },
      }
      collections.push(collection)
      return collection
    },
    createVariable(name, collection, type) {
      const variable: VariableLike = {
        id: `v${nextId++}`,
        name,
        resolvedType: type,
        valuesByMode: {},
        setValueForMode(modeId: string, value: RawValue) {
          // Like Figma: a value, or an alias's target, must match the variable's type.
          const valueType =
            typeof value === 'object' && 'type' in value
              ? variables.get(value.id)?.resolvedType
              : typeof value === 'number'
                ? 'FLOAT'
                : typeof value === 'string'
                  ? 'STRING'
                  : typeof value === 'boolean'
                    ? 'BOOLEAN'
                    : 'COLOR'
          if (valueType !== this.resolvedType)
            throw new Error(`in setValueForMode: Mismatched variable resolved type for ${modeId}`)
          this.valuesByMode[modeId] = value
        },
        scopes: ['ALL_SCOPES'],
        codeSyntax: {},
        resolveForConsumer() {
          return { value: resolve(this), resolvedType: this.resolvedType }
        },
        setVariableCodeSyntax(platform, value) {
          this.codeSyntax = { ...this.codeSyntax, [platform]: value }
        },
        removeVariableCodeSyntax(platform) {
          const next = { ...this.codeSyntax }
          delete next[platform]
          this.codeSyntax = next
        },
      }
      variables.set(variable.id, variable)
      const target = collections.find(item => item.id === collection.id)
      target?.variableIds.push(variable.id)
      return variable
    },
    createVariableAlias: variable => ({ type: 'VARIABLE_ALIAS', id: variable.id }),
  }
  return { api, collections, variables, resolve }
}
