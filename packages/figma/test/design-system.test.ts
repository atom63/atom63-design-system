import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { MOVED_PREFIX } from '../src/apply'

import type { ComponentModel } from '../src/components/model'
import { readTokenDirectory } from '../src/css-files'
import { buildProjectModel } from '../src/css-model'
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
const template = buildProjectModel(
  readTokenDirectory(resolve(__dirname, 'fixtures/project-tokens'))
).model

/** A build that was not blocked. */
async function build(...args: Parameters<typeof buildDesignSystem>) {
  const outcome = await buildDesignSystem(...args)
  if (outcome.status === 'blocked') throw new Error(`blocked by ${outcome.collisions.join(', ')}`)
  return outcome
}

type Fake = ReturnType<typeof createFakeNodes>

/** Every variable as the file stores it, by id. */
async function variablesOf(fake: Fake) {
  const out = new Map<string, unknown>()
  for (const collection of await fake.api.getLocalVariableCollectionsAsync())
    for (const id of collection.variableIds) {
      const variable = (await fake.api.getVariableByIdAsync(id))!
      out.set(id, {
        collection: collection.name,
        name: variable.name,
        codeSyntax: variable.codeSyntax?.WEB,
        values: JSON.stringify(variable.valuesByMode),
        hidden: variable.hiddenFromPublishing ?? false,
      })
    }
  return out
}

/** The whole file: collections and their modes, variables, styles and pages. */
async function fileOf(fake: Fake) {
  return {
    collections: (await fake.api.getLocalVariableCollectionsAsync()).map(item => ({
      name: item.name,
      modes: item.modes.map(mode => mode.name),
      variables: [...item.variableIds],
    })),
    variables: [...(await variablesOf(fake))],
    textStyles: fake.textStyles.length,
    effectStyles: fake.effectStyles.length,
    pages: fake.figma.root.children.length,
    writes: fake.writes,
  }
}

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
    const outcome = await build(fake.figma, models)
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
    await build(fake.figma, models)
    const writes = fake.writes
    const second = await build(fake.figma, models)
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
    const built = await build(fake.figma, models)
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

    const outcome = await build(fake.figma, models)
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
    await build(fake.figma, models, progress => seen.push(progress))
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
      collisions: [],
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
    expect(before.template).toEqual({ variables: 2, collections: ['Tokens'] })
    expect(before.collisions).toEqual([])

    await build(fake.figma, models)
    const after = await readDesignSystemTable(fake.figma, models)
    expect(after.template).toEqual({ variables: 2, collections: ['Tokens'] })
    expect(after.collisions).toEqual([])
    expect(after.atom63?.variables).toBe(sync.summary.variables)
    expect(after.atom63?.collections.map(item => item.name)).toEqual(
      sync.collections.map(item => item.name)
    )
    expect(after.components[0]).toMatchObject({ card: true, setOnPage: false })
  })
})

