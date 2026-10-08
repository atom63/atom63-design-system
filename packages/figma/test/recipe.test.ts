import { readFileSync } from 'node:fs'
import { readRules } from '../src/components/css-rules'
import { readRecipe } from '../src/components/recipe'
import { buttonAnatomy } from '../src/components/button-anatomy'
import { buttonModelFixture, syncFixture } from './fixtures/button'
import type { SyncModel } from '../src/plan'
import {
  buttonContract,
  buttonSizes,
} from '../../ui-foundation/src/components/button/button-contract'

const sync = syncFixture
const model = buttonModelFixture
const layer = (name: string, layerName = 'Button') =>
  model.variants.find(v => v.name === name)!.layers.find(l => l.name === layerName)!

it('names variants Variant × Size × State in contract order', () => {
  expect(model.variants).toHaveLength(2 * 2 * 3)
  expect(model.variants[0].name).toBe('Variant=default, Size=sm, State=rest')
})

it('follows --button-* locals to a synced token', () => {
  expect(layer('Variant=default, Size=md, State=rest').properties.fill).toEqual({
    alias: '--a63-action-neutral',
  })
  expect(layer('Variant=default, Size=md, State=rest').properties.stroke).toEqual({
    alias: '--a63-action-neutral',
  })
})

it('applies state, variant and size rules in cascade order', () => {
  expect(layer('Variant=default, Size=md, State=hover').properties.fill).toEqual({
    alias: '--a63-action-neutral-hover',
  })
  expect(layer('Variant=default, Size=sm, State=rest').properties.paddingInline).toEqual({
    alias: '--a63-control-padding-inline-sm',
  })
})

it('reads color-mix with transparent as a derived variable, and transparent as a literal', () => {
  const root = layer('Variant=secondary, Size=md, State=rest')
  const mix = 'color-mix(in oklch, var(--a63-action-neutral) 10%, transparent)'
  expect(root.properties.fill).toEqual({ alias: mix })
  expect(root.properties.stroke).toEqual({ value: { r: 0, g: 0, b: 0, a: 0 } })
  // One variable per (token, opacity), in the Component collection, named by meaning.
  expect(buttonModelFixture.derived).toEqual({
    name: 'Component',
    modes: ['Value'],
    variables: [
      {
        name: 'action-neutral/alpha-10',
        token: mix,
        type: 'COLOR',
        values: { Value: { composed: { alias: '--a63-action-neutral', opacity: 10 } } },
        codeSyntax: mix,
        scopes: ['FRAME_FILL', 'SHAPE_FILL'],
      },
    ],
  })
  // The code token behind it is what the model needs from the token sync (C8).
  expect(buttonModelFixture.tokens).toContain('--a63-action-neutral')
})

it('fades the label when disabled and keeps the anatomy in step with the recipe', () => {
  expect(layer('Variant=default, Size=md, State=disabled', 'Label').properties.opacity).toEqual({
    value: 0.56,
  })
})

it('reports what it does not read', () => {
  expect(model.skipped).toContainEqual({ what: '.a63-Button::after', reason: 'pseudo-element' })
  expect(model.skipped).toContainEqual({ what: 'Size=icon', reason: 'not in this plan (C2)' })
  expect(model.tokens).toEqual([
    '--a63-action-neutral',
    '--a63-action-neutral-hover',
    '--a63-control-padding-inline-md',
    '--a63-control-padding-inline-sm',
  ])
})

