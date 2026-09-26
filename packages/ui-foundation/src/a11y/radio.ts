import type { A11yAttributeCheck, A11yKeyboardInteraction, A11yPatternContract } from './types'

function checked(at: 'first' | 'last' | number): A11yAttributeCheck {
  return { target: { part: 'radio', at }, attribute: 'aria-checked', equals: 'true' }
}

type Position = 'first' | 'last' | number

/** An arrow key that moves focus from `from` to `to` and checks the radio it lands on. */
function arrow(
  id: string,
  key: string,
  keys: string,
  from: Position,
  to: Position,
  result: string
): A11yKeyboardInteraction {
  return {
    id,
    key,
    keys,
    requirement: 'required',
    given: { focus: { part: 'radio', at: from } },
    result,
    then: {
      focus: { part: 'radio', at: to },
      attributes: [checked(to), { ...checked(from), equals: 'false' }],
    },
  }
}

/**
 * Radio Group, outside a toolbar, in the left-to-right direction. The group
 * has at least three radios and the second one is checked when a story starts.
 *
 * Not covered: Tab into a group with no checked radio (focus goes to the first
 * radio), which needs a story without a default value.
 */
export const radioPattern: A11yPatternContract = {
  id: 'radio',
  name: 'Radio Group',
  source: 'https://www.w3.org/WAI/ARIA/apg/patterns/radio/',
  parts: {
    radiogroup: {
      description: 'The container of the radios, labelled by aria-labelledby or aria-label.',
      name: 'required',
      role: 'radiogroup',
    },
    radio: {
      description: 'The radios, each labelled by its content, by aria-labelledby or by aria-label.',
      multiple: true,
      name: 'required',
      role: 'radio',
      within: 'radiogroup',
    },
  },
  tree: [{ part: 'radiogroup', children: [{ part: 'radio', states: ['checked'] }] }],
  structure: [
    {
      id: 'radio-checked-state',
      requirement: 'required',
      rule: 'Every radio has aria-checked: true on the checked radio, false on the others.',
      target: { part: 'radio' },
      attribute: 'aria-checked',
      equals: ['true', 'false'],
    },
  ],
  keyboard: [
    {
      id: 'tab-enters-at-checked',
      key: 'Tab',
      keys: '{Tab}',
      requirement: 'required',
      given: { focus: 'page-start', attributes: [checked(1)] },
      result: 'When focus moves into the group, it lands on the checked radio.',
      then: { focus: { part: 'radio', at: 'checked' } },
    },
    {
      id: 'space-checks',
      key: 'Space',
      keys: '{ }',
      requirement: 'required',
      given: {
        focus: { part: 'radio', at: 'first' },
        attributes: [{ ...checked('first'), equals: 'false' }],
      },
      result: 'Checks the focused radio if it is not already checked.',
      then: { focus: { part: 'radio', at: 'first' }, attributes: [checked('first')] },
    },
    arrow(
      'down-arrow-next',
      'Down Arrow',
      '{ArrowDown}',
      1,
      2,
      'Moves focus to the next radio, unchecks the previous one and checks the new one.'
    ),
    arrow(
      'right-arrow-next',
      'Right Arrow',
      '{ArrowRight}',
      1,
      2,
      'Moves focus to the next radio, unchecks the previous one and checks the new one.'
    ),
    arrow(
      'down-arrow-wraps',
      'Down Arrow',
      '{ArrowDown}',
      'last',
      'first',
      'On the last radio, moves focus to the first radio and checks it.'
    ),
    arrow(
      'up-arrow-previous',
      'Up Arrow',
      '{ArrowUp}',
      1,
      'first',
      'Moves focus to the previous radio, unchecks the previous one and checks the new one.'
    ),
    arrow(
      'left-arrow-previous',
      'Left Arrow',
      '{ArrowLeft}',
      1,
      'first',
      'Moves focus to the previous radio, unchecks the previous one and checks the new one.'
    ),
    arrow(
      'up-arrow-wraps',
      'Up Arrow',
      '{ArrowUp}',
      'first',
      'last',
      'On the first radio, moves focus to the last radio and checks it.'
    ),
  ],
}
