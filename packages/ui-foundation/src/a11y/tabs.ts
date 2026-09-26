import type { A11yAttributeCheck, A11yPatternContract } from './types'

function selected(at: 'first' | 'last' | number): A11yAttributeCheck {
  return { target: { part: 'tab', at }, attribute: 'aria-selected', equals: 'true' }
}

/**
 * Tabs, in the horizontal orientation. The first tab is the selected one when
 * a story starts.
 *
 * Option `activation`: with `automatic`, a tab is selected when it receives
 * focus; with `manual`, the arrow keys only move focus and Enter or Space
 * selects the focused tab. The APG allows both and recommends automatic when
 * panels show without a noticeable delay.
 */
export const tabsPattern: A11yPatternContract = {
  id: 'tabs',
  name: 'Tabs',
  source: 'https://www.w3.org/WAI/ARIA/apg/patterns/tabs/',
  options: { activation: ['automatic', 'manual'] },
  parts: {
    tablist: {
      description: 'The container of the tabs, labelled by aria-labelledby or aria-label.',
      name: 'required',
      role: 'tablist',
    },
    tab: {
      description: 'The tabs, each the label of one panel.',
      multiple: true,
      name: 'required',
      role: 'tab',
      within: 'tablist',
    },
    panel: {
      description: 'The panel of the selected tab, labelled by that tab.',
      name: 'required',
      role: 'tabpanel',
    },
  },
  tree: [{ part: 'tablist', children: [{ part: 'tab', states: ['selected'] }] }, { part: 'panel' }],
  structure: [
    {
      id: 'tab-selection-state',
      requirement: 'required',
      rule: 'Every tab has aria-selected: true on the selected tab, false on the others.',
      target: { part: 'tab' },
      attribute: 'aria-selected',
      equals: ['true', 'false'],
    },
    {
      id: 'tab-controls-panel',
      requirement: 'required',
      rule: 'Each tab has aria-controls referring to its panel.',
      target: { part: 'tab', at: 'selected' },
      attribute: 'aria-controls',
      references: 'panel',
    },
    {
      id: 'panel-labelled-by-tab',
      requirement: 'required',
      rule: 'Each panel has aria-labelledby referring to its tab.',
      target: { part: 'panel' },
      attribute: 'aria-labelledby',
      references: 'tab',
    },
  ],
  keyboard: [
    {
      id: 'tab-enters-at-selected',
      key: 'Tab',
      keys: '{Tab}',
      requirement: 'required',
      given: { focus: 'page-start' },
      result: 'When focus moves into the tab list, it lands on the selected tab.',
      then: { focus: { part: 'tab', at: 'selected' } },
    },
    {
      id: 'tab-leaves-to-panel',
      key: 'Tab',
      keys: '{Tab}',
      requirement: 'required',
      given: { focus: { part: 'tab', at: 'selected' } },
      result: 'From the tab list, Tab moves focus to the next element in the page: the panel.',
      then: { focus: { part: 'panel' } },
    },
    {
      id: 'right-arrow-next',
      key: 'Right Arrow',
      keys: '{ArrowRight}',
      requirement: 'required',
      given: { focus: { part: 'tab', at: 'first' }, attributes: [selected('first')] },
      result: 'Moves focus to the next tab.',
      then: { focus: { part: 'tab', at: 1 } },
    },
    {
      id: 'right-arrow-selects',
      key: 'Right Arrow',
      keys: '{ArrowRight}',
      requirement: 'required',
      when: { activation: 'automatic' },
      given: { focus: { part: 'tab', at: 'first' }, attributes: [selected('first')] },
      result: 'With automatic activation, the tab that receives focus is selected.',
      then: { focus: { part: 'tab', at: 1 }, attributes: [selected(1)] },
    },
    {
      id: 'right-arrow-keeps-selection',
      key: 'Right Arrow',
      keys: '{ArrowRight}',
      requirement: 'required',
      when: { activation: 'manual' },
      given: { focus: { part: 'tab', at: 'first' }, attributes: [selected('first')] },
      result: 'With manual activation, moving focus does not change the selected tab.',
      then: { focus: { part: 'tab', at: 1 }, attributes: [selected('first')] },
    },
    {
      id: 'right-arrow-wraps',
      key: 'Right Arrow',
      keys: '{ArrowRight}',
      requirement: 'required',
      given: { focus: { part: 'tab', at: 'last' } },
      result: 'On the last tab, moves focus to the first tab.',
      then: { focus: { part: 'tab', at: 'first' } },
    },
    {
      id: 'left-arrow-previous',
      key: 'Left Arrow',
      keys: '{ArrowLeft}',
      requirement: 'required',
      given: { focus: { part: 'tab', at: 1 } },
      result: 'Moves focus to the previous tab.',
      then: { focus: { part: 'tab', at: 'first' } },
    },
    {
      id: 'left-arrow-wraps',
      key: 'Left Arrow',
      keys: '{ArrowLeft}',
      requirement: 'required',
      given: { focus: { part: 'tab', at: 'first' } },
      result: 'On the first tab, moves focus to the last tab.',
      then: { focus: { part: 'tab', at: 'last' } },
    },
    {
      id: 'home-first',
      key: 'Home',
      keys: '{Home}',
      requirement: 'optional',
      given: { focus: { part: 'tab', at: 'last' } },
      result: 'Moves focus to the first tab.',
      then: { focus: { part: 'tab', at: 'first' } },
    },
    {
      id: 'end-last',
      key: 'End',
      keys: '{End}',
      requirement: 'optional',
      given: { focus: { part: 'tab', at: 'first' } },
      result: 'Moves focus to the last tab.',
      then: { focus: { part: 'tab', at: 'last' } },
    },
    {
      id: 'enter-selects',
      key: 'Enter',
      keys: '{Enter}',
      requirement: 'required',
      when: { activation: 'manual' },
      given: { focus: { part: 'tab', at: 1 }, attributes: [selected('first')] },
      result: 'Selects the focused tab and shows its panel.',
      then: { focus: { part: 'tab', at: 1 }, attributes: [selected(1)] },
    },
    {
      id: 'space-selects',
      key: 'Space',
      keys: '{ }',
      requirement: 'required',
      when: { activation: 'manual' },
      given: { focus: { part: 'tab', at: 1 }, attributes: [selected('first')] },
      result: 'Selects the focused tab and shows its panel.',
      then: { focus: { part: 'tab', at: 1 }, attributes: [selected(1)] },
    },
  ],
}