describe('values beyond the trimmed recipe', () => {
  const twoModes: SyncModel = {
    ...sync,
    collections: [
      ...sync.collections,
      {
        name: 'Density',
        modes: ['comfortable', 'compact'],
        variables: [
          {
            name: 'height',
            token: '--a63-control-height-md',
            type: 'FLOAT',
            values: { comfortable: { value: 32 }, compact: { value: 28 } },
          },
          {
            name: 'min',
            token: '--a63-control-min-size',
            type: 'FLOAT',
            values: { comfortable: { alias: '--a63-control-height-md' }, compact: { value: 1 } },
          },
          {
            name: 'surface',
            token: '--surface-dark-1',
            type: 'COLOR',
            values: { comfortable: { value: { r: 0, g: 0, b: 0, a: 1 } }, compact: { value: 0 } },
          },
        ],
      },
    ],
  }
  const read = (recipe: string) =>
    readRecipe({
      css: recipe,
      sync: twoModes,
      anatomy: buttonAnatomy,
      sizes: ['md'],
      contract: {
        variants: ['default'],
        sizes: ['md'],
        states: ['rest', 'hover', 'disabled', 'loading'],
        defaultVariant: 'default',
        defaultSize: 'md',
      },
    })
  const rootOf = (recipeModel: ReturnType<typeof read>, state = 'rest', name = 'Button') =>
    recipeModel.variants.find(v => v.coord.state === state)!.layers.find(l => l.name === name)!
      .properties

  it('expands a three-part border shorthand, and later border-color wins', () => {
    const recipeModel = read(`
      .a63-Button {
        --button-border-color: var(--a63-action-neutral);
        border: var(--a63-control-padding-inline-sm) solid var(--button-border-color);
      }
      .a63-Button:hover { border-color: var(--a63-action-neutral-hover); }
      .a63-Button:disabled { border: none; }`)
    expect(rootOf(recipeModel).stroke).toEqual({ alias: '--a63-action-neutral' })
    expect(rootOf(recipeModel, 'hover').stroke).toEqual({ alias: '--a63-action-neutral-hover' })
    expect(recipeModel.skipped).toContainEqual({
      what: '.a63-Button:disabled border: none',
      reason: 'only `border: <width> <style> <color>` is read',
    })
  })

  it('stops at any synced token, not only --a63-*', () => {
    const recipeModel = read(`
      .a63-Button {
        --button-background: color-mix(in oklch, var(--surface-dark-1) 26%, transparent);
        background-color: var(--button-background);
      }`)
    expect(rootOf(recipeModel).fill).toEqual({
      alias: 'color-mix(in oklch, var(--surface-dark-1) 26%, transparent)',
    })
    expect(recipeModel.derived.variables.map(variable => variable.name)).toEqual([
      'surface/alpha-26',
    ])
  })

  it('evaluates calc() and max() with first-mode values as literals', () => {
    const recipeModel = read(`
      .a63-Button {
        --button-height: max(
          calc(var(--a63-control-height-md) * var(--a63-density-scale, 1)),
          var(--a63-control-min-size),
          calc(10px + 2 * 3px)
        );
        --button-radius: calc(var(--missing-token) * 2);
      }`)
    expect(rootOf(recipeModel).height).toEqual({ value: 32 })
    expect(recipeModel.literals).toContainEqual({
      variant: 'Variant=default, Size=md, State=rest',
      layer: 'Button',
      property: 'height',
      expression:
        'max( calc(var(--a63-control-height-md) * var(--a63-density-scale, 1)), var(--a63-control-min-size), calc(10px + 2 * 3px) )',
    })
    expect(rootOf(recipeModel).cornerRadius).toEqual({
      skipped: 'var(--missing-token) has no number',
    })
  })

  it('reads a synced token named directly by the anatomy and leaves undeclared properties out', () => {
    const recipeModel = read(`.a63-Button { font-size: var(--a63-control-height-md); }`)
    expect(rootOf(recipeModel, 'rest', 'Label')).toEqual({
      fontSize: { alias: '--a63-control-height-md' },
    })
    expect(rootOf(recipeModel, 'loading', 'Label').opacity).toEqual({ value: 0 })
    expect(rootOf(recipeModel, 'loading', 'Spinner').visible).toEqual({ value: true })
    expect(rootOf(recipeModel, 'rest', 'Spinner').visible).toEqual({ value: false })
  })

  it('reports a recipe literal that drifts from the anatomy', () => {
    const recipeModel = read(`.a63-Button:disabled .a63-Button-label { opacity: 0.5; }`)
    expect(recipeModel.skipped).toContainEqual({
      what: 'Label opacity in State=disabled',
      reason: 'the anatomy says 0.56, the recipe says 0.5',
    })
  })
})

