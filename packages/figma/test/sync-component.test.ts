import { readFileSync } from 'node:fs'

import { buttonAnatomy } from '../src/components/button-anatomy'
import type { ComponentModel } from '../src/components/model'
import type { SceneNodeLike } from '../src/components/nodes-api'
import { readRecipe } from '../src/components/recipe'
import { syncComponent } from '../src/components/sync-component'
import type { SyncModel, SyncVariable } from '../src/plan'
import { syncModel } from '../src/runtime'
import { createFakeNodes } from './fake-nodes'
import { buttonModelFixture, syncFixture } from './fixtures/button'

describe('the Figma node fake', () => {
  it('stores a bound paint as the variable resolves, as Figma does', () => {
    const fake = createFakeNodes()
    const collection = fake.api.createVariableCollection('Base')
    const red = fake.api.createVariable('red', collection, 'COLOR')
    red.setValueForMode(collection.modes[0].modeId, { r: 1, g: 0, b: 0, a: 1 })
    const faded = fake.api.createVariable('faded', collection, 'COLOR')
    faded.setValueForMode(collection.modes[0].modeId, {
      color: { type: 'VARIABLE_ALIAS', id: red.id },
      opacity: 90,
    })
    const frame = fake.figma.createFrame()
    expect(faded.resolveForConsumer!(frame)).toEqual({
      value: { r: 1, g: 0, b: 0, a: 0.9 },
      resolvedType: 'COLOR',
    })
    // Binding overwrites the paint's color and opacity with the resolved value.
    const paint = { type: 'SOLID' as const, color: { r: 0, g: 0, b: 1 }, opacity: 0.1 }
    const bound = fake.figma.variables.setBoundVariableForPaint(paint, 'color', faded)
    expect(bound).toMatchObject({ color: { r: 1, g: 0, b: 0 }, opacity: 0.9 })
    frame.fills = [{ ...bound, opacity: 0.1 }]
    expect(frame.fills[0]).toMatchObject({ color: { r: 1, g: 0, b: 0 }, opacity: 0.9 })
    // Rebinding the same variable keeps a stale stored color; another variable first refreshes it.
    fake.staleBinding(frame)
    frame.fills = [bound]
    expect(frame.fills[0]).toMatchObject({ color: { r: 0, g: 0, b: 0 }, opacity: 1 })
    frame.fills = [fake.figma.variables.setBoundVariableForPaint(paint, 'color', red)]
    frame.fills = [bound]
    expect(frame.fills[0]).toMatchObject({ color: { r: 1, g: 0, b: 0 }, opacity: 0.9 })
  })

  it('creates a page and a component and reads them back', async () => {
    const fake = createFakeNodes()
    const page = fake.figma.createPage()
    page.name = 'Components'
    const component = fake.figma.createComponent()
    component.name = 'Variant=default'
    const label = fake.figma.createText()
    label.name = 'Label'
    component.appendChild(label)
    const set = fake.figma.combineAsVariants([component], page)
    set.name = 'Button'

    const found = fake.figma.root.children.find(item => item.name === 'Components')!
    await found.loadAsync()
    expect(found.children.map(node => [node.type, node.name])).toEqual([
      ['COMPONENT_SET', 'Button'],
    ])
    expect(fake.findVariant('Button', 'Variant=default')).toBe(component)
    expect(component.parent).toBe(set)
    expect(component.children!.map(node => node.name)).toEqual(['Label'])
    expect(set.componentPropertyDefinitions).toEqual({
      Variant: { type: 'VARIANT', defaultValue: 'default' },
    })
  })

  it('fails where Figma fails', async () => {
    const fake = createFakeNodes()
    const frame = fake.figma.createFrame()
    expect(() => (frame.fills as unknown[]).push({})).toThrow()
    expect(() => {
      ;(frame as { width: number }).width = 10
    }).toThrow()
    expect(() => frame.setBoundVariable('cornerRadius', null)).toThrow()
    const text = fake.figma.createText()
    expect(() => {
      text.characters = 'Hi'
    }).toThrow(/unloaded font/)
    await fake.figma.loadFontAsync({ family: 'Inter', style: 'Regular' })
    text.characters = 'Hi'
    expect(() => frame.appendChild(frame)).toThrow()
    text.name = 'Label'
    frame.appendChild(text)
    expect(() => {
      text.componentPropertyReferences = { characters: 'Label#1:0' }
    }).toThrow()
  })

  it('counts writes and binds paints by returning new objects', async () => {
    const fake = createFakeNodes()
    const collection = fake.api.createVariableCollection('Base')
    const color = fake.api.createVariable('neutral', collection, 'COLOR')
    const frame = fake.figma.createFrame()
    const before = fake.writes
    const paint = { type: 'SOLID' as const, color: { r: 0, g: 0, b: 0 } }
    const bound = fake.figma.variables.setBoundVariableForPaint(paint, 'color', color)
    expect(paint).not.toHaveProperty('boundVariables')
    frame.fills = [bound]
    expect(frame.fills[0].boundVariables?.color?.id).toBe(color.id)
    expect(fake.writes).toBe(before + 2)
  })
})