describe('a template table that shares names with Atom63', () => {
  const collisions = ['Brand', 'Surface', 'Radius', 'Mode']
  const templateNames = template.collections.map(item => item.name)
  const templateVariables = template.collections.reduce(
    (total, item) => total + item.variables.length,
    0
  )

  async function templateFile() {
    const fake = createFakeNodes()
    await syncModel(fake.figma, template)
    return fake
  }

  it('reads the template fixture as a template, though most of its tokens are in the Atom63 set', async () => {
    const atom63Tokens = new Set(sync.collections.flatMap(item => item.variables.map(v => v.token)))
    const shared = template.collections
      .flatMap(item => item.variables)
      .filter(item => atom63Tokens.has(item.token))
    expect(shared.length).toBeGreaterThan(300)

    const table = await readDesignSystemTable((await templateFile()).figma, models)
    expect(table.atom63).toBeNull()
    expect(table.template).toEqual({ variables: templateVariables, collections: templateNames })
    expect(table.collisions).toEqual(collisions)
  })

  it('blocks a build into colliding collections, writing nothing', async () => {
    const fake = await templateFile()
    const before = await fileOf(fake)
    const seen: DesignSystemProgress[] = []
    const outcome = await buildDesignSystem(fake.figma, models, item => seen.push(item))
    expect(outcome).toEqual({ status: 'blocked', collisions })
    expect(seen).toEqual([])
    expect(await fileOf(fake)).toEqual(before)
  })

  it('with allowCollisions, builds beside the template and leaves its own variables untouched', async () => {
    const fake = await templateFile()
    const atom63Tokens = new Set(sync.collections.flatMap(item => item.variables.map(v => v.token)))
    const templateOnly = new Map(
      [...(await variablesOf(fake))].filter(([, item]) => {
        const { codeSyntax } = item as { codeSyntax: string }
        return !atom63Tokens.has(codeSyntax.slice(4, -1))
      })
    )
    const inMode = [...templateOnly.values()].filter(
      item => (item as { collection: string }).collection === 'Mode'
    )
    expect(inMode.length).toBeGreaterThan(0)

    const outcome = await build(fake.figma, models, undefined, { allowCollisions: true })
    expect(outcome.status).toBe('pass')
    expect(outcome.tokens.applied?.moved).toBe(0)
    const after = await variablesOf(fake)
    for (const [id, item] of templateOnly) expect(after.get(id)).toEqual(item)

    const table = await readDesignSystemTable(fake.figma, models)
    expect(table.atom63?.variables).toBe(sync.summary.variables)
    expect(table.template?.collections).toEqual(expect.arrayContaining(['Base', 'Mode']))
    // Surface and Radius held only tokens Atom63 shares, which the build adopted.
    expect(table.collisions).toEqual(['Brand', 'Mode'])
    expect((await checkDesignSystem(fake.figma, models)).status).toBe('pass')
  })

  it('never renames a template mode or retires a template variable', async () => {
    const [foundation] = sync.collections.find(item => item.name === 'Foundation')!.variables
    const seed = async () => {
      const fake = createFakeNodes()
      const collection = fake.api.createVariableCollection('Mode')
      collection.renameMode(collection.modes[0].modeId, 'Default')
      const variables = ['--brand-ink', foundation.token].map(token => {
        const variable = fake.api.createVariable(token.slice(2), collection, 'COLOR')
        variable.setVariableCodeSyntax?.('WEB', `var(${token})`)
        variable.setValueForMode(collection.modes[0].modeId, { r: 1, g: 0, b: 0, a: 1 })
        return variable
      })
      return { fake, variables }
    }

    // What the engine alone does to such a collection: renames its mode onto
    // Atom63's and retires the template's variable for the token it moves.
    const bare = await seed()
    await syncModel(bare.fake.figma, sync)
    const [bareMode] = await bare.fake.api.getLocalVariableCollectionsAsync()
    expect(bareMode.modes.map(item => item.name)).not.toContain('Default')
    expect(bare.variables[1].name.startsWith(MOVED_PREFIX)).toBe(true)

    const { fake, variables } = await seed()
    const before = await variablesOf(fake)
    expect((await readDesignSystemTable(fake.figma, models)).collisions).toEqual(['Mode'])
    const outcome = await build(fake.figma, models, undefined, { allowCollisions: true })
    expect(outcome.status).toBe('pass')
    expect(outcome.tokens.planned.move).toBe(0)
    const [mode] = await fake.api.getLocalVariableCollectionsAsync()
    expect(mode.modes.map(item => item.name)).toEqual(['Default', 'light', 'dark'])
    const after = await variablesOf(fake)
    for (const variable of variables)
      expect(after.get(variable.id)).toEqual(before.get(variable.id))
    expect((await checkDesignSystem(fake.figma, models)).status).toBe('pass')
  })
})

describe('status', () => {
  it('fails on a type conflict, though nothing else would be written', async () => {
    const fake = createFakeNodes()
    await build(fake.figma, models)
    const [first, ...rest] = sync.collections
    const conflicting: SyncModel = {
      ...sync,
      collections: [
        {
          ...first,
          variables: [{ ...first.variables[0], type: 'FLOAT' }, ...first.variables.slice(1)],
        },
        ...rest,
      ],
    }
    const check = await checkDesignSystem(fake.figma, { ...models, sync: conflicting })
    expect(check.tokens.verification).toMatchObject({ create: 0, update: 0, typeConflicts: 1 })
    expect(check.status).toBe('fail')
  })
})
