import { readFileSync } from 'node:fs'

import { type AgentIndex, buildComponentModel, readComponentDoc } from '../src/components/doc'
import { buttonAnatomy } from '../src/components/button-anatomy'
import type { SyncModel } from '../src/plan'
import {
  buttonContract,
  buttonSizes,
} from '../../ui-foundation/src/components/button/button-contract'

const root = new URL('../../', import.meta.url)
const read = (path: string) => readFileSync(new URL(path, root), 'utf8')
const realIndex = JSON.parse(read('cli/generated/agent-index.json')) as AgentIndex
const checkedIn = read('figma/generated/atom63.figma-components.json')

/** What generate-components.mjs writes for an index. */
const generate = (index: AgentIndex) =>
  `${JSON.stringify(
    buildComponentModel({
      css: read('ui-react/src/components/button/button.css'),
      contract: { ...buttonContract, sizes: buttonSizes },
      anatomy: buttonAnatomy,
      sync: JSON.parse(read('styles/generated/atom63.figma-sync.json')) as SyncModel,
      sizes: ['xs', 'sm', 'md', 'lg', 'xl'],
      index,
      slug: 'button',
    }),
    null,
    2
  )}\n`

/** A deep copy of the index with the Button entry edited. */
const editButton = (edit: (entry: AgentIndex['components'][number]) => void) => {
  const index = structuredClone(realIndex)
  edit(index.components.find(entry => entry.slug === 'button')!)
  return index
}

const axes = {
  Variant: ['primary', 'ghost'],
  Size: ['sm'],
  State: ['rest', 'hover'],
}

describe('the component doc block', () => {
  it('is read from the agent index, guidance in axis order, related with labels', () => {
    const doc = readComponentDoc(realIndex, 'button', axes)
    expect(doc).toEqual({
      slug: 'button',
      label: 'Button',
      group: { id: 'actions', title: 'Actions' },
      summary: 'Button is the shared action primitive and defaults to safe non-submit behavior.',
      usage: expect.stringMatching(/^Use it for an in-place action/),
      related: [
        { slug: 'button-group', label: 'Button Group' },
        { slug: 'toggle', label: 'Toggle' },
        { slug: 'copy-button', label: 'Copy Button' },
      ],
      axisGuidance: {
        variant: {
          primary: 'The one primary action per view.',
          ghost: 'Lowest emphasis; toolbars and dismissals.',
        },
        size: { sm: 'Compact rows and toolbars.' },
        state: { rest: 'Resting appearance.', hover: 'Pointer over an enabled button.' },
      },
      docsPath: '/components/component-button',
    })
    expect(Object.keys(doc.axisGuidance.variant)).toEqual(axes.Variant)
  })

  it('fails when the index has no entry for the component', () => {
    expect(() => readComponentDoc(realIndex, 'buttonn', axes)).toThrow(
      'agent-index.json has no component "buttonn"; run pnpm --filter @atom63/cli generate:index'
    )
  })

  it('fails naming every modelled value with a missing or blank guidance line', () => {
    const index = editButton(entry => {
      delete entry.axisGuidance!.variant!.ghost
      entry.axisGuidance!.state!.hover = '  '
      delete entry.axisGuidance!.size
    })
    expect(() => readComponentDoc(index, 'button', axes)).toThrow(
      'agent-index.json component "button" is missing axisGuidance.variant.ghost, ' +
        'axisGuidance.size.sm, axisGuidance.state.hover; add them to the component catalog'
    )
  })

  it('fails when the component has no guidance at all, or a blank field', () => {
    const index = editButton(entry => {
      entry.axisGuidance = null
      entry.summary = ''
    })
    expect(() => readComponentDoc(index, 'button', axes)).toThrow(
      /missing summary, axisGuidance\.variant\.primary, .*axisGuidance\.state\.hover;/
    )
  })

  it('fails naming related when it is not a list', () => {
    const index = editButton(entry => {
      ;(entry as { related: unknown }).related = 'link'
    })
    expect(() => readComponentDoc(index, 'button', axes)).toThrow(
      /component "button" is missing related;/
    )
  })

  it('covers every value the real Button model renders', () => {
    const model = JSON.parse(checkedIn) as ReturnType<typeof buildComponentModel>
    const { doc } = model
    expect(Object.keys(doc!.axisGuidance.variant)).toEqual(model.axes.Variant)
    expect(Object.keys(doc!.axisGuidance.size)).toEqual(['xs', 'sm', 'md', 'lg', 'xl'])
    expect(Object.keys(doc!.axisGuidance.state)).toEqual(model.axes.State)
  })
})

describe('the drift guard across catalog → agent index → Figma model', () => {
  it('reproduces the checked-in model from the current index', () => {
    expect(generate(realIndex)).toBe(checkedIn)
  })

  it('goes stale when an index entry changes, so check:components fails', () => {
    const summary = editButton(entry => {
      entry.summary = 'Button, reworded in the catalog.'
    })
    const guidance = editButton(entry => {
      entry.axisGuidance!.variant!.primary = 'The single most important action.'
    })
    const related = editButton(entry => {
      entry.related = ['toggle']
    })
    for (const index of [summary, guidance, related]) expect(generate(index)).not.toBe(checkedIn)
  })
})
