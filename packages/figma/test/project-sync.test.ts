import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { applyPlan, readSnapshot, type VariablesApi } from '../src/apply'
import { formatChangeList, planChangeList } from '../src/change-list'
import {
  buildProjectModel,
  type ColorResolver,
  type CssFile,
  evaluateNumber,
  parseColor,
  variableName,
} from '../src/css-model'
import { planSync, type SyncModel, type SyncVariable } from '../src/plan'
import { createFakeApi } from './fake-api'

/** The site template's token files, in the order its index.css imports them. */
const files: CssFile[] = ['palette', 'axes', 'semantic', 'scale', 'theme'].map(name => ({
  name: `${name}.css`,
  text: readFileSync(resolve(__dirname, `fixtures/project-tokens/${name}.css`), 'utf8'),
}))

/** Stands in for the browser's color conversion: gives relative colors a fixed value. */
const resolveColor: ColorResolver = expression =>
  parseColor(expression) ?? (expression.startsWith('oklch(') ? { r: 1, g: 1, b: 1, a: 1 } : null)

const project = buildProjectModel(files, resolveColor)

function find(token: string): { collection: string; variable: SyncVariable } {
  for (const collection of project.model.collections) {
    const variable = collection.variables.find(item => item.token === token)
    if (variable) return { collection: collection.name, variable }
  }
  throw new Error(`${token} is not in the model`)
}

async function sync(api: VariablesApi, model: SyncModel) {
  const plan = planSync(model, await readSnapshot(api, model))
  const result = await applyPlan(api, model, plan)
  return { plan, result }
}

describe('Project mode: reading token CSS', () => {
  it('makes a collection per axis, with the :root value as the first mode', () => {
    expect(project.model.collections.map(item => [item.name, item.modes])).toEqual([
      ['Base', ['Value']],
      ['Brand', ['b1', 'b2', 'b3', 'b4', 'b5', 'b6']],
      ['Surface', ['n1', 'n2', 'n3', 'n4', 'n5', 'n6']],
      ['Radius', ['default', 'none', 'subtle', 'round']],
      ['Type scale', ['normal', 'compact', 'comfortable', 'large']],
      ['Mode', ['light', 'dark']],
    ])
  })

  it('writes var() as an alias, per mode, where the variable varies', () => {
    expect(find('--background')).toMatchObject({
      collection: 'Mode',
      variable: {
        type: 'COLOR',
        values: { light: { alias: '--surface-light-2' }, dark: { alias: '--surface-dark-1' } },
      },
    })
    const primary = find('--primary')
    expect(primary.collection).toBe('Brand')
    expect(primary.variable.values.b1).toEqual({ alias: '--brand-600' })
    expect(primary.variable.values.b3).toEqual({ alias: '--brand-700' })
  })

  it('writes a color at an opacity as a composed color', () => {
    expect(find('--ring').variable.values.b2).toEqual({
      composed: { alias: '--brand-500', opacity: 30 },
    })
    expect(find('--accent').variable.values).toEqual({
      light: { composed: { alias: '--surface-light-4', opacity: 80 } },
      dark: { composed: { alias: '--surface-dark-6', opacity: 80 } },
    })
  })

  it('computes calc() per mode, at the widest viewport', () => {
    expect(find('--radius-lg')).toMatchObject({
      collection: 'Radius',
      variable: {
        type: 'FLOAT',
        values: {
          default: { value: 10 },
          none: { value: 0 },
          subtle: { value: 5 },
          round: { value: 15 },
        },
      },
    })
    // 16px at the base, 17px from 40rem.
    expect(find('--text-lg-size').variable.values.normal).toEqual({ value: 17 })
    expect(find('--text-lg-size').variable.values.large).toEqual({ value: 20.4 })
    expect(project.notes.join(' ')).toContain('widest viewport')
  })

  it('computes a relative color with the resolver, per mode', () => {
    expect(find('--primary-foreground')).toMatchObject({
      collection: 'Brand',
      variable: { type: 'COLOR', values: { b1: { value: { r: 1, g: 1, b: 1, a: 1 } } } },
    })
  })

  it('reads palette literals as colors and hides raw ramps from pickers', () => {
    const base = find('--color-b1-500')
    expect(base.collection).toBe('Base')
    expect(base.variable.values.Value).toEqual({
      value: { r: 44 / 255, g: 127 / 255, b: 1, a: 1 },
    })
    expect(base.variable.scopes).toEqual([])
    expect(find('--surface-light-3').variable.scopes).toEqual([])
    expect(find('--radius-multiplier').variable.scopes).toEqual([])
    expect(find('--radius-lg').variable.scopes).toEqual(['CORNER_RADIUS'])
    expect(find('--text-lg-size').variable.scopes).toEqual(['FONT_SIZE'])
    expect(find('--primary').variable.scopes).toEqual(['ALL_SCOPES'])
  })

  it('names variables by group and sets the web code syntax', () => {
    expect(find('--color-b1-500').variable.name).toBe('color/b1/500')
    expect(find('--muted-foreground').variable.name).toBe('muted-foreground')
    expect(variableName('--radius')).toBe('radius/base')
    expect(find('--primary').variable.codeSyntax).toBe('var(--primary)')
  })

  it('skips Tailwind wiring and reports what Figma variables cannot hold', () => {
    // `@theme inline { --color-primary: var(--primary) }` only wires the utility.
    expect(() => find('--color-primary')).toThrow()
    const skipped = Object.fromEntries(project.model.skipped.map(item => [item.token, item.reason]))
    expect(skipped['--shadow-md']).toContain('effect style')
    expect(skipped['--font-sans']).toContain('not a color or a number')
  })

  it('reports a relative color it cannot compute without a browser', () => {
    const plain = buildProjectModel(files)
    expect(plain.model.skipped.find(item => item.token === '--primary-foreground')?.reason).toBe(
      'a color that could not be computed here'
    )
  })
})

