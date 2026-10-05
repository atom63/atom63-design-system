import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { buildProjectModel } from '../src/css-model'
import { brandRamp, RAMP_STEPS } from '../src/ramp'
import { deriveStyles } from '../src/styles'
import { buildTemplateFiles, TEMPLATE_DEFAULTS, TEMPLATE_TOKENS } from '../src/template'

const text = (name: string, files = buildTemplateFiles(TEMPLATE_DEFAULTS)) =>
  files.find(file => file.name === name)?.text ?? ''

describe('the template copy', () => {
  it('matches template/tokens', () => {
    for (const file of TEMPLATE_TOKENS)
      expect(file.text).toBe(
        readFileSync(resolve(__dirname, '../template/tokens', file.name), 'utf8')
      )
  })
})

describe('buildTemplateFiles', () => {
  it('returns the template unchanged for the defaults', () => {
    expect(buildTemplateFiles(TEMPLATE_DEFAULTS)).toEqual(TEMPLATE_TOKENS)
  })

  it('replaces the b1 ramp with one generated from the brand color', () => {
    const files = buildTemplateFiles({ ...TEMPLATE_DEFAULTS, brand: '#e11d48' })
    const ramp = brandRamp('#e11d48')
    RAMP_STEPS.forEach((step, index) =>
      expect(text('palette.css', files)).toContain(`--color-b1-${step}: ${ramp[index]};`)
    )
    expect(text('palette.css', files)).toContain('--color-b2-500: rgba(247, 103, 13, 1);')
  })

  it('makes each chosen axis value the default mode', () => {
    const files = buildTemplateFiles({
      ...TEMPLATE_DEFAULTS,
      neutral: 'n3',
      radius: 'round',
      typeScale: 'large',
    })
    const { model } = buildProjectModel(files)
    const modes = (name: string) => model.collections.find(item => item.name === name)?.modes
    expect(modes('Surface')?.[0]).toBe('n3')
    expect(modes('Radius')?.[0]).toBe('round')
    expect(modes('Type scale')?.[0]).toBe('large')
    expect(modes('Surface')).toHaveLength(6)
  })

  it('keeps the values of every other axis value', () => {
    const files = buildTemplateFiles({
      ...TEMPLATE_DEFAULTS,
      neutral: 'n3',
      radius: 'round',
      typeScale: 'large',
    })
    const { model } = buildProjectModel(files)
    const value = (collection: string, token: string, mode: string) =>
      model.collections
        .find(item => item.name === collection)
        ?.variables.find(item => item.token === token)?.values[mode]
    expect(value('Surface', '--surface-light-1', 'n1')).toEqual({ alias: '--color-n1-light-1' })
    expect(value('Surface', '--surface-light-1', 'n3')).toEqual({ alias: '--color-n3-light-1' })
    expect(value('Radius', '--radius-multiplier', 'default')).toEqual({ value: 1 })
    expect(value('Radius', '--radius-multiplier', 'round')).toEqual({ value: 1.5 })
    expect(value('Type scale', '--type-scale', 'normal')).toEqual({ value: 1 })
    expect(value('Type scale', '--type-scale', 'large')).toEqual({ value: 1.2 })
  })

  it('sets the first family of the sans stack', () => {
    const files = buildTemplateFiles({ ...TEMPLATE_DEFAULTS, font: 'Inter' })
    const { model, raw } = buildProjectModel(files)
    expect(deriveStyles(model, raw).text[0].family).toEqual({ value: 'Inter' })
  })

  it.each(['', 'Geist"; } :root {', 'a;b'])('refuses the font %j', font => {
    expect(() => buildTemplateFiles({ ...TEMPLATE_DEFAULTS, font })).toThrow(
      `"${font}" is not a font family name`
    )
  })

  it('refuses a brand that is not a hex color', () => {
    expect(() => buildTemplateFiles({ ...TEMPLATE_DEFAULTS, brand: 'blue' })).toThrow(
      '"blue" is not a hex color'
    )
  })
})
