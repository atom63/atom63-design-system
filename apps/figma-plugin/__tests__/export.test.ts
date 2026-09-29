import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import {
  applyPlan,
  MOVED_PREFIX,
  readSnapshot,
  tokenOfCodeSyntax,
  type VariablesApi,
} from '@atom63/figma'
import { planExport, toTokenPatch } from '../src/sync/export'
import { planSync, type SyncModel, valuesEqual } from '@atom63/figma'
import { createFakeApi } from '../../../packages/figma/test/fake-api'

const model = JSON.parse(
  readFileSync(
    resolve(__dirname, '../../../packages/styles/generated/atom63.figma-sync.json'),
    'utf8'
  )
) as SyncModel

async function sync(api: VariablesApi, syncModel: SyncModel = model) {
  const plan = planSync(syncModel, await readSnapshot(api, syncModel))
  const result = await applyPlan(api, syncModel, plan)
  return { plan, result }
}

describe('Atom63 Figma export', () => {
  async function syncedFile() {
    const fake = createFakeApi()
    await sync(fake.api)
    const byToken = (token: string) =>
      [...fake.variables.values()].find(item => tokenOfCodeSyntax(item?.codeSyntax?.WEB) === token)
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
      version: 2,
      changes: [
        {
          token: '--color-b1-500',
          collection: 'Atom63 Foundation',
          mode: 'Value',
          type: 'COLOR',
          value: { r: 0.1, g: 0.4, b: 0.9, a: 1 },
        },
        {
          token: '--spacing-4',
          collection: 'Atom63 Foundation',
          mode: 'Value',
          type: 'FLOAT',
          value: 18,
        },
      ],
    })
  })

  it('exports a re-pointed alias in one mode of a multi-mode collection', async () => {
    const { byToken, modeId, exportPlan } = await syncedFile()
    const brand300 = byToken('--a63-brand-300')
    expect(brand300).toBeDefined()
    byToken('--a63-text-accent')?.setValueForMode(modeId('Atom63 Mode', 'dark'), {
      type: 'VARIABLE_ALIAS',
      id: brand300?.id ?? '',
    })

    const plan = await exportPlan()
    expect(plan.skipped).toEqual([])
    expect(toTokenPatch(plan).changes).toEqual([
      {
        token: '--a63-text-accent',
        collection: 'Atom63 Mode',
        mode: 'dark',
        type: 'COLOR',
        alias: '--a63-brand-300',
      },
    ])
  })

  it('skips what the patch cannot express, with a reason', async () => {
    const { byToken, modeId, exportPlan } = await syncedFile()
    // An alias in code (surface n2 points at the n2 palette), set to a raw color.
    byToken('--surface-light-2')?.setValueForMode(modeId('Atom63 Surface', 'n2'), {
      r: 1,
      g: 0,
      b: 0,
      a: 1,
    })
    // A string token.
    byToken('--font-family-sans')?.setValueForMode(modeId('Atom63 Foundation', 'Value'), 'Inter')

    const plan = await exportPlan()
    expect(plan.changes).toEqual([])
    expect(plan.skipped).toEqual([
      {
        name: 'font/family/sans',
        reason: 'string tokens are not exported yet',
      },
      {
        name: 'surface/light/2 (n2)',
        reason: 'an alias in code; point it at another variable instead of a raw value',
      },
    ])
  })

  it('exports a literal re-pointed at another variable as an alias', async () => {
    const { byToken, modeId, exportPlan } = await syncedFile()
    const blue = byToken('--color-b1-400')
    byToken('--color-b1-500')?.setValueForMode(modeId('Atom63 Foundation', 'Value'), {
      type: 'VARIABLE_ALIAS',
      id: blue?.id ?? '',
    })
    const plan = await exportPlan()
    expect(toTokenPatch(plan).changes).toEqual([
      {
        token: '--color-b1-500',
        collection: 'Atom63 Foundation',
        mode: 'Value',
        type: 'COLOR',
        alias: '--color-b1-400',
      },
    ])
  })
})
