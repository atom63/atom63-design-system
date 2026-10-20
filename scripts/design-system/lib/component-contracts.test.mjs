import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, it } from 'node:test'
import { fileURLToPath } from 'node:url'

import {
  contractFields,
  intentProblems,
  listInfo,
  listValues,
  loadContractSources,
  loadCrossRendererOrder,
  resolveRef,
  resolvedComponent,
  sections,
} from './component-contracts.mjs'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..')

const source = (name, doc) => ({ id: `components/${name}`, folder: 'components', name, doc })

describe('component contract sources', () => {
  const button = source('button', {
    component: 'button',
    lists: { sizes: ['sm', 'md'], visualArchetypes: ['action'] },
    contract: { defaultSize: 'md', visualArchetypes: { $ref: '#/lists/visualArchetypes' } },
  })
  const copy = source('copy-button', {
    component: 'copy-button',
    lists: {
      sizePairs: [{ icon: 'icon-sm', label: 'sm' }],
      sizes: { flatten: 'sizePairs' },
      solid: { values: ['a'], typed: false },
      soft: { values: ['b'], typed: false },
      variants: { concat: ['solid', 'soft'] },
    },
    contract: {
      defaultIconSize: 'icon-sm',
      sizes: { $ref: '#/lists/sizes' },
      linkSizes: { $ref: './button.json#/lists/sizes' },
      gap: '1rem',
    },
    parts: {
      group: { lists: { slots: ['group'] }, contract: { slots: { $ref: '#/lists/slots' } } },
    },
  })
  const sources = new Map([button, copy].map(item => [item.id, item]))

  it('derives the TypeScript names from the component name', () => {
    const [main, group] = sections(copy)
    assert.equal(listInfo(main, 'sizes').exportName, 'copyButtonSizes')
    assert.equal(listInfo(main, 'sizes').typeName, 'CopyButtonSize')
    assert.equal(listInfo(main, 'sizePairs').typeName, null)
    assert.equal(listInfo(main, 'solid').typeName, null)
    assert.equal(listInfo(group, 'slots').exportName, 'copyButtonGroupSlots')
  })

  it('resolves concat and flatten lists', () => {
    const [main] = sections(copy)
    assert.deepEqual(listValues(listInfo(main, 'sizes')), ['icon-sm', 'sm'])
    assert.deepEqual(listValues(listInfo(main, 'variants')), ['a', 'b'])
  })

  it('resolves a $ref to another file', () => {
    const [main] = sections(copy)
    assert.equal(resolveRef(sources, main, './button.json#/lists/sizes').exportName, 'buttonSizes')
    assert.throws(() => resolveRef(sources, main, './missing.json#/lists/sizes'))
  })

  it('types a default by its list, or by the one referenced list holding the value', () => {
    const [main] = sections(button)
    assert.equal(contractFields(sources, main)[0].defaultOf.typeName, 'ButtonSize')
    const fields = contractFields(sources, sections(copy)[0])
    assert.equal(fields[0].defaultOf.typeName, 'CopyButtonSize')
    assert.equal(fields.at(-1).primitive, 'string')
  })

  it('rejects a default outside its list', () => {
    const bad = source('bad', {
      component: 'bad',
      lists: { sizes: ['sm'] },
      contract: { defaultSize: 'xl' },
    })
    assert.throws(() => contractFields(new Map([[bad.id, bad]]), sections(bad)[0]), /not one of/)
  })

  it('reads every shipped source, and every cross-renderer component has a contract', () => {
    const shipped = loadContractSources(root)
    assert.ok(shipped.size >= 69)
    for (const item of shipped.values()) {
      for (const section of sections(item)) contractFields(shipped, section)
    }
    for (const name of loadCrossRendererOrder(root)) {
      assert.ok(shipped.get(`components/${name}`)?.doc.crossRenderer, name)
    }
  })
})

describe('resolved components', () => {
  it('joins a default to its axis, or adds the axis with the list it defaults', () => {
    const button = {
      id: 'components/button',
      folder: 'components',
      name: 'button',
      doc: {
        component: 'button',
        maturity: 'stable',
        lists: { variants: ['a', 'b'], sizes: ['sm', 'md'], slots: ['root'] },
        contract: {
          defaultSize: 'md',
          defaultVariant: 'b',
          slots: { $ref: '#/lists/slots' },
          variants: { $ref: '#/lists/variants' },
        },
      },
    }
    const resolved = resolvedComponent(new Map([[button.id, button]]), button)
    assert.deepEqual(resolved.axes, [
      { name: 'variants', values: ['a', 'b'], default: 'b' },
      { name: 'sizes', values: ['sm', 'md'], default: 'md' },
    ])
    assert.deepEqual(resolved.slots, ['root'])
    assert.equal(resolved.source, 'packages/ui-foundation/contracts/components/button.json')
    assert.equal(resolved.maturity, 'stable')
  })
})

