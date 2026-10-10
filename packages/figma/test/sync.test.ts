import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import {
  applyPlan,
  MOVED_PREFIX,
  readSnapshot,
  tokenOfCodeSyntax,
  type VariablesApi,
} from '../src/apply'
import { planSync, type SyncModel, valuesEqual } from '../src/plan'
import { createFakeApi } from './fake-api'

const model = JSON.parse(
  readFileSync(resolve(__dirname, '../../styles/generated/atom63.figma-sync.json'), 'utf8')
) as SyncModel

async function sync(api: VariablesApi, syncModel: SyncModel = model) {
  const plan = planSync(syncModel, await readSnapshot(api, syncModel))
  const result = await applyPlan(api, syncModel, plan)
  return { plan, result }
}

describe('Atom63 Figma sync', () => {
  it('names collections without the Atom63 prefix', () => {
    expect(model.collections.map(collection => collection.name)).toEqual([
      'Theme',
      'Contract',
      'Semantic',
      'Foundation',
      'Mode',
      'Brand',
      'Surface',
      'Design Language',
      'Input',
      'Density',
      'Radius',
      'Type Scale',
      'Font',
      'Window Size',
    ])
  })

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
      move: 0,
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
      [...variables.values()].map(variable => [
        tokenOfCodeSyntax(variable?.codeSyntax?.WEB),
        variable,
      ])
    )
    const surfacePage = byToken.get('--a63-surface-page')
    const lightModeId = Object.keys(surfacePage?.valuesByMode ?? {})[0]
    const light = surfacePage?.valuesByMode[lightModeId]

    expect(light).toEqual({ type: 'VARIABLE_ALIAS', id: byToken.get('--surface-light-2')?.id })
  })

  it('writes a color at an opacity as a composed color, with code syntax and scopes', async () => {
    const { api, collections, variables } = createFakeApi()
    await sync(api)
    const byToken = new Map(
      [...variables.values()].map(variable => [
        tokenOfCodeSyntax(variable?.codeSyntax?.WEB),
        variable,
      ])
    )
    const theme = collections.find(item => item.name === 'Theme')
    const terminalLight = theme?.modes.find(item => item.name === 'terminal-light')?.modeId ?? ''
    const focusRing = byToken.get('--a63-control-focus-ring-color')

    expect(focusRing?.valuesByMode[terminalLight]).toEqual({
      color: { type: 'VARIABLE_ALIAS', id: byToken.get('--a63-action-primary')?.id },
      opacity: 55,
    })
    expect(focusRing?.codeSyntax).toEqual({ WEB: 'var(--a63-control-focus-ring-color)' })
    expect(focusRing?.scopes).toEqual(['STROKE_COLOR'])
    expect(byToken.get('--color-b1-500')?.scopes).toEqual([])
    expect(byToken.get('--a63-text-primary')?.scopes).toEqual(['TEXT_FILL'])
  })

  it('updates only the mode whose value drifted', async () => {
    const { api, collections, variables } = createFakeApi()
    await sync(api)
    const mode = collections.find(item => item.name === 'Design Language')
    const height = [...variables.values()].find(
      item => tokenOfCodeSyntax(item?.codeSyntax?.WEB) === '--a63-control-height-md'
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
      item => tokenOfCodeSyntax(item?.codeSyntax?.WEB) === '--spacing-4'
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
    const foundation = collections.find(item => item.name === 'Foundation')
    const stale = foundation && api.createVariable('retired/token', foundation, 'FLOAT')
    stale?.setVariableCodeSyntax?.('WEB', 'var(--retired-token)')

    const plan = planSync(model, await readSnapshot(api, model))
    expect(plan.totals.orphaned).toBe(1)
    expect(plan.collections.find(item => item.name === 'Foundation')?.orphaned).toEqual([
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

  it('treats a number Figma stored as a 32-bit float as unchanged', () => {
    for (const value of [10.8, 51.6, 64.8, 73.2, 1234.56]) {
      expect(valuesEqual({ value }, { value: Math.fround(value) })).toBe(true)
    }
    expect(valuesEqual({ value: 64.8 }, { value: 64.81 })).toBe(false)
    expect(
      valuesEqual(
        { composed: { alias: '--a', opacity: 33.3 } },
        { composed: { alias: '--a', opacity: Math.fround(33.3) } }
      )
    ).toBe(true)
  })
})

describe('Atom63 Figma sync: a token moving to another collection', () => {
  // Two small models: --x lives in Contract, then moves to a two-mode Theme
  // collection; --y aliases --x throughout.
  const color = (r: number) => ({ value: { r, g: 0, b: 0, a: 1 } })
  const before: SyncModel = {
    schemaVersion: 1,
    summary: { collections: 2, variables: 2, aliasValues: 1, skipped: 0 },
    collections: [
      {
        name: 'Contract',
        modes: ['Value'],
        variables: [{ name: 'x', token: '--x', type: 'COLOR', values: { Value: color(0.2) } }],
      },
      {
        name: 'Semantic',
        modes: ['Value'],
        variables: [
          { name: 'y', token: '--y', type: 'COLOR', values: { Value: { alias: '--x' } } },
        ],
      },
    ],
    skipped: [],
  }
  const after: SyncModel = {
    ...before,
    collections: [
      { name: 'Contract', modes: ['Value'], variables: [] },
      before.collections[1],
      {
        name: 'Theme',
        modes: ['modern-light', 'aqua-light'],
        variables: [
          {
            name: 'x',
            token: '--x',
            type: 'COLOR',
            values: { 'modern-light': color(0.2), 'aqua-light': color(0.8) },
          },
        ],
      },
    ],
  }

  it('creates the variable in its new collection, re-points aliases and retires the old one', async () => {
    const fake = createFakeApi()
    await sync(fake.api, before)
    const oldX = [...fake.variables.values()].find(
      item => tokenOfCodeSyntax(item?.codeSyntax?.WEB) === '--x'
    )
    const { plan, result } = await sync(fake.api, after)

    expect(plan.totals.move).toBe(1)
    expect(plan.collections.find(item => item.name === 'Contract')?.orphaned).toEqual([])
    expect(result.moved).toBe(1)
    // Without a document to search (use_figma has no rebind), the move says so.
    expect(result.bindingsUnchecked).toBe(1)

    const newX = [...fake.variables.values()].find(
      item => tokenOfCodeSyntax(item?.codeSyntax?.WEB) === '--x'
    )
    expect(newX?.id).not.toBe(oldX?.id)
    const theme = fake.collections.find(item => item.name === 'Theme')
    expect(theme?.variableIds).toContain(newX?.id)

    // --y now aliases the new variable in every mode.
    const y = [...fake.variables.values()].find(
      item => tokenOfCodeSyntax(item?.codeSyntax?.WEB) === '--y'
    )
    expect(Object.values(y?.valuesByMode ?? {})).toEqual([{ type: 'VARIABLE_ALIAS', id: newX?.id }])

    // The old variable is kept, renamed and untagged, so no design loses a binding.
    expect(oldX?.name).toBe(`${MOVED_PREFIX}/x`)
    expect(tokenOfCodeSyntax(oldX?.codeSyntax?.WEB)).toBeNull()
    expect(oldX?.hiddenFromPublishing).toBe(true)

    const again = planSync(after, await readSnapshot(fake.api, after))
    expect(again.totals).toMatchObject({ move: 0, create: 0, update: 0, orphaned: 0 })
  })
})
