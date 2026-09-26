/**
 * APG pattern contracts, played against the stories of the components that
 * bind to them. Every test is generated from the data in
 * @atom63/ui-foundation: one per accessibility tree root, one per structure
 * check and one per keyboard interaction, for each story listed below.
 *
 * A check the component lists in `accessibility.knownGaps` runs as an
 * expected failure: it passes while the gap is there and fails once the
 * component is fixed, so the gap must then be removed from the contract.
 */
import * as foundation from '@atom63/ui-foundation'
import {
  type A11yPatternBinding,
  accordionContract,
  alertDialogContract,
  checkboxContract,
  dialogContract,
  dropdownMenuContract,
  getA11yPattern,
  radioContract,
  selectContract,
  switchContract,
  tabsContract,
} from '@atom63/ui-foundation'
import { composeStories } from '@storybook/react-vite'
import type { ComponentType } from 'react'
import { describe, expect, it } from 'vitest'

import * as accordionStories from '../../../packages/ui-react/src/components/accordion/accordion.stories'
import * as alertDialogStories from '../../../packages/ui-react/src/components/alert-dialog/alert-dialog.stories'
import * as checkboxStories from '../../../packages/ui-react/src/components/checkbox/checkbox.stories'
import * as dialogStories from '../../../packages/ui-react/src/components/dialog/dialog.stories'
import * as dropdownMenuStories from '../../../packages/ui-react/src/components/dropdown-menu/dropdown-menu.stories'
import * as radioStories from '../../../packages/ui-react/src/components/radio/radio.stories'
import * as selectStories from '../../../packages/ui-react/src/components/select/select.stories'
import * as switchStories from '../../../packages/ui-react/src/components/switch/switch.stories'
import * as tabsStories from '../../../packages/ui-react/src/components/tabs/tabs.stories'
import {
  type ContractCase,
  interactionsFor,
  runKeyboardInteraction,
  runStructureCheck,
  runTreeCheck,
} from './contract'

type StoryModule = Parameters<typeof composeStories>[0]

interface Binding {
  /** The component contract export that declares the pattern. */
  contract: { accessibility: A11yPatternBinding }
  exportName: string
  /** The stories that exercise the pattern, with the names that pick their parts. */
  stories: { module: StoryModule; name: string; names?: Record<string, string> }[]
}

const bindings: Binding[] = [
  {
    exportName: 'dialogContract',
    contract: dialogContract,
    stories: [{ module: dialogStories, name: 'Playground', names: { trigger: 'Open dialog' } }],
  },
  {
    exportName: 'alertDialogContract',
    contract: alertDialogContract,
    stories: [
      { module: alertDialogStories, name: 'Playground', names: { trigger: 'Delete project' } },
    ],
  },
  {
    exportName: 'dropdownMenuContract',
    contract: dropdownMenuContract,
    stories: [{ module: dropdownMenuStories, name: 'Playground', names: { trigger: 'Open menu' } }],
  },
  {
    exportName: 'tabsContract',
    contract: tabsContract,
    stories: [{ module: tabsStories, name: 'Playground' }],
  },
  {
    exportName: 'selectContract',
    contract: selectContract,
    stories: [{ module: selectStories, name: 'Playground' }],
  },
  {
    exportName: 'switchContract',
    contract: switchContract,
    stories: [{ module: switchStories, name: 'Playground' }],
  },
  {
    exportName: 'checkboxContract',
    contract: checkboxContract,
    stories: [{ module: checkboxStories, name: 'Playground' }],
  },
  {
    exportName: 'accordionContract',
    contract: accordionContract,
    stories: [{ module: accordionStories, name: 'Playground' }],
  },
  {
    exportName: 'radioContract',
    contract: radioContract,
    stories: [{ module: radioStories, name: 'Playground' }],
  },
]

describe('pattern bindings', () => {
  it('covers every component contract that declares a pattern', () => {
    const declared = Object.entries(foundation)
      .filter(([name, value]) => name.endsWith('Contract') && hasBinding(value))
      .map(([name]) => name)
      .sort()
    expect(bindings.map(binding => binding.exportName).sort()).toEqual(declared)
  })

  for (const { exportName, contract } of bindings) {
    it(`${exportName} picks valid options and names real checks`, () => {
      const binding = contract.accessibility
      const pattern = getA11yPattern(binding.pattern)
      for (const [option, values] of Object.entries(pattern.options ?? {})) {
        expect(values, `${exportName}: option "${option}"`).toContain(binding.options?.[option])
      }
      const checks = [
        'tree',
        ...pattern.structure.map(check => check.id),
        ...pattern.keyboard.map(interaction => interaction.id),
      ]
      for (const gap of binding.knownGaps ?? []) {
        expect(checks, `${exportName}: known gap "${gap.check}"`).toContain(gap.check)
        expect(
          gap.reason.length,
          `${exportName}: known gap "${gap.check}" needs a reason`
        ).toBeGreaterThan(0)
      }
    })
  }
})

function hasBinding(value: unknown): value is { accessibility: A11yPatternBinding } {
  return typeof value === 'object' && value !== null && 'accessibility' in value
}

for (const { exportName, contract, stories } of bindings) {
  const binding = contract.accessibility
  const pattern = getA11yPattern(binding.pattern)
  const gaps = new Map((binding.knownGaps ?? []).map(gap => [gap.check, gap.reason]))
  /** A known gap runs as an expected failure, so fixing it forces the gap out of the contract. */
  const test = (check: string, title: string, fn: () => Promise<void>) => {
    const reason = gaps.get(check)
    if (reason) it.fails(`${title} (known gap: ${reason})`, fn)
    else it(title, fn)
  }

  describe(`${exportName} implements ${pattern.name}`, () => {
    for (const story of stories) {
      const composed = composeStories(story.module) as Record<string, ComponentType>
      const Story = composed[story.name]
      if (!Story) throw new Error(`${exportName}: no story named ${story.name}`)
      const testCase: ContractCase = { names: story.names, story: Story, storyName: story.name }

      describe(story.name, () => {
        pattern.tree.forEach(node => {
          test('tree', `accessibility tree under ${node.part}`, () =>
            runTreeCheck(pattern, testCase, node)
          )
        })
        for (const check of pattern.structure) {
          test(check.id, `${check.id}: ${check.rule}`, () =>
            runStructureCheck(pattern, testCase, check)
          )
        }
        for (const interaction of interactionsFor(pattern, binding)) {
          test(
            interaction.id,
            `${interaction.id}: ${interaction.key} — ${interaction.result}`,
            () => runKeyboardInteraction(pattern, testCase, interaction)
          )
        }
      })
    }
  })
}
