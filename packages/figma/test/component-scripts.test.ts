import { readFileSync } from 'node:fs'

import type { ComponentModel } from '../src/components/model'
import { packComponentModel, unpackComponentModel } from '../src/components/pack-component'
import { buildComponentScripts } from '../src/components/scripts'
import { parseDerived } from '../src/derived'
import type { SyncModel } from '../src/plan'
import { syncModel } from '../src/runtime'
import { buildScripts } from '../src/scripts'
import { createFakeNodes } from './fake-nodes'
import { buttonModelFixture, syncFixture } from './fixtures/button'

const read = (path: string) =>
  JSON.parse(readFileSync(new URL(path, import.meta.url), 'utf8')) as unknown
const realSyncModel = read('../../styles/generated/atom63.figma-sync.json') as SyncModel
const realButtonModel = read('../generated/atom63.figma-components.json') as ComponentModel

interface Counts {
  missingVariables: string[]
  variables: number
  create: number
  update: number
  unchanged: number
  differences?: { variant: string; what: string; actual?: string; expected?: string }[]
}
interface SyncPart {
  part: number
  parts: number
  variants: number
  planned: Counts
  applied: { variables: number; created: number; updated: number; fontFallbacks: string[] }
  verification: Counts
}
interface CheckPart {
  part: number
  parts: number
  variants: number
  planned: Counts
}

/** The model a script carries, read back from its packed form. */
const modelIn = (script: string) => {
  const json = /A63Figma\.\w+\(figma, (.*)\);\nreturn/s.exec(script)?.[1]
  if (!json) throw new Error('no packed model in the script')
  return unpackComponentModel(JSON.parse(json))
}
/** The variant names a script carries. */
const namesIn = (script: string) => modelIn(script).variants.map(variant => variant.name)

describe('packed component models', () => {
  it('unpack to the model they were packed from', () => {
    for (const model of [buttonModelFixture, realButtonModel])
      expect(unpackComponentModel(packComponentModel(model))).toEqual(model)
  })

  it('carry the doc block through a round trip', () => {
    expect(realButtonModel.doc).toBeDefined()
    const unpacked = unpackComponentModel(
      JSON.parse(JSON.stringify(packComponentModel(realButtonModel)))
    )
    expect(unpacked.doc).toEqual(realButtonModel.doc)
    expect('doc' in unpackComponentModel(packComponentModel(buttonModelFixture))).toBe(false)
  })

  it('are much smaller than the model', () => {
    const packed = JSON.stringify(packComponentModel(realButtonModel)).length
    expect(packed).toBeLessThan(JSON.stringify(realButtonModel).length / 4)
  })
})

