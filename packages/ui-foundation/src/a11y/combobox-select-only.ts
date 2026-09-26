import type { A11yAttributeCheck, A11yPatternContract } from './types'

const EXPANDED = {
  target: { part: 'combobox' },
  attribute: 'aria-expanded',
  equals: 'true',
} as const
const COLLAPSED = { ...EXPANDED, equals: 'false' } as const

function selected(at: 'first' | number): A11yAttributeCheck {
  return { target: { part: 'option', at }, attribute: 'aria-selected', equals: 'true' }
}

/**
 * Select-Only Combobox: a combobox that is not editable and opens a listbox of
 * options, the APG's accessible replacement for an HTML select. The keys and
 * attributes come from the Combobox pattern and its select-only example. The
 * listbox has at least three options, and the first one is selected when a
 * story starts.
 *
 * "Focus" on an option is the APG's visual focus: DOM focus on the option, or
 * DOM focus on the combobox with aria-activedescendant referring to the
 * option. The APG uses aria-activedescendant, which `combobox-active-descendant`
 * checks.
 *
 * Down Arrow and Up Arrow stop at the ends of the list: the select-only
 * example does not wrap, and the Combobox pattern lets the last option either
 * do nothing or return focus to the combobox. Home and End on the closed
 * combobox come from the example alone, so they are optional here. Not
 * covered: printable characters (type-ahead), and Page Up and Page Down.
 */
