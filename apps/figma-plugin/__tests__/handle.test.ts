import { resolve } from 'node:path'

import { buildProjectModel, deriveStyles } from '@atom63/figma'
import { readTokenDirectory } from '@atom63/figma/node'
import { atom63Models } from '../src/main/atom63-models'
import { handle, type SelectionApi } from '../src/main/handle'
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
      selection: () => fake.figma as unknown as SelectionApi,
      progress: (p: DesignSystemProgress) => progress.push(p),
    }
    return { fake, progress, context }
  }

  it('bundles the generated token and component models', () => {
    expect(atom63Models()).toBe(atom63Models())
    expect(atom63Models().sync.summary.variables).toBeGreaterThan(0)
    expect(atom63Models().sync.styles).toBeUndefined()
    expect(atom63Models().components.map(model => model.component)).toEqual(['Button'])
    expect(atom63Models().components[0].doc).toBeDefined()
  })

  it('reads what an empty file holds', async () => {
    const { fake, context } = setup()
    expect(await handle(fake.figma, { type: 'atom63-scan' }, context)).toEqual({
      type: 'atom63-table',
      data: {
        atom63: null,
        template: null,
        blocked: null,
        components: [{ name: 'Button', variants: 0, card: false, setOnPage: false }],
      },
    })
  })

  it('builds with progress, returns the outcome and the new table, then checks clean', async () => {
    const { fake, progress, context } = setup()
    const reply = await handle(fake.figma, { type: 'atom63-build' }, context)
    if (reply?.type !== 'atom63-built') throw new Error(`unexpected ${reply?.type}`)
    if (reply.data.status === 'blocked') throw new Error('blocked')
    expect(reply.data.status).toBe('pass')
    expect(reply.data.components[0].verification).toMatchObject({ create: 0, update: 0 })
    expect(reply.data.table.atom63?.variables).toBe(atom63Models().sync.summary.variables)
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

  it('returns a refused build as its result, writing nothing, when the file holds another token set', async () => {
    const { fake, progress, context } = setup()
    await handle(fake.figma, { type: 'apply', model: project.model })
    const writes = fake.writes
    const reply = await handle(fake.figma, { type: 'atom63-build' }, context)
    if (reply?.type !== 'atom63-built') throw new Error(`unexpected ${reply?.type}`)
    const collections = project.model.collections.map(item => item.name)
    expect(reply.data).toMatchObject({
      status: 'blocked',
      reason: expect.stringContaining('This file already holds another token set'),
      collections,
      table: { atom63: null, template: { collections } },
    })
    expect(reply.data.table.blocked).toBe(
      reply.data.status === 'blocked' ? reply.data.reason : undefined
    )
    expect(progress).toEqual([])
    expect(fake.writes).toBe(writes)
  })

  it('rejects a build, check or scan while another is running, then accepts the next', async () => {
    const { fake, context } = setup()
    const first = handle(fake.figma, { type: 'atom63-build' }, context)
    for (const type of ['atom63-check', 'atom63-build', 'atom63-scan'] as const)
      await expect(handle(fake.figma, { type }, context)).rejects.toThrow(
        'A build or check is already running'
      )
    expect((await first)?.type).toBe('atom63-built')
    expect((await handle(fake.figma, { type: 'atom63-check' }, context))?.type).toBe(
      'atom63-checked'
    )
  })

  it('needs the node API for the Atom63 messages', async () => {
    const { figma } = createFakeFigma()
    await expect(handle(figma, { type: 'atom63-build' })).rejects.toThrow(/node API/)
  })

  describe('select-node', () => {
    /** A built file whose Button variant reads a broken fill, on a page not yet current. */
    const broken = async () => {
      const { fake, context } = setup()
      await handle(fake.figma, { type: 'atom63-build' }, context)
      const variant = fake.findVariant('Button', 'Variant=primary, Size=md, State=rest')
      variant.fills = []
      const check = await handle(fake.figma, { type: 'atom63-check' }, context)
      if (check?.type !== 'atom63-checked') throw new Error(`unexpected ${check?.type}`)
      const [difference] = check.data.components[0].verification.differences ?? []
      fake.unloadPages()
      return { fake, context, variant, difference }
    }

    it('loads the node’s page, makes it current, selects it and zooms to it', async () => {
      const { fake, context, variant, difference } = await broken()
      expect(difference.nodeId).toBe(variant.id)
      const page = fake.pages.find(item => item.name === 'Components')!
      expect(fake.figma.currentPage === page).toBe(false)
      const writes = fake.writes
      const reply = await handle(
        fake.figma,
        { type: 'select-node', id: difference.nodeId },
        context
      )
      expect(reply).toEqual({ type: 'selected', data: { id: variant.id } })
      expect(fake.figma.currentPage === page).toBe(true)
      expect(fake.figma.currentPage.selection).toHaveLength(1)
      expect(fake.figma.currentPage.selection[0] === variant).toBe(true)
      expect(fake.shown).toHaveLength(1)
      expect(fake.shown[0] === variant).toBe(true)
      expect(fake.writes).toBe(writes)
    })

    it('replies with an error for a node that is no longer in the file', async () => {
      const { fake, context, variant } = await broken()
      const id = variant.id
      variant.remove()
      const gone = {
        type: 'error',
        data: { message: 'That layer is no longer in the file.', for: 'select-node' },
      }
      expect(await handle(fake.figma, { type: 'select-node', id }, context)).toEqual(gone)
      expect(await handle(fake.figma, { type: 'select-node', id: '0:999999' }, context)).toEqual(
        gone
      )
      expect(fake.shown).toEqual([])
    })

    it('is refused while a build or check is running, and leaves the page alone', async () => {
      const { fake, context, variant } = await broken()
      const page = fake.figma.currentPage
      const build = handle(fake.figma, { type: 'atom63-check' }, context)
      await expect(
        handle(fake.figma, { type: 'select-node', id: variant.id }, context)
      ).rejects.toThrow('A build or check is already running')
      await build
      expect(fake.figma.currentPage === page).toBe(true)
      expect(
        (await handle(fake.figma, { type: 'select-node', id: variant.id }, context))?.type
      ).toBe('selected')
    })

    it('does not take the busy lock: a check can start while it runs', async () => {
      const { fake, context, variant } = await broken()
      const select = handle(fake.figma, { type: 'select-node', id: variant.id }, context)
      const check = handle(fake.figma, { type: 'atom63-check' }, context)
      expect((await select)?.type).toBe('selected')
      expect((await check)?.type).toBe('atom63-checked')
    })
  })
})