describe('component scripts for use_figma', () => {
  it('splits the model into scripts under the limit, every variant in exactly one', () => {
    for (const action of ['sync', 'check'] as const) {
      const scripts = buildComponentScripts(realButtonModel, action)
      expect(scripts.length).toBeGreaterThan(1)
      for (const script of scripts) expect(script.length).toBeLessThan(49_000)
      const names = scripts.flatMap(namesIn)
      expect(new Set(names).size).toBe(names.length)
      expect(names).toEqual(realButtonModel.variants.map(variant => variant.name))
    }
  })

  it('carries the doc block in the last part only, every part still under the limit', () => {
    for (const action of ['sync', 'check'] as const) {
      const scripts = buildComponentScripts(realButtonModel, action)
      const withDoc = scripts.map(script => modelIn(script).doc !== undefined)
      expect(withDoc.filter(Boolean)).toHaveLength(1)
      expect(withDoc.at(-1)).toBe(true)
      expect(modelIn(scripts.at(-1)!).doc).toEqual(realButtonModel.doc)
      for (const script of scripts) expect(script.length).toBeLessThan(49_000)
    }
  })

  it('moves variants out of the last part when the doc block would push it over', () => {
    const doc = { ...realButtonModel.doc!, usage: 'x'.repeat(6000) }
    const model = { ...realButtonModel, doc }
    const scripts = buildComponentScripts(model, 'sync')
    const withoutDoc = buildComponentScripts({ ...model, doc: undefined }, 'sync')
    expect(scripts.length).toBeGreaterThanOrEqual(withoutDoc.length)
    for (const script of scripts) expect(script.length).toBeLessThan(49_000)
    expect(modelIn(scripts.at(-1)!).doc).toEqual(doc)
    expect(scripts.flatMap(namesIn)).toEqual(model.variants.map(variant => variant.name))
  })

  it('carries only the tokens and derived variables its variants bind', () => {
    for (const script of buildComponentScripts(realButtonModel, 'sync')) {
      const json = /A63Figma\.\w+\(figma, (.*)\);\nreturn/s.exec(script)![1]
      const part = unpackComponentModel(JSON.parse(json))
      const bound = new Set(
        part.variants.flatMap(variant =>
          variant.layers.flatMap(layer =>
            Object.values(layer.properties).flatMap(value =>
              value && 'alias' in value ? [value.alias] : []
            )
          )
        )
      )
      const derived = part.derived.variables.map(variable => variable.token)
      expect(derived.every(token => bound.has(token))).toBe(true)
      const codeTokens = [...bound].map(token => parseDerived(token)?.alias ?? token)
      expect(new Set(part.tokens)).toEqual(new Set(codeTokens))
      expect(new Set(derived)).toEqual(new Set([...bound].filter(token => parseDerived(token))))
    }
  })

  it('refuses a limit no single variant fits in', () => {
    expect(() => buildComponentScripts(buttonModelFixture, 'sync', { maxLength: 1000 })).toThrow(
      /over 1000/
    )
  })

  it('reports missing variables and writes nothing when the tokens are not synced', async () => {
    const fake = createFakeNodes()
    const [script] = buildComponentScripts(buttonModelFixture, 'sync')
    const result = (await fake.run(script)) as SyncPart
    expect(result.planned.missingVariables.length).toBeGreaterThan(0)
    expect(result.applied).toMatchObject({ created: 0, updated: 0 })
    expect(fake.writes).toBe(0)
  })

  it('syncs the fixture in small parts, and check parts only read', async () => {
    const fake = createFakeNodes()
    await syncModel(fake.figma, syncFixture)
    // Just under the whole fixture's size, so it splits.
    const maxLength = buildComponentScripts(buttonModelFixture, 'check')[0].length - 100
    const scripts = buildComponentScripts(buttonModelFixture, 'sync', { maxLength })
    expect(scripts.length).toBeGreaterThan(1)
    let total = 0
    for (const [index, script] of scripts.entries()) {
      const result = (await fake.run(script)) as SyncPart
      expect(result).toMatchObject({ part: index + 1, parts: scripts.length })
      expect(result.verification).toMatchObject({ missingVariables: [], create: 0, update: 0 })
      total += result.applied.created
    }
    expect(total).toBe(buttonModelFixture.variants.length)
    const writes = fake.writes
    for (const script of buildComponentScripts(buttonModelFixture, 'check', { maxLength })) {
      const result = (await fake.run(script)) as CheckPart
      expect(result.planned).toMatchObject({ create: 0, update: 0, unchanged: result.variants })
    }
    expect(fake.writes).toBe(writes)
  })

  it('runs every real script in order against the fake and verifies clean', async () => {
    const fake = createFakeNodes()
    for (const script of buildScripts(realSyncModel, 'sync')) await fake.run(script)
    let created = 0
    for (const script of buildComponentScripts(realButtonModel, 'sync')) {
      const result = (await fake.run(script)) as SyncPart
      expect(result.verification.missingVariables).toEqual([])
      expect(result.verification.create).toBe(0)
      expect(result.verification.update).toBe(0)
      expect(result.verification.unchanged).toBe(result.variants)
      expect(JSON.stringify(result).length).toBeLessThan(20_000)
      created += result.applied.created
    }
    expect(created).toBe(realButtonModel.variants.length)
    const writes = fake.writes
    for (const script of buildComponentScripts(realButtonModel, 'check')) {
      const result = (await fake.run(script)) as CheckPart
      expect(result.planned.unchanged).toBe(result.variants)
      expect(result.variants).toBe(namesIn(script).length)
      expect(JSON.stringify(result).length).toBeLessThan(20_000)
    }
    expect(fake.writes).toBe(writes)
  }, 120_000)

  it('names what differs, capped and under 20 KB, when every variant still differs', async () => {
    const fake = createFakeNodes()
    for (const script of buildScripts(realSyncModel, 'sync')) await fake.run(script)
    // Figma drops every paint binding: nothing verifies.
    const variables = fake.figma.variables
    const bind = variables.setBoundVariableForPaint.bind(variables)
    variables.setBoundVariableForPaint = (paint, field, variable) => ({
      ...bind(paint, field, variable),
      boundVariables: {},
    })
    const scripts = buildComponentScripts(realButtonModel, 'sync')
    for (const script of scripts) {
      const result = (await fake.run(script)) as SyncPart
      expect(result.verification.update).toBe(result.variants)
      expect(result.verification.differences).toHaveLength(Math.min(12, result.variants))
      for (const entry of result.verification.differences!) {
        expect(namesIn(script)).toContain(entry.variant)
        expect(entry.what).toMatch(/\.(fills|strokes)$/)
        expect(entry.actual!.length).toBeLessThanOrEqual(120)
        expect(entry.expected!.length).toBeLessThanOrEqual(120)
      }
      expect(JSON.stringify(result).length).toBeLessThan(20_000)
    }
    for (const script of buildComponentScripts(realButtonModel, 'check')) {
      const result = (await fake.run(script)) as CheckPart
      expect(result.planned.differences).toHaveLength(Math.min(12, result.variants))
      expect(JSON.stringify(result).length).toBeLessThan(20_000)
    }
  }, 120_000)

  it('runs each real script on its own: it makes the derived variables it binds', async () => {
    const fake = createFakeNodes()
    for (const script of buildScripts(realSyncModel, 'sync')) await fake.run(script)
    const derived = realButtonModel.derived.variables
    // Before any component script, a check plans the derived variables, not missing tokens.
    const checks = buildComponentScripts(realButtonModel, 'check')
    let planned = 0
    for (const script of checks) {
      const result = (await fake.run(script)) as CheckPart
      expect(result.planned.missingVariables).toEqual([])
      planned += result.planned.variables
    }
    expect(planned).toBeGreaterThanOrEqual(derived.length)
    // Last part first: each part syncs what it binds, whatever ran before it.
    let made = 0
    for (const script of buildComponentScripts(realButtonModel, 'sync').reverse()) {
      const result = (await fake.run(script)) as SyncPart
      expect(result.verification).toMatchObject({ missingVariables: [], variables: 0, update: 0 })
      expect(result.verification.unchanged).toBe(result.variants)
      made += result.applied.variables
    }
    expect(made).toBe(derived.length)
    const component = fake.collections.find(item => item.name === 'Component')!
    expect(component.modes.map(mode => mode.name)).toEqual(['Value'])
    expect(component.variableIds).toHaveLength(derived.length)
    for (const script of checks) {
      const result = (await fake.run(script)) as CheckPart
      expect(result.planned).toMatchObject({ variables: 0, update: 0, unchanged: result.variants })
    }
  }, 120_000)
})
