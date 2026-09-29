import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { readTokenDirectory } from '../src/css-files'
import { buildProjectModel } from '../src/css-model'
import type { SyncModel } from '../src/plan'
import { deriveStyles, parseShadow } from '../src/styles'

const project = buildProjectModel(readTokenDirectory(resolve(__dirname, 'fixtures/project-tokens')))
const atom63 = JSON.parse(
  readFileSync(resolve(__dirname, '../../styles/generated/atom63.figma-sync.json'), 'utf8')
) as SyncModel

describe('parseShadow', () => {
  it('reads each layer of a box shadow', () => {
    expect(
      parseShadow('0px 1px 2px 0px rgb(0 0 0 / 0.05), 0px 2px 4px -2px rgb(0 0 0 / 0.08)')
    ).toEqual([
      { inset: false, x: 0, y: 1, blur: 2, spread: 0, color: { r: 0, g: 0, b: 0, a: 0.05 } },
      { inset: false, x: 0, y: 2, blur: 4, spread: -2, color: { r: 0, g: 0, b: 0, a: 0.08 } },
    ])
  })

  it('reads inset layers and missing blur or spread', () => {
    expect(parseShadow('inset 0 1px #000')).toEqual([
      { inset: true, x: 0, y: 1, blur: 0, spread: 0, color: { r: 0, g: 0, b: 0, a: 1 } },
    ])
  })

  it('refuses what an effect style cannot hold', () => {
    expect(parseShadow('none')).toBeNull()
    expect(parseShadow('0 0 0 1px color-mix(in oklch, black 8%, transparent)')).toBeNull()
  })
})

describe('deriveStyles', () => {
  it('pairs the project text steps into text styles bound to their variables', () => {
    const styles = deriveStyles(project.model, project.raw)
    const base = styles.text.find(style => style.name === 'Text/base')
    expect(base).toEqual({
      name: 'Text/base',
      description: 'var(--text-base-size) / var(--text-base-leading)',
      family: { value: 'Geist' },
      fontSize: { alias: '--text-base-size' },
      lineHeight: { alias: '--text-base-leading' },
    })
    expect(styles.text.map(style => style.name)).toContain('Text/9xl')
  })

  it('turns the project shadows into effect styles', () => {
    const styles = deriveStyles(project.model, project.raw)
    const md = styles.effects.find(style => style.name === 'Shadow/md')
    expect(md?.layers).toHaveLength(2)
    expect(md?.description).toBe('var(--shadow-md)')
  })

  it('derives Atom63 text styles bound to its font variable, and its shadow styles', () => {
    const styles = deriveStyles(atom63)
    expect(styles.text.find(style => style.name === 'Text/base')).toMatchObject({
      family: { alias: '--a63-font-app', fallback: 'Geist' },
      fontSize: { alias: '--typography-base-font-size' },
      lineHeight: { alias: '--typography-base-line-height' },
    })
    expect(styles.effects.map(style => style.name)).toContain('Shadow/2xl')
    expect(styles.skipped).toEqual([])
  })

  it('skips a text step whose line height the model does not have', () => {
    const model: SyncModel = {
      ...project.model,
      collections: project.model.collections.map(collection => ({
        ...collection,
        variables: collection.variables.filter(item => item.token !== '--text-xs-leading'),
      })),
    }
    const styles = deriveStyles(model, project.raw)
    expect(styles.text.map(style => style.name)).not.toContain('Text/xs')
    expect(styles.skipped).toContainEqual({
      name: 'Text/xs',
      reason: 'no line height token (--text-xs-leading)',
    })
  })

  it('skips a text step whose line height is unitless', () => {
    const model: SyncModel = {
      ...project.model,
      collections: project.model.collections.map(collection => ({
        ...collection,
        variables: collection.variables.map(variable =>
          variable.token === '--text-xs-leading'
            ? {
                ...variable,
                values: Object.fromEntries(collection.modes.map(mode => [mode, { value: 1.5 }])),
              }
            : variable
        ),
      })),
    }
    const styles = deriveStyles(model, project.raw)
    expect(styles.text.map(style => style.name)).not.toContain('Text/xs')
    expect(styles.skipped).toContainEqual({
      name: 'Text/xs',
      reason: 'unitless line height (--text-xs-leading); Figma needs pixels',
    })
  })

  it('says why a text step is missing when its size token was skipped', () => {
    const model: SyncModel = {
      ...project.model,
      collections: project.model.collections.map(collection => ({
        ...collection,
        variables: collection.variables.filter(item => item.token !== '--text-xs-size'),
      })),
      skipped: [...project.model.skipped, { token: '--text-xs-size', reason: 'not a number' }],
    }
    const styles = deriveStyles(model, project.raw)
    expect(styles.skipped).toContainEqual({
      name: 'Text/xs',
      reason: 'the size token --text-xs-size is not a Figma variable',
    })
  })
})
