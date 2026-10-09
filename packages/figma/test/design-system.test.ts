import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { MOVED_PREFIX } from '../src/apply'
import type { CollectionLike } from '../src/apply'

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
  if (outcome.status === 'blocked') throw new Error(outcome.reason)
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

/** Adds a collection with these modes and one COLOR variable per token, with code syntax. */
function addCollection(fake: Fake, name: string, modes: string[], tokens: string[]) {
  const collection: CollectionLike = fake.api.createVariableCollection(name)
  collection.renameMode(collection.modes[0].modeId, modes[0])
  for (const mode of modes.slice(1)) collection.addMode(mode)
  for (const token of tokens) {
    const variable = fake.api.createVariable(token.slice(2), collection, 'COLOR')
    variable.setVariableCodeSyntax?.('WEB', `var(${token})`)
    for (const mode of collection.modes)
      variable.setValueForMode(mode.modeId, { r: 1, g: 0, b: 0, a: 1 })
  }
  return collection
}

/** A refused build: blocked by these collections, no progress and the whole file unchanged. */
async function expectBlocked(fake: Fake, collections: string[]) {
  const before = await fileOf(fake)
  const seen: DesignSystemProgress[] = []
  const outcome = await buildDesignSystem(fake.figma, models, item => seen.push(item))
  expect(outcome).toEqual({
    status: 'blocked',
    reason: expect.stringContaining(
      `This file already holds another token set (collections: ${collections.join(', ')}). Start the Atom63 design system in a new file`
    ),
    collections,
  })
  expect(seen).toEqual([])
  expect(await fileOf(fake)).toEqual(before)
  const table = await readDesignSystemTable(fake.figma, models)
  expect(table.template?.collections).toEqual(collections)
  expect(table.blocked).toBe(outcome.status === 'blocked' ? outcome.reason : null)
}

const allAtom63 = {
  variables: sync.summary.variables,
  collections: sync.collections.map(item => ({
    name: item.name,
    variables: item.variables.length,
  })),
}

describe('readDesignSystemTable', () => {
  it('reads an empty file as holding nothing', async () => {
    const fake = createFakeNodes()
    expect(await readDesignSystemTable(fake.figma, models)).toEqual({
      atom63: null,
      template: null,
      blocked: null,
      components: [{ name: 'Button', variants: 0, card: false, setOnPage: false }],
    })
  })

  it('reads a file the build made as Atom63 only, which a second build leaves alone', async () => {
    const fake = createFakeNodes()
    await build(fake.figma, models)
    expect(await readDesignSystemTable(fake.figma, models)).toEqual({
      atom63: allAtom63,
      template: null,
      blocked: null,
      components: [
        { name: 'Button', variants: button.variants.length, card: true, setOnPage: false },
      ],
    })
    const writes = fake.writes
    expect(writesPlanned(await build(fake.figma, models))).toEqual({
      tokens: 0,
      styles: 0,
      variants: 0,
      card: 0,
    })
    expect(fake.writes).toBe(writes)
  })

  it("counts Atom63's retired copies and a designer's loose variables as no token set", async () => {
    const fake = createFakeNodes()
    await build(fake.figma, models)
    const collections = await fake.api.getLocalVariableCollectionsAsync()
    const foundation = collections.find(item => item.name === 'Foundation')!
    // A retired copy whose code syntax the host could not remove.
    const retired = fake.api.createVariable(`${MOVED_PREFIX}/old`, foundation, 'COLOR')
    retired.setVariableCodeSyntax?.('WEB', 'var(--retired-token)')
    fake.api.createVariable('loose', fake.api.createVariableCollection('Scratch'), 'COLOR')
    const table = await readDesignSystemTable(fake.figma, models)
    expect(table).toMatchObject({ atom63: allAtom63, template: null, blocked: null })
    expect((await build(fake.figma, models)).status).toBe('pass')
  })
})

describe('a file that holds another token set', () => {
  const templateNames = template.collections.map(item => item.name)

  async function templateFile(model = template) {
    const fake = createFakeNodes()
    await syncModel(fake.figma, model)
    return fake
  }

  it('reads the template fixture as another token set, though it shares most tokens and Mode', async () => {
    const atom63Tokens = new Set(sync.collections.flatMap(item => item.variables.map(v => v.token)))
    const shared = template.collections
      .flatMap(item => item.variables)
      .filter(item => atom63Tokens.has(item.token))
    expect(shared.length).toBeGreaterThan(300)
    expect(templateNames).toContain('Mode')

    const table = await readDesignSystemTable((await templateFile()).figma, models)
    expect(table.atom63).toBeNull()
    expect(table.template).toEqual({
      variables: template.collections.reduce((total, item) => total + item.variables.length, 0),
      collections: templateNames,
    })
    expect(table.blocked).toBe(
      `This file already holds another token set (collections: ${templateNames.join(', ')}). Start the Atom63 design system in a new file. If this file holds an older Atom63 token set, this version can't update it.`
    )
  })

  it('refuses to build into the template fixture, writing nothing', async () => {
    await expectBlocked(await templateFile(), templateNames)
  })

  it('refuses the template fixture with other values too', async () => {
    const variant: SyncModel = {
      ...template,
      collections: template.collections.map(collection => ({
        ...collection,
        variables: collection.variables.map(variable => ({
          ...variable,
          values: Object.fromEntries(
            Object.entries(variable.values).map(([mode, value]) => [
              mode,
              variable.type === 'COLOR' ? { r: 0.5, g: 0.25, b: 0.75, a: 1 } : value,
            ])
          ),
        })),
      })),
    } as SyncModel
    await expectBlocked(await templateFile(variant), templateNames)
  })

  it('refuses a token collection next to a built Atom63, without a message about older Atom63', async () => {
    const fake = createFakeNodes()
    await build(fake.figma, models)
    addCollection(fake, 'Tokens', ['Default'], ['--brand-primary', '--radius-card'])
    await expectBlocked(fake, ['Tokens'])
    const table = await readDesignSystemTable(fake.figma, models)
    expect(table.atom63).toEqual(allAtom63)
    expect(table.template).toEqual({ variables: 2, collections: ['Tokens'] })
    expect(table.blocked).not.toContain('older Atom63')
  })

  it("never claims a second Atom63-named collection that holds only that collection's tokens", async () => {
    const fake = createFakeNodes()
    await build(fake.figma, models)
    const radius = sync.collections.find(item => item.name === 'Radius')!
    addCollection(
      fake,
      'Radius',
      radius.modes,
      radius.variables.slice(0, 3).map(item => item.token)
    )
    // Both Radius collections are suspect: neither can be told apart as Atom63's.
    await expectBlocked(fake, ['Radius', 'Radius'])
  })

  it('refuses an Atom63-named collection with other modes, even with no code syntax in it', async () => {
    const fake = createFakeNodes()
    const mode = fake.api.createVariableCollection('Mode')
    mode.renameMode(mode.modes[0].modeId, 'Default')
    fake.api.createVariable('ink', mode, 'COLOR')
    await expectBlocked(fake, ['Mode'])
  })

  it('refuses a template token inside an Atom63 collection', async () => {
    const fake = createFakeNodes()
    await build(fake.figma, models)
    const collections = await fake.api.getLocalVariableCollectionsAsync()
    const surface = collections.find(item => item.name === 'Surface')!
    const variable = fake.api.createVariable('brand/ink', surface, 'COLOR')
    variable.setVariableCodeSyntax?.('WEB', 'var(--brand-ink)')
    await expectBlocked(fake, ['Surface'])
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
