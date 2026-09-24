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
import { planExport, toTokenPatch } from '../src/sync/export'
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

describe('Atom63 Figma export', () => {
  async function syncedFile() {
    const fake = createFakeApi()
    await sync(fake.api)
    const byToken = (token: string) =>
      [...fake.variables.values()].find(item => item.getPluginData(TOKEN_KEY) === token)
    const modeId = (collection: string, mode: string) =>
      fake.collections
        .find(item => item.name === collection)
        ?.modes.find(item => item.name === mode)?.modeId ?? ''
    const exportPlan = async () => planExport(model, await readSnapshot(fake.api, model))
    return { ...fake, byToken, modeId, exportPlan }
  }

  it('exports nothing right after a sync', async () => {
    const { exportPlan } = await syncedFile()
    expect(await exportPlan()).toEqual({ changes: [], skipped: [] })
  })

  it('exports an edited color and number as a token patch', async () => {
    const { byToken, modeId, exportPlan } = await syncedFile()
    const value = modeId('Atom63 Foundation', 'Value')
    byToken('--color-b1-500')?.setValueForMode(value, { r: 0.1, g: 0.4, b: 0.9, a: 1 })
    byToken('--spacing-4')?.setValueForMode(value, 18)

    const plan = await exportPlan()
    expect(plan.skipped).toEqual([])
    expect(plan.changes.map(change => change.token).sort()).toEqual([
      '--color-b1-500',
      '--spacing-4',
    ])
    expect(toTokenPatch(plan)).toEqual({
      format: 'atom63-token-patch',
      version: 1,
      tokens: {
        '--color-b1-500': { type: 'COLOR', value: { r: 0.1, g: 0.4, b: 0.9, a: 1 } },
        '--spacing-4': { type: 'FLOAT', value: 18 },
      },
    })
  })

  it('skips what the patch cannot express, with a reason', async () => {
    const { byToken, modeId, exportPlan } = await syncedFile()
    // Multi-mode collection: the value belongs to one [data-a63-surface] scope.
    byToken('--surface-light-2')?.setValueForMode(modeId('Atom63 Surface', 'n2'), {
      r: 1,
      g: 0,
      b: 0,
      a: 1,
    })
    // Re-pointed at another variable in Figma.
    const blue = byToken('--color-b1-400')
    if (blue) {
      byToken('--color-b1-500')?.setValueForMode(modeId('Atom63 Foundation', 'Value'), {
        type: 'VARIABLE_ALIAS',
        id: blue.id,
      })
    }
    // A string token.
    byToken('--font-family-sans')?.setValueForMode(modeId('Atom63 Foundation', 'Value'), 'Inter')

    const plan = await exportPlan()
    expect(plan.changes).toEqual([])
    expect(plan.skipped.map(item => item.reason).sort()).toEqual([
      'Atom63 Surface has several modes',
      'an alias or unset value in Figma',
      'string tokens are not exported yet',
    ])
  })
})
