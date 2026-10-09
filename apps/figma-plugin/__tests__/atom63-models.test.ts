import { resolve } from 'node:path'

import { buildProjectModel } from '@atom63/figma'
import { readTokenDirectory } from '@atom63/figma/node'
import { createFakeFigma } from '../../../packages/figma/test/fake-figma'
import { createFakeNodes } from '../../../packages/figma/test/fake-nodes'

const { model } = buildProjectModel(
  readTokenDirectory(resolve(__dirname, '../../../packages/figma/test/fixtures/project-tokens'))
)

/** A fresh handle (so a fresh memo) and how often it parsed a bundled model. */
async function freshHandle() {
  vi.resetModules()
  const parse = vi.spyOn(JSON, 'parse')
  const { handle } = await import('../src/main/handle')
  // The bundled models are the only JSON the main thread parses that is this large.
  const modelParses = () => parse.mock.calls.filter(([text]) => text.length > 100_000).length
  return { handle, modelParses }
}

afterEach(() => vi.restoreAllMocks())

describe('the bundled Atom63 models', () => {
  it('are not parsed when the plugin loads or for the token flows', async () => {
    const { handle, modelParses } = await freshHandle()
    const { figma } = createFakeFigma()
    await handle(figma, { type: 'scan' })
    await handle(figma, { type: 'plan', model })
    await handle(figma, { type: 'apply', model })
    expect(modelParses()).toBe(0)
  })

  it('are parsed once, on the first atom63 message', async () => {
    const { handle, modelParses } = await freshHandle()
    const fake = createFakeNodes()
    const context = { nodes: () => fake.figma }
    const reply = await handle(fake.figma, { type: 'atom63-scan' }, context)
    expect(reply?.type).toBe('atom63-table')
    expect(modelParses()).toBe(2)
    await handle(fake.figma, { type: 'atom63-scan' }, context)
    expect(modelParses()).toBe(2)
  })
})
