import { readFileSync } from 'node:fs'

import type { ComponentModel } from '../src/components/model'
import { packComponentModel, unpackComponentModel } from '../src/components/pack-component'
import { buildComponentScripts } from '../src/components/scripts'
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
  create: number
  update: number
  unchanged: number
}
interface SyncPart {
  part: number
  parts: number
  variants: number
  planned: Counts
  applied: { created: number; updated: number; fontFallbacks: string[] }
  verification: Counts
}
interface CheckPart {
  part: number
  parts: number
  variants: number
  planned: Counts
}

/** The variant names a script carries, read back from its packed model. */
const namesIn = (script: string) => {
  const json = /A63Figma\.\w+\(figma, (.*)\);\nreturn/s.exec(script)?.[1]
  if (!json) throw new Error('no packed model in the script')
  return unpackComponentModel(JSON.parse(json)).variants.map(variant => variant.name)
}

describe('packed component models', () => {
  it('unpack to the model they were packed from', () => {
    for (const model of [buttonModelFixture, realButtonModel])
      expect(unpackComponentModel(packComponentModel(model))).toEqual(model)
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

  it('carries only the tokens its variants bind', () => {
    for (const script of buildComponentScripts(realButtonModel, 'sync')) {
      const json = /A63Figma\.\w+\(figma, (.*)\);\nreturn/s.exec(script)![1]
      const part = unpackComponentModel(JSON.parse(json))
      const bound = new Set(
        part.variants.flatMap(variant =>
          variant.layers.flatMap(layer =>
            Object.values(layer.properties).flatMap(value =>
              value && 'alias' in value
                ? [value.alias]
                : value && 'composed' in value
                  ? [value.composed.alias]
                  : []
            )
          )
        )
      )
      expect(new Set(part.tokens)).toEqual(bound)
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
})
