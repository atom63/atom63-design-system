import { modalDialogKeyboard } from './dialog'
import type { A11yPatternContract } from './types'

/**
 * Alert and Message Dialogs: a modal dialog that interrupts the user with an
 * important message and asks for a response. The APG gives it the keyboard map
 * of the modal dialog.
 */
export const alertDialogPattern: A11yPatternContract = {
  id: 'alertdialog',
  name: 'Alert and Message Dialogs',
  source: 'https://www.w3.org/WAI/ARIA/apg/patterns/alertdialog/',
  parts: {
    trigger: {
      description: 'The element that opens the alert dialog and gets focus back when it closes.',
      name: 'required',
      role: 'button',
    },
    dialog: {
      description: 'The alert dialog container; every element of the dialog is inside it.',
      name: 'required',
      role: 'alertdialog',
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
      rule: 'The alert dialog container has aria-modal set to true.',
      target: { part: 'dialog' },
      attribute: 'aria-modal',
      equals: 'true',
    },
    {
      id: 'dialog-describes-message',
      requirement: 'required',
      rule: 'aria-describedby refers to the element that holds the alert message.',
      target: { part: 'dialog' },
      attribute: 'aria-describedby',
      resolves: true,
    },
  ],
  keyboard: modalDialogKeyboard('dialog'),
}
