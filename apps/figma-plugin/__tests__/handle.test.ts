import { resolve } from 'node:path'

import { buildProjectModel, deriveStyles } from '@atom63/figma'
import { readTokenDirectory } from '@atom63/figma/node'
import { atom63Models } from '../src/main/atom63-models'
import { handle } from '../src/main/handle'
import type { DesignSystemProgress } from '../src/messages'
import { createFakeFigma } from '../../../packages/figma/test/fake-figma'
import { createFakeNodes } from '../../../packages/figma/test/fake-nodes'

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

describe('the Atom63 design system', () => {
  const setup = () => {
    const fake = createFakeNodes()
    const progress: DesignSystemProgress[] = []
    const context = {
      nodes: () => fake.figma,
      progress: (p: DesignSystemProgress) => progress.push(p),
    }
    return { fake, progress, context }
  }

  it('bundles the generated token and component models', () => {
    expect(atom63Models.sync.summary.variables).toBeGreaterThan(0)
    expect(atom63Models.sync.styles).toBeUndefined()
    expect(atom63Models.components.map(model => model.component)).toEqual(['Button'])
    expect(atom63Models.components[0].doc).toBeDefined()
  })

  it('reads what an empty file holds', async () => {
    const { fake, context } = setup()
    expect(await handle(fake.figma, { type: 'atom63-scan' }, context)).toEqual({
      type: 'atom63-table',
      data: {
        atom63: null,
        template: null,
        components: [{ name: 'Button', variants: 0, card: false, setOnPage: false }],
      },
    })
  })

  it('builds with progress, returns the outcome and the new table, then checks clean', async () => {
    const { fake, progress, context } = setup()
    const reply = await handle(fake.figma, { type: 'atom63-build' }, context)
    if (reply?.type !== 'atom63-built') throw new Error(`unexpected ${reply?.type}`)
    expect(reply.data.status).toBe('pass')
    expect(reply.data.components[0].verification).toMatchObject({ create: 0, update: 0 })
    expect(reply.data.table.atom63?.variables).toBe(atom63Models.sync.summary.variables)
    expect(reply.data.table.components).toEqual([
      expect.objectContaining({ name: 'Button', card: true, setOnPage: false }),
    ])
    expect(progress.map(item => item.phase)).toEqual([
      'tokens',
      'tokens',
      'styles',
      'styles',
      'components',
      'card',
      'done',
    ])

    const writes = fake.writes
    const check = await handle(fake.figma, { type: 'atom63-check' }, context)
    if (check?.type !== 'atom63-checked') throw new Error(`unexpected ${check?.type}`)
    expect(check.data.status).toBe('pass')
    expect(fake.writes).toBe(writes)
  })

  it('needs the node API for the Atom63 messages', async () => {
    const { figma } = createFakeFigma()
    await expect(handle(figma, { type: 'atom63-build' })).rejects.toThrow(/node API/)
  })
})
