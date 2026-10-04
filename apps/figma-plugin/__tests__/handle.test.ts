import { resolve } from 'node:path'

import { buildProjectModel, deriveStyles } from '@atom63/figma'
import { readTokenDirectory } from '@atom63/figma/node'
import { handle } from '../src/main/handle'
import { createFakeFigma } from '../../../packages/figma/test/fake-figma'

const project = buildProjectModel(
  readTokenDirectory(resolve(__dirname, '../../../packages/figma/test/fixtures/project-tokens'))
)
const model = { ...project.model, styles: deriveStyles(project.model, project.raw) }

describe('the main thread', () => {
  it('reads an empty file as an empty table', async () => {
    const { figma } = createFakeFigma()
    expect(await handle(figma, { type: 'scan' })).toEqual({
      type: 'table',
      data: { collections: [], variables: 0, textStyles: 0, effectStyles: 0 },
    })
  })

  it('plans the whole token set for an empty file', async () => {
    const { figma } = createFakeFigma()
    const reply = await handle(figma, { type: 'plan', model })
    if (reply?.type !== 'planned') throw new Error(`unexpected ${reply?.type}`)
    expect(reply.data.planned.create).toBe(model.summary.variables)
    expect(reply.data.styles?.create).toHaveLength(
      model.styles.text.length + model.styles.effects.length
    )
  })

  it('applies, verifies, and returns the new table', async () => {
    const { figma } = createFakeFigma()
    const reply = await handle(figma, { type: 'apply', model })
    if (reply?.type !== 'applied') throw new Error(`unexpected ${reply?.type}`)
    expect(reply.data.verification).toMatchObject({ create: 0, update: 0 })
    expect(reply.data.table).toMatchObject({
      variables: model.summary.variables,
      textStyles: model.styles.text.length,
      effectStyles: model.styles.effects.length,
    })
  })

  it('changes nothing and makes no duplicate styles when run again', async () => {
    const fake = createFakeFigma()
    await handle(fake.figma, { type: 'apply', model })
    const reply = await handle(fake.figma, { type: 'apply', model })
    if (reply?.type !== 'applied') throw new Error(`unexpected ${reply?.type}`)
    expect(reply.data.planned).toMatchObject({ create: 0, update: 0 })
    expect(reply.data.styles?.planned).toMatchObject({ create: [], update: [] })
    expect(fake.textStyles).toHaveLength(model.styles.text.length)
  })

  it('reports text styles that fall back to Inter when the font cannot load', async () => {
    const { figma } = createFakeFigma({ fonts: ['Inter'] })
    const reply = await handle(figma, { type: 'apply', model })
    if (reply?.type !== 'applied') throw new Error(`unexpected ${reply?.type}`)
    expect(reply.data.styles?.applied.fontFallbacks).toContainEqual({
      style: 'Text/base',
      wanted: 'Geist',
      used: 'Inter',
    })
  })
})
