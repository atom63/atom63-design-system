import type { ComponentDoc, ComponentModel } from '../src/components/model'
import type { PageLike, SceneNodeLike } from '../src/components/nodes-api'
import { buildComponentScripts } from '../src/components/scripts'
import { BODY_STYLE, CARD_TOKENS, GRID_LEFT, GRID_TOP } from '../src/components/spec-card'
import { planComponent, syncComponent } from '../src/components/sync-component'
import type { SyncModel } from '../src/plan'
import { syncModel } from '../src/runtime'
import { createFakeNodes } from './fake-nodes'
import { buttonModelFixture, syncFixture } from './fixtures/button'

const doc: ComponentDoc = {
  slug: 'button',
  label: 'Button',
  group: { id: 'actions', title: 'Actions' },
  summary: 'Button is the shared action primitive.',
  usage: 'Use it for an in-place action; use a link for navigation.',
  related: [
    { slug: 'button-group', label: 'Button Group' },
    { slug: 'toggle', label: 'Toggle' },
  ],
  axisGuidance: {
    variant: { default: 'Neutral action.', secondary: 'Muted neutral action.' },
    size: { sm: 'Compact rows.', md: 'Default.' },
    state: { rest: 'Resting.', hover: 'Pointer over it.', disabled: 'Label fades.' },
  },
  docsPath: '/components/component-button',
}
const model: ComponentModel = { ...buttonModelFixture, doc }
const { doc: _doc, ...withoutDoc } = model
/** A part that does not carry the doc, as the earlier component scripts. */
const part: ComponentModel = withoutDoc

const variable = (token: string, type: 'COLOR' | 'FLOAT' | 'STRING', value: unknown) =>
  ({ name: token.slice(2), token, type, values: { default: { value } } }) as never
const grey = (level: number) => ({ r: level, g: level, b: level, a: 1 })
/** The fixture's tokens plus the ones the card binds. */
const cardSync: SyncModel = {
  ...syncFixture,
  collections: [
    ...syncFixture.collections,
    {
      name: 'Card',
      modes: ['default'],
      variables: [
        variable(CARD_TOKENS.surface, 'COLOR', grey(1)),
        variable(CARD_TOKENS.border, 'COLOR', grey(0.9)),
        variable(CARD_TOKENS.borderWidth, 'FLOAT', 1),
        variable(CARD_TOKENS.radius, 'FLOAT', 8),
        variable(CARD_TOKENS.textPrimary, 'COLOR', grey(0.1)),
        variable(CARD_TOKENS.textSecondary, 'COLOR', grey(0.4)),
        variable(CARD_TOKENS.fontFamily, 'STRING', "'Geist', ui-sans-serif, system-ui"),
        variable(CARD_TOKENS.bodySize, 'FLOAT', 12),
        variable(CARD_TOKENS.bodyLine, 'FLOAT', 18),
        variable(CARD_TOKENS.titleSize, 'FLOAT', 17),
        variable(CARD_TOKENS.titleLine, 'FLOAT', 26),
      ],
    },
  ],
}

/** The synced style the row values link, as styles.ts derives it from the xs step. */
const withBodyStyle: SyncModel = {
  ...cardSync,
  styles: {
    text: [
      {
        name: BODY_STYLE,
        description: 'xs',
        family: { alias: CARD_TOKENS.fontFamily, fallback: 'Geist' },
        fontSize: { alias: CARD_TOKENS.bodySize },
        lineHeight: { alias: CARD_TOKENS.bodyLine },
      },
    ],
    effects: [],
    skipped: [],
  },
}

const ROWS = ['Summary', 'When to use', 'Variant', 'Size', 'State', 'Related', 'Docs']
const alias = (id: string) => ({ type: 'VARIABLE_ALIAS', id })

