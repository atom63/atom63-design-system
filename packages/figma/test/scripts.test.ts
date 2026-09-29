import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { readSnapshot } from '../src/apply'
import { readTokenDirectory } from '../src/css-files'
import { buildProjectModel } from '../src/css-model'
import { packModel, unpackModel } from '../src/pack'
import { planSync, type SyncModel } from '../src/plan'
import { buildScripts } from '../src/scripts'
import { createFakeFigma } from './fake-figma'

const atom63 = JSON.parse(
  readFileSync(resolve(__dirname, '../../styles/generated/atom63.figma-sync.json'), 'utf8')
) as SyncModel
const project = buildProjectModel(
  readTokenDirectory(resolve(__dirname, 'fixtures/project-tokens'))
).model

describe('scripts for use_figma', () => {
  it('packs and unpacks a token set without losing anything', () => {
    for (const model of [atom63, project]) {
      const back = unpackModel(packModel(model))
      expect(back.collections).toHaveLength(model.collections.length)
      back.collections.forEach((collection, index) => {
        const original = model.collections[index]
        expect(collection.modes).toEqual(original.modes)
        collection.variables.forEach((variable, position) => {
          const expected = original.variables[position]
          expect(variable.name).toBe(expected.name)
          expect(variable.token).toBe(expected.token)
          expect(variable.codeSyntax).toBe(expected.codeSyntax)
          expect(variable.scopes).toEqual(expected.scopes)
          for (const mode of original.modes) {
            const got = variable.values[mode]
            const want = expected.values[mode]
            if (want && 'value' in want && typeof want.value === 'object') {
              if (!got || !('value' in got) || typeof got.value !== 'object') throw new Error(mode)
              for (const channel of ['r', 'g', 'b', 'a'] as const)
                expect(got.value[channel]).toBeCloseTo(want.value[channel], 4)
            } else expect(got).toEqual(want)
          }
        })
      })
    }
  })

  it('keeps every script under 50,000 characters, for the whole Atom63 set', () => {
    const scripts = buildScripts(atom63, 'sync')
    expect(scripts.length).toBeGreaterThan(1)
    for (const script of scripts) expect(script.length).toBeLessThan(50_000)
  })

  it('syncs in parts, aliases across parts included, and plans nothing on a second run', async () => {
    const { run } = createFakeFigma()
    for (const script of buildScripts(atom63, 'sync'))
      expect(await run(script)).toMatchObject({ verification: { create: 0, update: 0 } })
    for (const script of buildScripts(atom63, 'check')) {
      const result = (await run(script)) as { planned: Record<string, number> }
      expect(result).toMatchObject({ planned: { create: 0, update: 0 } })
      // A part knows only its own tokens, so it cannot tell what is orphaned.
      expect(result.planned).not.toHaveProperty('orphaned')
    }
  })

  it('writes values the full-precision model reads as unchanged', async () => {
    for (const model of [atom63, project]) {
      const { run, api } = createFakeFigma()
      for (const script of buildScripts(model, 'sync')) await run(script)
      const plan = planSync(model, await readSnapshot(api, model))
      expect(plan.totals).toMatchObject({ create: 0, update: 0 })
    }
  })

  it('check scripts only read', async () => {
    const { run, collections } = createFakeFigma()
    for (const script of buildScripts(project, 'check'))
      expect(await run(script)).toMatchObject({ planned: { update: 0 } })
    expect(collections).toHaveLength(0)
  })

  it('reads the project token directory in import order', () => {
    const names = readTokenDirectory(resolve(__dirname, 'fixtures/project-tokens')).map(
      file => file.name
    )
    expect(names).not.toContain('index.css')
    expect(names.indexOf('palette.css')).toBeLessThan(names.indexOf('semantic.css'))
  })
})