describe('the real Button recipe', () => {
  const root = new URL('../../', import.meta.url)
  const realCss = readFileSync(new URL('ui-react/src/components/button/button.css', root), 'utf8')
  const realModel = readRecipe({
    css: realCss,
    sync: JSON.parse(
      readFileSync(new URL('styles/generated/atom63.figma-sync.json', root), 'utf8')
    ) as SyncModel,
    // The contract object carries no `sizes`; the module exports them alongside it.
    contract: { ...buttonContract, sizes: buttonSizes },
    anatomy: buttonAnatomy,
    sizes: ['xs', 'sm', 'md', 'lg', 'xl'],
  })

  it('builds 300 variants', () => {
    expect(realModel.variants).toHaveLength(300)
  })

  it('skips exactly the known rules, so a rewritten selector cannot slip into `skipped`', () => {
    expect(realModel.skipped).toEqual([
      { what: 'Size=tile', reason: 'not in this plan (C2)' },
      { what: 'Size=icon-xs', reason: 'not in this plan (C2)' },
      { what: 'Size=icon-sm', reason: 'not in this plan (C2)' },
      { what: 'Size=icon', reason: 'not in this plan (C2)' },
      { what: 'Size=icon-lg', reason: 'not in this plan (C2)' },
      { what: 'Size=icon-xl', reason: 'not in this plan (C2)' },
      { what: '.a63-Button::after', reason: 'pseudo-element' },
      { what: ".a63-Button:not([data-size='tile'])::before", reason: 'pseudo-element' },
      { what: '.a63-Button > span:not(.a63-Button-spinner)', reason: 'descendant' },
      {
        what: "[data-a63-theme='aqua'] .a63-Button[data-size^='icon']",
        reason: 'context selector',
      },
      { what: ".a63-Button[data-size^='icon']::after", reason: 'pseudo-element' },
      {
        what: ":is(.dark, [data-a63-mode='dark']) .a63-Button[data-variant='outline']",
        reason: 'context selector',
      },
      { what: ".a63-Button[data-size='tile'].h-full", reason: 'unsupported selector' },
      { what: ".a63-Button[data-size='tile'].size-full", reason: 'unsupported selector' },
      { what: '.a63-Button :where(svg)', reason: 'descendant' },
    ])
  })

  // Anatomy properties allowed to be absent or skipped, as `Layer.property` → reason.
  // None today: every `reads` key resolves on all 300 variants.
  const exemptions: Record<string, string> = {}

  it('reads every anatomy property on every variant, so a renamed custom property fails', () => {
    const missing: string[] = []
    for (const v of realModel.variants)
      for (const anatomyLayer of buttonAnatomy.layers) {
        const properties = v.layers.find(l => l.name === anatomyLayer.name)?.properties ?? {}
        for (const key of Object.keys(anatomyLayer.reads) as (keyof typeof properties)[]) {
          if (`${anatomyLayer.name}.${key}` in exemptions) continue
          const value = properties[key]
          if (!value || 'skipped' in value) missing.push(`${v.name} ${anatomyLayer.name}.${key}`)
        }
      }
    expect(missing).toEqual([])
  })

  it('gives Variant=default, Size=md its own hover and pressed fills', () => {
    const fill = (state: string) =>
      realModel.variants.find(v => v.name === `Variant=default, Size=md, State=${state}`)!.layers[0]
        .properties.fill
    expect(fill('rest')).toEqual({ alias: '--a63-action-neutral' })
    expect(fill('hover')).toEqual({
      alias: 'color-mix(in oklch, var(--a63-action-neutral) 90%, transparent)',
    })
    // The recipe sets --button-state-active-background to the hover background.
    expect(fill('pressed')).toEqual(fill('hover'))
    expect(fill('hover')).not.toEqual(fill('rest'))
    expect(fill('pressed')).not.toEqual(fill('rest'))
  })

  it('binds every root fill to a token or the transparent literal', () => {
    const unbound = realModel.variants
      .map(v => ({ name: v.name, fill: v.layers[0].properties.fill }))
      .filter(
        ({ fill }) =>
          !fill ||
          !(
            'alias' in fill ||
            JSON.stringify(fill) === JSON.stringify({ value: { r: 0, g: 0, b: 0, a: 0 } })
          )
      )
    expect(unbound).toEqual([])
  })

  it('fades the disabled label by the recipe’s 0.56 with no drift', () => {
    for (const v of realModel.variants.filter(item => item.coord.state === 'disabled'))
      expect(v.layers.find(l => l.name === 'Label')!.properties.opacity).toEqual({ value: 0.56 })
    expect(realModel.skipped.filter(item => item.reason.startsWith('the anatomy says'))).toEqual([])
    const fade = readRules(realCss).find(rule =>
      rule.selectors.includes('.a63-Button:disabled .a63-Button-label')
    )
    expect(fade?.declarations.opacity).toBe('0.56')
  })
})