async function setup(tokens: SyncModel = cardSync) {
  const fake = createFakeNodes()
  await syncModel(fake.figma, tokens)
  return fake
}
async function pageOf(fake: ReturnType<typeof createFakeNodes>): Promise<PageLike> {
  const page = fake.figma.root.children.find(item => item.name === 'Components')!
  await page.loadAsync()
  return page
}
const childOf = (node: SceneNodeLike | undefined, name: string) => {
  const found = node?.children?.find(child => child.name === name)
  if (!found) throw new Error(`no ${name} in ${node?.name}`)
  return found
}
async function cardOf(fake: ReturnType<typeof createFakeNodes>) {
  const page = await pageOf(fake)
  const cards = page.children.filter(node => node.type === 'FRAME' && node.name === 'Button')
  expect(cards).toHaveLength(1)
  const card = cards[0]
  const grid = childOf(card, 'Grid')
  const set = grid.children!.find(node => node.type === 'COMPONENT_SET')!
  return { page, card, grid, set }
}
const valueOf = (card: SceneNodeLike, row: string) =>
  childOf(childOf(card, row), 'Value').characters

describe('the spec card', () => {
  it('builds the card around the set on the first run, in the doc block’s words', async () => {
    const fake = await setup()
    const result = await syncComponent(fake.figma, model)
    expect(result.verification).toMatchObject({ create: [], update: [], unchanged: 12 })
    expect(result.verification.card).toMatchObject({ create: [], update: [] })
    expect(result.planned.card!.create).toEqual(
      expect.arrayContaining(['Button', 'Group', 'Title', ...ROWS, 'Grid'])
    )
    // The variants make the set; the card only moves and describes it.
    expect(result.planned.card!.create).not.toContain('Set')
    expect(result.planned.card!.update).toEqual(['Set'])
    expect(result.applied.card!.created).toBe(result.planned.card!.create.length)

    const { page, card, set } = await cardOf(fake)
    // The set lives in the card, nowhere else on the page.
    expect(page.children.map(node => [node.type, node.name])).toEqual([['FRAME', 'Button']])
    expect(card.children!.map(node => node.name)).toEqual([
      'Group',
      'Title',
      ...ROWS.flatMap(row => [`Divider/${row}`, row]),
      'Divider/end',
      'Grid',
    ])
    expect(childOf(card, 'Group').characters).toBe('Actions')
    expect(childOf(card, 'Title').characters).toBe('button')
    expect(valueOf(card, 'Summary')).toBe(doc.summary)
    expect(valueOf(card, 'When to use')).toBe(doc.usage)
    expect(valueOf(card, 'Variant')).toBe(
      'default — Neutral action.\nsecondary — Muted neutral action.'
    )
    expect(valueOf(card, 'Size')).toBe('sm — Compact rows.\nmd — Default.')
    expect(valueOf(card, 'State')).toBe(
      'rest — Resting.\nhover — Pointer over it.\ndisabled — Label fades.'
    )
    expect(valueOf(card, 'Related')).toBe('Button Group, Toggle')
    expect(valueOf(card, 'Docs')).toBe(doc.docsPath)
    for (const row of ROWS) expect(childOf(childOf(card, row), 'Label').characters).toBe(row)
    // S7: the set's own description, shown in Assets and Dev Mode.
    expect(set.description).toBe(`${doc.summary}\n${doc.docsPath}`)

    // Layout: a vertical card as tall as its rows and as wide as the Grid, stretched rows.
    expect(card).toMatchObject({
      layoutMode: 'VERTICAL',
      primaryAxisSizingMode: 'AUTO',
      counterAxisSizingMode: 'FIXED',
      width: childOf(card, 'Grid').width + 48,
      paddingLeft: 24,
      paddingRight: 24,
      paddingTop: 24,
      paddingBottom: 24,
      itemSpacing: 12,
    })
    const row = childOf(card, 'Summary')
    expect(row).toMatchObject({
      layoutMode: 'HORIZONTAL',
      layoutAlign: 'STRETCH',
      primaryAxisSizingMode: 'FIXED',
      counterAxisSizingMode: 'AUTO',
      itemSpacing: 16,
    })
    expect(childOf(row, 'Label')).toMatchObject({ width: 128, textAutoResize: 'HEIGHT' })
    expect(childOf(row, 'Value')).toMatchObject({ layoutGrow: 1, textAutoResize: 'HEIGHT' })
    expect(childOf(card, 'Divider/end')).toMatchObject({ layoutAlign: 'STRETCH', height: 1 })
  })

  it('binds the chrome to atom63 variables, so the card re-themes', async () => {
    const fake = await setup()
    await syncComponent(fake.figma, model)
    const { card } = await cardOf(fake)
    const id = (token: string) => fake.variableOf(token).id
    const paint = (node: SceneNodeLike, key: 'fills' | 'strokes' = 'fills') =>
      node[key][0].boundVariables?.color?.id
    expect(paint(card)).toBe(id(CARD_TOKENS.surface))
    expect(paint(card, 'strokes')).toBe(id(CARD_TOKENS.border))
    for (const corner of [
      'topLeftRadius',
      'topRightRadius',
      'bottomLeftRadius',
      'bottomRightRadius',
    ] as const)
      expect(card.boundVariables?.[corner]).toEqual(alias(id(CARD_TOKENS.radius)))
    // Figma stores a stroke-weight binding on the four sides.
    expect(card.boundVariables?.strokeTopWeight).toEqual(alias(id(CARD_TOKENS.borderWidth)))
    expect(card.boundVariables).not.toHaveProperty('strokeWeight')
    expect(paint(childOf(card, 'Divider/Summary'))).toBe(id(CARD_TOKENS.border))
    const row = childOf(card, 'Summary')
    const value = childOf(row, 'Value')
    expect(paint(value)).toBe(id(CARD_TOKENS.textPrimary))
    expect(paint(childOf(row, 'Label'))).toBe(id(CARD_TOKENS.textSecondary))
    // Text-field bindings on a text node are one alias per range.
    expect(value.boundVariables?.fontSize).toEqual([alias(id(CARD_TOKENS.bodySize))])
    expect(value.boundVariables?.lineHeight).toEqual([alias(id(CARD_TOKENS.bodyLine))])
    expect(childOf(card, 'Title').boundVariables?.fontSize).toEqual([
      alias(id(CARD_TOKENS.titleSize)),
    ])
    // A CSS stack never loads as a family: Geist, unbound, as the Label's.
    expect(value.fontName).toEqual({ family: 'Geist', style: 'Regular' })
    expect(childOf(card, 'Title').fontName).toEqual({ family: 'Geist', style: 'Bold' })
    expect(value.boundVariables?.fontFamily).toBeUndefined()
    // A bound paint stores the variable's resolved color.
    expect(card.fills[0]).toMatchObject({ color: { r: 1, g: 1, b: 1 }, opacity: 1 })
  })

  it('writes nothing on a second run', async () => {
    const fake = await setup()
    const first = await syncComponent(fake.figma, model)
    const writes = fake.writes
    const second = await syncComponent(fake.figma, model)
    expect(second.planned.card).toEqual({
      create: [],
      update: [],
      unchanged: first.verification.card!.unchanged,
    })
    expect(second.planned.differences).toBeUndefined()
    expect(fake.writes).toBe(writes)
  })

  it('updates only the row whose doc text changed', async () => {
    const fake = await setup()
    await syncComponent(fake.figma, model)
    const { card } = await cardOf(fake)
    const summary = childOf(childOf(card, 'Summary'), 'Value')
    const usage = 'Use it for an action that changes something here.'
    const changed = { ...model, doc: { ...doc, usage } }
    const plan = await planComponent(fake.figma, changed)
    expect(plan.card!.update).toEqual(['When to use'])
    expect(plan.differences).toEqual([
      expect.objectContaining({ variant: 'card When to use', what: 'Value.characters' }),
    ])
    const writes = fake.writes
    const result = await syncComponent(fake.figma, changed)
    expect(result.applied.card).toEqual({ created: 0, updated: 1 })
    // One text write, after loading its font.
    expect(fake.writes - writes).toBe(1)
    expect(valueOf(card, 'When to use')).toBe(usage)
    expect(childOf(childOf(card, 'Summary'), 'Value')).toBe(summary)
    expect(result.verification.card).toMatchObject({ create: [], update: [] })
  })

  it('keeps layers a designer added inside the card', async () => {
    const fake = await setup()
    await syncComponent(fake.figma, model)
    const { card, grid } = await cardOf(fake)
    const note = fake.figma.createText()
    note.name = 'Designer note'
    card.insertChild(2, note)
    const sticker = fake.figma.createFrame()
    sticker.name = 'Sticker'
    grid.appendChild(sticker)
    const writes = fake.writes
    const result = await syncComponent(fake.figma, model)
    expect(result.planned.card).toMatchObject({ create: [], update: [] })
    expect(fake.writes).toBe(writes)
    expect(note.parent).toBe(card)
    expect(sticker.parent).toBe(grid)

    // A deleted row comes back in its place; the note stays.
    childOf(card, 'Related').remove()
    const repaired = await syncComponent(fake.figma, model)
    expect(repaired.planned.card!.create).toEqual(['Related'])
    const names = card.children!.map(node => node.name)
    expect(names.indexOf('Related')).toBe(names.indexOf('Divider/Related') + 1)
    expect(names).toContain('Designer note')
    expect(valueOf(card, 'Related')).toBe('Button Group, Toggle')
  })

  it('aligns header labels with the State columns and row labels with the grid rows', async () => {
    const fake = await setup()
    await syncComponent(fake.figma, model)
    const { grid, set } = await cardOf(fake)
    expect([set.x, set.y]).toEqual([GRID_LEFT, GRID_TOP])
    expect([grid.width, grid.height]).toEqual([GRID_LEFT + set.width, GRID_TOP + set.height])
    const variant = (name: string) => fake.findVariant('Button', name)
    const expectAligned = () => {
      for (const state of model.axes.State) {
        const header = childOf(grid, `Header/${state}`)
        const column = set.children!.filter(node => node.name.endsWith(`State=${state}`))
        expect(header.characters).toBe(state)
        expect(header.x).toBe(set.x + Math.min(...column.map(node => node.x)))
        expect(header.y).toBe(0)
      }
      for (const name of model.axes.Variant)
        for (const size of model.axes.Size) {
          const label = childOf(grid, `Row/${name} · ${size}`)
          const rest = variant(`Variant=${name}, Size=${size}, State=rest`)
          expect(label.characters).toBe(`${name} · ${size}`)
          expect(label.x).toBe(0)
          expect(label.y + label.height / 2).toBeCloseTo(set.y + rest.y + rest.height / 2)
          // Beside its row, not across another one.
          expect(label.y).toBeGreaterThanOrEqual(set.y + rest.y - label.height)
        }
    }
    expectAligned()
    // Labels follow the variants where they are: a designer moves the hover column.
    for (const node of set.children!) if (node.name.endsWith('State=hover')) node.x += 40
    const result = await syncComponent(fake.figma, model)
    expect(result.planned.card!.update).toEqual(['Header/hover'])
    expectAligned()
  })

  it('moves a set from a plan-1 file into the card, keeping its identity', async () => {
    const fake = await setup()
    // Plan 1 drew the set straight on the page.
    await syncComponent(fake.figma, part)
    const page = await pageOf(fake)
    const set = page.children.find(node => node.type === 'COMPONENT_SET')!
    set.x = 320
    set.y = 200
    const id = set.id
    const variants = [...set.children!]
    const result = await syncComponent(fake.figma, model)
    expect(result.planned).toMatchObject({ create: [], update: [] })
    expect(result.planned.card!.update).toEqual(['Set'])
    expect(result.verification.card).toMatchObject({ create: [], update: [] })
    const { card, grid } = await cardOf(fake)
    expect(set.id).toBe(id)
    expect(set.parent).toBe(grid)
    expect(set.children).toEqual(variants)
    // The card takes the set's place on the page.
    expect([card.x, card.y]).toEqual([320, 200])
    const writes = fake.writes
    await syncComponent(fake.figma, model)
    expect(fake.writes).toBe(writes)
  })

  it('leaves the card to the doc part, while other parts write their variants in it', async () => {
    const fake = await setup()
    await syncComponent(fake.figma, model)
    const { card, set } = await cardOf(fake)
    const name = 'Variant=secondary, Size=md, State=hover'
    fake.findVariant('Button', name).remove()
    childOf(card, 'Title').characters = 'renamed'
    const result = await syncComponent(fake.figma, part)
    expect(result.planned.card).toBeUndefined()
    expect(result.planned.create).toEqual([name])
    expect(result.verification).toMatchObject({ create: [], update: [] })
    // Added to the set inside the card, which it found there; the card is not touched.
    expect(fake.findVariant('Button', name).parent).toBe(set)
    expect(childOf(card, 'Title').characters).toBe('renamed')
    const doc = await syncComponent(fake.figma, model)
    expect(doc.planned.card!.update).toEqual(['Title'])
    expect(childOf(card, 'Title').characters).toBe('button')
  })

  it('adopts a set an earlier part made on the page after the set was deleted', async () => {
    const fake = await setup()
    await syncComponent(fake.figma, model)
    const { card, set } = await cardOf(fake)
    set.remove()
    await syncComponent(fake.figma, part)
    const page = await pageOf(fake)
    const made = page.children.find(node => node.type === 'COMPONENT_SET')!
    expect(made).toBeDefined()
    await syncComponent(fake.figma, model)
    expect(made.parent).toBe(childOf(card, 'Grid'))
    expect(page.children.filter(node => node.type === 'COMPONENT_SET')).toEqual([])
  })

  it('writes nothing when a variable the card binds is missing', async () => {
    const fake = createFakeNodes()
    await syncModel(fake.figma, syncFixture)
    const result = await syncComponent(fake.figma, model)
    expect(result.planned.missingVariables).toEqual(
      expect.arrayContaining([CARD_TOKENS.surface, CARD_TOKENS.textPrimary])
    )
    expect(result.applied).toMatchObject({ created: 0, updated: 0 })
    expect(fake.figma.root.children.some(page => page.name === 'Components')).toBe(false)
  })

  it('reports card counts from the last script only, with results under 20 KB', async () => {
    const fake = await setup()
    const maxLength = buildComponentScripts(model, 'check')[0].length - 100
    const scripts = buildComponentScripts(model, 'sync', { maxLength })
    expect(scripts.length).toBeGreaterThan(1)
    for (const [index, script] of scripts.entries()) {
      const result = (await fake.run(script)) as {
        applied: { card?: unknown }
        verification: { card?: { create: number; update: number; unchanged: number } }
      }
      const last = index === scripts.length - 1
      expect(result.verification.card !== undefined).toBe(last)
      if (last) expect(result.verification.card).toMatchObject({ create: 0, update: 0 })
      expect(JSON.stringify(result).length).toBeLessThan(20_000)
    }
  })
  it('fixes the card’s width to the Grid’s plus padding, following the set', async () => {
    const fake = await setup()
    await syncComponent(fake.figma, model)
    const { card, grid, set } = await cardOf(fake)
    expect(card.counterAxisSizingMode).toBe('FIXED')
    expect(card.width).toBeCloseTo(grid.width + 48, 2)
    // A designer widens the set: the Grid and then the card follow on the next run.
    const variant = set.children![0]
    variant.x = set.width + 200
    set.resize(variant.x + variant.width, set.height)
    const again = await syncComponent(fake.figma, model)
    // The plan sees the Grid; the card's width follows it in the final card pass.
    expect(again.planned.card!.update).toEqual(expect.arrayContaining(['Grid']))
    expect(again.applied.card!.updated).toBeGreaterThanOrEqual(2)
    expect(again.verification.card).toMatchObject({ create: [], update: [] })
    expect(grid.width).toBeCloseTo(GRID_LEFT + set.width, 2)
    expect(card.width).toBeCloseTo(grid.width + 48, 2)
    expect(card.counterAxisSizingMode).toBe('FIXED')
    expect(card.primaryAxisSizingMode).toBe('AUTO')
  })

  it('fixes a row’s width before stretching it, as Figma’s typings require', async () => {
    const fake = await setup()
    // The fake refuses a stretch on an axis that hugs.
    const card = fake.figma.createFrame()
    card.layoutMode = 'VERTICAL'
    const row = fake.figma.createFrame()
    card.appendChild(row)
    row.layoutMode = 'HORIZONTAL'
    expect(() => {
      row.layoutAlign = 'STRETCH'
    }).toThrow(/AUTO sizing/)
    row.primaryAxisSizingMode = 'FIXED'
    row.layoutAlign = 'STRETCH'
    expect(() => {
      row.primaryAxisSizingMode = 'AUTO'
    }).toThrow(/AUTO sizing/)
    // The card's rows are written in that order, and verify.
    const result = await syncComponent(fake.figma, model)
    expect(result.verification.card).toMatchObject({ create: [], update: [] })
    const { card: drawn } = await cardOf(fake)
    for (const name of ROWS)
      expect(childOf(drawn, name)).toMatchObject({
        layoutAlign: 'STRETCH',
        primaryAxisSizingMode: 'FIXED',
      })
  })

  it('links the row values to the synced Text/xs style, and labels keep variables', async () => {
    const fake = await setup(withBodyStyle)
    const style = fake.textStyles.find(item => item.name === BODY_STYLE)!
    expect(style).toBeDefined()
    const result = await syncComponent(fake.figma, model)
    expect(result.verification.card).toMatchObject({ create: [], update: [] })
    const { card } = await cardOf(fake)
    const id = (token: string) => fake.variableOf(token).id
    for (const name of ROWS) {
      const value = childOf(childOf(card, name), 'Value')
      expect(value.textStyleId).toBe(style.id)
      // No text property of its own: it would detach the style.
      expect(value.boundVariables?.fontSize).toBeUndefined()
      expect(value.boundVariables?.lineHeight).toBeUndefined()
      expect(value.boundVariables?.fontFamily).toBeUndefined()
      expect(value.fontName).toEqual(style.fontName)
      expect(value.fills[0].boundVariables?.color?.id).toBe(id(CARD_TOKENS.textPrimary))
      // Bold 11px: no Regular-only synced style matches, so variables.
      const label = childOf(childOf(card, name), 'Label')
      expect(label.textStyleId).toBe('')
      expect(label.boundVariables?.lineHeight).toEqual([alias(id(CARD_TOKENS.bodyLine))])
    }
    expect(childOf(card, 'Title').textStyleId).toBe('')

    const writes = fake.writes
    const second = await syncComponent(fake.figma, model)
    expect(second.planned.card).toMatchObject({ create: [], update: [] })
    expect(second.planned.differences).toBeUndefined()
    expect(fake.writes).toBe(writes)
  })

  it('binds variables on the values without the style, and links it once it is synced', async () => {
    const fake = await setup()
    await syncComponent(fake.figma, model)
    const { card } = await cardOf(fake)
    const id = (token: string) => fake.variableOf(token).id
    const value = childOf(childOf(card, 'Summary'), 'Value')
    expect(value.textStyleId).toBe('')
    expect(value.boundVariables?.fontSize).toEqual([alias(id(CARD_TOKENS.bodySize))])

    await syncModel(fake.figma, withBodyStyle)
    const style = fake.textStyles.find(item => item.name === BODY_STYLE)!
    const linked = await syncComponent(fake.figma, model)
    expect(linked.planned.card!.update).toEqual(ROWS)
    expect(linked.planned.differences![0]).toMatchObject({
      variant: 'card Summary',
      what: 'Value.textStyleId',
    })
    expect(linked.verification.card).toMatchObject({ create: [], update: [] })
    expect(value.textStyleId).toBe(style.id)
    expect(value.boundVariables?.fontSize).toBeUndefined()
  })

  it('finds the style by name and checks it by id', async () => {
    const fake = await setup(withBodyStyle)
    await syncComponent(fake.figma, model)
    const { card } = await cardOf(fake)
    const value = childOf(childOf(card, 'Docs'), 'Value')
    // Another style of the same font linked by hand: the run relinks Text/xs.
    const other = fake.figma.createTextStyle()
    other.name = 'Text/other'
    other.fontName = { family: 'Geist', style: 'Regular' }
    await value.setTextStyleIdAsync!(other.id)
    const result = await syncComponent(fake.figma, model)
    expect(result.planned.card!.update).toEqual(['Docs'])
    expect(value.textStyleId).toBe(fake.textStyles.find(item => item.name === BODY_STYLE)!.id)
  })
})