const neutral = 'Variant=default, Size=md, State=rest'
const alias = (id: string) => ({ type: 'VARIABLE_ALIAS', id })

/** A one-variant, one-size model over `css` and extra single-mode tokens. */
function modelOf(
  css: string,
  tokens: { token: string; type: 'COLOR' | 'FLOAT' | 'STRING'; value: unknown }[],
  states = ['rest', 'focusVisible']
) {
  const sync: SyncModel = {
    ...syncFixture,
    collections: [
      {
        ...syncFixture.collections[0],
        variables: [
          ...syncFixture.collections[0].variables,
          ...tokens.map(({ token, type, value }) => ({
            name: token.slice(2),
            token,
            type,
            values: { default: { value } } as SyncVariable['values'],
          })),
        ],
      },
    ],
  }
  const model = readRecipe({
    css,
    sync,
    anatomy: buttonAnatomy,
    sizes: ['md'],
    contract: {
      variants: ['default'],
      sizes: ['md'],
      states,
      defaultVariant: 'default',
      defaultSize: 'md',
    },
  })
  return { sync, model }
}

describe('syncComponent', () => {
  it('refuses to write when a bound token has no variable', async () => {
    const fake = createFakeNodes()
    const writes = fake.writes
    const result = await syncComponent(fake.figma, buttonModelFixture)
    expect(result.planned.missingVariables).toContain('--a63-action-neutral')
    expect(result.applied).toEqual({ variables: 0, created: 0, updated: 0, fontFallbacks: [] })
    expect(fake.writes).toBe(writes)
    // Not even the derived variables: they alias the missing tokens.
    expect(fake.collections).toEqual([])
  })

  it('builds the set, binds by code syntax, and a second run writes nothing', async () => {
    const fake = createFakeNodes()
    await syncModel(fake.figma, syncFixture) // variables first, as in real use
    const first = await syncComponent(fake.figma, buttonModelFixture)
    expect(first.planned.create).toEqual([
      'page',
      'set',
      ...buttonModelFixture.variants.map(v => v.name),
    ])
    expect(first.applied.created).toBe(12)
    expect(first.verification).toEqual({
      missingVariables: [],
      variables: [],
      create: [],
      update: [],
      unchanged: 12,
    })
    const root = fake.findVariant('Button', neutral)
    expect(root.fills[0].boundVariables?.color?.id).toBe(fake.variableOf('--a63-action-neutral').id)
    expect(root.boundVariables?.paddingLeft?.id).toBe(
      fake.variableOf('--a63-control-padding-inline-md').id
    )
    expect(root.boundVariables?.paddingRight?.id).toBe(root.boundVariables?.paddingLeft?.id)
    expect(root.children!.map(c => c.name)).toEqual(['Icon', 'Label', 'Spinner'])
    expect(root).toMatchObject({
      layoutMode: 'HORIZONTAL',
      primaryAxisAlignItems: 'CENTER',
      counterAxisAlignItems: 'CENTER',
      primaryAxisSizingMode: 'AUTO',
      counterAxisSizingMode: 'FIXED',
      effects: [],
    })

    const writes = fake.writes
    const second = await syncComponent(fake.figma, buttonModelFixture)
    expect(second.planned).toEqual({
      missingVariables: [],
      variables: [],
      create: [],
      update: [],
      unchanged: 12,
    })
    expect(second.applied).toEqual({ variables: 0, created: 0, updated: 0, fontFallbacks: [] })
    expect(fake.writes).toBe(writes)
  })

  it('wires the Label and Icon component properties once', async () => {
    const fake = createFakeNodes()
    await syncModel(fake.figma, syncFixture)
    await syncComponent(fake.figma, buttonModelFixture)
    await syncComponent(fake.figma, buttonModelFixture)
    const root = fake.findVariant('Button', neutral)
    const set = root.parent as SceneNodeLike
    const own = Object.entries(set.componentPropertyDefinitions!).filter(
      ([, definition]) => definition.type !== 'VARIANT'
    )
    expect(own.map(([key, definition]) => [key.split('#')[0], definition])).toEqual([
      ['Label', { type: 'TEXT', defaultValue: 'Button' }],
      ['Icon', { type: 'BOOLEAN', defaultValue: false }],
    ])
    const [label, icon] = ['Label', 'Icon'].map(name => root.children!.find(c => c.name === name)!)
    expect(label.componentPropertyReferences).toEqual({ characters: own[0][0] })
    expect(label.characters).toBe('Button')
    expect(icon.componentPropertyReferences).toEqual({ visible: own[1][0] })
  })

  it('lays a new set out as a grid: rows Variant × Size, columns State', async () => {
    const fake = createFakeNodes()
    await syncModel(fake.figma, syncFixture)
    await syncComponent(fake.figma, buttonModelFixture)
    const at = (name: string) => {
      const { x, y } = fake.findVariant('Button', name)
      return [x, y]
    }
    const [x0, y0] = at('Variant=default, Size=sm, State=rest')
    const [x1, y1] = at('Variant=default, Size=sm, State=hover')
    const [x2, y2] = at('Variant=default, Size=md, State=rest')
    const [, y3] = at('Variant=secondary, Size=sm, State=rest')
    expect(y1).toBe(y0)
    expect(x1).toBeGreaterThan(x0)
    expect(x2).toBe(x0)
    expect(y2).toBeGreaterThan(y0)
    expect(y3).toBeGreaterThan(y2)

    // A designer's arrangement survives a run that changes the variant.
    const moved = fake.findVariant('Button', 'Variant=default, Size=sm, State=hover')
    moved.x = 999
    moved.fills = []
    const again = await syncComponent(fake.figma, buttonModelFixture)
    expect(again.planned.update).toEqual(['Variant=default, Size=sm, State=hover'])
    expect(moved.x).toBe(999)
    expect(moved.fills).toHaveLength(1)
  })

  it('keeps layers a designer added and variants it does not list', async () => {
    const fake = createFakeNodes()
    await syncModel(fake.figma, syncFixture)
    await syncComponent(fake.figma, buttonModelFixture)
    const root = fake.findVariant('Button', neutral)
    const note = fake.figma.createFrame()
    note.name = 'Designer note'
    root.appendChild(note)
    const extra = fake.figma.createComponent()
    extra.name = 'Variant=ghost, Size=md, State=rest'
    ;(root.parent as SceneNodeLike).appendChild(extra)
    const result = await syncComponent(fake.figma, buttonModelFixture)
    expect(result.planned.update).toEqual([])
    expect(root.children!.map(c => c.name)).toContain('Designer note')
    expect(fake.findVariant('Button', 'Variant=ghost, Size=md, State=rest')).toBe(extra)
  })

  it('repairs a deleted layer in place and adds a missing variant to the set', async () => {
    const fake = createFakeNodes()
    await syncModel(fake.figma, syncFixture)
    await syncComponent(fake.figma, buttonModelFixture)
    const root = fake.findVariant('Button', neutral)
    root.children!.find(c => c.name === 'Label')!.remove()
    fake.findVariant('Button', 'Variant=secondary, Size=md, State=hover').remove()
    fake.unloadPages()
    const result = await syncComponent(fake.figma, buttonModelFixture)
    expect(result.planned.create).toEqual(['Variant=secondary, Size=md, State=hover'])
    expect(result.planned.update).toEqual([neutral])
    expect(result.verification.unchanged).toBe(12)
    expect(root.children!.map(c => c.name)).toEqual(['Icon', 'Label', 'Spinner'])
  })

  it('runs only the named variants', async () => {
    const fake = createFakeNodes()
    await syncModel(fake.figma, syncFixture)
    const only = [neutral, 'Variant=secondary, Size=md, State=rest']
    const first = await syncComponent(fake.figma, buttonModelFixture, only)
    expect(first.verification).toEqual({
      missingVariables: [],
      variables: [],
      create: [],
      update: [],
      unchanged: 2,
    })
    const rest = await syncComponent(fake.figma, buttonModelFixture)
    expect(rest.planned.create).toHaveLength(10)
    expect(rest.verification.unchanged).toBe(12)
  })

  it('draws the focus ring as a bound drop shadow only on focusVisible', async () => {
    const { sync, model } = modelOf(
      `.a63-Button {
        --button-focus-ring: var(--a63-control-focus-ring-color);
        background-color: var(--a63-action-neutral);
      }`,
      [
        {
          token: '--a63-control-focus-ring-color',
          type: 'COLOR',
          value: { r: 0, g: 0, b: 1, a: 1 },
        },
        { token: '--a63-control-focus-ring-width', type: 'FLOAT', value: 3 },
      ]
    )
    const fake = createFakeNodes()
    await syncModel(fake.figma, sync)
    const result = await syncComponent(fake.figma, model)
    expect(result.verification.unchanged).toBe(2)

    expect(fake.findVariant('Button', neutral).effects).toEqual([])
    const focused = fake.findVariant('Button', 'Variant=default, Size=md, State=focusVisible')
    expect(focused.effects).toHaveLength(1)
    expect(focused.effects[0]).toMatchObject({
      type: 'DROP_SHADOW',
      offset: { x: 0, y: 0 },
      radius: 0,
      visible: true,
      boundVariables: {
        color: { type: 'VARIABLE_ALIAS', id: fake.variableOf('--a63-control-focus-ring-color').id },
        spread: {
          type: 'VARIABLE_ALIAS',
          id: fake.variableOf('--a63-control-focus-ring-width').id,
        },
      },
    })

    // A ring a designer removed comes back; a second run is idle.
    focused.effects = []
    const repaired = await syncComponent(fake.figma, model)
    expect(repaired.planned.update).toEqual(['Variant=default, Size=md, State=focusVisible'])
    expect(focused.effects).toHaveLength(1)
    const writes = fake.writes
    await syncComponent(fake.figma, model)
    expect(fake.writes).toBe(writes)

    // A skipped ring leaves a designer's effect alone, on every state.
    const skipped = structuredClone(model)
    for (const variant of skipped.variants)
      variant.layers[0].properties.focusRing = { skipped: 'unresolved' }
    const shadow = { ...focused.effects[0], spread: 8 }
    focused.effects = [shadow]
    const rest = fake.findVariant('Button', neutral)
    rest.effects = [shadow]
    const kept = await syncComponent(fake.figma, skipped)
    expect(kept.planned.update).toEqual([])
    expect(focused.effects).toEqual([shadow])
    expect(rest.effects).toEqual([shadow])
  })

  it('binds a color-mix focus ring to its derived variable', async () => {
    const { sync, model } = modelOf(
      `.a63-Button {
        --button-focus-ring: color-mix(in oklch, var(--a63-control-focus-ring-color) 50%, transparent);
        background-color: var(--a63-action-neutral);
      }`,
      [
        {
          token: '--a63-control-focus-ring-color',
          type: 'COLOR',
          value: { r: 0, g: 0, b: 1, a: 1 },
        },
        { token: '--a63-control-focus-ring-width', type: 'FLOAT', value: 3 },
      ]
    )
    const fake = createFakeNodes()
    await syncModel(fake.figma, sync)
    const result = await syncComponent(fake.figma, model)
    expect(result.verification.update).toEqual([])
    const mix = 'color-mix(in oklch, var(--a63-control-focus-ring-color) 50%, transparent)'
    const derived = [...fake.variables.values()].find(item => item.codeSyntax?.WEB === mix)!
    expect(derived.scopes).toEqual(['EFFECT_COLOR'])
    const focused = fake.findVariant('Button', 'Variant=default, Size=md, State=focusVisible')
    expect(focused.effects[0].boundVariables?.color?.id).toBe(derived.id)
    expect(focused.effects[0].color).toEqual({ r: 0, g: 0, b: 1, a: 0.5 })
  })

  it('keeps a designer effect on a component with no focus ring', async () => {
    const fake = createFakeNodes()
    await syncModel(fake.figma, syncFixture)
    await syncComponent(fake.figma, buttonModelFixture)
    const shadow = {
      type: 'DROP_SHADOW' as const,
      color: { r: 0, g: 0, b: 0, a: 0.25 },
      offset: { x: 0, y: 2 },
      radius: 4,
      spread: 0,
      visible: true,
      blendMode: 'NORMAL' as const,
    }
    const root = fake.findVariant('Button', neutral)
    root.effects = [shadow]
    const writes = fake.writes
    const again = await syncComponent(fake.figma, buttonModelFixture)
    expect(again.planned.update).toEqual([])
    expect(fake.writes).toBe(writes)
    expect(root.effects).toEqual([shadow])
  })

  it('binds a color-mix value to a derived variable, with the paint at its alpha', async () => {
    const fake = createFakeNodes()
    await syncModel(fake.figma, syncFixture)
    const first = await syncComponent(fake.figma, buttonModelFixture)
    expect(first.verification.update).toEqual([])
    expect(first.verification.unchanged).toBe(12)
    const mix = 'color-mix(in oklch, var(--a63-action-neutral) 10%, transparent)'
    const derived = [...fake.variables.values()].find(item => item.codeSyntax?.WEB === mix)!
    expect(derived).toMatchObject({ name: 'action-neutral/alpha-10', resolvedType: 'COLOR' })
    const component = fake.collections.find(item => item.variableIds.includes(derived.id))!
    expect(component.name).toBe('Component')
    expect(component.modes.map(mode => mode.name)).toEqual(['Value'])
    expect(Object.values(derived.valuesByMode)).toEqual([
      { color: alias(fake.variableOf('--a63-action-neutral').id), opacity: 10 },
    ])
    const secondary = fake.findVariant('Button', 'Variant=secondary, Size=md, State=rest')
    expect(secondary.fills).toHaveLength(1)
    expect(secondary.fills[0].boundVariables?.color?.id).toBe(derived.id)
    // The stored paint is the variable's resolved value: black at 10%.
    expect(secondary.fills[0].color).toEqual({ r: 0, g: 0, b: 0 })
    expect(secondary.fills[0].opacity).toBeCloseTo(0.1)
    // `transparent` is a literal: an unbound paint at zero opacity.
    expect(secondary.strokes).toHaveLength(1)
    expect(secondary.strokes[0].boundVariables?.color).toBeUndefined()
    expect(secondary.strokes[0].opacity).toBe(0)

    const writes = fake.writes
    const second = await syncComponent(fake.figma, buttonModelFixture)
    expect(second.planned).toEqual({
      missingVariables: [],
      variables: [],
      create: [],
      update: [],
      unchanged: 12,
    })
    expect(fake.writes).toBe(writes)
  })

  it('repairs a stale stored color on a binding Figma kept, and is idle after', async () => {
    const fake = createFakeNodes()
    await syncModel(fake.figma, syncFixture)
    await syncComponent(fake.figma, buttonModelFixture)
    const name = 'Variant=secondary, Size=md, State=rest'
    const secondary = fake.findVariant('Button', name)
    const id = secondary.fills[0].boundVariables?.color?.id
    fake.staleBinding(secondary)
    expect(secondary.fills[0].opacity).toBe(1)

    const repaired = await syncComponent(fake.figma, buttonModelFixture)
    expect(repaired.planned.update).toEqual([name])
    expect(repaired.verification.update).toEqual([])
    expect(secondary.fills[0].boundVariables?.color?.id).toBe(id)
    expect(secondary.fills[0].opacity).toBeCloseTo(0.1)

    const writes = fake.writes
    const again = await syncComponent(fake.figma, buttonModelFixture)
    expect(again.planned.update).toEqual([])
    expect(fake.writes).toBe(writes)
  })

  it('repairs bindings Figma stored black on a first run, in the same run', async () => {
    const { sync, model } = modelOf(
      '.a63-Button { background-color: var(--a63-action-neutral-hover); }',
      []
    )
    const fake = createFakeNodes()
    await syncModel(fake.figma, sync)
    fake.staleNextBinds(2)
    const first = await syncComponent(fake.figma, model)
    expect(first.verification.update).toEqual([])
    const root = fake.findVariant('Button', neutral)
    expect(root.fills[0].color).toEqual({ r: 0.1, g: 0.1, b: 0.1 })
    expect(root.fills[0].boundVariables?.color?.id).toBe(
      fake.variableOf('--a63-action-neutral-hover').id
    )
  })

  it('fades the disabled label and hides the spinner and icon by default', async () => {
    const fake = createFakeNodes()
    await syncModel(fake.figma, syncFixture)
    await syncComponent(fake.figma, buttonModelFixture)
    const layer = (state: string, name: string) =>
      fake
        .findVariant('Button', `Variant=default, Size=md, State=${state}`)
        .children!.find(c => c.name === name)!
    expect(layer('disabled', 'Label').opacity).toBe(0.56)
    expect(layer('rest', 'Label').opacity).toBe(1)
    expect(layer('rest', 'Spinner').visible).toBe(false)
    expect(layer('rest', 'Icon').visible).toBe(false)
  })

  it('binds a loadable font like a text style and falls back to Inter Regular otherwise', async () => {
    const css = `.a63-Button {
      font-family: var(--a63-control-font-family);
      font-weight: var(--a63-control-font-weight);
      font-size: var(--a63-control-padding-inline-md);
    }`
    const weight = { token: '--a63-control-font-weight', type: 'FLOAT' as const, value: 600 }
    const loadable = modelOf(
      css,
      [{ token: '--a63-control-font-family', type: 'STRING', value: 'Geist' }, weight],
      ['rest']
    )
    const fake = createFakeNodes()
    await syncModel(fake.figma, loadable.sync)
    const bound = await syncComponent(fake.figma, loadable.model)
    expect(bound.applied.fontFallbacks).toEqual([])
    expect(bound.verification.unchanged).toBe(1)
    const label = fake.findVariant('Button', neutral).children!.find(c => c.name === 'Label')!
    expect(label.fontName).toEqual({ family: 'Geist', style: 'Semi Bold' })
    expect(label.boundVariables?.fontFamily).toEqual([
      alias(fake.variableOf('--a63-control-font-family').id),
    ])
    expect(label.boundVariables?.fontWeight).toEqual([
      alias(fake.variableOf('--a63-control-font-weight').id),
    ])
    expect(label.boundVariables?.fontSize).toEqual([
      alias(fake.variableOf('--a63-control-padding-inline-md').id),
    ])

    // A CSS stack: its first family is the literal; Figma cannot bind the whole string.
    const stack = modelOf(
      css,
      [
        { token: '--a63-control-font-family', type: 'STRING', value: "'Geist', sans-serif" },
        weight,
      ],
      ['rest']
    )
    const other = createFakeNodes()
    await syncModel(other.figma, stack.sync)
    const literal = await syncComponent(other.figma, stack.model)
    expect(literal.applied.fontFallbacks).toEqual([
      'Label: --a63-control-font-family not bound in every mode; used Geist',
    ])
    expect(literal.verification.unchanged).toBe(1)
    const geist = other.findVariant('Button', neutral).children!.find(c => c.name === 'Label')!
    expect(geist.fontName).toEqual({ family: 'Geist', style: 'Semi Bold' })
    expect(geist.boundVariables?.fontFamily).toBeUndefined()
    expect(geist.boundVariables?.fontWeight).toEqual([
      alias(other.variableOf('--a63-control-font-weight').id),
    ])
    // Figma refuses that binding, and so does the fake.
    expect(() =>
      geist.setBoundVariable('fontFamily', other.variableOf('--a63-control-font-family'))
    ).toThrow(/unloaded font/)

    // A family that loads in the first mode only stays a literal too.
    const modes = modelOf(
      css,
      [{ token: '--a63-control-font-family', type: 'STRING', value: 'Geist' }, weight],
      ['rest']
    )
    const base = modes.sync.collections[0]
    const familyVariable = base.variables.find(v => v.token === '--a63-control-font-family')!
    modes.sync.collections = [
      { ...base, variables: base.variables.filter(v => v !== familyVariable) },
      {
        name: 'Fonts',
        modes: ['brand', 'other'],
        variables: [
          {
            ...familyVariable,
            values: { brand: { value: 'Geist' }, other: { value: 'Comic Sans' } },
          } as SyncVariable,
        ],
      },
    ]
    const mixed = createFakeNodes()
    await syncModel(mixed.figma, modes.sync)
    const partly = await syncComponent(mixed.figma, modes.model)
    expect(partly.applied.fontFallbacks).toEqual([
      'Label: --a63-control-font-family not bound in every mode; used Geist',
    ])
    expect(partly.verification.unchanged).toBe(1)
    const half = mixed.findVariant('Button', neutral).children!.find(c => c.name === 'Label')!
    expect(half.fontName).toEqual({ family: 'Geist', style: 'Semi Bold' })
    expect(half.boundVariables?.fontFamily).toBeUndefined()

    // A family that does not load at all falls back to Inter Regular, unbound.
    const missing = modelOf(
      css,
      [{ token: '--a63-control-font-family', type: 'STRING', value: 'Comic Sans' }, weight],
      ['rest']
    )
    const none = createFakeNodes()
    await syncModel(none.figma, missing.sync)
    const fallback = await syncComponent(none.figma, missing.model)
    expect(fallback.applied.fontFallbacks).toEqual([
      'Label: Comic Sans Semi Bold did not load; used Inter Regular',
      'Label: --a63-control-font-family not bound; used Inter',
    ])
    expect(fallback.verification.unchanged).toBe(1)
    const plain = none.findVariant('Button', neutral).children!.find(c => c.name === 'Label')!
    expect(plain.fontName).toEqual({ family: 'Inter', style: 'Regular' })
    expect(plain.boundVariables?.fontFamily).toBeUndefined()
    expect(plain.boundVariables?.fontWeight).toBeUndefined()
  })

  it('reads text-field bindings as Figma reports them on a text node: one alias per range', async () => {
    const { sync, model } = modelOf(
      `.a63-Button {
        font-size: var(--a63-control-padding-inline-md);
        font-weight: var(--a63-control-font-weight);
      }`,
      [{ token: '--a63-control-font-weight', type: 'FLOAT', value: 500 }],
      ['rest']
    )
    const fake = createFakeNodes()
    await syncModel(fake.figma, sync)
    await syncComponent(fake.figma, model)
    const label = fake.findVariant('Button', neutral).children!.find(c => c.name === 'Label')!
    // Figma's typings: `readonly [field in VariableBindableTextField]?: VariableAlias[]`.
    expect(label.boundVariables?.fontSize).toEqual([
      alias(fake.variableOf('--a63-control-padding-inline-md').id),
    ])
    expect(label.boundVariables?.fontWeight).toEqual([
      alias(fake.variableOf('--a63-control-font-weight').id),
    ])
    const writes = fake.writes
    const again = await syncComponent(fake.figma, model)
    expect(again.planned).toEqual({
      missingVariables: [],
      variables: [],
      create: [],
      update: [],
      unchanged: 1,
    })
    expect(fake.writes).toBe(writes)
  })

  it('turns clipping on so Figma accepts the focus ring spread', async () => {
    const fake = createFakeNodes()
    const component = fake.figma.createComponent()
    const ring = {
      type: 'DROP_SHADOW' as const,
      color: { r: 0, g: 0, b: 1, a: 1 },
      offset: { x: 0, y: 0 },
      radius: 0,
      spread: 3,
      visible: true,
      blendMode: 'NORMAL' as const,
    }
    expect(() => (component.effects = [ring])).toThrow(/clipsContent/)
    component.clipsContent = true
    component.fills = []
    expect(() => (component.effects = [ring])).toThrow(/visible fill/)

    const { sync, model } = modelOf(
      `.a63-Button {
        --button-focus-ring: var(--a63-control-focus-ring-color);
        background-color: var(--a63-action-neutral);
      }`,
      [
        {
          token: '--a63-control-focus-ring-color',
          type: 'COLOR',
          value: { r: 0, g: 0, b: 1, a: 1 },
        },
        { token: '--a63-control-focus-ring-width', type: 'FLOAT', value: 3 },
      ]
    )
    await syncModel(fake.figma, sync)
    const result = await syncComponent(fake.figma, model)
    expect(result.verification.unchanged).toBe(2)
    const focused = fake.findVariant('Button', 'Variant=default, Size=md, State=focusVisible')
    expect(focused.clipsContent).toBe(true)
    expect(focused.effects).toHaveLength(1)
    expect(fake.findVariant('Button', neutral).clipsContent).toBe(true)
  })

  it('places the spinner over the row, out of the flow and centered', async () => {
    const fake = createFakeNodes()
    await syncModel(fake.figma, syncFixture)
    await syncComponent(fake.figma, buttonModelFixture)
    const root = fake.findVariant('Button', neutral)
    const spinner = root.children!.find(c => c.name === 'Spinner')!
    expect(spinner).toMatchObject({
      layoutPositioning: 'ABSOLUTE',
      constraints: { horizontal: 'CENTER', vertical: 'CENTER' },
      x: (root.width - spinner.width) / 2,
      y: (root.height - spinner.height) / 2,
    })

    // A spinner that is off center is an update and comes back to the center.
    spinner.resize(12, 12)
    const again = await syncComponent(fake.figma, buttonModelFixture)
    expect(again.planned.update).toEqual([neutral])
    expect([spinner.x, spinner.y]).toEqual([(root.width - 12) / 2, (root.height - 12) / 2])
    const writes = fake.writes
    await syncComponent(fake.figma, buttonModelFixture)
    expect(fake.writes).toBe(writes)
  })

  it('recovers from a run that failed before the set existed: one set, no orphans', async () => {
    const fake = createFakeNodes()
    await syncModel(fake.figma, syncFixture)
    const create = fake.figma.createComponent
    let calls = 0
    fake.figma.createComponent = () => {
      calls += 1
      if (calls === 3) throw new Error('injected failure')
      return create()
    }
    await expect(syncComponent(fake.figma, buttonModelFixture)).rejects.toThrow('injected failure')
    fake.figma.createComponent = create
    const page = fake.pages.find(item => item.name === 'Components')!
    // The partial run's components wait on the Components page, not the user's page.
    expect(page.children.map(node => node.type)).toEqual(['COMPONENT', 'COMPONENT'])
    expect(fake.figma.currentPage.children).toEqual([])

    const result = await syncComponent(fake.figma, buttonModelFixture)
    expect(result.applied.created).toBe(12)
    expect(result.verification.unchanged).toBe(12)
    for (const item of fake.pages)
      expect(item.children.filter(node => node.type === 'COMPONENT')).toEqual([])
    expect(page.children.map(node => [node.type, node.name])).toEqual([['COMPONENT_SET', 'Button']])
    const names = page.children[0].children!.map(node => node.name)
    expect(names).toHaveLength(12)
    expect(new Set(names).size).toBe(12)
    expect(fake.figma.currentPage.children).toEqual([])
  })

  it('runs as a use_figma script body', async () => {
    const fake = createFakeNodes()
    await syncModel(fake.figma, syncFixture)
    ;(globalThis as { __syncComponent?: unknown }).__syncComponent = syncComponent
    const result = (await fake.run(
      `return globalThis.__syncComponent(figma, ${JSON.stringify(buttonModelFixture)})`
    )) as Awaited<ReturnType<typeof syncComponent>>
    delete (globalThis as { __syncComponent?: unknown }).__syncComponent
    expect(result.verification.unchanged).toBe(12)
  })
})