describe('Project mode: syncing', () => {
  it('writes the model and plans zero changes on a second sync', async () => {
    const { api, variables } = createFakeApi()
    const first = await sync(api, project.model)
    expect(first.result.created).toBe(project.model.summary.variables)

    const second = planSync(project.model, await readSnapshot(api, project.model))
    expect(second.totals).toMatchObject({ create: 0, update: 0, typeConflicts: 0 })

    const ring = [...variables.values()].find(item => item.name === 'ring')
    const brand500 = [...variables.values()].find(item => item.name === 'brand/500')
    expect(Object.values(ring?.valuesByMode ?? {})[0]).toEqual({
      color: { type: 'VARIABLE_ALIAS', id: brand500?.id },
      opacity: 30,
    })
    expect(ring?.codeSyntax).toEqual({ WEB: 'var(--ring)' })
  })

  it('restores scopes a designer changed', async () => {
    const { api, variables } = createFakeApi()
    await sync(api, project.model)
    const palette = [...variables.values()].find(item => item.name === 'color/b1/500')
    if (palette) palette.scopes = ['ALL_SCOPES']

    const plan = planSync(project.model, await readSnapshot(api, project.model))
    expect(plan.totals.update).toBe(1)
    expect(plan.changes[0]).toMatchObject({ kind: 'update', modes: [], metadata: true })
    await applyPlan(api, project.model, plan)
    expect(palette?.scopes).toEqual([])
  })
})

describe('Project mode: changes made in Figma', () => {
  it('lists edits with the file, selector and CSS value', async () => {
    const { api, collections, variables } = createFakeApi()
    await sync(api, project.model)

    const modeCollection = collections.find(item => item.name === 'Mode')
    const dark = modeCollection?.modes.find(mode => mode.name === 'dark')?.modeId ?? ''
    const byName = (name: string) => [...variables.values()].find(item => item.name === name)
    byName('primary')?.setValueForMode(
      collections.find(item => item.name === 'Brand')?.modes[0].modeId ?? '',
      { type: 'VARIABLE_ALIAS', id: byName('brand/400')?.id ?? '' }
    )
    byName('border')?.setValueForMode(dark, {
      color: { type: 'VARIABLE_ALIAS', id: byName('surface/dark/7')?.id ?? '' },
      opacity: 50,
    })
    byName('radius/lg')?.setValueForMode(
      collections.find(item => item.name === 'Radius')?.modes[0].modeId ?? '',
      12
    )

    const changes = planChangeList(project, await readSnapshot(api, project.model))
    expect(changes.map(change => [change.token, change.mode])).toEqual([
      ['--primary', 'b1'],
      ['--radius-lg', 'default'],
      ['--border', 'dark'],
    ])
    const text = formatChangeList(changes)
    expect(text).toContain(
      '- `semantic.css`, `:root, [data-brand]`: set `--primary` to `var(--brand-400)` (now `var(--brand-600)`).'
    )
    expect(text).toContain(
      '- `semantic.css`, `.dark`: set `--border` to `color-mix(in srgb, var(--surface-dark-7) 50%, transparent)` (now `var(--surface-dark-6)`).'
    )
    expect(text).toContain(
      'set `--radius-lg` to `12px` (now `10px`). The code has `calc(var(--corner-radius) * var(--radius-multiplier))`.'
    )
  })

  it('lists nothing right after a sync', async () => {
    const { api } = createFakeApi()
    await sync(api, project.model)
    expect(planChangeList(project, await readSnapshot(api, project.model))).toEqual([])
  })
})

describe('Project mode: values', () => {
  it('evaluates lengths and calc()', () => {
    expect(evaluateNumber('12px')).toBe(12)
    expect(evaluateNumber('1.5rem')).toBe(24)
    expect(evaluateNumber('calc(10px * 0.8 * 1.5)')).toBeCloseTo(12)
    expect(evaluateNumber('calc((4px + 2px) / 2)')).toBe(3)
    expect(evaluateNumber('50%')).toBeNull()
  })

  it('parses literal colors', () => {
    expect(parseColor('#fff')).toEqual({ r: 1, g: 1, b: 1, a: 1 })
    expect(parseColor('rgb(0 0 0 / 0.5)')).toEqual({ r: 0, g: 0, b: 0, a: 0.5 })
    expect(parseColor('rgba(255, 0, 0, 1)')).toEqual({ r: 1, g: 0, b: 0, a: 1 })
    expect(parseColor('oklch(0.5 0.1 200)')).toBeNull()
  })
})
