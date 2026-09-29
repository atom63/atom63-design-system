import { resolve } from 'node:path'

import { applyPlan, readSnapshot } from '../src/apply'
import { readTokenDirectory } from '../src/css-files'
import { buildProjectModel } from '../src/css-model'
import { planSync, type SyncModel } from '../src/plan'
import { applyStyles, planStyles } from '../src/style-sync'
import { deriveStyles } from '../src/styles'
import { createFakeFigma } from './fake-figma'

const project = buildProjectModel(readTokenDirectory(resolve(__dirname, 'fixtures/project-tokens')))
const styles = deriveStyles(project.model, project.raw)

async function withVariables(fonts?: string[], model: SyncModel = project.model) {
  const fake = createFakeFigma({ fonts })
  await applyPlan(fake.api, model, planSync(model, await readSnapshot(fake.api, model)))
  return fake
}

/** A model with one text step and a font variable over two family values. */
function fontModel(sans: string, pixel: string): SyncModel {
  return {
    schemaVersion: 1,
    summary: { collections: 2, variables: 5, aliasValues: 1, skipped: 0 },
    skipped: [],
    collections: [
      {
        name: 'Base',
        modes: ['Value'],
        variables: [
          {
            name: 'sans',
            token: '--font-family-sans',
            type: 'STRING',
            values: { Value: { value: sans } },
          },
          {
            name: 'pixel',
            token: '--font-family-pixel',
            type: 'STRING',
            values: { Value: { value: pixel } },
          },
          {
            name: 'size',
            token: '--typography-base-font-size',
            type: 'FLOAT',
            values: { Value: { value: 15 } },
          },
          {
            name: 'leading',
            token: '--typography-base-line-height',
            type: 'FLOAT',
            values: { Value: { value: 23 } },
          },
        ],
      },
      {
        name: 'Font',
        modes: ['sans', 'pixel'],
        variables: [
          {
            name: 'app',
            token: '--a63-font-app',
            type: 'STRING',
            values: {
              sans: { alias: '--font-family-sans' },
              pixel: { alias: '--font-family-pixel' },
            },
          },
        ],
      },
    ],
  }
}

