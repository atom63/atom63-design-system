import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { applyPlan, readSnapshot } from '../src/apply'
import { readTokenDirectory } from '../src/css-files'
import { buildProjectModel } from '../src/css-model'
import { diffTokens, formatDiff } from '../src/diff'
import { type PackedSnapshot, unpackSnapshot } from '../src/pack'
import { planSync, type SyncModel } from '../src/plan'
import { buildReadScript, buildScripts } from '../src/scripts'
import { createFakeFigma } from './fake-figma'

const project = buildProjectModel(readTokenDirectory(resolve(__dirname, 'fixtures/project-tokens')))

async function synced() {
  const fake = createFakeFigma()
  const plan = planSync(project.model, await readSnapshot(fake.api, project.model))
  await applyPlan(fake.api, project.model, plan)
  return fake
}

const read = async (run: (script: string) => Promise<unknown>) =>
  unpackSnapshot((await run(buildReadScript())) as PackedSnapshot)

describe('Figma to code', () => {
  it('finds nothing right after a sync', async () => {
    const { run } = await synced()
    const diff = diffTokens(project, await read(run))
    expect(diff).toEqual({ changed: [], proposed: [], missing: [], orphaned: [] })
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

  it('lists variables whose token the code no longer has', async () => {
    const { run, api, collections } = await synced()
    const gone = api.createVariable('old/accent', collections[0], 'COLOR')
    gone.setVariableCodeSyntax?.('WEB', 'var(--old-accent)')
    const diff = diffTokens(project, await read(run))
    expect(diff.orphaned).toEqual([
      { collection: collections[0].name, name: 'old/accent', token: '--old-accent' },
    ])
    expect(formatDiff(diff)).toContain('--old-accent')
  })

  it('lists tokens the file does not have', async () => {
    const { run } = createFakeFigma()
    const diff = diffTokens(project, await read(run))
    expect(diff.missing.length).toBe(project.model.summary.variables)
    expect(formatDiff(diff)).toContain('Not in Figma yet')
  })

  it('returns the whole Atom63 file compactly, and it reads back as in sync', async () => {
    const atom63 = JSON.parse(
      readFileSync(resolve(__dirname, '../../styles/generated/atom63.figma-sync.json'), 'utf8')
    ) as SyncModel
    const { run } = createFakeFigma()
    for (const script of buildScripts(atom63, 'sync')) await run(script)
    const result = await run(buildReadScript())
    expect(JSON.stringify(result).length).toBeLessThan(100_000)
    const diff = diffTokens(
      { model: atom63, sources: {}, notes: [] },
      unpackSnapshot(result as PackedSnapshot)
    )
    expect(diff).toEqual({ changed: [], proposed: [], missing: [], orphaned: [] })
  })
})
