import { readFileSync } from 'node:fs'

import type { ComponentModel } from '../src/components/model'
import { syncComponent } from '../src/components/sync-component'
import {
  buildDesignSystem,
  checkDesignSystem,
  type DesignSystemOutcome,
  type DesignSystemProgress,
  readDesignSystemTable,
} from '../src/design-system'
import type { SyncModel } from '../src/plan'
import { syncModel } from '../src/runtime'
import { deriveStyles } from '../src/styles'
import { createFakeNodes } from './fake-nodes'

const read = (path: string) =>
  JSON.parse(readFileSync(new URL(path, import.meta.url), 'utf8')) as unknown
const sync = read('../../styles/generated/atom63.figma-sync.json') as SyncModel
const button = read('../generated/atom63.figma-components.json') as ComponentModel
const models = { sync, components: [button] }

/** Every count a second build would write, which must all be zero. */
function writesPlanned(outcome: DesignSystemOutcome) {
  const [component] = outcome.components
  return {
    tokens: outcome.tokens.planned.create + outcome.tokens.planned.update,
    styles: outcome.styles!.planned.create.length + outcome.styles!.planned.update.length,
    variants: component.planned.create + component.planned.update,
    card: component.planned.card!.create + component.planned.card!.update,
  }
}

describe('buildDesignSystem', () => {
  it('builds a fresh file cleanly: tokens, styles, the component and its card', async () => {
    const fake = createFakeNodes()
    const outcome = await buildDesignSystem(fake.figma, models)
    expect(outcome.status).toBe('pass')
    expect(outcome.tokens.planned.create).toBe(sync.summary.variables)
    expect(outcome.tokens.verification).toMatchObject({ create: 0, update: 0 })
    const styles = deriveStyles(sync)
    expect(outcome.styles?.planned.create).toHaveLength(styles.text.length + styles.effects.length)
    expect(outcome.styles?.verification).toMatchObject({ create: [], update: [] })
    expect(outcome.components).toHaveLength(1)
    const [component] = outcome.components
    expect(component).toMatchObject({ name: 'Button', variants: button.variants.length })
    expect(component.applied?.created).toBe(button.variants.length)
    expect(component.applied?.card?.created).toBeGreaterThan(0)
    expect(component.verification).toMatchObject({
      missingVariables: [],
      create: 0,
      update: 0,
      unchanged: button.variants.length,
      card: { create: 0, update: 0 },
    })
    expect(outcome.fontFallbacks).toEqual([
      `${styles.text.length} text styles: --a63-font-app not bound in every mode; used Geist`,
      'Label: --a63-control-font-family not bound in every mode; used Geist',
      'Spec card: --a63-font-app not bound in every mode; used Geist',
    ])
    expect((await checkDesignSystem(fake.figma, models)).status).toBe('pass')
  })

  it('writes nothing on a second build, and a check reads the same', async () => {
    const fake = createFakeNodes()
    await buildDesignSystem(fake.figma, models)
    const writes = fake.writes
    const second = await buildDesignSystem(fake.figma, models)
    expect(fake.writes).toBe(writes)
    expect(second.status).toBe('pass')
    expect(writesPlanned(second)).toEqual({ tokens: 0, styles: 0, variants: 0, card: 0 })
    expect(second.components[0].applied).toMatchObject({ created: 0, updated: 0, variables: 0 })
    const check = await checkDesignSystem(fake.figma, models)
    expect(fake.writes).toBe(writes)
    expect(check.status).toBe('pass')
    expect(check.tokens).not.toHaveProperty('applied')
    expect(writesPlanned(check)).toEqual({ tokens: 0, styles: 0, variants: 0, card: 0 })
  })

  it('is pending while Figma reconciles a default reference, and passes once settled', async () => {
    const fake = createFakeNodes()
    fake.reconcileDefaultReference(['Label', 'Icon'])
    const built = await buildDesignSystem(fake.figma, models)
    expect(['pass', 'pending']).toContain(built.status)
    const early = await checkDesignSystem(fake.figma, models)
    expect(early.status).toBe('pending')
    expect(early.components[0].verification.pendingReferences).toEqual([button.variants[0].name])
    fake.settleReferences()
    expect((await checkDesignSystem(fake.figma, models)).status).toBe('pass')
  })

  it('reads a file with missing tokens as a failing check', async () => {
    const fake = createFakeNodes()
    const check = await checkDesignSystem(fake.figma, models)
    expect(check.status).toBe('fail')
    expect(check.tokens.planned.create).toBe(sync.summary.variables)
    expect(check.components[0].verification.missingVariables.length).toBeGreaterThan(0)
    expect(fake.writes).toBe(0)
  })

  it('moves a plan-1 set on the page into the card, keeping its id', async () => {
    const fake = createFakeNodes()
    await syncModel(fake.figma, { ...sync, styles: deriveStyles(sync) })
    const { doc: _doc, ...withoutDoc } = button
    await syncComponent(fake.figma, withoutDoc)
    const page = fake.figma.root.children.find(item => item.name === button.page)!
    const set = page.children.find(node => node.type === 'COMPONENT_SET')!
    const id = set.id
    expect((await readDesignSystemTable(fake.figma, models)).components).toEqual([
      { name: 'Button', variants: button.variants.length, card: false, setOnPage: true },
    ])

    const outcome = await buildDesignSystem(fake.figma, models)
    expect(outcome.status).toBe('pass')
    expect(outcome.components[0].planned).toMatchObject({ create: 0, update: 0 })
    expect(outcome.components[0].applied?.card?.created).toBeGreaterThan(0)
    const card = page.children.find(node => node.type === 'FRAME' && node.name === 'Button')!
    const moved = fake.findVariant('Button', button.variants[0].name).parent
    expect(moved).toBe(set)
    expect(set.id).toBe(id)
    expect(page.children.filter(node => node.type === 'COMPONENT_SET')).toEqual([])
    expect(card.children!.some(child => child.children?.includes(set))).toBe(true)
    expect((await readDesignSystemTable(fake.figma, models)).components).toEqual([
      { name: 'Button', variants: button.variants.length, card: true, setOnPage: false },
    ])
  })

  it('reports progress phases in order, with counts that only grow', async () => {
    const fake = createFakeNodes()
    const seen: DesignSystemProgress[] = []
    await buildDesignSystem(fake.figma, models, progress => seen.push(progress))
    const order = ['tokens', 'styles', 'components', 'card', 'done']
    const phases = seen.map(item => item.phase).filter((phase, i, all) => all[i - 1] !== phase)
    expect(phases).toEqual(order)
    for (const phase of order) {
      const counts = seen.filter(item => item.phase === phase).map(item => item.done)
      expect(counts).toEqual([...counts].sort((a, b) => a - b))
      for (const item of seen.filter(entry => entry.phase === phase))
        expect(item.done).toBeLessThanOrEqual(item.total)
    }
    expect(seen.find(item => item.phase === 'components')?.label).toBe('Button')
    expect(seen.at(-1)).toEqual({ phase: 'done', done: 1, total: 1 })
  })
})