describe('style sync', () => {
  it('creates text styles bound to their variables, and effect styles', async () => {
    const fake = await withVariables()
    const plan = await planStyles(fake.figma, styles)
    expect(plan.create.length).toBe(styles.text.length + styles.effects.length)
    const result = await applyStyles(fake.figma, styles, plan)
    expect(result.fontFallbacks).toEqual([])
    const base = fake.textStyles.find(style => style.name === 'Text/base')
    expect(base?.fontName).toEqual({ family: 'Geist', style: 'Regular' })
    const size = [...fake.variables.values()].find(
      item => item.codeSyntax?.WEB === 'var(--text-base-size)'
    )
    expect(base?.boundVariables.fontSize).toEqual({ type: 'VARIABLE_ALIAS', id: size?.id })
    expect(base?.description).toBe('var(--text-base-size) / var(--text-base-leading)')
    const md = fake.effectStyles.find(style => style.name === 'Shadow/md')
    expect(md?.effects).toHaveLength(2)
  })

  it('plans nothing on a second run, with values read back as 32-bit floats', async () => {
    const fake = await withVariables()
    await applyStyles(fake.figma, styles, await planStyles(fake.figma, styles))
    for (const style of fake.effectStyles)
      style.effects = (
        style.effects as {
          color: Record<string, number>
          offset: Record<string, number>
          radius: number
          spread: number
        }[]
      ).map(effect => ({
        ...effect,
        color: Object.fromEntries(
          Object.entries(effect.color).map(([key, value]) => [key, Math.fround(value)])
        ),
        radius: Math.fround(effect.radius),
        spread: Math.fround(effect.spread),
      }))
    const again = await planStyles(fake.figma, styles)
    expect(again).toMatchObject({ create: [], update: [] })
  })

  it('falls back to Inter when the family cannot load, and says so', async () => {
    const fake = await withVariables(['Inter'])
    const result = await applyStyles(fake.figma, styles, await planStyles(fake.figma, styles))
    expect(fake.textStyles.find(style => style.name === 'Text/base')?.fontName.family).toBe('Inter')
    expect(result.fontFallbacks).toContainEqual({
      style: 'Text/base',
      wanted: 'Geist',
      used: 'Inter',
    })
  })

  it('leaves a style made in Figma alone', async () => {
    const fake = await withVariables()
    const mine = fake.figma.createEffectStyle()
    mine.name = 'Brand glow'
    await applyStyles(fake.figma, styles, await planStyles(fake.figma, styles))
    expect(fake.effectStyles.find(style => style.name === 'Brand glow')?.effects).toEqual([])
  })

  it('updates a style whose shadow changed in code', async () => {
    const fake = await withVariables()
    await applyStyles(fake.figma, styles, await planStyles(fake.figma, styles))
    const changed = {
      ...styles,
      effects: styles.effects.map(style =>
        style.name === 'Shadow/md' ? { ...style, layers: style.layers.slice(0, 1) } : style
      ),
    }
    expect((await planStyles(fake.figma, changed)).update).toEqual(['Shadow/md'])
  })

  it('does not bind a font variable with a mode Figma cannot load', async () => {
    const model = fontModel("'Geist', sans-serif", "'Doto', monospace")
    const fake = await withVariables(['Inter', 'Geist'], model)
    const derived = deriveStyles(model)
    const result = await applyStyles(fake.figma, derived, await planStyles(fake.figma, derived))
    const base = fake.textStyles.find(style => style.name === 'Text/base')
    expect(base?.boundVariables.fontFamily).toBeUndefined()
    expect(base?.fontName.family).toBe('Geist')
    expect(result.fontFallbacks).toContainEqual({
      style: 'Text/base',
      wanted: '--a63-font-app',
      used: 'Geist',
    })
  })

  it('does not bind a font variable whose values are CSS font stacks', async () => {
    // Figma reads a variable's whole string as one family name.
    const model = fontModel("'Geist', sans-serif", "'Inter', sans-serif")
    const fake = await withVariables(['Inter', 'Geist'], model)
    const derived = deriveStyles(model)
    const result = await applyStyles(fake.figma, derived, await planStyles(fake.figma, derived))
    const base = fake.textStyles.find(style => style.name === 'Text/base')
    expect(base?.boundVariables.fontFamily).toBeUndefined()
    expect(base?.fontName.family).toBe('Geist')
    expect(result.fontFallbacks).toContainEqual({
      style: 'Text/base',
      wanted: '--a63-font-app',
      used: 'Geist',
    })
  })

  it('binds a font variable whose every mode is a family Figma loads', async () => {
    const model = fontModel('Geist', 'Inter')
    const fake = await withVariables(['Inter', 'Geist'], model)
    const derived = deriveStyles(model)
    const result = await applyStyles(fake.figma, derived, await planStyles(fake.figma, derived))
    const base = fake.textStyles.find(style => style.name === 'Text/base')
    expect(base?.boundVariables.fontFamily).toBeDefined()
    expect(result.fontFallbacks).toEqual([])
  })

  it('repairs a style that fell back to Inter once its font loads', async () => {
    const fonts = ['Inter']
    const fake = await withVariables(fonts)
    await applyStyles(fake.figma, styles, await planStyles(fake.figma, styles))
    fonts.push('Geist')
    expect((await planStyles(fake.figma, styles)).update).toContain('Text/base')
  })

  it('plans an update when a bound font family was unbound in Figma', async () => {
    const model = fontModel('Geist', 'Inter')
    const fake = await withVariables(['Inter', 'Geist'], model)
    const derived = deriveStyles(model)
    await applyStyles(fake.figma, derived, await planStyles(fake.figma, derived))
    fake.textStyles.find(style => style.name === 'Text/base')?.setBoundVariable('fontFamily', null)
    expect((await planStyles(fake.figma, derived)).update).toEqual(['Text/base'])
  })

  it('plans an update when the literal family of a font-variable style changed', async () => {
    const model = fontModel("'Geist', sans-serif", "'Inter', sans-serif")
    const fake = await withVariables(['Inter', 'Geist'], model)
    const derived = deriveStyles(model)
    await applyStyles(fake.figma, derived, await planStyles(fake.figma, derived))
    const base = fake.textStyles.find(style => style.name === 'Text/base')
    if (base) base.fontName = { family: 'Roboto', style: 'Bold' }
    expect((await planStyles(fake.figma, derived)).update).toEqual(['Text/base'])
  })

  it('skips a text style whose size variable is not a number', async () => {
    const model: SyncModel = {
      ...project.model,
      collections: project.model.collections.map(collection => ({
        ...collection,
        variables: collection.variables.map(variable =>
          variable.token === '--text-base-size'
            ? {
                ...variable,
                type: 'STRING' as const,
                values: Object.fromEntries(
                  collection.modes.map(mode => [mode, { value: 'large' }])
                ),
              }
            : variable
        ),
      })),
    }
    const fake = await withVariables(undefined, model)
    const plan = await planStyles(fake.figma, styles)
    expect(plan.create).not.toContain('Text/base')
    expect(plan.skipped).toContainEqual({
      name: 'Text/base',
      reason: 'variable --text-base-size is not a number',
    })
  })
})