describe('the real Button model', () => {
  it('syncs the real token set and component model cleanly, and a second run writes nothing', async () => {
    const read = (path: string) =>
      JSON.parse(readFileSync(new URL(path, import.meta.url), 'utf8')) as unknown
    const sync = read('../../styles/generated/atom63.figma-sync.json') as SyncModel
    const model = read('../generated/atom63.figma-components.json') as ComponentModel
    const fake = createFakeNodes()
    await syncModel(fake.figma, sync)
    const first = await syncComponent(fake.figma, model)
    expect(first.planned.missingVariables).toEqual([])
    expect(first.verification).toEqual({
      missingVariables: [],
      variables: [],
      create: [],
      update: [],
      unchanged: 300,
    })
    expect(first.applied.created).toBe(300)
    expect(first.applied.variables).toBe(model.derived.variables.length)
    expect(model.derived.variables).toHaveLength(13)
    // The family token holds a CSS stack: Geist is the literal, the variable stays unbound.
    expect(first.applied.fontFallbacks).toEqual([
      'Label: --a63-control-font-family not bound in every mode; used Geist',
    ])
    const focused = fake.findVariant('Button', 'Variant=default, Size=md, State=focusVisible')
    expect(focused.effects).toHaveLength(1)
    expect(fake.findVariant('Button', neutral).effects).toEqual([])
    const label = focused.children!.find(c => c.name === 'Label')!
    expect(label.boundVariables?.fontSize).toEqual([
      alias(fake.variableOf('--a63-control-font-size-md').id),
    ])
    expect(label.fontName).toEqual({ family: 'Geist', style: 'Medium' })
    expect(label.boundVariables?.fontFamily).toBeUndefined()
    expect(label.boundVariables?.fontWeight).toEqual([
      alias(fake.variableOf('--a63-control-font-weight').id),
    ])

    const writes = fake.writes
    const second = await syncComponent(fake.figma, model)
    expect(second.planned.unchanged).toBe(300)
    expect(fake.writes).toBe(writes)
  }, 60_000)
})