describe('intent layer', () => {
  const button = () => ({
    id: 'components/button',
    folder: 'components',
    name: 'button',
    doc: {
      component: 'button',
      maturity: 'stable',
      lists: { variants: ['default', 'link', 'glass'], states: ['rest', 'focusVisible'] },
      contract: { variants: { $ref: '#/lists/variants' } },
      intent: {
        axes: { tone: ['neutral'], emphasis: ['solid'] },
        platforms: {
          web: {
            props: {
              variant: {
                list: 'variants',
                map: { default: { tone: 'neutral', emphasis: 'solid' } },
                extensions: {
                  link: { description: 'A link.' },
                  glass: { description: 'Old.', deprecatedFor: 'link' },
                },
              },
            },
          },
        },
        stateAliases: { focusVisible: 'focus-visible' },
      },
    },
  })
  const problems = source => intentProblems(new Map([[source.id, source]]), source)

  it('accepts a prop whose every value is mapped or an extension once', () => {
    assert.deepEqual(problems(button()), [])
  })

  it('reports a value that is neither mapped nor an extension, or both', () => {
    const missing = button()
    delete missing.doc.intent.platforms.web.props.variant.extensions.link
    assert.match(problems(missing)[0], /"link" is neither mapped nor an extension/)
    const both = button()
    both.doc.intent.platforms.web.props.variant.map.link = { tone: 'neutral' }
    assert.match(problems(both)[0], /"link" is both mapped and an extension/)
  })

  it('reports an unknown axis value, deprecation target or state alias', () => {
    const source = button()
    source.doc.intent.platforms.web.props.variant.map.default.emphasis = 'loud'
    source.doc.intent.platforms.web.props.variant.extensions.glass.deprecatedFor = 'shiny'
    source.doc.intent.stateAliases = { focus: 'focus-visible' }
    assert.equal(problems(source).length, 3)
  })

  it('has no problems in the shipped sources', () => {
    const shipped = loadContractSources(root)
    for (const item of shipped.values()) assert.deepEqual(intentProblems(shipped, item), [])
  })
})

/*
 * The hit target a control gets is the larger of its rendered height and the
 * platform's interaction floor (the tokens keep the two apart on purpose, so a
 * 28px web button or a 48pt iOS one is not raised or capped). Checks that it
 * meets the platform minimum at every size and density (WCAG 2.5.8 on web with
 * a pointer, 44 with touch and on iOS per the Apple HIG), and that the floors
 * in the data match the tokens.
 */
describe('hit targets', () => {
  const computed = JSON.parse(
    readFileSync(path.join(root, 'packages/styles/generated/atom63.computed-values.json'), 'utf8')
  ).tokens
  const manifest = JSON.parse(
    readFileSync(path.join(root, 'packages/styles/generated/atom63.tokens.json'), 'utf8')
  )
  const swift = readFileSync(
    path.join(root, 'packages/ui-ios/Sources/Atom63UI/Generated/Atom63Tokens.generated.swift'),
    'utf8'
  )
  const minimum = { web: { pointer: 24, touch: 44 }, ios: { touch: 44 } }
  const floors = value => (typeof value === 'number' ? { touch: value } : value)

  it('meets the platform minimum at every size, density and input', () => {
    let checked = 0
    for (const item of loadContractSources(root).values()) {
      for (const [size, { platforms }] of Object.entries(item.doc.intent?.sizes ?? {})) {
        for (const [platform, { visualHeight }] of Object.entries(platforms)) {
          const heights = Object.entries(computed[visualHeight]?.values ?? {})
            .filter(([context]) => context.includes(`design-language=${platform}`))
            .map(([, value]) => value)
          assert.ok(
            heights.length > 0,
            `${item.name} ${size} ${platform}: ${visualHeight} has no values`
          )
          const floor = floors(item.doc.intent.platforms[platform].minHitTarget)
          for (const [input, required] of Object.entries(minimum[platform])) {
            for (const height of heights) {
              const target = Math.max(height, floor[input])
              assert.ok(
                target >= required,
                `${item.name} ${size} ${platform} ${input}: ${target} < ${required}`
              )
              checked++
            }
          }
        }
      }
    }
    assert.ok(checked > 0)
  })

  it('takes its floors from the tokens', () => {
    const px = value => parseFloat(value) * 16
    const webFloors = manifest.entries
      .filter(entry => entry.cssVar === '--a63-control-min-target')
      .map(entry => px(entry.value))
    const iosFloor = Number(/minTouchTarget: Double = (\d+)/.exec(swift)[1])
    for (const item of loadContractSources(root).values()) {
      const platforms = item.doc.intent?.platforms ?? {}
      if (platforms.web?.minHitTarget) {
        assert.deepEqual(
          [platforms.web.minHitTarget.pointer, platforms.web.minHitTarget.touch],
          [Math.min(...webFloors), Math.max(...webFloors)],
          item.name
        )
      }
      if (platforms.ios?.minHitTarget) assert.equal(platforms.ios.minHitTarget, iosFloor, item.name)
    }
  })
})