describe('readDesignSystemTable', () => {
  it('reads an empty file as holding nothing', async () => {
    const fake = createFakeNodes()
    expect(await readDesignSystemTable(fake.figma, models)).toEqual({
      atom63: null,
      template: null,
      components: [{ name: 'Button', variants: 0, card: false, setOnPage: false }],
    })
  })

  it('reports a template table next to the Atom63 one, and never counts it as Atom63', async () => {
    const fake = createFakeNodes()
    const collection = fake.api.createVariableCollection('Tokens')
    for (const token of ['--brand-primary', '--radius-card']) {
      const variable = fake.api.createVariable(token.slice(2), collection, 'COLOR')
      variable.setVariableCodeSyntax?.('WEB', `var(${token})`)
    }
    // A variable without code syntax is a designer's, not a table's.
    fake.api.createVariable('loose', collection, 'COLOR')
    const before = await readDesignSystemTable(fake.figma, models)
    expect(before.atom63).toBeNull()
    expect(before.template).toEqual({ variables: 2 })

    await buildDesignSystem(fake.figma, models)
    const after = await readDesignSystemTable(fake.figma, models)
    expect(after.template).toEqual({ variables: 2 })
    expect(after.atom63?.variables).toBe(sync.summary.variables)
    expect(after.atom63?.collections.map(item => item.name)).toEqual(
      sync.collections.map(item => item.name)
    )
    expect(after.components[0]).toMatchObject({ card: true, setOnPage: false })
  })
})