export const comboboxSelectOnlyPattern: A11yPatternContract = {
  id: 'combobox-select-only',
  name: 'Select-Only Combobox',
  source: 'https://www.w3.org/WAI/ARIA/apg/patterns/combobox/examples/combobox-select-only/',
  parts: {
    combobox: {
      description:
        'The element that shows the value and opens the listbox, labelled by a label, aria-labelledby or aria-label.',
      name: 'required',
      role: 'combobox',
    },
    listbox: {
      description: 'The popup that lists the options.',
      name: 'none',
      role: 'listbox',
      whileOpen: true,
    },
    option: {
      description: 'The options of the listbox, each named by its text.',
      multiple: true,
      name: 'required',
      role: 'option',
      whileOpen: true,
      within: 'listbox',
    },
  },
  popup: 'listbox',
  opener: { part: 'combobox', keys: '{Enter}' },
  tree: [
    { part: 'combobox', states: ['expanded'] },
    { part: 'listbox', children: [{ part: 'option', states: ['selected'] }] },
  ],
  structure: [
    {
      id: 'combobox-expanded',
      requirement: 'required',
      rule: 'While the listbox is displayed, the combobox has aria-expanded set to true.',
      ...EXPANDED,
    },
    {
      id: 'combobox-controls-listbox',
      requirement: 'required',
      rule: 'The combobox has aria-controls referring to the listbox.',
      target: { part: 'combobox' },
      attribute: 'aria-controls',
      references: 'listbox',
    },
    {
      id: 'combobox-has-popup',
      requirement: 'optional',
      rule: 'The combobox may set aria-haspopup to listbox, its implicit value.',
      target: { part: 'combobox' },
      attribute: 'aria-haspopup',
      equals: 'listbox',
    },
    {
      id: 'combobox-active-descendant',
      requirement: 'required',
      rule: 'While an option has visual focus, DOM focus stays on the combobox and its aria-activedescendant refers to that option.',
      target: { part: 'combobox' },
      attribute: 'aria-activedescendant',
      references: 'option',
    },
    {
      id: 'option-selected',
      requirement: 'required',
      rule: 'The selected option has aria-selected set to true.',
      target: { part: 'option', at: 'selected' },
      attribute: 'aria-selected',
      equals: 'true',
    },
  ],
  keyboard: [
    {
      id: 'enter-opens',
      key: 'Enter',
      keys: '{Enter}',
      requirement: 'required',
      given: { open: false, focus: { part: 'combobox' } },
      result:
        'Opens the listbox without changing the selection; visual focus is on the selected option.',
      then: {
        open: true,
        focus: { part: 'option', at: 'selected' },
        attributes: [EXPANDED, selected('first')],
      },
    },
    {
      id: 'space-opens',
      key: 'Space',
      keys: '{ }',
      requirement: 'required',
      given: { open: false, focus: { part: 'combobox' } },
      result:
        'Opens the listbox without changing the selection; visual focus is on the selected option.',
      then: {
        open: true,
        focus: { part: 'option', at: 'selected' },
        attributes: [EXPANDED, selected('first')],
      },
    },
    {
      id: 'down-arrow-opens',
      key: 'Down Arrow',
      keys: '{ArrowDown}',
      requirement: 'required',
      given: { open: false, focus: { part: 'combobox' } },
      result:
        'Opens the listbox without changing the selection; visual focus is on the selected option.',
      then: {
        open: true,
        focus: { part: 'option', at: 'selected' },
        attributes: [EXPANDED, selected('first')],
      },
    },
    {
      id: 'alt-down-arrow-opens',
      key: 'Alt + Down Arrow',
      keys: '{Alt>}{ArrowDown}{/Alt}',
      requirement: 'optional',
      given: { open: false, focus: { part: 'combobox' } },
      result: 'Opens the listbox without changing the selection.',
      then: { open: true, attributes: [EXPANDED, selected('first')] },
    },
    {
      id: 'up-arrow-opens',
      key: 'Up Arrow',
      keys: '{ArrowUp}',
      requirement: 'optional',
      given: { open: false, focus: { part: 'combobox' } },
      result: 'Opens the listbox and moves visual focus to the first option.',
      then: { open: true, focus: { part: 'option', at: 'first' } },
    },
    {
      id: 'home-opens-at-first',
      key: 'Home',
      keys: '{Home}',
      requirement: 'optional',
      given: { open: false, focus: { part: 'combobox' } },
      result: 'Opens the listbox and moves visual focus to the first option.',
      then: { open: true, focus: { part: 'option', at: 'first' } },
    },
    {
      id: 'end-opens-at-last',
      key: 'End',
      keys: '{End}',
      requirement: 'optional',
      given: { open: false, focus: { part: 'combobox' } },
      result: 'Opens the listbox and moves visual focus to the last option.',
      then: { open: true, focus: { part: 'option', at: 'last' } },
    },
    {
      id: 'down-arrow-next',
      key: 'Down Arrow',
      keys: '{ArrowDown}',
      requirement: 'required',
      given: { open: true, focus: { part: 'option', at: 'first' } },
      result: 'Moves visual focus to the next option.',
      then: { open: true, focus: { part: 'option', at: 1 } },
    },
    {
      id: 'down-arrow-stops',
      key: 'Down Arrow',
      keys: '{ArrowDown}',
      requirement: 'required',
      given: { open: true, focus: { part: 'option', at: 'last' } },
      result: 'On the last option, visual focus does not move.',
      then: { open: true, focus: { part: 'option', at: 'last' } },
    },
    {
      id: 'up-arrow-previous',
      key: 'Up Arrow',
      keys: '{ArrowUp}',
      requirement: 'required',
      given: { open: true, focus: { part: 'option', at: 1 } },
      result: 'Moves visual focus to the previous option.',
      then: { open: true, focus: { part: 'option', at: 'first' } },
    },
    {
      id: 'up-arrow-stops',
      key: 'Up Arrow',
      keys: '{ArrowUp}',
      requirement: 'required',
      given: { open: true, focus: { part: 'option', at: 'first' } },
      result: 'On the first option, visual focus does not move.',
      then: { open: true, focus: { part: 'option', at: 'first' } },
    },
    {
      id: 'home-first',
      key: 'Home',
      keys: '{Home}',
      requirement: 'optional',
      given: { open: true, focus: { part: 'option', at: 'last' } },
      result: 'Moves visual focus to the first option.',
      then: { open: true, focus: { part: 'option', at: 'first' } },
    },
    {
      id: 'end-last',
      key: 'End',
      keys: '{End}',
      requirement: 'optional',
      given: { open: true, focus: { part: 'option', at: 'first' } },
      result: 'Moves visual focus to the last option.',
      then: { open: true, focus: { part: 'option', at: 'last' } },
    },
    {
      id: 'enter-selects',
      key: 'Enter',
      keys: '{Enter}',
      requirement: 'required',
      given: { open: true, focus: { part: 'option', at: 1 } },
      result: 'Selects the focused option, closes the listbox and returns focus to the combobox.',
      then: { open: false, focus: { part: 'combobox' }, attributes: [COLLAPSED, selected(1)] },
    },
    {
      id: 'space-selects',
      key: 'Space',
      keys: '{ }',
      requirement: 'required',
      given: { open: true, focus: { part: 'option', at: 1 } },
      result: 'Selects the focused option, closes the listbox and returns focus to the combobox.',
      then: { open: false, focus: { part: 'combobox' }, attributes: [COLLAPSED, selected(1)] },
    },
    {
      id: 'alt-up-arrow-selects',
      key: 'Alt + Up Arrow',
      keys: '{Alt>}{ArrowUp}{/Alt}',
      requirement: 'optional',
      given: { open: true, focus: { part: 'option', at: 1 } },
      result: 'Selects the focused option, closes the listbox and returns focus to the combobox.',
      then: { open: false, focus: { part: 'combobox' }, attributes: [COLLAPSED, selected(1)] },
    },
    {
      id: 'tab-selects',
      key: 'Tab',
      keys: '{Tab}',
      requirement: 'required',
      given: { open: true, focus: { part: 'option', at: 1 } },
      result: 'Selects the focused option and closes the listbox.',
      then: { open: false, attributes: [COLLAPSED, selected(1)] },
    },
    {
      id: 'escape-closes',
      key: 'Escape',
      keys: '{Escape}',
      requirement: 'required',
      given: { open: true, focus: { part: 'option', at: 1 } },
      result:
        'Closes the listbox without changing the selection and returns focus to the combobox.',
      then: {
        open: false,
        focus: { part: 'combobox' },
        attributes: [COLLAPSED, selected('first')],
      },
    },
  ],
}
