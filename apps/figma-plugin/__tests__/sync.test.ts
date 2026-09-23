import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import {
  applyPlan,
  type CollectionLike,
  type ModeLike,
  type RawValue,
  readSnapshot,
  TOKEN_KEY,
  type VariableLike,
  type VariablesApi,
} from '../src/sync/apply'
import { planSync, type SyncModel, valuesEqual } from '../src/sync/plan'

const model = JSON.parse(
  readFileSync(
    resolve(__dirname, '../../../packages/styles/generated/atom63.figma-sync.json'),
    'utf8'
  )
) as SyncModel

/** In-memory stand-in for the slice of `figma.variables` the sync uses. */
function createFakeApi({ maxModes = 10 } = {}) {
  let nextId = 0
  const collections: (CollectionLike & { modes: ModeLike[]; variableIds: string[] })[] = []
  const variables = new Map<string, VariableLike>()

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
      const pluginData = new Map<string, string>()
      const variable: VariableLike = {
        id: `v${nextId++}`,
        name,
        resolvedType: type,
        valuesByMode: {},
        setValueForMode(modeId: string, value: RawValue) {
          this.valuesByMode[modeId] = value
        },
        getPluginData: key => pluginData.get(key) ?? '',
        setPluginData: (key, value) => void pluginData.set(key, value),
      }
      variables.set(variable.id, variable)
      const target = collections.find(item => item.id === collection.id)
      target?.variableIds.push(variable.id)
      return variable
    },
    createVariableAlias: variable => ({ type: 'VARIABLE_ALIAS', id: variable.id }),
  }
  return { api, collections, variables }
}

async function sync(api: VariablesApi) {
  const plan = planSync(model, await readSnapshot(api, model))
  const result = await applyPlan(api, model, plan)
  return { plan, result }
}

describe('Atom63 Figma sync', () => {
  it('creates every collection, mode, and variable in an empty file', async () => {
    const { api, collections } = createFakeApi()
    const { plan, result } = await sync(api)

    expect(plan.totals.create).toBe(model.summary.variables)
    expect(result.createdCollections).toBe(model.collections.length)
    expect(result.created).toBe(model.summary.variables)
    for (const collection of model.collections) {
      const created = collections.find(item => item.name === collection.name)
      expect(created?.modes.map(mode => mode.name)).toEqual(collection.modes)
    }
  })

  it('plans zero changes on a second sync', async () => {
    const { api } = createFakeApi()
    await sync(api)
    const plan = planSync(model, await readSnapshot(api, model))

    expect(plan.totals).toEqual({
      create: 0,
      update: 0,
      unchanged: model.summary.variables,
      orphaned: 0,
      typeConflicts: 0,
    })
  })

  it('writes aliases as Figma aliases to the target token variable', async () => {
    const { api, variables } = createFakeApi()
    await sync(api)
    const byToken = new Map(
      [...variables.values()].map(variable => [variable.getPluginData(TOKEN_KEY), variable])
    )
    const surfacePage = byToken.get('--a63-surface-page')
    const lightModeId = Object.keys(surfacePage?.valuesByMode ?? {})[0]
    const light = surfacePage?.valuesByMode[lightModeId]

    expect(light).toEqual({ type: 'VARIABLE_ALIAS', id: byToken.get('--surface-light-2')?.id })
  })

  it('updates only the mode whose value drifted', async () => {
    const { api, collections, variables } = createFakeApi()
    await sync(api)
    const mode = collections.find(item => item.name === 'Atom63 Design Language')
    const height = [...variables.values()].find(
      item => item.getPluginData(TOKEN_KEY) === '--a63-control-height-md'
    )
    const iosModeId = mode?.modes.find(item => item.name === 'ios')?.modeId ?? ''
    height?.setValueForMode(iosModeId, 40)

    const plan = planSync(model, await readSnapshot(api, model))
    expect(plan.totals.update).toBe(1)
    expect(plan.changes[0]).toMatchObject({ kind: 'update', modes: ['ios'], rename: false })

    await applyPlan(api, model, plan)
    expect(height?.valuesByMode[iosModeId]).toBe(44)
  })

  it('renames a variable matched by token instead of recreating it', async () => {
    const { api, variables } = createFakeApi()
    await sync(api)
    const spacing = [...variables.values()].find(
      item => item.getPluginData(TOKEN_KEY) === '--spacing-4'
    )
    const originalName = spacing?.name
    if (spacing) spacing.name = 'renamed/by/designer'

    const plan = planSync(model, await readSnapshot(api, model))
    expect(plan.totals).toMatchObject({ create: 0, update: 1 })
    await applyPlan(api, model, plan)
    expect(spacing?.name).toBe(originalName)
  })

  it('reports Atom63 variables the model no longer has without deleting them', async () => {
    const { api, collections } = createFakeApi()
    await sync(api)
    const foundation = collections.find(item => item.name === 'Atom63 Foundation')
    const stale = foundation && api.createVariable('retired/token', foundation, 'FLOAT')
    stale?.setPluginData(TOKEN_KEY, '--retired-token')

    const plan = planSync(model, await readSnapshot(api, model))
    expect(plan.totals.orphaned).toBe(1)
    expect(plan.collections.find(item => item.name === 'Atom63 Foundation')?.orphaned).toEqual([
      'retired/token',
    ])
  })

  it('explains the Figma plan limit when a collection cannot gain modes', async () => {
    const { api } = createFakeApi({ maxModes: 1 })
    await expect(sync(api)).rejects.toThrow(/Professional plan/)
  })

  it('compares colors and numbers with a small tolerance', () => {
    expect(
      valuesEqual(
        { value: { r: 0.1, g: 0.2, b: 0.3, a: 1 } },
        { value: { r: 0.1000000001, g: 0.2, b: 0.3, a: 1 } }
      )
    ).toBe(true)
    expect(valuesEqual({ value: 44 }, { value: 40 })).toBe(false)
    expect(valuesEqual({ alias: '--a' }, { value: 1 })).toBe(false)
  })
})
