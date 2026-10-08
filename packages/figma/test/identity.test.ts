import { applyPlan, readSnapshot, tokenOfCodeSyntax, type VariablesApi } from '../src/apply'
import { derivedToken, parseDerived } from '../src/derived'
import { planSync, type SyncModel } from '../src/plan'
import { createFakeApi } from './fake-api'

const model: SyncModel = {
  schemaVersion: 1,
  summary: { collections: 1, variables: 2, aliasValues: 1, skipped: 0 },
  skipped: [],
  collections: [
    {
      name: 'Brand',
      modes: ['b1', 'b2'],
      variables: [
        {
          name: 'brand/500',
          token: '--brand-500',
          type: 'COLOR',
          values: {
            b1: { value: { r: 0, g: 0, b: 1, a: 1 } },
            b2: { value: { r: 1, g: 0, b: 0, a: 1 } },
          },
          codeSyntax: 'var(--brand-500)',
          scopes: [],
        },
        {
          name: 'primary',
          token: '--primary',
          type: 'COLOR',
          values: { b1: { alias: '--brand-500' }, b2: { alias: '--brand-500' } },
          codeSyntax: 'var(--primary)',
          scopes: ['ALL_SCOPES'],
        },
      ],
    },
  ],
}

async function sync(api: VariablesApi) {
  const plan = planSync(model, await readSnapshot(api, model))
  await applyPlan(api, model, plan)
  return planSync(model, await readSnapshot(api, model))
}

describe('identity by code syntax', () => {
  it('reads the token from web code syntax', () => {
    expect(tokenOfCodeSyntax('var(--primary)')).toBe('--primary')
    expect(tokenOfCodeSyntax('var( --a63-surface-page )')).toBe('--a63-surface-page')
    expect(tokenOfCodeSyntax(undefined)).toBeNull()
    expect(tokenOfCodeSyntax('16px')).toBeNull()
  })

  it("reads a derived variable's color-mix code syntax as its canonical key", () => {
    const key = 'color-mix(in oklch, var(--a63-action-danger) 10%, transparent)'
    expect(tokenOfCodeSyntax(key)).toBe(key)
    expect(
      tokenOfCodeSyntax('color-mix( in  oklch,var( --a63-action-danger )  10.0%,transparent )')
    ).toBe(key)
    expect(parseDerived(key)).toEqual({ alias: '--a63-action-danger', opacity: 10 })
    expect(derivedToken('--a63-action-danger', 12.5)).toBe(
      'color-mix(in oklch, var(--a63-action-danger) 12.5%, transparent)'
    )
    // Only the form the recipe writes: another space, color or a 0% mix is not a derived variable.
    expect(tokenOfCodeSyntax('color-mix(in srgb, var(--a) 10%, transparent)')).toBeNull()
    expect(tokenOfCodeSyntax('color-mix(in oklch, var(--a) 10%, white)')).toBeNull()
    expect(tokenOfCodeSyntax('color-mix(in oklch, var(--a) 0%, transparent)')).toBeNull()
  })

  it('recognizes variables written without plugin data', async () => {
    const { api } = createFakeApi()
    expect((await sync(api)).totals).toMatchObject({ create: 0, update: 0, unchanged: 2 })
  })

  it('keeps matching a variable a designer renamed', async () => {
    const { api, variables } = createFakeApi()
    await sync(api)
    const primary = [...variables.values()].find(item => item.name === 'primary')
    if (!primary) throw new Error('primary missing')
    primary.name = 'roles/primary'
    const plan = planSync(model, await readSnapshot(api, model))
    expect(plan.totals).toMatchObject({ create: 0, update: 1 })
    expect(plan.changes[0]).toMatchObject({ kind: 'update', rename: true })
  })

  it('adopts a variable an older sync left without code syntax, by name', async () => {
    const { api } = createFakeApi()
    const collection = api.createVariableCollection('Brand')
    collection.renameMode(collection.modes[0].modeId, 'b1')
    collection.addMode('b2')
    api.createVariable('brand/500', collection, 'COLOR')
    const after = await sync(api)
    expect(after.totals).toMatchObject({ create: 0, update: 0, unchanged: 2 })
    const snapshot = await readSnapshot(api, model)
    expect(snapshot[0].variables.filter(item => item.name === 'brand/500')).toHaveLength(1)
  })

  it('leaves a variable made in Figma alone and does not call it orphaned', async () => {
    const { api, collections } = createFakeApi()
    await sync(api)
    const made = api.createVariable('my-accent', collections[0], 'COLOR')
    made.setValueForMode(collections[0].modes[0].modeId, { r: 0, g: 1, b: 0, a: 1 })
    const plan = planSync(model, await readSnapshot(api, model))
    expect(plan.totals).toMatchObject({ create: 0, update: 0, orphaned: 0 })
    await applyPlan(api, model, plan)
    expect(made.valuesByMode[collections[0].modes[0].modeId]).toEqual({ r: 0, g: 1, b: 0, a: 1 })
  })

  it('does not match by name a variable that already stands for another token', async () => {
    const { api } = createFakeApi()
    const color = { value: { r: 0, g: 0, b: 1, a: 1 } }
    const one = (variables: SyncModel['collections'][number]['variables']): SyncModel => ({
      ...model,
      collections: [{ name: 'Base', modes: ['Value'], variables }],
    })
    const v1 = one([{ name: 'a', token: '--b', type: 'COLOR', values: { Value: color } }])
    const v2 = one([
      { name: 'b2', token: '--b', type: 'COLOR', values: { Value: color } },
      { name: 'a', token: '--a', type: 'COLOR', values: { Value: color } },
    ])
    await applyPlan(api, v1, planSync(v1, await readSnapshot(api, v1)))
    await applyPlan(api, v2, planSync(v2, await readSnapshot(api, v2)))
    expect(planSync(v2, await readSnapshot(api, v2)).totals).toMatchObject({ create: 0, update: 0 })
  })
})
