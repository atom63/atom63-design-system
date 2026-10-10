import assert from 'node:assert/strict'
import path from 'node:path'
import { describe, it } from 'node:test'
import { fileURLToPath } from 'node:url'

import {
  contractFields,
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
