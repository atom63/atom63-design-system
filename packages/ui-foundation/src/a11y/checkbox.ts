import type { A11yAttributeCheck, A11yPatternContract } from './types'

function checked(value: 'false' | 'true'): A11yAttributeCheck {
  return { target: { part: 'checkbox', at: 'first' }, attribute: 'aria-checked', equals: value }
}

/**
 * Checkbox, in its dual-state form. The checkbox is checked when a story
 * starts.
 *
 * A partially checked checkbox reports `aria-checked="mixed"`, so the state
 * check allows that value too. The keyboard map is the dual-state one: the
 * APG's tri-state example, where Space cycles through the mixed state, is a
 * parent checkbox that controls a group, not a single checkbox.
 */
export const checkboxPattern: A11yPatternContract = {
  id: 'checkbox',
  name: 'Checkbox',
  source: 'https://www.w3.org/WAI/ARIA/apg/patterns/checkbox/',
  parts: {
    checkbox: {
      description: 'The checkbox, labelled by its content, by aria-labelledby or by aria-label.',
      name: 'required',
      role: 'checkbox',
    },
  },
  tree: [{ part: 'checkbox', states: ['checked'] }],
  structure: [
    {
      id: 'checkbox-checked-state',
      requirement: 'required',
      rule: 'The checkbox has aria-checked set to true when checked, false when not checked and mixed when partially checked.',
      target: { part: 'checkbox' },
      attribute: 'aria-checked',
      equals: ['true', 'false', 'mixed'],
    },
  ],
  keyboard: [
    {
      id: 'space-toggles',
      key: 'Space',
      keys: '{ }',
      requirement: 'required',
      given: { focus: { part: 'checkbox', at: 'first' }, attributes: [checked('true')] },
      result: 'Changes the state of the checkbox.',
      then: { focus: { part: 'checkbox', at: 'first' }, attributes: [checked('false')] },
    },
  ],
}
