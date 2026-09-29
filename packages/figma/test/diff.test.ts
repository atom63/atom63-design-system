import { resolve } from 'node:path'

import { applyPlan, readSnapshot } from '../src/apply'
import { readTokenDirectory } from '../src/css-files'
import { buildProjectModel } from '../src/css-model'
import { diffTokens, formatDiff } from '../src/diff'
import { planSync, type SnapshotCollection } from '../src/plan'
import { buildReadScript } from '../src/scripts'
import { createFakeFigma } from './fake-figma'

const project = buildProjectModel(readTokenDirectory(resolve(__dirname, 'fixtures/project-tokens')))

async function synced() {
  const fake = createFakeFigma()
  const plan = planSync(project.model, await readSnapshot(fake.api, project.model))
  await applyPlan(fake.api, project.model, plan)
  return fake
}

const read = async (run: (script: string) => Promise<unknown>) =>
  (await run(buildReadScript())) as SnapshotCollection[]

describe('Figma to code', () => {
  it('finds nothing right after a sync', async () => {
    const { run } = await synced()
    const diff = diffTokens(project, await read(run))
    expect(diff).toEqual({ changed: [], proposed: [], missing: [] })
    expect(formatDiff(diff)).toBe('')
  })

  it('lists an edited value with its file and selector', async () => {
    const { run, variables, collections } = await synced()
    const radius = [...variables.values()].find(item => item.codeSyntax?.WEB === 'var(--radius)')
    if (!radius) throw new Error('--radius missing')
    const collection = collections.find(item => item.variableIds.includes(radius.id))
    if (!collection) throw new Error('collection missing')
    radius.setValueForMode(collection.modes[0].modeId, 6)
    const diff = diffTokens(project, await read(run))
    expect(diff.changed).toHaveLength(1)
    expect(diff.changed[0]).toMatchObject({ token: '--radius', to: { value: 6 } })
    expect(formatDiff(diff)).toContain('`--radius`')
  })

  it('lists a variable made in Figma as a proposed token', async () => {
    const { run, api, collections } = await synced()
    const made = api.createVariable('my-accent', collections[0], 'COLOR')
    made.setValueForMode(collections[0].modes[0].modeId, { r: 0, g: 1, b: 0, a: 1 })
    const diff = diffTokens(project, await read(run))
    expect(diff.proposed).toEqual([
      expect.objectContaining({ collection: collections[0].name, name: 'my-accent' }),
    ])
    expect(formatDiff(diff)).toContain('my-accent')
  })

  it('lists tokens the file does not have', async () => {
    const { run } = createFakeFigma()
    const diff = diffTokens(project, await read(run))
    expect(diff.missing.length).toBe(project.model.summary.variables)
    expect(formatDiff(diff)).toContain('Not in Figma yet')
  })
})
