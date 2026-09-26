import type { A11yKeyboardInteraction, A11yPatternContract } from './types'

/**
 * The keyboard map of a modal dialog, for a dialog part with the given id.
 * The alert dialog pattern reuses it: the APG gives both the same keys.
 */
export function modalDialogKeyboard(dialog: string): readonly A11yKeyboardInteraction[] {
  return [
    {
      id: 'open-moves-focus-inside',
      key: 'Enter',
      keys: '{Enter}',
      requirement: 'required',
      given: { open: false, focus: { part: 'trigger' } },
      result: 'Activating the trigger opens the dialog and moves focus to an element inside it.',
      then: { open: true, focus: { inside: dialog } },
    },
    {
      id: 'tab-wraps',
      key: 'Tab',
      keys: '{Tab}',
      requirement: 'required',
      given: { open: true, focus: { part: dialog, tabbable: 'last' } },
      result: 'Tab on the last tabbable element moves focus to the first one: focus stays inside.',
      then: { open: true, focus: { part: dialog, tabbable: 'first' } },
    },
    {
      id: 'shift-tab-wraps',
      key: 'Shift + Tab',
      keys: '{Shift>}{Tab}{/Shift}',
      requirement: 'required',
      given: { open: true, focus: { part: dialog, tabbable: 'first' } },
      result: 'Shift + Tab on the first tabbable element moves focus to the last one.',
      then: { open: true, focus: { part: dialog, tabbable: 'last' } },
    },
    {
      id: 'escape-closes',
      key: 'Escape',
      keys: '{Escape}',
      requirement: 'required',
      given: { open: true, focus: { inside: dialog } },
      result: 'Escape closes the dialog and returns focus to the element that opened it.',
      then: { open: false, focus: { part: 'trigger' } },
    },
  ]
}

/** Dialog (Modal): a window over the page that the user must dismiss to return to it. */
export const dialogModalPattern: A11yPatternContract = {
  id: 'dialog-modal',
  name: 'Dialog (Modal)',
  source: 'https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/',
  parts: {
    trigger: {
      description: 'The element that opens the dialog and gets focus back when it closes.',
      name: 'required',
      role: 'button',
    },
    dialog: {
      description: 'The dialog container; every element of the dialog is inside it.',
      name: 'required',
      role: 'dialog',
      whileOpen: true,
    },
  },
  popup: 'dialog',
  opener: { part: 'trigger', keys: '{Enter}' },
  tree: [{ part: 'dialog' }],
  structure: [
    {
      id: 'dialog-is-modal',
      requirement: 'required',
      rule: 'The dialog container has aria-modal set to true.',
      target: { part: 'dialog' },
      attribute: 'aria-modal',
      equals: 'true',
    },
  ],
  keyboard: modalDialogKeyboard('dialog'),
}
