import type { A11yAttributeCheck, A11yPatternContract } from './types'

function checked(value: 'false' | 'true'): A11yAttributeCheck {
  return { target: { part: 'switch', at: 'first' }, attribute: 'aria-checked', equals: value }
}

/**
 * Switch: an on/off control. The switch is on when a story starts.
 *
 * The APG also allows an HTML checkbox input with the `checked` attribute in
 * place of `aria-checked`; this contract expects the ARIA state, which is what
 * a custom switch element carries.
 */
export const switchPattern: A11yPatternContract = {
  id: 'switch',
  name: 'Switch',
  source: 'https://www.w3.org/WAI/ARIA/apg/patterns/switch/',
  parts: {
    switch: {
      description: 'The switch, labelled by its content, by aria-labelledby or by aria-label.',
      name: 'required',
      role: 'switch',
    },
  },
  tree: [{ part: 'switch', states: ['checked'] }],
  structure: [
    {
      id: 'switch-checked-state',
      requirement: 'required',
      rule: 'The switch has aria-checked set to true when on and to false when off.',
      target: { part: 'switch' },
      attribute: 'aria-checked',
      equals: ['true', 'false'],
    },
  ],
  keyboard: [
    {
      id: 'space-toggles',
      key: 'Space',
      keys: '{ }',
      requirement: 'required',
      given: { focus: { part: 'switch', at: 'first' }, attributes: [checked('true')] },
      result: 'Changes the state of the switch.',
      then: { focus: { part: 'switch', at: 'first' }, attributes: [checked('false')] },
    },
    {
      id: 'enter-toggles',
      key: 'Enter',
      keys: '{Enter}',
      requirement: 'optional',
      given: { focus: { part: 'switch', at: 'first' }, attributes: [checked('true')] },
      result: 'Changes the state of the switch.',
      then: { focus: { part: 'switch', at: 'first' }, attributes: [checked('false')] },
    },
  ],
}
