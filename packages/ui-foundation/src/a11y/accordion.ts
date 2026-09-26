import type { A11yAttributeCheck, A11yPatternContract } from './types'

function expanded(at: 'first' | number, value: 'false' | 'true'): A11yAttributeCheck {
  return { target: { part: 'header', at }, attribute: 'aria-expanded', equals: value }
}

/**
 * Accordion: a stack of headers that each show or hide a panel. The accordion
 * has at least three sections, and only the first one is expanded when a story
 * starts.
 *
 * Option `expand`: with `single`, expanding a panel collapses the one that was
 * open; with `multiple`, several panels can be open at once.
 *
 * Option `collapse`: with `collapsible`, Enter or Space on the header of an
 * expanded panel collapses it; with `keep-one`, one panel stays expanded and
 * its header reports aria-disabled. The APG allows both.
 *
 * The APG page no longer lists arrow keys between headers; an implementation
 * may add them, and this contract does not check them.
 */
export const accordionPattern: A11yPatternContract = {
  id: 'accordion',
  name: 'Accordion',
  source: 'https://www.w3.org/WAI/ARIA/apg/patterns/accordion/',
  options: { collapse: ['collapsible', 'keep-one'], expand: ['single', 'multiple'] },
  parts: {
    heading: {
      description: 'The heading, with an aria-level, that wraps each header button.',
      multiple: true,
      name: 'required',
      role: 'heading',
    },
    header: {
      description: 'The header buttons, each titled by the section name.',
      multiple: true,
      name: 'required',
      role: 'button',
    },
    panel: {
      description: 'The expanded panel, a region labelled by its header button.',
      name: 'required',
      role: 'region',
    },
  },
  tree: [
    { part: 'heading', children: [{ part: 'header', states: ['expanded'] }] },
    { part: 'panel' },
  ],
  structure: [
    {
      id: 'header-expanded-state',
      requirement: 'required',
      rule: 'Every header button has aria-expanded: true when its panel is visible, false when it is hidden.',
      target: { part: 'header' },
      attribute: 'aria-expanded',
      equals: ['true', 'false'],
    },
    {
      id: 'header-controls-panel',
      requirement: 'required',
      rule: 'Every header button has aria-controls referring to the element that holds its panel.',
      target: { part: 'header' },
      attribute: 'aria-controls',
    },
    {
      id: 'expanded-header-controls-panel',
      requirement: 'required',
      rule: 'The header button of the expanded panel has aria-controls referring to that panel.',
      target: { part: 'header', at: 'first' },
      attribute: 'aria-controls',
      references: 'panel',
    },
    {
      id: 'panel-labelled-by-header',
      requirement: 'optional',
      rule: 'A panel with the region role has aria-labelledby referring to its header button.',
      target: { part: 'panel' },
      attribute: 'aria-labelledby',
      references: 'header',
    },
  ],
  keyboard: [
    {
      id: 'enter-expands',
      key: 'Enter',
      keys: '{Enter}',
      requirement: 'required',
      given: { focus: { part: 'header', at: 1 }, attributes: [expanded(1, 'false')] },
      result: 'On the header of a collapsed panel, expands the panel.',
      then: { focus: { part: 'header', at: 1 }, attributes: [expanded(1, 'true')] },
    },
    {
      id: 'space-expands',
      key: 'Space',
      keys: '{ }',
      requirement: 'required',
      given: { focus: { part: 'header', at: 1 }, attributes: [expanded(1, 'false')] },
      result: 'On the header of a collapsed panel, expands the panel.',
      then: { focus: { part: 'header', at: 1 }, attributes: [expanded(1, 'true')] },
    },
    {
      id: 'enter-collapses-other',
      key: 'Enter',
      keys: '{Enter}',
      requirement: 'required',
      when: { expand: 'single' },
      given: { focus: { part: 'header', at: 1 }, attributes: [expanded('first', 'true')] },
      result:
        'When only one panel can be expanded, expanding a panel collapses the one that was open.',
      then: { attributes: [expanded(1, 'true'), expanded('first', 'false')] },
    },
    {
      id: 'enter-keeps-other',
      key: 'Enter',
      keys: '{Enter}',
      requirement: 'required',
      when: { expand: 'multiple' },
      given: { focus: { part: 'header', at: 1 }, attributes: [expanded('first', 'true')] },
      result:
        'When several panels can be expanded, expanding a panel leaves the open one expanded.',
      then: { attributes: [expanded(1, 'true'), expanded('first', 'true')] },
    },
    {
      id: 'enter-collapses',
      key: 'Enter',
      keys: '{Enter}',
      requirement: 'required',
      when: { collapse: 'collapsible' },
      given: { focus: { part: 'header', at: 'first' }, attributes: [expanded('first', 'true')] },
      result: 'On the header of an expanded panel, collapses the panel.',
      then: { focus: { part: 'header', at: 'first' }, attributes: [expanded('first', 'false')] },
    },
    {
      id: 'space-collapses',
      key: 'Space',
      keys: '{ }',
      requirement: 'required',
      when: { collapse: 'collapsible' },
      given: { focus: { part: 'header', at: 'first' }, attributes: [expanded('first', 'true')] },
      result: 'On the header of an expanded panel, collapses the panel.',
      then: { focus: { part: 'header', at: 'first' }, attributes: [expanded('first', 'false')] },
    },
    {
      id: 'enter-keeps-open',
      key: 'Enter',
      keys: '{Enter}',
      requirement: 'required',
      when: { collapse: 'keep-one' },
      given: { focus: { part: 'header', at: 'first' }, attributes: [expanded('first', 'true')] },
      result: 'On the header of the one expanded panel, the panel stays expanded.',
      then: {
        focus: { part: 'header', at: 'first' },
        attributes: [
          expanded('first', 'true'),
          { target: { part: 'header', at: 'first' }, attribute: 'aria-disabled', equals: 'true' },
        ],
      },
    },
    {
      id: 'tab-next-header',
      key: 'Tab',
      keys: '{Tab}',
      requirement: 'required',
      given: { focus: { part: 'header', at: 1 }, attributes: [expanded(1, 'false')] },
      result: 'Moves focus to the next focusable element: past a collapsed panel, the next header.',
      then: { focus: { part: 'header', at: 2 } },
    },
    {
      id: 'shift-tab-previous-header',
      key: 'Shift + Tab',
      keys: '{Shift>}{Tab}{/Shift}',
      requirement: 'required',
      given: { focus: { part: 'header', at: 2 }, attributes: [expanded(1, 'false')] },
      result:
        'Moves focus to the previous focusable element: past a collapsed panel, the previous header.',
      then: { focus: { part: 'header', at: 1 } },
    },
  ],
}
